import { CfnOutput, Duration, RemovalPolicy, Stack, Validations, type StackProps } from 'aws-cdk-lib';
import { CfnBudget } from 'aws-cdk-lib/aws-budgets';
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  HeadersFrameOption,
  HeadersReferrerPolicy,
  HttpVersion,
  PriceClass,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
  type ResponseCustomHeader,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket, BucketEncryption, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { Topic } from 'aws-cdk-lib/aws-sns';
import type { Construct } from 'constructs';

import type { LandingConfig } from './config';
import { PARTITION, SITE_BUCKET_ID, budgetName, budgetTopicName, responseHeadersPolicyName } from './names';

// Edge security headers (SPEC §10.2). Next's static export inlines its bootstrap
// scripts and styles, hence 'unsafe-inline'; everything else is same-origin only.
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');
export const PERMISSIONS_POLICY = 'camera=(), microphone=(), geolocation=(), payment=(), usb=()';
export const ROBOTS_NOINDEX = 'noindex, nofollow';
const HSTS_MAX_AGE = Duration.seconds(63_072_000); // two years

// Origin headers that only describe the S3 implementation (audit finding L). The
// last two are already stripped by CloudFront for S3 origins (not seen at the
// edge on 2026-10-01); they are listed so a change of origin type cannot leak
// them. None is in CloudFront's list of headers a policy may not remove.
export const REMOVED_ORIGIN_HEADERS = [
  'server',
  'x-amz-version-id',
  'x-amz-server-side-encryption',
  'x-amz-request-id',
  'x-amz-id-2',
] as const;

// A missing object behind OAC surfaces as 403 (CloudFront has no s3:ListBucket),
// so both codes map to the site's own 404 page with a real 404 status.
const NOT_FOUND_PAGE = '/404.html';
const NOT_FOUND_STATUSES = [403, 404] as const;
const ERROR_CACHE_TTL = Duration.seconds(60);

const CLOUDFRONT_LOG_PREFIX = 'cloudfront/';
const S3_ACCESS_LOG_PREFIX = 's3-access/';
const BUDGET_ALERT_THRESHOLD_PERCENT = 80;

export interface LandingSiteStackProps extends StackProps {
  readonly config: LandingConfig;
}

/**
 * Site resources only. No IAM resource of any kind: the stack is deployed by the
 * workflow through the scoped CloudFormation execution role, which has no IAM
 * permissions, and the publish permissions live in the identity stack (ADR-002).
 */
export class LandingSiteStack extends Stack {
  public readonly siteBucket: Bucket;
  public readonly logsBucket: Bucket;
  public readonly distribution: Distribution;

  public constructor(scope: Construct, id: string, props: LandingSiteStackProps) {
    const { config, ...stackProps } = props;
    super(scope, id, {
      description: 'M3TRIC landing: private S3 origin + CloudFront (OAC), security headers and budget',
      ...stackProps,
    });

    this.logsBucket = new Bucket(this, 'LogsBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      // CloudFront standard logging writes through an ACL grant to the
      // awslogsdelivery account, which BucketOwnerEnforced would reject.
      objectOwnership: ObjectOwnership.BUCKET_OWNER_PREFERRED,
      lifecycleRules: [{ id: 'ExpireLogs', enabled: true, expiration: Duration.days(config.logRetentionDays) }],
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    // The identity stack's publish policy matches this bucket by the name prefix
    // CloudFormation derives from this construct id (names.ts).
    this.siteBucket = new Bucket(this, SITE_BUCKET_ID, {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
      versioned: true,
      lifecycleRules: [
        {
          id: 'ExpireNoncurrentVersions',
          enabled: true,
          noncurrentVersionExpiration: Duration.days(config.noncurrentVersionDays),
        },
      ],
      serverAccessLogsBucket: this.logsBucket,
      serverAccessLogsPrefix: S3_ACCESS_LOG_PREFIX,
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    const customHeaders: ResponseCustomHeader[] = [
      { header: 'Permissions-Policy', value: PERMISSIONS_POLICY, override: true },
    ];
    if (config.robotsNoindex) {
      // ADR-004: the provisional *.cloudfront.net host must never be indexed.
      customHeaders.push({ header: 'X-Robots-Tag', value: ROBOTS_NOINDEX, override: true });
    }
    const responseHeadersPolicy = new ResponseHeadersPolicy(this, 'SecurityHeadersPolicy', {
      responseHeadersPolicyName: responseHeadersPolicyName(config.environment),
      comment: 'M3TRIC landing security headers (SPEC 10.2)',
      securityHeadersBehavior: {
        contentSecurityPolicy: { contentSecurityPolicy: CONTENT_SECURITY_POLICY, override: true },
        strictTransportSecurity: { accessControlMaxAge: HSTS_MAX_AGE, includeSubdomains: true, override: true },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: HeadersFrameOption.DENY, override: true },
        referrerPolicy: { referrerPolicy: HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN, override: true },
      },
      customHeadersBehavior: { customHeaders },
      removeHeaders: [...REMOVED_ORIGIN_HEADERS],
    });

    this.distribution = new Distribution(this, 'Distribution', {
      comment: `M3TRIC landing (${config.environment})`,
      defaultRootObject: 'index.html',
      httpVersion: HttpVersion.HTTP2_AND_3,
      priceClass: PriceClass.PRICE_CLASS_100,
      enableLogging: true,
      logBucket: this.logsBucket,
      logFilePrefix: CLOUDFRONT_LOG_PREFIX,
      logIncludesCookies: false,
      errorResponses: NOT_FOUND_STATUSES.map((httpStatus) => ({
        httpStatus,
        responseHttpStatus: 404,
        responsePagePath: NOT_FOUND_PAGE,
        ttl: ERROR_CACHE_TTL,
      })),
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(this.siteBucket),
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: true,
        // CachingOptimized honours the origin Cache-Control that publish.sh sets
        // per content type (SPEC 11.3).
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy,
      },
    });
    Validations.of(this.distribution).acknowledge(
      {
        id: 'AwsSolutions-CFR1',
        reason:
          'Public marketing landing with no geographic distribution restriction requirement; geo-blocking would only deny legitimate visitors.',
      },
      {
        id: 'AwsSolutions-CFR2',
        reason:
          'WAF is out of scope (Anexo 1 13.2): static, read-only GET/HEAD site with no forms, APIs or dynamic origin; cost would exceed the whole landing budget.',
      },
      {
        id: 'AwsSolutions-CFR4',
        reason:
          'No custom domain yet: with the default *.cloudfront.net certificate CloudFront does not allow setting the minimum viewer TLS policy. Custom domain + ACM (us-east-1) + TLSv1.2_2021 is client dependency REQ-A09 (SPEC 16.1).',
      },
    );

    // No SSE-KMS on purpose: Budgets cannot publish to a topic under the
    // AWS-managed SNS key, and a customer-managed key (~USD 1/month) would be 10%
    // of the budget it protects for messages that carry only cost thresholds.
    const alertsTopic = new Topic(this, 'BudgetAlertsTopic', {
      topicName: budgetTopicName(config.environment),
      displayName: 'M3TRIC landing budget alerts',
      enforceSSL: true,
    });
    // Pattern from the AWS Budgets SNS documentation. The topic is dedicated to
    // budget alerts, so any budget in this account publishing to it is benign.
    alertsTopic.addToResourcePolicy(
      new PolicyStatement({
        sid: 'AllowBudgetsPublish',
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal('budgets.amazonaws.com')],
        actions: ['sns:Publish'],
        resources: [alertsTopic.topicArn],
        conditions: {
          StringEquals: { 'aws:SourceAccount': config.account },
          ArnLike: { 'aws:SourceArn': `arn:${PARTITION}:budgets::${config.account}:*` },
        },
      }),
    );

    const budget = new CfnBudget(this, 'MonthlyCostBudget', {
      budget: {
        budgetName: budgetName(config.environment),
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: { amount: config.budgetMonthlyUsd, unit: 'USD' },
        // Only matches once Component is activated as a cost allocation tag in
        // Billing (see infra/README.md); until then the budget reports 0.
        costFilters: { TagKeyValue: [`user:Component$${config.tags.Component}`] },
      },
      notificationsWithSubscribers: [
        {
          notification: {
            notificationType: 'ACTUAL',
            comparisonOperator: 'GREATER_THAN',
            threshold: BUDGET_ALERT_THRESHOLD_PERCENT,
            thresholdType: 'PERCENTAGE',
          },
          subscribers: [{ subscriptionType: 'SNS', address: alertsTopic.topicArn }],
        },
      ],
      // CfnBudget has no tag manager in aws-cdk-lib 2.267, so Tags.of() skips it;
      // reuse the stack's own tags so the required set still has a single source.
      resourceTags: Object.entries(this.tags.tagValues())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => ({ key, value })),
    });
    // Budgets validates it can publish when the notification is created.
    const topicPolicy = alertsTopic.node.tryFindChild('Policy');
    if (topicPolicy === undefined) {
      throw new Error('BudgetAlertsTopic resource policy was not created');
    }
    budget.node.addDependency(topicPolicy);

    new CfnOutput(this, 'SiteBucketName', { value: this.siteBucket.bucketName });
    new CfnOutput(this, 'DistributionId', { value: this.distribution.distributionId });
    new CfnOutput(this, 'DistributionDomainName', { value: this.distribution.distributionDomainName });
    new CfnOutput(this, 'SiteUrl', { value: `https://${this.distribution.distributionDomainName}` });
  }
}

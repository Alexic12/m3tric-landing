import type { CfnElement } from 'aws-cdk-lib';
import { describe, expect, it } from 'vitest';

import { LandingSiteStack } from '../lib/landing-site-stack';
import {
  SITE_STACK,
  allowedActions,
  getAtt,
  newApp,
  objectsArn,
  onlyResource,
  resourcesOfType,
  stagingConfig,
  synthesize,
  withoutTags,
  type TemplateJson,
} from './helpers';

// Spec strings are written out literally (not imported from the stack) so a
// change to the implementation cannot silently change the expectation too.
const EXPECTED_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'";
const EXPECTED_PERMISSIONS_POLICY = 'camera=(), microphone=(), geolocation=(), payment=(), usb=()';
const CACHING_OPTIMIZED_ID = '658327ea-f89d-4fab-a63d-7e88639e58f6';
const SSL_DENY = (bucketId: string) => ({
  Effect: 'Deny',
  Principal: { AWS: '*' },
  Action: 's3:*',
  Condition: { Bool: { 'aws:SecureTransport': 'false' } },
  Resource: [getAtt(bucketId, 'Arn'), objectsArn(bucketId)],
});

const { stacks, site } = synthesize();
const siteBucketId = stacks.site.getLogicalId(stacks.site.siteBucket.node.defaultChild as CfnElement);
const logsBucketId = stacks.site.getLogicalId(stacks.site.logsBucket.node.defaultChild as CfnElement);
const distributionId = stacks.site.getLogicalId(stacks.site.distribution.node.defaultChild as CfnElement);

function bucketPolicyFor(template: TemplateJson, bucketId: string): Array<Record<string, any>> {
  const policies = resourcesOfType(template, 'AWS::S3::BucketPolicy').filter(
    ([, resource]) => JSON.stringify(resource.Properties?.Bucket) === JSON.stringify({ Ref: bucketId }),
  );
  expect(policies).toHaveLength(1);
  return policies[0]![1].Properties?.PolicyDocument.Statement as Array<Record<string, any>>;
}

function distributionConfig(template: TemplateJson): Record<string, any> {
  return onlyResource(template, 'AWS::CloudFront::Distribution')[1].Properties?.DistributionConfig as Record<string, any>;
}

function responseHeadersConfig(template: TemplateJson): Record<string, any> {
  return onlyResource(template, 'AWS::CloudFront::ResponseHeadersPolicy')[1].Properties
    ?.ResponseHeadersPolicyConfig as Record<string, any>;
}

describe('LandingSiteStack buckets', () => {
  it('creates exactly the site and logs buckets, both retained, with no auto-delete machinery', () => {
    expect(resourcesOfType(site, 'AWS::S3::Bucket').map(([id]) => id).sort()).toEqual([logsBucketId, siteBucketId].sort());
    for (const id of [siteBucketId, logsBucketId]) {
      expect(site.Resources[id]?.DeletionPolicy).toBe('Retain');
      expect(site.Resources[id]?.UpdateReplacePolicy).toBe('Retain');
    }
    expect(resourcesOfType(site, 'Custom::S3AutoDeleteObjects')).toEqual([]);
    expect(resourcesOfType(site, 'AWS::Lambda::Function')).toEqual([]);
  });

  it('configures the site bucket exactly: BPA, SSE-S3, versioning, owner-enforced, 90-day noncurrent expiry, access logs', () => {
    expect(withoutTags(site.Resources[siteBucketId]?.Properties)).toEqual({
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      BucketEncryption: { ServerSideEncryptionConfiguration: [{ ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } }] },
      VersioningConfiguration: { Status: 'Enabled' },
      OwnershipControls: { Rules: [{ ObjectOwnership: 'BucketOwnerEnforced' }] },
      LifecycleConfiguration: {
        Rules: [{ Id: 'ExpireNoncurrentVersions', Status: 'Enabled', NoncurrentVersionExpiration: { NoncurrentDays: 90 } }],
      },
      LoggingConfiguration: { DestinationBucketName: { Ref: logsBucketId }, LogFilePrefix: 's3-access/' },
    });
  });

  it('configures the logs bucket exactly: BPA, SSE-S3, owner-preferred for CloudFront logs, 90-day expiry', () => {
    expect(withoutTags(site.Resources[logsBucketId]?.Properties)).toEqual({
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      BucketEncryption: { ServerSideEncryptionConfiguration: [{ ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } }] },
      OwnershipControls: { Rules: [{ ObjectOwnership: 'BucketOwnerPreferred' }] },
      LifecycleConfiguration: { Rules: [{ Id: 'ExpireLogs', Status: 'Enabled', ExpirationInDays: 90 }] },
    });
  });

  it('lets only CloudFront (this distribution, via OAC) read the site bucket, over TLS', () => {
    expect(bucketPolicyFor(site, siteBucketId)).toEqual([
      SSL_DENY(siteBucketId),
      {
        Effect: 'Allow',
        Principal: { Service: 'cloudfront.amazonaws.com' },
        Action: 's3:GetObject',
        Resource: objectsArn(siteBucketId),
        Condition: {
          StringEquals: {
            'AWS:SourceArn': {
              'Fn::Join': [
                '',
                ['arn:', { Ref: 'AWS::Partition' }, ':cloudfront::', { Ref: 'AWS::AccountId' }, ':distribution/', { Ref: distributionId }],
              ],
            },
          },
        },
      },
    ]);
  });

  it('lets only S3 server access logging of the site bucket write into the logs bucket, over TLS', () => {
    expect(bucketPolicyFor(site, logsBucketId)).toEqual([
      SSL_DENY(logsBucketId),
      {
        Effect: 'Allow',
        Principal: { Service: 'logging.s3.amazonaws.com' },
        Action: 's3:PutObject',
        Resource: { 'Fn::Join': ['', [getAtt(logsBucketId, 'Arn'), '/s3-access/*']] },
        Condition: {
          ArnLike: { 'aws:SourceArn': getAtt(siteBucketId, 'Arn') },
          StringEquals: { 'aws:SourceAccount': '147997127433' },
        },
      },
    ]);
  });
});

describe('LandingSiteStack distribution', () => {
  it('uses one Origin Access Control and no Origin Access Identity', () => {
    const [oacId, oac] = onlyResource(site, 'AWS::CloudFront::OriginAccessControl');
    expect(oac.Properties).toEqual({
      OriginAccessControlConfig: {
        Name: expect.stringMatching(/^[A-Za-z0-9-_]{1,64}$/),
        OriginAccessControlOriginType: 's3',
        SigningBehavior: 'always',
        SigningProtocol: 'sigv4',
      },
    });
    expect(resourcesOfType(site, 'AWS::CloudFront::CloudFrontOriginAccessIdentity')).toEqual([]);

    const origins = distributionConfig(site).Origins as Array<Record<string, any>>;
    expect(origins).toHaveLength(1);
    expect(origins[0]).toEqual({
      Id: origins[0]!.Id,
      DomainName: getAtt(siteBucketId, 'RegionalDomainName'),
      OriginAccessControlId: getAtt(oacId, 'Id'),
      S3OriginConfig: { OriginAccessIdentity: '' },
    });
  });

  it('matches the SPEC §10.2 distribution configuration exactly', () => {
    const config = distributionConfig(site);
    const [headersPolicyId] = onlyResource(site, 'AWS::CloudFront::ResponseHeadersPolicy');
    const originId = (config.Origins as Array<Record<string, any>>)[0]!.Id as string;
    expect(config).toEqual({
      Comment: 'M3TRIC landing (staging)',
      Enabled: true,
      IPV6Enabled: true,
      DefaultRootObject: 'index.html',
      HttpVersion: 'http2and3',
      PriceClass: 'PriceClass_100',
      Logging: { Bucket: getAtt(logsBucketId, 'RegionalDomainName'), Prefix: 'cloudfront/', IncludeCookies: false },
      CustomErrorResponses: [
        { ErrorCode: 403, ResponseCode: 404, ResponsePagePath: '/404.html', ErrorCachingMinTTL: 60 },
        { ErrorCode: 404, ResponseCode: 404, ResponsePagePath: '/404.html', ErrorCachingMinTTL: 60 },
      ],
      DefaultCacheBehavior: {
        TargetOriginId: originId,
        AllowedMethods: ['GET', 'HEAD'],
        ViewerProtocolPolicy: 'redirect-to-https',
        Compress: true,
        CachePolicyId: CACHING_OPTIMIZED_ID,
        ResponseHeadersPolicyId: { Ref: headersPolicyId },
      },
      Origins: config.Origins,
    });
  });

  it('sends the exact SPEC §10.2 security headers, overriding the origin, plus X-Robots-Tag in staging', () => {
    expect(responseHeadersConfig(site)).toEqual({
      Name: 'm3tric-staging-landing-security-headers',
      Comment: 'M3TRIC landing security headers (SPEC 10.2)',
      SecurityHeadersConfig: {
        ContentSecurityPolicy: { ContentSecurityPolicy: EXPECTED_CSP, Override: true },
        StrictTransportSecurity: { AccessControlMaxAgeSec: 63072000, IncludeSubdomains: true, Override: true },
        ContentTypeOptions: { Override: true },
        FrameOptions: { FrameOption: 'DENY', Override: true },
        ReferrerPolicy: { ReferrerPolicy: 'strict-origin-when-cross-origin', Override: true },
      },
      CustomHeadersConfig: {
        Items: [
          { Header: 'Permissions-Policy', Value: EXPECTED_PERMISSIONS_POLICY, Override: true },
          { Header: 'X-Robots-Tag', Value: 'noindex, nofollow', Override: true },
        ],
      },
    });
  });

  it('omits X-Robots-Tag (and only it) when robotsNoindex is false', () => {
    const indexable = synthesize(stagingConfig((raw) => (raw.robotsNoindex = false)));
    const config = responseHeadersConfig(indexable.site);
    expect(config.CustomHeadersConfig).toEqual({
      Items: [{ Header: 'Permissions-Policy', Value: EXPECTED_PERMISSIONS_POLICY, Override: true }],
    });
    expect(config.SecurityHeadersConfig).toEqual(responseHeadersConfig(site).SecurityHeadersConfig);
  });
});

describe('LandingSiteStack publish permissions', () => {
  it('attaches one policy to the existing deploy role by name and never creates or alters a role', () => {
    const [, policy] = onlyResource(site, 'AWS::IAM::Policy');
    expect(policy.Properties?.PolicyName).toBe('m3tric-staging-landing-publish');
    expect(policy.Properties?.Roles).toEqual(['m3tric-staging-landing-github-deploy']);
    expect(policy.Properties?.Users).toBeUndefined();
    expect(policy.Properties?.Groups).toBeUndefined();
    expect(resourcesOfType(site, 'AWS::IAM::Role')).toEqual([]);
    expect(resourcesOfType(site, 'AWS::IAM::ManagedPolicy')).toEqual([]);
  });

  it('grants exactly the closed action list on exactly this bucket and distribution', () => {
    const [, policy] = onlyResource(site, 'AWS::IAM::Policy');
    const statements = policy.Properties?.PolicyDocument.Statement as Array<Record<string, any>>;
    expect(statements).toEqual([
      { Sid: 'ListSiteBucket', Effect: 'Allow', Action: 's3:ListBucket', Resource: getAtt(siteBucketId, 'Arn') },
      {
        Sid: 'SyncSiteObjects',
        Effect: 'Allow',
        Action: ['s3:DeleteObject', 's3:GetObject', 's3:PutObject'],
        Resource: objectsArn(siteBucketId),
      },
      {
        Sid: 'InvalidateDistribution',
        Effect: 'Allow',
        Action: ['cloudfront:CreateInvalidation', 'cloudfront:GetInvalidation'],
        Resource: { 'Fn::Join': ['', ['arn:aws:cloudfront::147997127433:distribution/', { Ref: distributionId }]] },
      },
    ]);
    expect(allowedActions(statements)).toEqual([
      'cloudfront:CreateInvalidation',
      'cloudfront:GetInvalidation',
      's3:DeleteObject',
      's3:GetObject',
      's3:ListBucket',
      's3:PutObject',
    ]);
  });

  it('refuses to synthesize when the publish role name drifts from the identity stack', () => {
    expect(
      () =>
        new LandingSiteStack(newApp(), SITE_STACK, {
          env: { account: '147997127433', region: 'us-east-2' },
          config: stagingConfig(),
          publishRoleName: 'm3tric-staging-some-other-role',
        }),
    ).toThrow(/does not match the delivery identity role m3tric-staging-landing-github-deploy/);
  });
});

describe('LandingSiteStack budget', () => {
  it('creates the alert topic with SSL-only publishing and a Budgets-only allow', () => {
    const [topicId, topic] = onlyResource(site, 'AWS::SNS::Topic');
    expect(withoutTags(topic.Properties)).toEqual({
      TopicName: 'm3tric-staging-landing-budget-alerts',
      DisplayName: 'M3TRIC landing budget alerts',
    });
    expect(resourcesOfType(site, 'AWS::SNS::Subscription')).toEqual([]);
    const [, topicPolicy] = onlyResource(site, 'AWS::SNS::TopicPolicy');
    expect(topicPolicy.Properties?.Topics).toEqual([{ Ref: topicId }]);
    expect(topicPolicy.Properties?.PolicyDocument.Statement).toEqual([
      {
        Sid: 'AllowPublishThroughSSLOnly',
        Effect: 'Deny',
        Principal: '*',
        Action: 'sns:Publish',
        Resource: { Ref: topicId },
        Condition: { Bool: { 'aws:SecureTransport': 'false' } },
      },
      {
        Sid: 'AllowBudgetsPublish',
        Effect: 'Allow',
        Principal: { Service: 'budgets.amazonaws.com' },
        Action: 'sns:Publish',
        Resource: { Ref: topicId },
        Condition: {
          StringEquals: { 'aws:SourceAccount': '147997127433' },
          ArnLike: { 'aws:SourceArn': 'arn:aws:budgets::147997127433:*' },
        },
      },
    ]);
  });

  it('budgets USD 10/month on Component=landing and alerts at 80% actual spend', () => {
    const [topicId] = onlyResource(site, 'AWS::SNS::Topic');
    const [topicPolicyId] = onlyResource(site, 'AWS::SNS::TopicPolicy');
    const [, budget] = onlyResource(site, 'AWS::Budgets::Budget');
    expect(withoutTags(budget.Properties)).toEqual({
      Budget: {
        BudgetName: 'm3tric-staging-landing-monthly',
        BudgetType: 'COST',
        TimeUnit: 'MONTHLY',
        BudgetLimit: { Amount: 10, Unit: 'USD' },
        CostFilters: { TagKeyValue: ['user:Component$landing'] },
      },
      NotificationsWithSubscribers: [
        {
          Notification: { NotificationType: 'ACTUAL', ComparisonOperator: 'GREATER_THAN', Threshold: 80, ThresholdType: 'PERCENTAGE' },
          Subscribers: [{ SubscriptionType: 'SNS', Address: { Ref: topicId } }],
        },
      ],
    });
    expect(budget.DependsOn).toEqual([topicPolicyId]);
  });
});

describe('LandingSiteStack outputs and coupling', () => {
  it('outputs exactly the values the deploy workflow reads', () => {
    expect(site.Outputs).toEqual({
      SiteBucketName: { Value: { Ref: siteBucketId } },
      DistributionId: { Value: { Ref: distributionId } },
      DistributionDomainName: { Value: getAtt(distributionId, 'DomainName') },
      SiteUrl: { Value: { 'Fn::Join': ['', ['https://', getAtt(distributionId, 'DomainName')]] } },
      PublishRoleName: { Value: 'm3tric-staging-landing-github-deploy' },
    });
  });

  it('does not import anything from the identity stack at deploy time', () => {
    expect(JSON.stringify(site)).not.toContain('Fn::ImportValue');
    expect(stacks.site.dependencies).toEqual([]);
    expect(stacks.site.terminationProtection).toBe(false);
  });
});

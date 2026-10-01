import { CfnOutput, Duration, RemovalPolicy, Stack, Validations, type StackProps } from 'aws-cdk-lib';
import {
  Effect,
  FederatedPrincipal,
  OpenIdConnectProvider,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket, BucketEncryption, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';

import type { LandingConfig } from './config';
import { acknowledgeFinding } from './nag';
import {
  DEPLOY_ROLE_PATH,
  GITHUB_OIDC_AUDIENCE,
  GITHUB_OIDC_HOST,
  PARTITION,
  SITE_ASSETS_PREFIX,
  SITE_BUCKET_ID,
  SITE_STACK_ID,
  cdkAssetsBucketName,
  cfnExecRoleName,
  deployRoleName,
  landingNamePrefix,
  s3BucketArn,
  siteStackBucketNamePrefix,
  stackName,
} from './names';

// GitHub's assume-role-with-web-identity session cannot exceed the role's maximum;
// one hour covers a landing deploy (CDK + publish + invalidation wait) with margin.
const MAX_SESSION = Duration.hours(1);

// The template is only read while CloudFormation creates the change set; after
// that the object is dead weight (the CLI re-uploads it if it is missing).
const ASSET_RETENTION = Duration.days(30);

// The workflow files whose jobs may assume the deploy role (OIDC job_workflow_ref).
// deploy.yml runs `cdk deploy`; publish.yml (reusable, called by deploy.yml and
// rollback.yml) publishes; rollback.yml reads the stack outputs.
export const DELIVERY_WORKFLOWS = ['deploy.yml', 'publish.yml', 'rollback.yml'] as const;
export const DELIVERY_REF = 'refs/heads/main';

// Inline policy names. Deliberately NOT the old `m3tric-staging-landing-publish`:
// during the migration the site stack still owns an inline policy with that name
// on the same role, and deleting it (CloudFormation removes it by name) would
// otherwise delete this stack's copy too.
export const DEPLOY_POLICY_NAME = 'LandingSiteDeploy';
export const PUBLISH_POLICY_NAME = 'LandingSitePublish';
export const EXEC_POLICY_NAME = 'LandingSiteResources';

export interface LandingDeliveryIdentityStackProps extends StackProps {
  readonly config: LandingConfig;
}

/**
 * Every OIDC `sub` the deploy role trusts. Requires the repository's OIDC subject
 * customization `include_claim_keys: ["repo", "context", "ref", "job_workflow_ref"]`
 * (infra/README.md, migration step b); GitHub joins the claims in that order.
 * `context` is `environment:<name>` for a job that declares an environment.
 */
export function githubOidcSubjects(github: LandingConfig['github']): string[] {
  const repository = `${github.owner}/${github.repo}`;
  return DELIVERY_WORKFLOWS.map(
    (workflow) =>
      `repo:${repository}:environment:${github.environment}:ref:${DELIVERY_REF}` +
      `:job_workflow_ref:${repository}/.github/workflows/${workflow}@${DELIVERY_REF}`,
  );
}

/**
 * Delivery identity of the landing. Deployed by a human with local admin
 * credentials (through the account's CDK bootstrap), never by the workflow it
 * authorizes, so the workflow cannot widen its own trust or permissions (ADR-002).
 *
 * - CloudFormation execution role: the only principal that creates/changes the
 *   site stack's resources; no IAM at all, so no template can grant anything.
 * - Dedicated assets bucket: the site stack's template is staged here, not in the
 *   shared bootstrap bucket other projects deploy from.
 * - GitHub deploy role: change sets on the site stack only (with the execution
 *   role and nothing else), the assets prefix, publish and invalidation. No
 *   sts:AssumeRole: the shared bootstrap roles are out of reach.
 */
export class LandingDeliveryIdentityStack extends Stack {
  public readonly deployRole: Role;
  public readonly deployRoleName: string;
  public readonly cfnExecRole: Role;
  public readonly assetsBucket: Bucket;

  public constructor(scope: Construct, id: string, props: LandingDeliveryIdentityStackProps) {
    const { config, ...stackProps } = props;
    super(scope, id, {
      description: 'M3TRIC landing: GitHub OIDC deploy role, scoped CloudFormation execution role and assets bucket (deployed by a human)',
      ...stackProps,
      terminationProtection: true,
    });

    const { account, region, environment } = config;
    this.deployRoleName = deployRoleName(environment);

    // The stack ID suffix is a UUID assigned by CloudFormation at creation, so the
    // resource can only be pinned up to the stack name.
    const siteStackArn = `arn:${PARTITION}:cloudformation:${region}:${account}:stack/${stackName(environment, SITE_STACK_ID)}/*`;
    const siteBucketsArn = s3BucketArn(`${siteStackBucketNamePrefix(environment)}*`);
    const siteBucketArn = s3BucketArn(`${siteStackBucketNamePrefix(environment)}${SITE_BUCKET_ID.toLowerCase()}*`);
    const cloudFront = (resource: string) => `arn:${PARTITION}:cloudfront::${account}:${resource}`;
    const distributionArn = cloudFront(`distribution/${config.siteCloudFront.distributionId}`);
    const topicsArn = `arn:${PARTITION}:sns:${region}:${account}:${landingNamePrefix(environment)}-*`;
    const budgetsArn = `arn:${PARTITION}:budgets::${account}:budget/${landingNamePrefix(environment)}-*`;
    const assetsBucketArn = s3BucketArn(cdkAssetsBucketName(environment, account, region));
    const assetsObjectsArn = `${assetsBucketArn}/${SITE_ASSETS_PREFIX}*`;

    this.assetsBucket = new Bucket(this, 'CdkAssetsBucket', {
      bucketName: cdkAssetsBucketName(environment, account, region),
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
      lifecycleRules: [{ id: 'ExpireStagedAssets', enabled: true, expiration: ASSET_RETENTION }],
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });
    Validations.of(this.assetsBucket).acknowledge({
      id: 'AwsSolutions-S1',
      reason:
        'Holds only CDK-synthesized CloudFormation templates of the public landing for 30 days; writes are limited to one role and prefix, and every change set they feed is recorded by CloudFormation itself.',
    });

    this.cfnExecRole = new Role(this, 'CfnExecRole', {
      roleName: cfnExecRoleName(environment),
      path: DEPLOY_ROLE_PATH,
      description: `CloudFormation execution role for ${stackName(environment, SITE_STACK_ID)} only: no IAM, no other stacks`,
      assumedBy: new ServicePrincipal('cloudformation.amazonaws.com', {
        conditions: { StringEquals: { 'aws:SourceAccount': account } },
      }),
      inlinePolicies: {
        [EXEC_POLICY_NAME]: new PolicyDocument({
          statements: [
            // Union of the CloudFormation resource handler permissions
            // (`aws cloudformation describe-type ... --query Schema`) restricted to
            // the properties the site stack uses, plus every read the read handler
            // performs. Unused features (CORS, website, replication, inventory,
            // notifications, ...) are absent on purpose: a template that adds one
            // fails with AccessDenied until a human widens this role.
            new PolicyStatement({
              sid: 'SiteStackBuckets',
              effect: Effect.ALLOW,
              actions: [
                's3:CreateBucket',
                's3:DeleteBucket',
                's3:ListBucket',
                's3:GetBucketTagging',
                's3:PutBucketTagging',
                // Listed in the bucket schema's tagging permissions: every deploy changes tags.
                's3:DeleteBucketTagging',
                's3:TagResource',
                's3:UntagResource',
                's3:ListTagsForResource',
                's3:GetEncryptionConfiguration',
                's3:PutEncryptionConfiguration',
                's3:GetBucketPublicAccessBlock',
                's3:PutBucketPublicAccessBlock',
                's3:GetBucketOwnershipControls',
                's3:PutBucketOwnershipControls',
                's3:GetBucketVersioning',
                's3:PutBucketVersioning',
                's3:GetLifecycleConfiguration',
                's3:PutLifecycleConfiguration',
                's3:GetBucketLogging',
                's3:PutBucketLogging',
                // CloudFront standard logging grants itself write access to the logs
                // bucket through its ACL, with the caller's (this role's) permissions.
                's3:GetBucketAcl',
                's3:PutBucketAcl',
                's3:GetBucketPolicy',
                's3:PutBucketPolicy',
                's3:DeleteBucketPolicy',
                // Read handler only (drift and post-update reads).
                's3:GetAccelerateConfiguration',
                's3:GetAnalyticsConfiguration',
                's3:GetBucketAbac',
                's3:GetBucketCORS',
                's3:GetBucketMetadataTableConfiguration',
                's3:GetBucketNotification',
                's3:GetBucketObjectLockConfiguration',
                's3:GetBucketWebsite',
                's3:GetIntelligentTieringConfiguration',
                's3:GetInventoryConfiguration',
                's3:GetMetricsConfiguration',
                's3:GetReplicationConfiguration',
              ],
              resources: [siteBucketsArn],
            }),
            // Pinned to the IDs of the live resources (config.siteCloudFront): the
            // account hosts other projects' distributions and OACs. No Create*:
            // creating or replacing a CloudFront resource is a human change
            // (infra/README.md, "Recrear el stack del sitio").
            new PolicyStatement({
              sid: 'SiteDistribution',
              effect: Effect.ALLOW,
              actions: [
                'cloudfront:GetDistribution',
                'cloudfront:GetDistributionConfig',
                'cloudfront:UpdateDistribution',
                'cloudfront:DeleteDistribution',
                'cloudfront:TagResource',
                'cloudfront:UntagResource',
                'cloudfront:ListTagsForResource',
              ],
              resources: [distributionArn],
            }),
            new PolicyStatement({
              sid: 'SiteOriginAccessControl',
              effect: Effect.ALLOW,
              actions: [
                'cloudfront:GetOriginAccessControl',
                'cloudfront:UpdateOriginAccessControl',
                'cloudfront:DeleteOriginAccessControl',
              ],
              resources: [cloudFront(`origin-access-control/${config.siteCloudFront.originAccessControlId}`)],
            }),
            new PolicyStatement({
              sid: 'SiteResponseHeadersPolicy',
              effect: Effect.ALLOW,
              actions: [
                'cloudfront:GetResponseHeadersPolicy',
                'cloudfront:UpdateResponseHeadersPolicy',
                'cloudfront:DeleteResponseHeadersPolicy',
              ],
              resources: [cloudFront(`response-headers-policy/${config.siteCloudFront.responseHeadersPolicyId}`)],
            }),
            new PolicyStatement({
              sid: 'SiteBudgetTopic',
              effect: Effect.ALLOW,
              actions: [
                'sns:CreateTopic',
                'sns:DeleteTopic',
                'sns:GetTopicAttributes',
                'sns:SetTopicAttributes',
                'sns:TagResource',
                'sns:UntagResource',
                'sns:ListTagsForResource',
                'sns:ListSubscriptionsByTopic',
                'sns:GetDataProtectionPolicy',
                'sns:PutDataProtectionPolicy',
              ],
              resources: [topicsArn],
            }),
            // AWS::Budgets::Budget publishes no handler schema; these are the
            // actions its APIs require (CreateBudget/UpdateBudget/notifications are
            // all budgets:ModifyBudget) plus tagging for ResourceTags.
            new PolicyStatement({
              sid: 'SiteBudget',
              effect: Effect.ALLOW,
              actions: [
                'budgets:ViewBudget',
                'budgets:ModifyBudget',
                'budgets:TagResource',
                'budgets:UntagResource',
                'budgets:ListTagsForResource',
              ],
              resources: [budgetsArn],
            }),
            // Defence in depth: nothing above grants these, and an explicit deny
            // also beats any policy someone attaches to this role later.
            new PolicyStatement({
              sid: 'NeverIdentityOrStacks',
              effect: Effect.DENY,
              actions: ['iam:*', 'sts:AssumeRole', 'organizations:*', 'cloudformation:*'],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    // Imported, never created: the account already has exactly one GitHub
    // provider and IAM allows only one per issuer URL.
    const provider = OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      'GitHubOidcProvider',
      config.oidcProviderArn,
    );

    const subjects = githubOidcSubjects(config.github);

    this.deployRole = new Role(this, 'GitHubDeployRole', {
      roleName: this.deployRoleName,
      path: DEPLOY_ROLE_PATH,
      maxSessionDuration: MAX_SESSION,
      description: `GitHub Actions (${config.github.owner}/${config.github.repo}, environment ${config.github.environment}, ${DELIVERY_REF}) deploys and publishes the M3TRIC landing`,
      assumedBy: new FederatedPrincipal(
        provider.openIdConnectProviderArn,
        {
          StringEquals: {
            [`${GITHUB_OIDC_HOST}:aud`]: GITHUB_OIDC_AUDIENCE,
            [`${GITHUB_OIDC_HOST}:sub`]: subjects,
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
      inlinePolicies: {
        [DEPLOY_POLICY_NAME]: new PolicyDocument({
          statements: [
            // The calls `cdk deploy --method=change-set` makes with CLI credentials
            // (aws-cdk 2.1138: deploy-stack.ts, change-set describer, stack
            // activity monitor, failure diagnoser; DescribeEvents only explains an
            // early-validation failure, and the CLI tolerates it being denied). No CreateStack/UpdateStack/
            // DeleteStack: change sets are the only way in, and every one runs as
            // the execution role (next statement).
            new PolicyStatement({
              sid: 'SiteStackChangeSets',
              effect: Effect.ALLOW,
              actions: [
                'cloudformation:DescribeStacks',
                'cloudformation:DescribeStackEvents',
                'cloudformation:DescribeEvents',
                'cloudformation:DescribeStackResources',
                'cloudformation:GetTemplate',
                'cloudformation:GetTemplateSummary',
                'cloudformation:DescribeChangeSet',
                'cloudformation:ExecuteChangeSet',
                'cloudformation:DeleteChangeSet',
                'cloudformation:ListChangeSets',
              ],
              resources: [siteStackArn],
            }),
            // A change set without RoleARN would run as the stack's last associated
            // role (or as this role's own session); this condition makes the scoped
            // execution role the only way to create one.
            new PolicyStatement({
              sid: 'SiteStackChangeSetAsExecRole',
              effect: Effect.ALLOW,
              actions: ['cloudformation:CreateChangeSet'],
              resources: [siteStackArn],
              conditions: { StringEquals: { 'cloudformation:RoleArn': this.cfnExecRole.roleArn } },
            }),
            new PolicyStatement({
              sid: 'PassExecRoleToCloudFormation',
              effect: Effect.ALLOW,
              actions: ['iam:PassRole'],
              resources: [this.cfnExecRole.roleArn],
              conditions: { StringEquals: { 'iam:PassedToService': 'cloudformation.amazonaws.com' } },
            }),
            // cdk-assets: GetBucketLocation (ownership check), GetEncryptionConfiguration
            // (upload headers), ListBucket (exists check), PutObject; CloudFormation
            // reads the template with the caller's credentials (GetObject).
            new PolicyStatement({
              sid: 'AssetsBucketInfo',
              effect: Effect.ALLOW,
              actions: ['s3:GetBucketLocation', 's3:GetEncryptionConfiguration'],
              resources: [assetsBucketArn],
            }),
            new PolicyStatement({
              sid: 'AssetsBucketListSitePrefix',
              effect: Effect.ALLOW,
              actions: ['s3:ListBucket'],
              resources: [assetsBucketArn],
              conditions: { StringLike: { 's3:prefix': `${SITE_ASSETS_PREFIX}*` } },
            }),
            new PolicyStatement({
              sid: 'AssetsSiteObjects',
              effect: Effect.ALLOW,
              actions: ['s3:GetObject', 's3:PutObject'],
              resources: [assetsObjectsArn],
            }),
            new PolicyStatement({
              sid: 'NeverOtherStacks',
              effect: Effect.DENY,
              actions: ['cloudformation:*'],
              notResources: [siteStackArn],
            }),
            // Same-account trust policies naming this role would otherwise work
            // without any Allow here; deny role chaining outright.
            new PolicyStatement({
              sid: 'NeverAssumeRoles',
              effect: Effect.DENY,
              actions: ['sts:AssumeRole'],
              resources: ['*'],
            }),
          ],
        }),
        [PUBLISH_POLICY_NAME]: new PolicyDocument({
          statements: [
            new PolicyStatement({
              sid: 'ListSiteBucket',
              effect: Effect.ALLOW,
              actions: ['s3:ListBucket'],
              resources: [siteBucketArn],
            }),
            new PolicyStatement({
              sid: 'SyncSiteObjects',
              effect: Effect.ALLOW,
              actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
              resources: [`${siteBucketArn}/*`],
            }),
            new PolicyStatement({
              sid: 'InvalidateDistribution',
              effect: Effect.ALLOW,
              actions: ['cloudfront:CreateInvalidation', 'cloudfront:GetInvalidation'],
              resources: [distributionArn],
            }),
          ],
        }),
      },
    });

    // One acknowledgement per wildcard finding (test/app.test.ts pins the list),
    // so any new wildcard still fails synth.
    const iam5 = (resource: string) => `AwsSolutions-IAM5[Resource::${resource}]`;
    acknowledgeFinding(
      this.deployRole,
      iam5(siteStackArn),
      'Pinned to the single landing site stack name; the trailing /* is the stack UUID, which CloudFormation assigns at creation and cannot be known in advance.',
    );
    acknowledgeFinding(
      this.deployRole,
      iam5(assetsObjectsArn),
      'cdk-assets writes the site template under a content-hash key that changes with every synth; limited to the site/ prefix of the dedicated landing assets bucket.',
    );
    acknowledgeFinding(
      this.deployRole,
      iam5(siteBucketArn),
      'The site bucket name ends in a random suffix CloudFormation assigns at creation; the prefix is the site stack name plus the SiteBucket logical id, which nothing else produces.',
    );
    acknowledgeFinding(
      this.deployRole,
      iam5(`${siteBucketArn}/*`),
      '`aws s3 sync --delete` must read, write and delete arbitrary object keys of the export; limited to the site bucket of the landing stack.',
    );
    acknowledgeFinding(
      this.cfnExecRole,
      iam5(siteBucketsArn),
      'CloudFormation names the site and logs buckets <site stack name>-<logical id>-<random>; the prefix is the site stack name, so only that stack\'s buckets match.',
    );
    acknowledgeFinding(
      this.cfnExecRole,
      iam5(topicsArn),
      'The budget topic has a fixed name under the m3tric-<env>-landing- prefix, which no other project in the account uses.',
    );
    acknowledgeFinding(
      this.cfnExecRole,
      iam5(budgetsArn),
      'The budget has a fixed name under the m3tric-<env>-landing- prefix, which no other project in the account uses.',
    );

    new CfnOutput(this, 'RoleArn', {
      description: 'Role ARN for aws-actions/configure-aws-credentials (GitHub variable AWS_DEPLOY_ROLE_ARN)',
      value: this.deployRole.roleArn,
    });
    new CfnOutput(this, 'CfnExecRoleArn', {
      description: 'cdk deploy --role-arn (GitHub variable AWS_CFN_EXEC_ROLE_ARN)',
      value: this.cfnExecRole.roleArn,
    });
    new CfnOutput(this, 'AssetsBucketName', {
      description: 'Bucket the site stack template is staged in',
      value: this.assetsBucket.bucketName,
    });
  }
}

import type { CfnElement } from 'aws-cdk-lib';
import { describe, expect, it } from 'vitest';

import { githubOidcSubjects } from '../lib/delivery-identity-stack';
import {
  IDENTITY_STACK,
  allowedActions,
  getAtt,
  onlyResource,
  resourcesOfType,
  stagingConfig,
  synthesize,
  withoutTags,
  type Resource,
  type TemplateJson,
} from './helpers';

// Literal on purpose (not derived from lib/): a change to the implementation must
// not silently change the expectation too.
const ACCOUNT = '147997127433';
const SITE_STACK_ARN = `arn:aws:cloudformation:us-east-2:${ACCOUNT}:stack/m3tric-staging-LandingSiteStack/*`;
const ASSETS_BUCKET = 'm3tric-staging-landing-cdk-assets-147997127433-us-east-2';
const ASSETS_BUCKET_ARN = `arn:aws:s3:::${ASSETS_BUCKET}`;
const SITE_BUCKET_ARN = 'arn:aws:s3:::m3tric-staging-landingsitestack-sitebucket*';
const DISTRIBUTION_ARN = `arn:aws:cloudfront::${ACCOUNT}:distribution/E1J2L9XZIAGQ7M`;
const SUB_PREFIX = 'repo:Alexic12/m3tric-landing:environment:landing-staging:ref:refs/heads/main:job_workflow_ref:Alexic12/m3tric-landing/.github/workflows';
const EXPECTED_SUBJECTS = [
  `${SUB_PREFIX}/deploy.yml@refs/heads/main`,
  `${SUB_PREFIX}/publish.yml@refs/heads/main`,
  `${SUB_PREFIX}/rollback.yml@refs/heads/main`,
];

const { stacks, identity } = synthesize();
const execRoleId = stacks.identity.getLogicalId(stacks.identity.cfnExecRole.node.defaultChild as CfnElement);
const deployRoleId = stacks.identity.getLogicalId(stacks.identity.deployRole.node.defaultChild as CfnElement);
const assetsBucketId = stacks.identity.getLogicalId(stacks.identity.assetsBucket.node.defaultChild as CfnElement);
const EXEC_ROLE_ARN = getAtt(execRoleId, 'Arn');

function role(template: TemplateJson, logicalId: string): Resource {
  const resource = template.Resources[logicalId];
  expect(resource?.Type).toBe('AWS::IAM::Role');
  return resource!;
}

function inlinePolicy(logicalId: string, name: string): Array<Record<string, any>> {
  const policies = role(identity, logicalId).Properties?.Policies as Array<{ PolicyName: string; PolicyDocument: any }>;
  const match = policies.filter((policy) => policy.PolicyName === name);
  expect(match).toHaveLength(1);
  return match[0]!.PolicyDocument.Statement as Array<Record<string, any>>;
}

/** Every IAM action string any statement of the role mentions, Allow or Deny. */
function everyAction(logicalId: string): string[] {
  const policies = role(identity, logicalId).Properties?.Policies as Array<{ PolicyDocument: any }>;
  return policies.flatMap((policy) =>
    (policy.PolicyDocument.Statement as Array<Record<string, any>>).flatMap((statement) =>
      [statement.Action ?? statement.NotAction].flat() as string[],
    ),
  );
}

describe('LandingDeliveryIdentityStack', () => {
  it('uses the agreed physical stack name with termination protection on', () => {
    expect(stacks.identity.stackName).toBe(IDENTITY_STACK);
    expect(stacks.identity.terminationProtection).toBe(true);
  });

  it('creates exactly two roles, the assets bucket and its TLS policy, and imports (never creates) the OIDC provider', () => {
    expect(
      Object.entries(identity.Resources)
        .map(([id, resource]) => `${resource.Type} ${id}`)
        .sort(),
    ).toEqual(
      [
        `AWS::IAM::Role ${deployRoleId}`,
        `AWS::IAM::Role ${execRoleId}`,
        `AWS::S3::Bucket ${assetsBucketId}`,
        `AWS::S3::BucketPolicy ${onlyResource(identity, 'AWS::S3::BucketPolicy')[0]}`,
      ].sort(),
    );
    expect(resourcesOfType(identity, 'AWS::IAM::OIDCProvider')).toEqual([]);
    expect(resourcesOfType(identity, 'AWS::IAM::Policy')).toEqual([]);
    expect(resourcesOfType(identity, 'AWS::IAM::ManagedPolicy')).toEqual([]);
  });

  it('outputs the three values the runbook and the GitHub variables need, without exports', () => {
    expect(identity.Outputs).toEqual({
      RoleArn: {
        Description: 'Role ARN for aws-actions/configure-aws-credentials (GitHub variable AWS_DEPLOY_ROLE_ARN)',
        Value: getAtt(deployRoleId, 'Arn'),
      },
      CfnExecRoleArn: {
        Description: 'cdk deploy --role-arn (GitHub variable AWS_CFN_EXEC_ROLE_ARN)',
        Value: EXEC_ROLE_ARN,
      },
      AssetsBucketName: { Description: 'Bucket the site stack template is staged in', Value: { Ref: assetsBucketId } },
    });
  });
});

describe('dedicated CDK assets bucket', () => {
  it('has a fixed name, BPA, SSE-S3, owner-enforced, 30-day expiry and is retained', () => {
    const bucket = identity.Resources[assetsBucketId]!;
    expect(bucket.DeletionPolicy).toBe('Retain');
    expect(bucket.UpdateReplacePolicy).toBe('Retain');
    expect(withoutTags(bucket.Properties)).toEqual({
      BucketName: ASSETS_BUCKET,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      BucketEncryption: { ServerSideEncryptionConfiguration: [{ ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } }] },
      OwnershipControls: { Rules: [{ ObjectOwnership: 'BucketOwnerEnforced' }] },
      LifecycleConfiguration: { Rules: [{ Id: 'ExpireStagedAssets', Status: 'Enabled', ExpirationInDays: 30 }] },
    });
  });

  it('denies every non-TLS request and grants nothing to anyone', () => {
    const [, policy] = onlyResource(identity, 'AWS::S3::BucketPolicy');
    expect(policy.Properties?.Bucket).toEqual({ Ref: assetsBucketId });
    expect(policy.Properties?.PolicyDocument.Statement).toEqual([
      {
        Effect: 'Deny',
        Principal: { AWS: '*' },
        Action: 's3:*',
        Condition: { Bool: { 'aws:SecureTransport': 'false' } },
        Resource: [getAtt(assetsBucketId, 'Arn'), { 'Fn::Join': ['', [getAtt(assetsBucketId, 'Arn'), '/*']] }],
      },
    ]);
  });
});

describe('CloudFormation execution role', () => {
  it('has the exact name and path, and only CloudFormation of this account can assume it', () => {
    const exec = role(identity, execRoleId);
    expect(Object.keys(withoutTags(exec.Properties)).sort()).toEqual([
      'AssumeRolePolicyDocument',
      'Description',
      'Path',
      'Policies',
      'RoleName',
    ]);
    expect(exec.Properties?.RoleName).toBe('m3tric-staging-landing-cfn-exec');
    expect(exec.Properties?.Path).toBe('/m3tric/delivery/');
    expect(exec.Properties?.AssumeRolePolicyDocument).toEqual({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: 'sts:AssumeRole',
          Principal: { Service: 'cloudformation.amazonaws.com' },
          Condition: { StringEquals: { 'aws:SourceAccount': ACCOUNT } },
        },
      ],
    });
  });

  it('has exactly one inline policy and no managed policy or boundary', () => {
    const exec = role(identity, execRoleId);
    expect((exec.Properties?.Policies as Array<{ PolicyName: string }>).map(({ PolicyName }) => PolicyName)).toEqual([
      'LandingSiteResources',
    ]);
    expect(exec.Properties?.ManagedPolicyArns).toBeUndefined();
    expect(exec.Properties?.PermissionsBoundary).toBeUndefined();
  });

  it('allows no IAM, STS, Organizations or CloudFormation action at all, and denies them explicitly', () => {
    const statements = inlinePolicy(execRoleId, 'LandingSiteResources');
    expect(allowedActions(statements).filter((action) => /^(iam|sts|organizations|cloudformation):/.test(action))).toEqual([]);
    expect(statements.filter((statement) => statement.Effect === 'Deny')).toEqual([
      {
        Sid: 'NeverIdentityOrStacks',
        Effect: 'Deny',
        Action: ['cloudformation:*', 'iam:*', 'organizations:*', 'sts:AssumeRole'],
        Resource: '*',
      },
    ]);
    // No NotAction/NotResource anywhere: an inverted statement could grant by omission.
    for (const statement of statements) {
      expect(Object.keys(statement).sort(), statement.Sid).toEqual(['Action', 'Effect', 'Resource', 'Sid']);
    }
  });

  it('grants exactly the reviewed actions on exactly the site stack resources', () => {
    expect(inlinePolicy(execRoleId, 'LandingSiteResources').filter((statement) => statement.Effect === 'Allow')).toEqual([
      {
        Sid: 'SiteStackBuckets',
        Effect: 'Allow',
        Action: [
          's3:CreateBucket',
          's3:DeleteBucket',
          's3:DeleteBucketPolicy',
          's3:DeleteBucketTagging',
          's3:GetAccelerateConfiguration',
          's3:GetAnalyticsConfiguration',
          's3:GetBucketAbac',
          's3:GetBucketAcl',
          's3:GetBucketCORS',
          's3:GetBucketLogging',
          's3:GetBucketMetadataTableConfiguration',
          's3:GetBucketNotification',
          's3:GetBucketObjectLockConfiguration',
          's3:GetBucketOwnershipControls',
          's3:GetBucketPolicy',
          's3:GetBucketPublicAccessBlock',
          's3:GetBucketTagging',
          's3:GetBucketVersioning',
          's3:GetBucketWebsite',
          's3:GetEncryptionConfiguration',
          's3:GetIntelligentTieringConfiguration',
          's3:GetInventoryConfiguration',
          's3:GetLifecycleConfiguration',
          's3:GetMetricsConfiguration',
          's3:GetReplicationConfiguration',
          's3:ListBucket',
          's3:ListTagsForResource',
          's3:PutBucketAcl',
          's3:PutBucketLogging',
          's3:PutBucketOwnershipControls',
          's3:PutBucketPolicy',
          's3:PutBucketPublicAccessBlock',
          's3:PutBucketTagging',
          's3:PutBucketVersioning',
          's3:PutEncryptionConfiguration',
          's3:PutLifecycleConfiguration',
          's3:TagResource',
          's3:UntagResource',
        ],
        Resource: 'arn:aws:s3:::m3tric-staging-landingsitestack-*',
      },
      {
        Sid: 'SiteDistribution',
        Effect: 'Allow',
        Action: [
          'cloudfront:DeleteDistribution',
          'cloudfront:GetDistribution',
          'cloudfront:GetDistributionConfig',
          'cloudfront:ListTagsForResource',
          'cloudfront:TagResource',
          'cloudfront:UntagResource',
          'cloudfront:UpdateDistribution',
        ],
        Resource: DISTRIBUTION_ARN,
      },
      {
        Sid: 'SiteOriginAccessControl',
        Effect: 'Allow',
        Action: [
          'cloudfront:DeleteOriginAccessControl',
          'cloudfront:GetOriginAccessControl',
          'cloudfront:UpdateOriginAccessControl',
        ],
        Resource: `arn:aws:cloudfront::${ACCOUNT}:origin-access-control/E3QYZ9YDRZ4IZP`,
      },
      {
        Sid: 'SiteResponseHeadersPolicy',
        Effect: 'Allow',
        Action: [
          'cloudfront:DeleteResponseHeadersPolicy',
          'cloudfront:GetResponseHeadersPolicy',
          'cloudfront:UpdateResponseHeadersPolicy',
        ],
        Resource: `arn:aws:cloudfront::${ACCOUNT}:response-headers-policy/952c4e4a-adb6-4ed4-b06a-dbc54cac2676`,
      },
      {
        Sid: 'SiteBudgetTopic',
        Effect: 'Allow',
        Action: [
          'sns:CreateTopic',
          'sns:DeleteTopic',
          'sns:GetDataProtectionPolicy',
          'sns:GetTopicAttributes',
          'sns:ListSubscriptionsByTopic',
          'sns:ListTagsForResource',
          'sns:PutDataProtectionPolicy',
          'sns:SetTopicAttributes',
          'sns:TagResource',
          'sns:UntagResource',
        ],
        Resource: `arn:aws:sns:us-east-2:${ACCOUNT}:m3tric-staging-landing-*`,
      },
      {
        Sid: 'SiteBudget',
        Effect: 'Allow',
        Action: [
          'budgets:ListTagsForResource',
          'budgets:ModifyBudget',
          'budgets:TagResource',
          'budgets:UntagResource',
          'budgets:ViewBudget',
        ],
        Resource: `arn:aws:budgets::${ACCOUNT}:budget/m3tric-staging-landing-*`,
      },
    ]);
  });

  it('never creates CloudFront resources and cannot reach the assets bucket or the shared bootstrap', () => {
    const actions = everyAction(execRoleId);
    expect(actions.filter((action) => /^cloudfront:Create/.test(action))).toEqual([]);
    const resources = JSON.stringify(inlinePolicy(execRoleId, 'LandingSiteResources'));
    expect(resources).not.toContain('cdk-assets');
    expect(resources).not.toContain('hnb659fds');
    expect(resources).not.toContain('distribution/*');
  });

  it('pins CloudFront to the configured IDs rather than hardcoded strings', () => {
    const other = synthesize(
      stagingConfig((raw) => {
        raw.siteCloudFront = {
          distributionId: 'E0000000000000',
          originAccessControlId: 'E1111111111111',
          responseHeadersPolicyId: '00000000-0000-4000-8000-000000000000',
        };
      }),
    );
    const policy = JSON.stringify(
      (other.identity.Resources[execRoleId]!.Properties?.Policies as Array<{ PolicyDocument: unknown }>)[0]!.PolicyDocument,
    );
    expect(policy).toContain(`distribution/E0000000000000"`);
    expect(policy).toContain(`origin-access-control/E1111111111111"`);
    expect(policy).toContain(`response-headers-policy/00000000-0000-4000-8000-000000000000"`);
    expect(policy).not.toContain('E1J2L9XZIAGQ7M');
  });
});

describe('GitHub deploy role', () => {
  it('defines the role with the exact name, path, one-hour session cap and no managed policy', () => {
    const deploy = role(identity, deployRoleId);
    expect(Object.keys(withoutTags(deploy.Properties)).sort()).toEqual([
      'AssumeRolePolicyDocument',
      'Description',
      'MaxSessionDuration',
      'Path',
      'Policies',
      'RoleName',
    ]);
    expect(deploy.Properties?.RoleName).toBe('m3tric-staging-landing-github-deploy');
    expect(deploy.Properties?.Path).toBe('/m3tric/delivery/');
    expect(deploy.Properties?.MaxSessionDuration).toBe(3600);
  });

  it('trusts exactly the three delivery workflows on main, in the landing-staging environment (exact aud + sub list)', () => {
    expect(role(identity, deployRoleId).Properties?.AssumeRolePolicyDocument).toEqual({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: 'sts:AssumeRoleWithWebIdentity',
          Principal: { Federated: `arn:aws:iam::${ACCOUNT}:oidc-provider/token.actions.githubusercontent.com` },
          Condition: {
            StringEquals: {
              'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
              'token.actions.githubusercontent.com:sub': EXPECTED_SUBJECTS,
            },
          },
        },
      ],
    });
  });

  it('derives the subjects from configuration rather than a hardcoded string', () => {
    expect(githubOidcSubjects({ owner: 'Org', repo: 'site', environment: 'prod' })).toEqual([
      'repo:Org/site:environment:prod:ref:refs/heads/main:job_workflow_ref:Org/site/.github/workflows/deploy.yml@refs/heads/main',
      'repo:Org/site:environment:prod:ref:refs/heads/main:job_workflow_ref:Org/site/.github/workflows/publish.yml@refs/heads/main',
      'repo:Org/site:environment:prod:ref:refs/heads/main:job_workflow_ref:Org/site/.github/workflows/rollback.yml@refs/heads/main',
    ]);
  });

  it('has exactly the deploy and publish inline policies', () => {
    expect(
      (role(identity, deployRoleId).Properties?.Policies as Array<{ PolicyName: string }>).map(({ PolicyName }) => PolicyName),
    ).toEqual(['LandingSiteDeploy', 'LandingSitePublish']);
  });

  it('cannot assume any role: no sts:AssumeRole Allow anywhere, and an explicit Deny', () => {
    const allowed = [
      ...allowedActions(inlinePolicy(deployRoleId, 'LandingSiteDeploy')),
      ...allowedActions(inlinePolicy(deployRoleId, 'LandingSitePublish')),
    ];
    expect(allowed.filter((action) => action.startsWith('sts:'))).toEqual([]);
    expect(JSON.stringify(role(identity, deployRoleId).Properties?.Policies)).not.toContain('hnb659fds');
  });

  it('grants exactly the change-set calls on the site stack, CreateChangeSet only with the execution role', () => {
    expect(inlinePolicy(deployRoleId, 'LandingSiteDeploy')).toEqual([
      {
        Sid: 'SiteStackChangeSets',
        Effect: 'Allow',
        Action: [
          'cloudformation:DeleteChangeSet',
          'cloudformation:DescribeChangeSet',
          'cloudformation:DescribeEvents',
          'cloudformation:DescribeStackEvents',
          'cloudformation:DescribeStackResources',
          'cloudformation:DescribeStacks',
          'cloudformation:ExecuteChangeSet',
          'cloudformation:GetTemplate',
          'cloudformation:GetTemplateSummary',
          'cloudformation:ListChangeSets',
        ],
        Resource: SITE_STACK_ARN,
      },
      {
        Sid: 'SiteStackChangeSetAsExecRole',
        Effect: 'Allow',
        Action: 'cloudformation:CreateChangeSet',
        Resource: SITE_STACK_ARN,
        Condition: { StringEquals: { 'cloudformation:RoleArn': EXEC_ROLE_ARN } },
      },
      {
        Sid: 'PassExecRoleToCloudFormation',
        Effect: 'Allow',
        Action: 'iam:PassRole',
        Resource: EXEC_ROLE_ARN,
        Condition: { StringEquals: { 'iam:PassedToService': 'cloudformation.amazonaws.com' } },
      },
      {
        Sid: 'AssetsBucketInfo',
        Effect: 'Allow',
        Action: ['s3:GetBucketLocation', 's3:GetEncryptionConfiguration'],
        Resource: ASSETS_BUCKET_ARN,
      },
      {
        Sid: 'AssetsBucketListSitePrefix',
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: ASSETS_BUCKET_ARN,
        Condition: { StringLike: { 's3:prefix': 'site/*' } },
      },
      {
        Sid: 'AssetsSiteObjects',
        Effect: 'Allow',
        Action: ['s3:GetObject', 's3:PutObject'],
        Resource: `${ASSETS_BUCKET_ARN}/site/*`,
      },
      {
        Sid: 'NeverOtherStacks',
        Effect: 'Deny',
        Action: 'cloudformation:*',
        NotResource: SITE_STACK_ARN,
      },
      {
        Sid: 'NeverAssumeRoles',
        Effect: 'Deny',
        Action: 'sts:AssumeRole',
        Resource: '*',
      },
    ]);
  });

  it('can never create or update a stack directly, delete one, or change termination protection', () => {
    const allowed = allowedActions(inlinePolicy(deployRoleId, 'LandingSiteDeploy'));
    for (const action of [
      'cloudformation:CreateStack',
      'cloudformation:UpdateStack',
      'cloudformation:DeleteStack',
      'cloudformation:UpdateTerminationProtection',
      'cloudformation:SetStackPolicy',
      'cloudformation:ContinueUpdateRollback',
      'cloudformation:RollbackStack',
    ]) {
      expect(allowed).not.toContain(action);
    }
    expect(allowed.filter((action) => action.includes('*'))).toEqual([]);
  });

  it('publishes only to the site bucket and invalidates only the configured distribution', () => {
    expect(inlinePolicy(deployRoleId, 'LandingSitePublish')).toEqual([
      { Sid: 'ListSiteBucket', Effect: 'Allow', Action: 's3:ListBucket', Resource: SITE_BUCKET_ARN },
      {
        Sid: 'SyncSiteObjects',
        Effect: 'Allow',
        Action: ['s3:DeleteObject', 's3:GetObject', 's3:PutObject'],
        Resource: `${SITE_BUCKET_ARN}/*`,
      },
      {
        Sid: 'InvalidateDistribution',
        Effect: 'Allow',
        Action: ['cloudfront:CreateInvalidation', 'cloudfront:GetInvalidation'],
        Resource: DISTRIBUTION_ARN,
      },
    ]);
  });

  it('never reuses the old site-stack policy name (deleting that one must not delete this one)', () => {
    const names = (role(identity, deployRoleId).Properties?.Policies as Array<{ PolicyName: string }>).map(
      ({ PolicyName }) => PolicyName,
    );
    expect(names).not.toContain('m3tric-staging-landing-publish');
    expect(names).not.toContain('LandingCdkDelivery');
  });
});

// Physical names shared by both stacks. The identity stack grants permissions on
// resources the site stack creates (and the site stack synthesizes against the
// assets bucket the identity stack creates), always BY NAME, so both stacks must
// derive those names from this one place.

export const APPLICATION = 'm3tric';

// Literal, not Stack.partition: the ARNs below are also cdk-nag acknowledgement
// keys, which must be plain strings (a token key fails synth). The config schema
// restricts regions to the commercial partition to keep this true.
export const PARTITION = 'aws';

export const DELIVERY_IDENTITY_STACK_ID = 'LandingDeliveryIdentityStack';
export const SITE_STACK_ID = 'LandingSiteStack';

// Construct ids inside the site stack whose CloudFormation-generated physical
// names the identity stack's policies match by prefix (see siteStackBucketNamePrefix).
export const SITE_BUCKET_ID = 'SiteBucket';

export const DEPLOY_ROLE_PATH = '/m3tric/delivery/';

export const GITHUB_OIDC_HOST = 'token.actions.githubusercontent.com';
export const GITHUB_OIDC_AUDIENCE = 'sts.amazonaws.com';

// The only key prefix the site stack's CLI-credentials synthesizer writes to in
// the dedicated assets bucket (today: just the stack template).
export const SITE_ASSETS_PREFIX = 'site/';

export function stackName(environment: string, stackId: string): string {
  return `${APPLICATION}-${environment}-${stackId}`;
}

// Every name below starts with this; the execution role scopes SNS and Budgets
// permissions to `<prefix>-*`, which no other project in the account uses.
export function landingNamePrefix(environment: string): string {
  return `${APPLICATION}-${environment}-landing`;
}

export function deployRoleName(environment: string): string {
  return `${landingNamePrefix(environment)}-github-deploy`;
}

export function cfnExecRoleName(environment: string): string {
  return `${landingNamePrefix(environment)}-cfn-exec`;
}

// Account and region in the name: S3 names are global, and the name must be
// known before the bucket exists (the site stack synthesizes against it).
export function cdkAssetsBucketName(environment: string, account: string, region: string): string {
  return `${landingNamePrefix(environment)}-cdk-assets-${account}-${region}`;
}

export function responseHeadersPolicyName(environment: string): string {
  return `${landingNamePrefix(environment)}-security-headers`;
}

export function budgetName(environment: string): string {
  return `${landingNamePrefix(environment)}-monthly`;
}

export function budgetTopicName(environment: string): string {
  return `${landingNamePrefix(environment)}-budget-alerts`;
}

/**
 * Prefix of every bucket name CloudFormation generates for the site stack:
 * `<stack name, lower-cased>-<logical id, lower-cased>-<random suffix>`. The
 * stack name is short enough (31 characters) that CloudFormation never truncates it.
 */
export function siteStackBucketNamePrefix(environment: string): string {
  return `${stackName(environment, SITE_STACK_ID).toLowerCase()}-`;
}

export function s3BucketArn(bucketName: string): string {
  return `arn:${PARTITION}:s3:::${bucketName}`;
}

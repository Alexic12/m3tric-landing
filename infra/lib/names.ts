// Physical names shared by both stacks. The site stack attaches its publish
// policy to the delivery role BY NAME only (the identity stack is deployed by a
// human beforehand), so both stacks must derive that name from this one place.

export const APPLICATION = 'm3tric';

// Literal, not Stack.partition: the ARNs below are also cdk-nag acknowledgement
// keys, which must be plain strings (a token key fails synth). The config schema
// restricts regions to the commercial partition to keep this true.
export const PARTITION = 'aws';

export const DELIVERY_IDENTITY_STACK_ID = 'LandingDeliveryIdentityStack';
export const SITE_STACK_ID = 'LandingSiteStack';

export const DEPLOY_ROLE_PATH = '/m3tric/delivery/';

export const GITHUB_OIDC_HOST = 'token.actions.githubusercontent.com';
export const GITHUB_OIDC_AUDIENCE = 'sts.amazonaws.com';

// The three roles of the existing CDK bootstrap that `cdk deploy` chains into.
export const CDK_BOOTSTRAP_ROLE_KINDS = ['deploy', 'file-publishing', 'lookup'] as const;

export function stackName(environment: string, stackId: string): string {
  return `${APPLICATION}-${environment}-${stackId}`;
}

export function deployRoleName(environment: string): string {
  return `${APPLICATION}-${environment}-landing-github-deploy`;
}

export function publishPolicyName(environment: string): string {
  return `${APPLICATION}-${environment}-landing-publish`;
}

export function responseHeadersPolicyName(environment: string): string {
  return `${APPLICATION}-${environment}-landing-security-headers`;
}

export function budgetName(environment: string): string {
  return `${APPLICATION}-${environment}-landing-monthly`;
}

export function budgetTopicName(environment: string): string {
  return `${APPLICATION}-${environment}-landing-budget-alerts`;
}

export function cdkBootstrapRoleName(
  qualifier: string,
  kind: (typeof CDK_BOOTSTRAP_ROLE_KINDS)[number],
  account: string,
  region: string,
): string {
  return `cdk-${qualifier}-${kind}-role-${account}-${region}`;
}

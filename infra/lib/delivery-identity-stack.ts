import { CfnOutput, Duration, Stack, Validations, type StackProps } from 'aws-cdk-lib';
import {
  Effect,
  FederatedPrincipal,
  OpenIdConnectProvider,
  PolicyDocument,
  PolicyStatement,
  Role,
} from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';

import type { LandingConfig } from './config';
import {
  CDK_BOOTSTRAP_ROLE_KINDS,
  DEPLOY_ROLE_PATH,
  PARTITION,
  GITHUB_OIDC_AUDIENCE,
  GITHUB_OIDC_HOST,
  SITE_STACK_ID,
  cdkBootstrapRoleName,
  deployRoleName,
  stackName,
} from './names';

// GitHub's assume-role-with-web-identity session cannot exceed the role's maximum;
// one hour covers a landing deploy (CDK + publish + invalidation wait) with margin.
const MAX_SESSION = Duration.hours(1);

export interface LandingDeliveryIdentityStackProps extends StackProps {
  readonly config: LandingConfig;
}

export function githubOidcSubject(github: LandingConfig['github']): string {
  return `repo:${github.owner}/${github.repo}:environment:${github.environment}`;
}

/**
 * GitHub Actions deploy identity. Deployed once by a human with local AWS
 * credentials, never by the workflow it authorizes, so the workflow cannot widen
 * its own trust or permissions (ADR-002).
 */
export class LandingDeliveryIdentityStack extends Stack {
  public readonly deployRole: Role;
  public readonly deployRoleName: string;

  public constructor(scope: Construct, id: string, props: LandingDeliveryIdentityStackProps) {
    const { config, ...stackProps } = props;
    super(scope, id, {
      description: 'M3TRIC landing: GitHub Actions OIDC deploy role (deployed manually, once)',
      ...stackProps,
      terminationProtection: true,
    });

    this.deployRoleName = deployRoleName(config.environment);

    // Imported, never created: the account already has exactly one GitHub
    // provider and IAM allows only one per issuer URL.
    const provider = OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      'GitHubOidcProvider',
      config.oidcProviderArn,
    );

    const bootstrapRoleArns = CDK_BOOTSTRAP_ROLE_KINDS.map(
      (kind) =>
        `arn:${PARTITION}:iam::${config.account}:role/${cdkBootstrapRoleName(
          config.cdkQualifier,
          kind,
          config.account,
          config.region,
        )}`,
    );
    // The stack ID suffix is a UUID assigned by CloudFormation at creation, so the
    // resource can only be pinned up to the stack name.
    const siteStackArn = `arn:${PARTITION}:cloudformation:${config.region}:${config.account}:stack/${stackName(
      config.environment,
      SITE_STACK_ID,
    )}/*`;

    this.deployRole = new Role(this, 'GitHubDeployRole', {
      roleName: this.deployRoleName,
      path: DEPLOY_ROLE_PATH,
      maxSessionDuration: MAX_SESSION,
      description: `GitHub Actions (${githubOidcSubject(config.github)}) deploys the M3TRIC landing via CDK`,
      assumedBy: new FederatedPrincipal(
        provider.openIdConnectProviderArn,
        {
          StringEquals: {
            [`${GITHUB_OIDC_HOST}:aud`]: GITHUB_OIDC_AUDIENCE,
            [`${GITHUB_OIDC_HOST}:sub`]: githubOidcSubject(config.github),
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
      inlinePolicies: {
        LandingCdkDelivery: new PolicyDocument({
          statements: [
            new PolicyStatement({
              sid: 'AssumeCdkBootstrapRoles',
              effect: Effect.ALLOW,
              actions: ['sts:AssumeRole'],
              resources: bootstrapRoleArns,
            }),
            new PolicyStatement({
              sid: 'ReadLandingSiteStackOutputs',
              effect: Effect.ALLOW,
              actions: ['cloudformation:DescribeStacks'],
              resources: [siteStackArn],
            }),
          ],
        }),
      },
    });

    Validations.of(this.deployRole).acknowledge({
      id: `AwsSolutions-IAM5[Resource::${siteStackArn}]`,
      reason:
        'cloudformation:DescribeStacks is pinned to the single landing site stack name; the trailing /* is the stack UUID, which CloudFormation assigns at creation and cannot be known in advance.',
    });

    new CfnOutput(this, 'RoleArn', {
      description: 'Role ARN for aws-actions/configure-aws-credentials (role-to-assume)',
      value: this.deployRole.roleArn,
    });
  }
}

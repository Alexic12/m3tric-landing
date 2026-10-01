import { describe, expect, it } from 'vitest';

import { IDENTITY_STACK, allowedActions, getAtt, onlyResource, stagingConfig, synthesize, withoutTags } from './helpers';

const { stacks, identity } = synthesize();

describe('LandingDeliveryIdentityStack', () => {
  it('uses the agreed physical stack name with termination protection on', () => {
    expect(stacks.identity.stackName).toBe(IDENTITY_STACK);
    expect(stacks.identity.terminationProtection).toBe(true);
  });

  it('creates exactly one IAM role and imports (never creates) the OIDC provider', () => {
    expect(Object.values(identity.Resources).map((resource) => resource.Type)).toEqual(['AWS::IAM::Role']);
  });

  it('defines the role with the exact name, path and one-hour session cap', () => {
    const [, role] = onlyResource(identity, 'AWS::IAM::Role');
    expect(role.Properties?.RoleName).toBe('m3tric-staging-landing-github-deploy');
    expect(role.Properties?.Path).toBe('/m3tric/delivery/');
    expect(role.Properties?.MaxSessionDuration).toBe(3600);
    expect(role.Properties?.ManagedPolicyArns).toBeUndefined();
    expect(role.Properties?.PermissionsBoundary).toBeUndefined();
  });

  it('trusts only the landing-staging GitHub environment of this repository (exact aud + sub)', () => {
    const [, role] = onlyResource(identity, 'AWS::IAM::Role');
    expect(role.Properties?.AssumeRolePolicyDocument).toEqual({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: 'sts:AssumeRoleWithWebIdentity',
          Principal: {
            Federated: 'arn:aws:iam::147997127433:oidc-provider/token.actions.githubusercontent.com',
          },
          Condition: {
            StringEquals: {
              'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
              'token.actions.githubusercontent.com:sub': 'repo:Alexic12/m3tric-landing:environment:landing-staging',
            },
          },
        },
      ],
    });
  });

  it('grants exactly the bootstrap role chain and DescribeStacks on the site stack', () => {
    const [, role] = onlyResource(identity, 'AWS::IAM::Role');
    expect(role.Properties?.Policies).toEqual([
      {
        PolicyName: 'LandingCdkDelivery',
        PolicyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'AssumeCdkBootstrapRoles',
              Effect: 'Allow',
              Action: 'sts:AssumeRole',
              Resource: [
                'arn:aws:iam::147997127433:role/cdk-hnb659fds-deploy-role-147997127433-us-east-2',
                'arn:aws:iam::147997127433:role/cdk-hnb659fds-file-publishing-role-147997127433-us-east-2',
                'arn:aws:iam::147997127433:role/cdk-hnb659fds-lookup-role-147997127433-us-east-2',
              ],
            },
            {
              Sid: 'ReadLandingSiteStackOutputs',
              Effect: 'Allow',
              Action: 'cloudformation:DescribeStacks',
              Resource: 'arn:aws:cloudformation:us-east-2:147997127433:stack/m3tric-staging-LandingSiteStack/*',
            },
          ],
        },
      },
    ]);
    expect(allowedActions(role.Properties?.Policies[0].PolicyDocument.Statement)).toEqual([
      'cloudformation:DescribeStacks',
      'sts:AssumeRole',
    ]);
  });

  it('has no properties beyond the reviewed set', () => {
    const [, role] = onlyResource(identity, 'AWS::IAM::Role');
    expect(Object.keys(withoutTags(role.Properties)).sort()).toEqual([
      'AssumeRolePolicyDocument',
      'Description',
      'MaxSessionDuration',
      'Path',
      'Policies',
      'RoleName',
    ]);
  });

  it('outputs only the role ARN, without a cross-stack export', () => {
    const [roleId] = onlyResource(identity, 'AWS::IAM::Role');
    expect(Object.keys(identity.Outputs ?? {})).toEqual(['RoleArn']);
    expect(identity.Outputs?.RoleArn?.Value).toEqual(getAtt(roleId, 'Arn'));
    expect(identity.Outputs?.RoleArn?.Export).toBeUndefined();
  });

  it('derives the subject from configuration rather than a hardcoded string', () => {
    const other = synthesize(stagingConfig((raw) => (raw.github.environment = 'landing-other')));
    const [, role] = onlyResource(other.identity, 'AWS::IAM::Role');
    expect(role.Properties?.AssumeRolePolicyDocument.Statement[0].Condition.StringEquals['token.actions.githubusercontent.com:sub']).toBe(
      'repo:Alexic12/m3tric-landing:environment:landing-other',
    );
  });
});

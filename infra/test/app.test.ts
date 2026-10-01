import { Stack, Validations } from 'aws-cdk-lib';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { AssetManifestArtifact } from 'aws-cdk-lib/cx-api';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { AwsSolutionsChecks } from 'cdk-nag';
import type { IConstruct } from 'constructs';
import { describe, expect, it } from 'vitest';

import { addNagChecks, buildLandingApp } from '../lib/landing-app';
import {
  IDENTITY_STACK,
  SITE_STACK,
  TEST_DEPLOYMENT,
  newApp,
  stagingConfig,
  synthesize,
  type TemplateJson,
} from './helpers';

const EXPECTED_TAGS = [
  { Key: 'Application', Value: 'm3tric' },
  { Key: 'Component', Value: 'landing' },
  { Key: 'CostCenter', Value: 'EAFIT-M3TRIC' },
  { Key: 'DataClassification', Value: 'public' },
  { Key: 'Environment', Value: 'staging' },
  { Key: 'GitSha', Value: '1234567890abcdef1234567890abcdef12345678' },
  { Key: 'ManagedBy', Value: 'aws-cdk' },
  { Key: 'Owner', Value: 'Alejandro Puerta' },
  { Key: 'ReleaseId', Value: 'test-release-0001' },
];

// Every resource type the app may contain, split by whether CloudFormation can
// tag it. A new type fails this test until someone decides where it belongs.
const TAGGED_TYPES = ['AWS::IAM::Role', 'AWS::S3::Bucket', 'AWS::CloudFront::Distribution', 'AWS::SNS::Topic'];
const BUDGET_TYPE = 'AWS::Budgets::Budget'; // tagged through ResourceTags (lower-case keys)
const UNTAGGABLE_TYPES = [
  'AWS::S3::BucketPolicy',
  'AWS::CloudFront::OriginAccessControl',
  'AWS::CloudFront::ResponseHeadersPolicy',
  'AWS::SNS::TopicPolicy',
];

// The complete, reviewed suppression table. Adding or widening a suppression
// must change this list in the same diff.
const EXPECTED_ACKNOWLEDGEMENTS = [
  `${IDENTITY_STACK}/GitHubDeployRole :: AwsSolutions-IAM5[Resource::arn:aws:cloudformation:us-east-2:147997127433:stack/m3tric-staging-LandingSiteStack/*]`,
  `${IDENTITY_STACK}/GitHubDeployRole :: AwsSolutions-IAM5[Resource::arn:aws:s3:::m3tric-staging-landing-cdk-assets-147997127433-us-east-2/site/*]`,
  `${IDENTITY_STACK}/GitHubDeployRole :: AwsSolutions-IAM5[Resource::arn:aws:s3:::m3tric-staging-landingsitestack-sitebucket*]`,
  `${IDENTITY_STACK}/GitHubDeployRole :: AwsSolutions-IAM5[Resource::arn:aws:s3:::m3tric-staging-landingsitestack-sitebucket*/*]`,
  `${IDENTITY_STACK}/CfnExecRole :: AwsSolutions-IAM5[Resource::arn:aws:s3:::m3tric-staging-landingsitestack-*]`,
  `${IDENTITY_STACK}/CfnExecRole :: AwsSolutions-IAM5[Resource::arn:aws:sns:us-east-2:147997127433:m3tric-staging-landing-*]`,
  `${IDENTITY_STACK}/CfnExecRole :: AwsSolutions-IAM5[Resource::arn:aws:budgets::147997127433:budget/m3tric-staging-landing-*]`,
  `${IDENTITY_STACK}/CdkAssetsBucket :: AwsSolutions-S1`,
  `${SITE_STACK}/Distribution :: AwsSolutions-CFR1`,
  `${SITE_STACK}/Distribution :: AwsSolutions-CFR2`,
  `${SITE_STACK}/Distribution :: AwsSolutions-CFR4`,
].sort();

interface Acknowledgement {
  readonly path: string;
  readonly id: string;
  readonly reason: string;
}

function acknowledgements(root: IConstruct): Acknowledgement[] {
  return root.node
    .findAll()
    .flatMap((construct) =>
      construct.node.metadata
        .filter((entry) => entry.type === Validations.ACKNOWLEDGED_RULES_METADATA_KEY)
        .flatMap((entry) =>
          Object.entries(entry.data as Record<string, string>).map(([id, reason]) => ({
            path: construct.node.path,
            id: id.replace(/^annotation::/i, ''),
            reason,
          })),
        ),
    );
}

/** Findings cdk-nag would raise if nothing were acknowledged, as `<construct> :: <rule>`. */
function rawFindings(root: IConstruct): string[] {
  const pack = new AwsSolutionsChecks();
  // isAcknowledged is private API; shadowing it on the instance lets the test
  // see what each suppression is hiding without editing the stacks.
  (pack as unknown as { isAcknowledged: () => boolean }).isAcknowledged = () => false;
  return pack
    .validateScope(root)
    .violations.flatMap((violation) =>
      violation.violatingResources.map(
        (resource) => `${resource.constructPath?.replace(/\/Resource$/, '')} :: ${violation.ruleName}`,
      ),
    )
    .sort();
}

function tagsOf(type: string, properties: Record<string, any> | undefined): unknown {
  if (type === BUDGET_TYPE) {
    return (properties?.ResourceTags as Array<{ Key: string; Value: string }> | undefined)?.map(({ Key, Value }) => ({
      Key,
      Value,
    }));
  }
  return properties?.Tags;
}

describe('landing CDK app', () => {
  const synthesized = synthesize();
  const { app, stacks } = synthesized;

  it('selects stacks by their physical names (cdk deploy m3tric-staging-LandingSiteStack)', () => {
    const assembly = app.synth();
    expect(assembly.stacks.map((stack) => [stack.id, stack.stackName]).sort()).toEqual([
      [IDENTITY_STACK, IDENTITY_STACK],
      [SITE_STACK, SITE_STACK],
    ]);
    for (const stack of assembly.stacks) {
      expect(stack.environment).toMatchObject({ account: '147997127433', region: 'us-east-2' });
    }
  });

  it('carries the nine required tags on the stacks themselves', () => {
    const assembly = app.synth();
    const expected = Object.fromEntries(EXPECTED_TAGS.map(({ Key, Value }) => [Key, Value]));
    for (const stack of assembly.stacks) {
      expect(stack.tags).toEqual(expected);
    }
  });

  it.each([
    ['identity', () => synthesized.identity],
    ['site', () => synthesized.site],
  ])('tags every taggable %s resource with exactly the required set', (_name, template: () => TemplateJson) => {
    for (const [logicalId, resource] of Object.entries(template().Resources)) {
      if (UNTAGGABLE_TYPES.includes(resource.Type)) {
        expect(resource.Properties?.Tags, logicalId).toBeUndefined();
        continue;
      }
      expect([...TAGGED_TYPES, BUDGET_TYPE], `${logicalId} has unclassified type ${resource.Type}`).toContain(resource.Type);
      expect(tagsOf(resource.Type, resource.Properties), logicalId).toEqual(EXPECTED_TAGS);
    }
  });

  it('deploys the identity stack (human only) through the account bootstrap it has (version 31)', () => {
    const ACCOUNT_BOOTSTRAP_VERSION = 31;
    const template = synthesized.identity;
    expect(template.Parameters?.BootstrapVersion?.Default).toBe('/cdk-bootstrap/hnb659fds/version');
    const assertion = template.Rules?.CheckBootstrapVersion?.Assertions?.[0]?.Assert;
    const rejected = assertion['Fn::Not'][0]['Fn::Contains'][0] as string[];
    expect(Math.max(...rejected.map(Number)) + 1).toBeLessThanOrEqual(ACCOUNT_BOOTSTRAP_VERSION);
    const stack = app.synth().getStackByName(IDENTITY_STACK);
    expect(stack.requiresBootstrapStackVersion).toBeLessThanOrEqual(ACCOUNT_BOOTSTRAP_VERSION);
    expect(stack.assumeRoleArn).toBe('arn:${AWS::Partition}:iam::147997127433:role/cdk-hnb659fds-deploy-role-147997127433-us-east-2');
  });

  it('synthesizes the site stack with CLI credentials into the dedicated assets bucket, with no bootstrap dependency', () => {
    const assembly = app.synth();
    const stack = assembly.getStackByName(SITE_STACK);
    // No role of the shared bootstrap is ever assumed or passed on the CLI's behalf.
    expect(stack.assumeRoleArn).toBeUndefined();
    expect(stack.cloudFormationExecutionRoleArn).toBeUndefined();
    expect(stack.lookupRole).toBeUndefined();
    expect(stack.requiresBootstrapStackVersion).toBeUndefined();
    expect(stack.bootstrapStackVersionSsmParameter).toBeUndefined();
    expect(synthesized.site.Parameters).toBeUndefined();
    expect(synthesized.site.Rules).toBeUndefined();
    expect(JSON.stringify(synthesized.site)).not.toMatch(/BootstrapVersion|AWS::SSM|hnb659fds/);
    expect(stack.stackTemplateAssetObjectUrl).toMatch(
      /^s3:\/\/m3tric-staging-landing-cdk-assets-147997127433-us-east-2\/site\/[0-9a-f]{64}\.json$/,
    );

    const manifests = stack.dependencies.filter(AssetManifestArtifact.isAssetManifestArtifact);
    expect(manifests).toHaveLength(1);
    const { files = {}, dockerImages = {} } = manifests[0]!.contents;
    expect(dockerImages).toEqual({});
    const destinations = Object.values(files).flatMap((file) => Object.values(file.destinations));
    expect(destinations).toEqual([
      {
        bucketName: 'm3tric-staging-landing-cdk-assets-147997127433-us-east-2',
        objectKey: expect.stringMatching(/^site\/[0-9a-f]{64}\.json$/),
        region: 'us-east-2',
      },
    ]);
  });

  it('rejects a context env that does not match the configuration', () => {
    expect(() => buildLandingApp(newApp(), stagingConfig(), { ...TEST_DEPLOYMENT, environment: 'production' })).toThrow(
      /does not match configuration staging/,
    );
  });

  it('emits no CDK error or warning annotations', () => {
    // cdk-nag 3 reports through the Validations plugin API, not annotations, so
    // this only covers CDK's own diagnostics; the nag gate is the suite below.
    for (const stack of [stacks.identity, stacks.site]) {
      expect(Annotations.fromStack(stack).findError('*', Match.anyValue())).toEqual([]);
      expect(Annotations.fromStack(stack).findWarning('*', Match.anyValue())).toEqual([]);
    }
  });
});

describe('cdk-nag AwsSolutions', () => {
  it('reports zero unacknowledged findings across the whole app', () => {
    const { app } = synthesize();
    expect(new AwsSolutionsChecks(undefined, { verbose: true }).validateScope(app)).toEqual({ success: true, violations: [] });
  });

  it('acknowledges exactly the reviewed table, each with a real reason and a literal rule id', () => {
    const { app } = synthesize();
    const found = acknowledgements(app);
    expect(found.map(({ path, id }) => `${path} :: ${id}`).sort()).toEqual(EXPECTED_ACKNOWLEDGEMENTS);
    for (const { id, reason } of found) {
      expect(id, 'acknowledgement ids must be resolved strings, not tokens').not.toMatch(/\$\{Token\[/);
      expect(reason.length, `reason for ${id}`).toBeGreaterThanOrEqual(60);
    }
  });

  it('has no stale suppressions: every acknowledgement hides a finding that really exists', () => {
    const { app } = synthesize();
    expect(rawFindings(app)).toEqual(EXPECTED_ACKNOWLEDGEMENTS);
  });

  it('is live: the same pack flags a bare bucket (positive control)', () => {
    const app = newApp();
    new Bucket(new Stack(app, 'Control'), 'Bare');
    const ruleNames = new AwsSolutionsChecks().validateScope(app).violations.map((violation) => violation.ruleName);
    expect(ruleNames).toEqual(expect.arrayContaining(['AwsSolutions-S1', 'AwsSolutions-S10']));
  });

  it('fails synthesis through the same plugin wiring bin/landing.ts uses', () => {
    const clean = newApp();
    buildLandingApp(clean, stagingConfig(), TEST_DEPLOYMENT);
    addNagChecks(clean);
    expect(() => clean.synth()).not.toThrow();

    const dirty = newApp();
    buildLandingApp(dirty, stagingConfig(), TEST_DEPLOYMENT);
    new Bucket(new Stack(dirty, 'Control'), 'Bare');
    addNagChecks(dirty);
    expect(() => dirty.synth()).toThrow(/AwsSolutions-S1/);
  });
});

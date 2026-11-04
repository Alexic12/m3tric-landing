import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Template } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks } from 'cdk-nag';
import { describe, expect, it } from 'vitest';

import { loadLandingDeploymentConfig, parseLandingConfig } from '../lib/config';
import { buildLandingApp, buildLandingBootstrapApp } from '../lib/landing-app';
import { eafitLandingBucketName } from '../lib/names';
import { SITE_STACK, TEST_DEPLOYMENT, newApp, rawStagingConfig } from './helpers';

function targetRaw(): Record<string, any> {
  return JSON.parse(readFileSync(join(__dirname, '../config/eafit-staging.json'), 'utf8'));
}
function bootstrapConfig() {
  const input = targetRaw(); delete input.siteCloudFront; delete input.createOidcProvider;
  input.bootstrapSiteOnly = true;
  return parseLandingConfig(input);
}

describe('EAFIT landing migration bootstrap', () => {
  it('requires an explicit matching deployment profile and rejects source IDs and wrong targets', () => {
    expect(loadLandingDeploymentConfig('eafit-staging', 'staging')).toMatchObject({
      account: '914800441297', region: 'us-east-2', createOidcProvider: true,
    });
    expect(loadLandingDeploymentConfig('flypark-staging', 'staging').account).toBe('147997127433');
    for (const profile of ['unknown', '../staging']) {
      expect(() => loadLandingDeploymentConfig(profile, 'staging')).toThrow();
    }
    expect(() => loadLandingDeploymentConfig('eafit-staging', 'production')).toThrow();
    for (const mutate of [
      (input: Record<string, any>) => { input.account = '147997127433'; },
      (input: Record<string, any>) => { input.region = 'us-east-1'; },
      (input: Record<string, any>) => { input.siteCloudFront = rawStagingConfig().siteCloudFront; },
      (input: Record<string, any>) => { delete input.siteCloudFront; },
      (input: Record<string, any>) => { input.bootstrapSiteOnly = true; },
    ]) {
      const input = targetRaw(); mutate(input);
      expect(() => parseLandingConfig(input)).toThrow();
    }
  });

  it('synthesizes one asset-free, target-bound site without an identity or bootstrap dependency', () => {
    const app = newApp();
    const config = bootstrapConfig();
    const { site } = buildLandingBootstrapApp(app, config, TEST_DEPLOYMENT);
    const template = Template.fromStack(site).toJSON();
    const assembly = app.synth();
    expect(assembly.stacks.map((stack) => stack.stackName)).toEqual([SITE_STACK]);
    const artifact = assembly.getStackByName(SITE_STACK);
    expect(artifact.assumeRoleArn).toBeUndefined();
    expect(artifact.cloudFormationExecutionRoleArn).toBeUndefined();
    expect(artifact.requiresBootstrapStackVersion).toBeUndefined();
    expect(artifact.stackTemplateAssetObjectUrl).toBeUndefined();
    const serialized = JSON.stringify(template);
    expect(serialized).not.toMatch(/147997127433|E1J2L9XZIAGQ7M|E3QYZ9YDRZ4IZP|BootstrapVersion|AWS::IAM::|Custom::/);
    expect(template.Rules.ExpectedMigrationTarget.Assertions).toEqual([
      { Assert: { 'Fn::Equals': [{ Ref: 'AWS::AccountId' }, '914800441297'] }, AssertDescription: 'EAFIT account is required' },
      { Assert: { 'Fn::Equals': [{ Ref: 'AWS::Region' }, 'us-east-2'] }, AssertDescription: 'Ohio region is required' },
    ]);
    const buckets = Object.values(template.Resources).filter((resource: any) => resource.Type === 'AWS::S3::Bucket') as any[];
    expect(buckets.map((bucket) => bucket.Properties.BucketName).sort()).toEqual(
      [eafitLandingBucketName('site'), eafitLandingBucketName('logs')].sort());
    for (const bucket of buckets) expect(bucket.DeletionPolicy).toBe('Retain');
    for (const output of ['SiteBucketName', 'SiteUrl', 'DistributionId', 'OriginAccessControlId', 'ResponseHeadersPolicyId', 'LogsBucketName']) {
      expect(template.Outputs[output]).toBeDefined();
    }
    expect(Buffer.byteLength(serialized)).toBeLessThanOrEqual(51_200);
    expect(new AwsSolutionsChecks().validateScope(app)).toEqual({ success: true, violations: [] });
    expect(() => buildLandingApp(newApp(), config, TEST_DEPLOYMENT)).toThrow(/bootstrap app/);
  });

  it('creates only the explicit target provider and retains the source import behavior', () => {
    const config = parseLandingConfig(targetRaw());
    const app = newApp();
    const { identity } = buildLandingApp(app, config, TEST_DEPLOYMENT);
    const template = Template.fromStack(identity);
    template.resourceCountIs('AWS::IAM::OIDCProvider', 1);
    template.hasResource('AWS::IAM::OIDCProvider', {
      Properties: { Url: 'https://token.actions.githubusercontent.com', ClientIdList: ['sts.amazonaws.com'] },
      DeletionPolicy: 'Retain', UpdateReplacePolicy: 'Retain',
    });
    const serialized = JSON.stringify(template.toJSON());
    expect(serialized).not.toContain('Custom::');
    expect(serialized).toContain('environment:landing-eafit-staging:ref:refs/heads/main:job_workflow_ref:');
    expect(template.toJSON().Rules.ExpectedMigrationTarget.Assertions).toHaveLength(2);
    const source = rawStagingConfig(); source.createOidcProvider = true;
    expect(() => parseLandingConfig(source)).toThrow(/explicit EAFIT/);
    const imported = targetRaw(); delete imported.createOidcProvider;
    const importedStacks = buildLandingApp(newApp(), parseLandingConfig(imported), TEST_DEPLOYMENT);
    Template.fromStack(importedStacks.identity).resourceCountIs('AWS::IAM::OIDCProvider', 0);
  });

  it('keeps steady delivery policies pinned to target IDs and account-bound buckets', () => {
    const input = targetRaw();
    const config = parseLandingConfig(input);
    const app = newApp();
    const { identity } = buildLandingApp(app, config, TEST_DEPLOYMENT);
    const template = Template.fromStack(identity).toJSON();
    const serialized = JSON.stringify(template);
    expect(serialized).not.toContain('147997127433');
    expect(serialized).toContain('arn:aws:cloudfront::914800441297:distribution/E1EXSNY8BIV6RS');
    expect(serialized).not.toContain('arn:aws:cloudfront::914800441297:distribution/*');
    expect(serialized).toContain(eafitLandingBucketName('site'));
    expect(serialized).toContain(eafitLandingBucketName('logs'));
    expect(new AwsSolutionsChecks().validateScope(app)).toEqual({ success: true, violations: [] });
  });
});

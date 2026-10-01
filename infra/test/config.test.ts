import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  loadLandingConfig,
  parseLandingConfig,
  readDeploymentContext,
  requiredTags,
} from '../lib/config';
import { TEST_DEPLOYMENT, rawStagingConfig, stagingConfig } from './helpers';

function contextOf(values: Record<string, unknown>): { tryGetContext(key: string): unknown } {
  return { tryGetContext: (key: string) => values[key] };
}

const VALID_CONTEXT = { gitSha: 'a'.repeat(40), releaseId: 'identity-2026-10-01' };

describe('staging configuration file', () => {
  it('loads exactly the agreed staging values', () => {
    expect(loadLandingConfig('staging')).toEqual({
      account: '147997127433',
      region: 'us-east-2',
      environment: 'staging',
      tags: {
        Application: 'm3tric',
        Component: 'landing',
        Owner: 'Alejandro Puerta',
        CostCenter: 'EAFIT-M3TRIC',
        DataClassification: 'public',
      },
      github: { owner: 'Alexic12', repo: 'm3tric-landing', environment: 'landing-staging' },
      oidcProviderArn: 'arn:aws:iam::147997127433:oidc-provider/token.actions.githubusercontent.com',
      cdkQualifier: 'hnb659fds',
      budgetMonthlyUsd: 10,
      robotsNoindex: true,
      logRetentionDays: 90,
      noncurrentVersionDays: 90,
    });
  });

  it('fails with a clear message when an environment has no configuration file', () => {
    expect(() => loadLandingConfig('production')).toThrow(/Unable to read landing configuration .*production\.json/);
  });

  it('rejects a file whose declared environment differs from the requested one', () => {
    const directory = mkdtempSync(join(tmpdir(), 'landing-config-'));
    try {
      writeFileSync(join(directory, 'staging.json'), JSON.stringify({ ...rawStagingConfig(), environment: 'production' }));
      expect(() => loadLandingConfig('staging', directory)).toThrow(/declares environment production, expected staging/);
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  });
});

describe('configuration schema (fail closed)', () => {
  const rejects = (mutate: (raw: Record<string, any>) => void) => () => stagingConfig(mutate);

  it('rejects unknown keys at every level', () => {
    expect(rejects((raw) => (raw.extra = true))).toThrow();
    expect(rejects((raw) => (raw.tags.Extra = 'x'))).toThrow();
    expect(rejects((raw) => (raw.github.ref = 'main'))).toThrow();
  });

  it('only imports this account’s GitHub OIDC provider', () => {
    expect(rejects((raw) => (raw.oidcProviderArn = 'arn:aws:iam::111111111111:oidc-provider/token.actions.githubusercontent.com'))).toThrow(
      /oidcProviderArn must be exactly/,
    );
    expect(rejects((raw) => (raw.oidcProviderArn = 'arn:aws:iam::147997127433:oidc-provider/gitlab.com'))).toThrow(
      /oidcProviderArn must be exactly/,
    );
  });

  it('rejects wildcards and claim separators in any value that reaches the OIDC subject', () => {
    expect(rejects((raw) => (raw.github.environment = '*'))).toThrow();
    expect(rejects((raw) => (raw.github.environment = 'landing-staging:ref:refs/heads/main'))).toThrow();
    expect(rejects((raw) => (raw.github.repo = 'm3tric-*'))).toThrow();
    expect(rejects((raw) => (raw.github.repo = '..'))).toThrow();
    expect(rejects((raw) => (raw.github.owner = 'Alexic12?'))).toThrow();
  });

  it('restricts regions to the commercial partition the ARNs are built for', () => {
    expect(rejects((raw) => (raw.region = 'us-gov-west-1'))).toThrow();
    expect(rejects((raw) => (raw.region = 'cn-north-1'))).toThrow();
  });

  it('pins the tag values the budget filter and classification depend on', () => {
    expect(rejects((raw) => (raw.tags.Component = 'platform'))).toThrow();
    expect(rejects((raw) => (raw.tags.DataClassification = 'internal'))).toThrow();
    expect(rejects((raw) => (raw.tags.Owner = 'bad<owner>'))).toThrow();
  });

  it('rejects non-positive or non-integer retention and budget values', () => {
    expect(rejects((raw) => (raw.logRetentionDays = 0))).toThrow();
    expect(rejects((raw) => (raw.noncurrentVersionDays = 1.5))).toThrow();
    expect(rejects((raw) => (raw.budgetMonthlyUsd = 0))).toThrow();
    expect(rejects((raw) => (raw.cdkQualifier = 'HNB659FDS'))).toThrow();
  });

  it('round-trips the raw file through the public parser', () => {
    expect(parseLandingConfig(rawStagingConfig())).toEqual(loadLandingConfig('staging'));
  });
});

describe('deployment context', () => {
  it('defaults env to staging and returns the validated values', () => {
    expect(readDeploymentContext(contextOf(VALID_CONTEXT))).toEqual({
      environment: 'staging',
      gitSha: 'a'.repeat(40),
      releaseId: 'identity-2026-10-01',
    });
  });

  it('requires gitSha and releaseId (no defaults that could mislabel a deploy)', () => {
    expect(() => readDeploymentContext(contextOf({ releaseId: 'r-001' }))).toThrow(/gitSha is required/);
    expect(() => readDeploymentContext(contextOf({ gitSha: 'a'.repeat(40) }))).toThrow(/releaseId is required/);
  });

  it.each([
    ['uppercase', 'A'.repeat(40)],
    ['39 characters', 'a'.repeat(39)],
    ['41 characters', 'a'.repeat(41)],
    ['short sha', 'abc1234'],
    ['non-hex', 'g'.repeat(40)],
  ])('rejects a %s gitSha', (_label, gitSha) => {
    expect(() => readDeploymentContext(contextOf({ ...VALID_CONTEXT, gitSha }))).toThrow();
  });

  it.each([
    ['too short', 'ab'],
    ['leading separator', '-abc'],
    ['slash', 'a/b/c'],
    ['space', 'a b c'],
    ['129 characters', 'a'.repeat(129)],
  ])('rejects a %s releaseId', (_label, releaseId) => {
    expect(() => readDeploymentContext(contextOf({ ...VALID_CONTEXT, releaseId }))).toThrow();
  });

  it('accepts the longest permitted releaseId', () => {
    expect(readDeploymentContext(contextOf({ ...VALID_CONTEXT, releaseId: 'a'.repeat(128) })).releaseId).toHaveLength(128);
  });

  it('rejects unknown environments and non-string context values', () => {
    expect(() => readDeploymentContext(contextOf({ ...VALID_CONTEXT, env: 'dev' }))).toThrow();
    expect(() => readDeploymentContext(contextOf({ ...VALID_CONTEXT, gitSha: 1234 }))).toThrow(/must be a non-empty string/);
    expect(() => readDeploymentContext(contextOf({ ...VALID_CONTEXT, releaseId: '   ' }))).toThrow(/must be a non-empty string/);
  });
});

describe('required tags', () => {
  it('builds exactly the nine SPEC §10 tags', () => {
    expect(requiredTags(stagingConfig(), TEST_DEPLOYMENT)).toEqual({
      Application: 'm3tric',
      Component: 'landing',
      Environment: 'staging',
      Owner: 'Alejandro Puerta',
      CostCenter: 'EAFIT-M3TRIC',
      ManagedBy: 'aws-cdk',
      DataClassification: 'public',
      GitSha: '1234567890abcdef1234567890abcdef12345678',
      ReleaseId: 'test-release-0001',
    });
  });
});

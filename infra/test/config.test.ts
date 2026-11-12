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
import { FIXTURE_CERTIFICATE_ARN, TEST_DEPLOYMENT, eafitDomainConfig, rawStagingConfig, stagingConfig } from './helpers';

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
      siteCloudFront: {
        distributionId: 'E1J2L9XZIAGQ7M',
        originAccessControlId: 'E3QYZ9YDRZ4IZP',
        responseHeadersPolicyId: '952c4e4a-adb6-4ed4-b06a-dbc54cac2676',
      },
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

  it('accepts only CloudFront ID alphabets in the IDs that reach IAM resource ARNs', () => {
    expect(rejects((raw) => (raw.siteCloudFront.distributionId = '*'))).toThrow(/distribution ID/);
    expect(rejects((raw) => (raw.siteCloudFront.distributionId = 'E1J2L9XZIAGQ7M*'))).toThrow(/distribution ID/);
    expect(rejects((raw) => (raw.siteCloudFront.distributionId = 'E1J2L9XZIAGQ7M/x'))).toThrow(/distribution ID/);
    expect(rejects((raw) => (raw.siteCloudFront.originAccessControlId = 'e3qyz9ydrz4izp'))).toThrow(/origin access control ID/);
    expect(rejects((raw) => (raw.siteCloudFront.responseHeadersPolicyId = '952c4e4a-*'))).toThrow(/response headers policy ID/);
    expect(rejects((raw) => delete raw.siteCloudFront)).toThrow();
    expect(rejects((raw) => (raw.siteCloudFront.extra = 'x'))).toThrow();
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

describe('customDomain (SPEC-DOMINIO 6.3.1)', () => {
  const rejects = (mutate: (raw: Record<string, any>) => void) => () => eafitDomainConfig(mutate);

  it('is optional: the Flypark file has none and the EAFIT fixture parses', () => {
    expect(loadLandingConfig('staging').customDomain).toBeUndefined();
    expect(eafitDomainConfig().customDomain).toEqual({
      apexDomain: 'm3tric.io',
      redirectDomains: ['www.m3tric.io'],
      certificateArn: FIXTURE_CERTIFICATE_ARN,
    });
  });

  it('accepts an apex with no redirect domains', () => {
    expect(eafitDomainConfig((raw) => (raw.customDomain.redirectDomains = [])).customDomain?.redirectDomains).toEqual([]);
  });

  it('rejects unknown keys', () => {
    expect(rejects((raw) => (raw.customDomain.extra = true))).toThrow();
  });

  it('requires an ACM certificate ARN in us-east-1 and in the configured account', () => {
    for (const arn of [
      'arn:aws:acm:us-east-2:914800441297:certificate/11111111-2222-3333-4444-555555555555',
      'arn:aws:acm:us-east-1:147997127433:certificate/11111111-2222-3333-4444-555555555555',
      'arn:aws:acm:us-east-1:914800441297:certificate/*',
      'arn:aws:acm:us-east-1:914800441297:certificate/11111111-2222-3333-4444-55555555555',
      'arn:aws:acm:us-east-1:914800441297:certificate/11111111-2222-3333-4444-555555555555/x',
      'arn:aws:iam::914800441297:role/x',
      '',
    ]) {
      expect(rejects((raw) => (raw.customDomain.certificateArn = arn)), arn).toThrow();
    }
    expect(rejects((raw) => (raw.customDomain.certificateArn = FIXTURE_CERTIFICATE_ARN.replace('914800441297', '147997127433')))).toThrow(
      /belong to the configured account/,
    );
  });

  it('requires lower-case hostnames with at least two labels', () => {
    for (const apexDomain of ['M3TRIC.io', 'm3tric', 'm3tric.io.', '*.m3tric.io', 'm3tric.io/x', '-m3tric.io', 'm3 tric.io', '']) {
      expect(rejects((raw) => (raw.customDomain.apexDomain = apexDomain)), apexDomain).toThrow();
    }
    expect(rejects((raw) => (raw.customDomain.redirectDomains = ['WWW.m3tric.io']))).toThrow(/lower-case hostname/);
  });

  it('rejects hostnames longer than 253 characters', () => {
    const label = 'a'.repeat(61);
    const longest = [label, label, label, 'a'.repeat(63), 'io'].join('.'); // 61*3+63+2+4 dots = 252
    const tooLong = [label, label, label, 'a'.repeat(63), 'aaaaa', 'io'].join('.'); // 258
    expect(longest.length).toBeLessThanOrEqual(253);
    expect(tooLong.length).toBeGreaterThan(253);
    expect(eafitDomainConfig((raw) => { raw.customDomain.apexDomain = longest; raw.customDomain.redirectDomains = []; }).customDomain)
      .toBeDefined();
    expect(rejects((raw) => { raw.customDomain.apexDomain = tooLong; raw.customDomain.redirectDomains = []; })).toThrow(/lower-case hostname/);
  });

  it('accepts only direct subdomains of the apex as redirect domains, without duplicates', () => {
    for (const redirectDomains of [
      ['m3tric.io'],
      ['m3tric.io.evil.example'],
      ['wwwm3tric.io'],
      ['a.b.m3tric.io'],
      ['www.other.io'],
      ['www.m3tric.io', 'www.m3tric.io'],
    ]) {
      expect(rejects((raw) => (raw.customDomain.redirectDomains = redirectDomains)), redirectDomains.join()).toThrow();
    }
  });

  it('requires steady delivery: siteCloudFront present and never bootstrapSiteOnly', () => {
    expect(rejects((raw) => delete raw.siteCloudFront)).toThrow(/steady delivery/);
    expect(
      rejects((raw) => {
        delete raw.siteCloudFront;
        delete raw.createOidcProvider;
        raw.bootstrapSiteOnly = true;
      }),
    ).toThrow(/steady delivery/);
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

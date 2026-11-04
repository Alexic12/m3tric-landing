import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { resolveTarget } from './target.mjs';

const input = {
  ref: 'refs/heads/main', platformUrl: 'https://d123platform.cloudfront.net/login',
  bucket: 'm3tric-staging-landing-site-914800441297-us-east-2',
  distribution: 'E1EXSNY8BIV6RS', site: 'https://d34991vs3lv2po.cloudfront.net',
};
test('explicit profiles resolve isolated accounts and environments', () => {
  assert.deepEqual(resolveTarget('eafit-staging', input), {
    profile: 'eafit-staging', account: '914800441297', environment: 'landing-eafit-staging', region: 'us-east-2',
  });
  assert.equal(resolveTarget('flypark-staging', { ref: input.ref }).account, '147997127433');
  assert.equal(resolveTarget('flypark-staging', { ...input, bucket: 'm3tric-staging-landingsitestack-sitebucketabc123-abc123',
    distribution: 'E1J2L9XZIAGQ7M', site: 'https://d21guxd9tjai7a.cloudfront.net' }).environment, 'landing-staging');
});
test('unknown profiles, branches, missing URL and cross-account resources fail closed', () => {
  for (const profile of ['unknown', '', 'toString', '../staging']) assert.throws(() => resolveTarget(profile, input));
  for (const changed of [
    { platformUrl: 'https://d3pz2gipvkcx1b.cloudfront.net/login' },
    { platformUrl: 'https://D3PZ2GIPVKCX1B.cloudfront.net/login' },
    { ref: 'refs/heads/feature' }, { platformUrl: '' }, { platformUrl: 'http://app.m3tric.co' },
    { platformUrl: 'https://127.0.0.1/login' }, { platformUrl: 'https://d123platform.cloudfront.net./login' },
    { platformUrl: 'https://user@d123platform.cloudfront.net' }, { platformUrl: 'https://example.com/login' },
    { bucket: 'm3tric-staging-landing-site-147997127433-us-east-2' },
    { distribution: 'E1J2L9XZIAGQ7M' }, { site: 'https://foreign.cloudfront.net' },
  ]) assert.throws(() => resolveTarget('eafit-staging', { ...input, ...changed }));
  assert.throws(() => resolveTarget('flypark-staging', input));
});
test('source auto deployment remains paused and reusable publish receives the selected profile', () => {
  const deploy = readFileSync(new URL('../../.github/workflows/deploy.yml', import.meta.url), 'utf8');
  const publish = readFileSync(new URL('../../.github/workflows/publish.yml', import.meta.url), 'utf8');
  assert.match(deploy, /workflow_dispatch:/);
  assert.doesNotMatch(deploy, /^  push:/m);
  assert.match(deploy, /group:.*landing-eafit-staging.*landing-staging/);
  const rollback = readFileSync(new URL('../../.github/workflows/rollback.yml', import.meta.url), 'utf8');
  assert.match(rollback, /group: landing-staging/);
  assert.match(publish, /deployment_target:[\s\S]*?default: flypark-staging/);
  assert.match(publish, /# Pipeline checkout, not the older release ref/);
  assert.match(deploy, /deployment_target: \$\{\{ needs\.select\.outputs\.profile \}\}/);
  for (const workflow of [deploy, publish]) {
    assert.match(workflow, /environment: \$\{\{ needs\.select\.outputs\.environment \}\}/);
    assert.match(workflow, /allowed-account-ids: \$\{\{ needs\.select\.outputs\.account \}\}/);
    assert.match(workflow, /aws sts get-caller-identity/);
  }
  assert.match(publish, /NEXT_PUBLIC_PLATFORM_URL: \$\{\{ inputs\.platform_url \}\}/);
});

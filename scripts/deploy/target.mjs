// Credential-free delivery routing. Profile names are an allowlist, never a fallback.
import { pathToFileURL } from 'node:url';

const TARGETS = {
  'flypark-staging': {
    account: '147997127433', environment: 'landing-staging', region: 'us-east-2',
    distribution: 'E1J2L9XZIAGQ7M',
  },
  'eafit-staging': {
    account: '914800441297', environment: 'landing-eafit-staging', region: 'us-east-2',
    distribution: 'E1EXSNY8BIV6RS',
    bucket: 'm3tric-staging-landing-site-914800441297-us-east-2',
    site: 'https://d34991vs3lv2po.cloudfront.net',
  },
};

export function resolveTarget(profile, { ref, platformUrl = '', bucket, distribution, site } = {}) {
  if (!Object.hasOwn(TARGETS, profile)) throw new Error('Unknown deployment profile');
  if (ref !== 'refs/heads/main') throw new Error('Delivery requires refs/heads/main');
  const target = TARGETS[profile];
  if (profile === 'eafit-staging' || platformUrl) {
    const url = new URL(platformUrl);
    if (profile === 'eafit-staging' && url.hostname.replace(/\.$/, '') === 'd3pz2gipvkcx1b.cloudfront.net') {
      throw new Error('EAFIT delivery cannot link to the Flypark platform');
    }
    if (url.protocol !== 'https:' || url.username || url.password || /[\r\n]/.test(platformUrl)
        || !url.hostname.includes('.') || url.hostname.endsWith('.') || /^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname)
        || /(^|\.)(localhost|local|internal|example|test|invalid)$|(^|\.)example\.(com|net|org)$/.test(url.hostname)) {
      throw new Error('An actual HTTPS platform URL without userinfo is required');
    }
  }
  if (bucket !== undefined || distribution !== undefined || site !== undefined) {
    if (distribution !== target.distribution) throw new Error('Distribution differs from the observed profile');
    if (target.bucket ? bucket !== target.bucket : !/^m3tric-staging-landingsitestack-sitebucket[a-z0-9-]+$/.test(bucket ?? '')) {
      throw new Error('Site bucket differs from the selected profile');
    }
    if (target.site ? site !== target.site : !/^https:\/\/[a-z0-9]+\.cloudfront\.net$/.test(site ?? '')) {
      throw new Error('Site URL differs from the selected profile');
    }
  }
  return { profile, account: target.account, environment: target.environment, region: target.region };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const selected = resolveTarget(process.env.DEPLOYMENT_TARGET, {
    ref: process.env.GITHUB_REF, platformUrl: process.env.PLATFORM_URL,
    ...(process.env.VALIDATE_PUBLISH === 'true' ? {
      bucket: process.env.BUCKET_NAME, distribution: process.env.DISTRIBUTION_ID, site: process.env.SITE_URL,
    } : {}),
  });
  for (const [key, value] of Object.entries(selected)) console.log(`${key}=${value}`);
}

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Template } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks } from 'cdk-nag';
import { describe, expect, it } from 'vitest';

import { CONFIG_DIRECTORY } from '../lib/config';
import { loadDomainConfig, parseDomainConfig } from '../lib/domain-config';
import { DOMAIN_STACK_ID, DomainStack } from '../lib/domain-stack';
import { addNagChecks } from '../lib/landing-app';
import { newApp, resourcesOfType, type TemplateJson } from './helpers';

const MAX_TEMPLATE_BYTES = 51_200;
const CLOUDFRONT_ZONE = 'Z2FDTNDATAQYW2';
const LANDING_CF = 'd34991vs3lv2po.cloudfront.net';
const PLATFORM_CF = 'd3p6d14kqnroeh.cloudfront.net';

function rawConfig(mutate?: (raw: Record<string, any>) => void): Record<string, any> {
  const raw = JSON.parse(readFileSync(join(CONFIG_DIRECTORY, 'domain-eafit.json'), 'utf8')) as Record<string, any>;
  mutate?.(raw);
  return raw;
}

function build() {
  const app = newApp();
  const stack = new DomainStack(app, loadDomainConfig());
  return { app, stack, template: Template.fromStack(stack).toJSON() as TemplateJson };
}

describe('domain config schema', () => {
  it('accepts the committed configuration', () => {
    expect(parseDomainConfig(rawConfig()).certificateDomains).toEqual(['m3tric.io', 'www.m3tric.io', 'platform.m3tric.io']);
  });

  const rejections: Array<[string, (raw: Record<string, any>) => void, RegExp]> = [
    ['unknown top-level key', (raw) => { raw.extra = true; }, /extra|unrecognized/i],
    ['unknown alias key', (raw) => { raw.aliasRecords[0].extra = 1; }, /unrecognized/i],
    ['foreign account', (raw) => { raw.account = '147997127433'; }, /914800441297/],
    ['foreign region', (raw) => { raw.region = 'us-east-2'; }, /us-east-1/],
    ['malformed hosted zone id', (raw) => { raw.hostedZoneId = 'z123'; }, /hosted zone ID/],
    ['uppercase name', (raw) => { raw.certificateDomains[1] = 'WWW.m3tric.io'; }, /lowercase hostname/],
    ['certificate name outside the zone', (raw) => { raw.certificateDomains.push('evil.example.com'); }, /not inside zone/],
    ['suffix that only looks like the zone', (raw) => { raw.certificateDomains.push('notm3tric.io'); }, /not inside zone/],
    ['alias name outside the zone', (raw) => { raw.aliasRecords[0].name = 'evil.example.com'; }, /not inside zone/],
    ['duplicate certificate name', (raw) => { raw.certificateDomains.push('www.m3tric.io'); }, /duplicated/],
    ['duplicate alias name', (raw) => { raw.aliasRecords.push({ ...raw.aliasRecords[0] }); }, /duplicated/],
    ['alias without certificate coverage', (raw) => { raw.certificateDomains.pop(); }, /not covered by certificateDomains/],
    ['invalid distribution domain', (raw) => { raw.aliasRecords[0].distributionDomainName = 'example.com'; }, /CloudFront distribution domain/],
    ['distribution domain with a suffix trick', (raw) => {
      raw.aliasRecords[0].distributionDomainName = 'd34991vs3lv2po.cloudfront.net.evil.com';
    }, /CloudFront distribution domain/],
    ['wrong Component tag', (raw) => { raw.tags.Component = 'landing'; }, /domain/],
  ];
  it.each(rejections)('rejects %s', (_label, mutate, message) => {
    expect(() => parseDomainConfig(rawConfig(mutate))).toThrow(message);
  });
});

describe('DomainStack template', () => {
  const { template } = build();

  it('contains exactly one certificate and six record sets, nothing else', () => {
    const types = Object.values(template.Resources).map((resource) => resource.Type).sort();
    expect(types).toEqual(['AWS::CertificateManager::Certificate', ...Array<string>(6).fill('AWS::Route53::RecordSet')]);
    expect(Object.keys(template.Rules ?? {})).toEqual(['ExpectedTarget']);
    expect(JSON.stringify(template)).not.toMatch(/Custom::|AWS::Lambda/);
  });

  it('requests the exact names with native DNS validation and keeps the certificate on delete', () => {
    const [, certificate] = resourcesOfType(template, 'AWS::CertificateManager::Certificate')[0]!;
    expect(certificate.Properties).toMatchObject({
      DomainName: 'm3tric.io',
      SubjectAlternativeNames: ['www.m3tric.io', 'platform.m3tric.io'],
      ValidationMethod: 'DNS',
      DomainValidationOptions: [
        { DomainName: 'm3tric.io', HostedZoneId: 'Z03781402XLYZD0WZKSHK' },
        { DomainName: 'www.m3tric.io', HostedZoneId: 'Z03781402XLYZD0WZKSHK' },
        { DomainName: 'platform.m3tric.io', HostedZoneId: 'Z03781402XLYZD0WZKSHK' },
      ],
    });
    expect(certificate.DeletionPolicy).toBe('Retain');
    expect(certificate.UpdateReplacePolicy).toBe('Retain');
  });

  it('creates an A and an AAAA alias per name pointing at the right distribution', () => {
    const summary = resourcesOfType(template, 'AWS::Route53::RecordSet')
      .map(([, record]) => {
        const properties = record.Properties!;
        return `${properties.Name} ${properties.Type} ${properties.AliasTarget.DNSName} ${properties.AliasTarget.HostedZoneId} ${properties.HostedZoneId}`;
      })
      .sort();
    const zone = 'Z03781402XLYZD0WZKSHK';
    expect(summary).toEqual([
      `m3tric.io. A ${LANDING_CF} ${CLOUDFRONT_ZONE} ${zone}`,
      `m3tric.io. AAAA ${LANDING_CF} ${CLOUDFRONT_ZONE} ${zone}`,
      `platform.m3tric.io. A ${PLATFORM_CF} ${CLOUDFRONT_ZONE} ${zone}`,
      `platform.m3tric.io. AAAA ${PLATFORM_CF} ${CLOUDFRONT_ZONE} ${zone}`,
      `www.m3tric.io. A ${LANDING_CF} ${CLOUDFRONT_ZONE} ${zone}`,
      `www.m3tric.io. AAAA ${LANDING_CF} ${CLOUDFRONT_ZONE} ${zone}`,
    ].sort());
  });

  it('asserts the account and region and exports the certificate ARN and names', () => {
    expect(JSON.stringify(template.Rules)).toContain('914800441297');
    expect(JSON.stringify(template.Rules)).toContain('us-east-1');
    expect(Object.keys(template.Outputs ?? {}).sort()).toEqual(['CertificateArn', 'DomainNames']);
    expect(template.Outputs!.DomainNames!.Value).toBe('m3tric.io,www.m3tric.io,platform.m3tric.io');
  });

  it('is named m3tric-DomainStack and fits --template-body', () => {
    const { stack } = build();
    expect(stack.stackName).toBe(DOMAIN_STACK_ID);
    expect(Buffer.byteLength(JSON.stringify(template, null, 2))).toBeLessThanOrEqual(MAX_TEMPLATE_BYTES);
  });

  it('carries the required tags on the stack and the certificate', () => {
    const { stack } = build();
    const expected = { Application: 'm3tric', Component: 'domain', Owner: 'Alejandro Puerta', CostCenter: 'EAFIT-M3TRIC' };
    expect(stack.tags.tagValues()).toMatchObject(expected);
    const [, certificate] = resourcesOfType(template, 'AWS::CertificateManager::Certificate')[0]!;
    for (const [Key, Value] of Object.entries(expected)) {
      expect(certificate.Properties!.Tags).toContainEqual({ Key, Value });
    }
  });
});

describe('DomainStack cdk-nag', () => {
  it('reports zero unacknowledged findings', () => {
    const { app } = build();
    expect(new AwsSolutionsChecks(undefined, { verbose: true }).validateScope(app)).toEqual({ success: true, violations: [] });
  });

  it('synthesizes through the same plugin wiring bin/domain.ts uses', () => {
    const app = newApp();
    new DomainStack(app, loadDomainConfig());
    addNagChecks(app);
    expect(() => app.synth()).not.toThrow();
  });
});

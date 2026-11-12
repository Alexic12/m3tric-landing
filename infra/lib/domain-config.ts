import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { z } from 'zod';

import { CONFIG_DIRECTORY } from './config';

export const DOMAIN_ACCOUNT = '914800441297';
// ACM certificates used by CloudFront must live in us-east-1.
export const DOMAIN_REGION = 'us-east-1';

const hostname = z
  .string()
  .regex(/^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/, 'must be a lowercase hostname');

const tagValue = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(256, `${label} must contain at most 256 characters`)
    .regex(/^[\p{L}\p{Z}\p{N}_.:/=+\-@]+$/u, `${label} contains characters AWS does not allow in tag values`);

const AliasRecordSchema = z
  .object({
    name: hostname,
    distributionDomainName: z
      .string()
      .regex(/^d[a-z0-9]{12,14}\.cloudfront\.net$/, 'distributionDomainName must be a CloudFront distribution domain name'),
  })
  .strict();

export const DomainConfigSchema = z
  .object({
    account: z.literal(DOMAIN_ACCOUNT),
    region: z.literal(DOMAIN_REGION),
    hostedZoneId: z.string().regex(/^Z[A-Z0-9]{8,32}$/, 'hostedZoneId must be a Route 53 hosted zone ID'),
    zoneName: hostname,
    certificateDomains: z.array(hostname).min(1, 'certificateDomains needs at least one name'),
    aliasRecords: z.array(AliasRecordSchema).min(1, 'aliasRecords needs at least one entry'),
    tags: z
      .object({
        Application: z.literal('m3tric'),
        Component: z.literal('domain'),
        Owner: tagValue('tags.Owner'),
        CostCenter: tagValue('tags.CostCenter'),
      })
      .strict(),
  })
  .strict()
  .superRefine((config, ctx) => {
    const inZone = (name: string): boolean => name === config.zoneName || name.endsWith(`.${config.zoneName}`);
    const reject = (path: Array<string | number>, message: string): void => {
      ctx.addIssue({ code: 'custom', path, message });
    };

    config.certificateDomains.forEach((name, index) => {
      if (!inZone(name)) reject(['certificateDomains', index], `${name} is not inside zone ${config.zoneName}`);
      if (config.certificateDomains.indexOf(name) !== index) reject(['certificateDomains', index], `${name} is duplicated`);
    });
    config.aliasRecords.forEach((record, index) => {
      if (!inZone(record.name)) reject(['aliasRecords', index, 'name'], `${record.name} is not inside zone ${config.zoneName}`);
      if (config.aliasRecords.findIndex((other) => other.name === record.name) !== index) {
        reject(['aliasRecords', index, 'name'], `${record.name} is duplicated`);
      }
      if (!config.certificateDomains.includes(record.name)) {
        reject(['aliasRecords', index, 'name'], `${record.name} is not covered by certificateDomains`);
      }
    });
  });

export type DomainConfig = z.infer<typeof DomainConfigSchema>;

export function parseDomainConfig(input: unknown): DomainConfig {
  return DomainConfigSchema.parse(input);
}

export function loadDomainConfig(directory = CONFIG_DIRECTORY): DomainConfig {
  const path = join(directory, 'domain-eafit.json');
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read domain configuration ${path}: ${detail}`, { cause: error });
  }
  return parseDomainConfig(raw);
}

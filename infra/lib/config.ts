import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { z } from 'zod';

import { GITHUB_OIDC_HOST, PARTITION } from './names';

export const EnvironmentNameSchema = z.enum(['staging', 'production']);
export type EnvironmentName = z.infer<typeof EnvironmentNameSchema>;

export const DEFAULT_ENVIRONMENT: EnvironmentName = 'staging';

// Characters AWS accepts in tag values; rejecting anything else here gives a
// clear error at synth instead of a CloudFormation rollback mid-deploy.
const tagValue = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(256, `${label} must contain at most 256 characters`)
    .regex(/^[\p{L}\p{Z}\p{N}_.:/=+\-@]+$/u, `${label} contains characters AWS does not allow in tag values`);

// These three values are interpolated into the OIDC `sub` condition. Restricting
// them to GitHub's own name alphabets rules out IAM wildcards (`*`, `?`) and
// claim separators (`:`), so the trust condition can only ever be an exact match.
const GitHubConfigSchema = z
  .object({
    owner: z.string().regex(/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/, 'github.owner must be a GitHub account name'),
    repo: z
      .string()
      .regex(/^[A-Za-z0-9._-]{1,100}$/, 'github.repo must be a GitHub repository name')
      .refine((value) => value !== '.' && value !== '..', 'github.repo must be a GitHub repository name'),
    environment: z
      .string()
      .regex(/^[A-Za-z0-9._-]{1,255}$/, 'github.environment must contain only letters, digits, ".", "_" and "-"'),
  })
  .strict();

export const LandingConfigSchema = z
  .object({
    account: z.string().regex(/^\d{12}$/, 'account must be a 12-digit AWS account ID'),
    // Commercial partition only (see PARTITION in names.ts): no GovCloud, no China.
    region: z
      .string()
      .regex(/^[a-z]{2}-[a-z]+-\d$/, 'region must be an AWS region name')
      .refine((value) => !value.startsWith('cn-'), 'region must be in the aws (commercial) partition'),
    environment: EnvironmentNameSchema,
    tags: z
      .object({
        Application: z.literal('m3tric'),
        // The budget filters on this exact value; see LandingSiteStack.
        Component: z.literal('landing'),
        Owner: tagValue('tags.Owner'),
        CostCenter: tagValue('tags.CostCenter'),
        DataClassification: z.literal('public'),
      })
      .strict(),
    github: GitHubConfigSchema,
    oidcProviderArn: z.string(),
    cdkQualifier: z.string().regex(/^[a-z0-9]{1,10}$/, 'cdkQualifier must be 1-10 lowercase alphanumerics'),
    budgetMonthlyUsd: z.number().positive().max(1000),
    robotsNoindex: z.boolean(),
    logRetentionDays: z.number().int().min(1).max(3650),
    noncurrentVersionDays: z.number().int().min(1).max(3650),
  })
  .strict()
  .superRefine((config, ctx) => {
    // Import only the account's own GitHub provider: a provider ARN from another
    // account or for another issuer would silently change who can assume the role.
    const expected = `arn:${PARTITION}:iam::${config.account}:oidc-provider/${GITHUB_OIDC_HOST}`;
    if (config.oidcProviderArn !== expected) {
      ctx.addIssue({
        code: 'custom',
        message: `oidcProviderArn must be exactly ${expected}`,
        path: ['oidcProviderArn'],
      });
    }
  });

export type LandingConfig = z.infer<typeof LandingConfigSchema>;

export const GitShaSchema = z
  .string()
  .regex(/^[a-f0-9]{40}$/, 'gitSha must be the full 40-character lowercase commit SHA');
export const ReleaseIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9][A-Za-z0-9._-]{2,127}$/, 'releaseId must match ^[A-Za-z0-9][A-Za-z0-9._-]{2,127}$');

export interface DeploymentContext {
  readonly environment: EnvironmentName;
  readonly gitSha: string;
  readonly releaseId: string;
}

export const CONFIG_DIRECTORY = join(__dirname, '..', 'config');

export function parseLandingConfig(input: unknown): LandingConfig {
  return LandingConfigSchema.parse(input);
}

export function loadLandingConfig(environment: EnvironmentName, directory = CONFIG_DIRECTORY): LandingConfig {
  const path = join(directory, `${environment}.json`);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read landing configuration ${path}: ${detail}`, { cause: error });
  }
  const config = parseLandingConfig(raw);
  if (config.environment !== environment) {
    throw new Error(`Configuration ${path} declares environment ${config.environment}, expected ${environment}`);
  }
  return config;
}

interface ContextReader {
  tryGetContext(key: string): unknown;
}

function stringContext(node: ContextReader, key: string): string | undefined {
  const value = node.tryGetContext(key);
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`CDK context ${key} must be a non-empty string`);
  }
  return value.trim();
}

function requiredStringContext(node: ContextReader, key: string): string {
  const value = stringContext(node, key);
  if (value === undefined) {
    throw new Error(`CDK context ${key} is required (pass -c ${key}=...)`);
  }
  return value;
}

// gitSha and releaseId have no defaults on purpose: every synthesized template is
// tagged with them, so a missing value must stop synth rather than mislabel a deploy.
export function readDeploymentContext(node: ContextReader): DeploymentContext {
  return {
    environment: EnvironmentNameSchema.parse(stringContext(node, 'env') ?? DEFAULT_ENVIRONMENT),
    gitSha: GitShaSchema.parse(requiredStringContext(node, 'gitSha')),
    releaseId: ReleaseIdSchema.parse(requiredStringContext(node, 'releaseId')),
  };
}

export const REQUIRED_TAG_KEYS = [
  'Application',
  'Component',
  'Environment',
  'Owner',
  'CostCenter',
  'ManagedBy',
  'DataClassification',
  'GitSha',
  'ReleaseId',
] as const;

export type RequiredTags = Readonly<Record<(typeof REQUIRED_TAG_KEYS)[number], string>>;

export function requiredTags(config: LandingConfig, deployment: DeploymentContext): RequiredTags {
  return {
    Application: config.tags.Application,
    Component: config.tags.Component,
    Environment: config.environment,
    Owner: config.tags.Owner,
    CostCenter: config.tags.CostCenter,
    ManagedBy: 'aws-cdk',
    DataClassification: config.tags.DataClassification,
    GitSha: deployment.gitSha,
    ReleaseId: deployment.releaseId,
  };
}

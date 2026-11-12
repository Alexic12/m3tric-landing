import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { expect } from 'vitest';

import { parseLandingConfig, type DeploymentContext, type LandingConfig } from '../lib/config';
import { buildLandingApp, type LandingStacks } from '../lib/landing-app';

export interface Resource {
  readonly Type: string;
  readonly Properties?: Record<string, any>;
  readonly DeletionPolicy?: string;
  readonly UpdateReplacePolicy?: string;
  readonly DependsOn?: readonly string[];
}

export interface TemplateJson {
  readonly Description?: string;
  readonly Resources: Record<string, Resource>;
  readonly Outputs?: Record<string, { readonly Value: unknown; readonly Description?: string; readonly Export?: unknown }>;
  readonly Parameters?: Record<string, { readonly Type: string; readonly Default?: string }>;
  readonly Rules?: Record<string, any>;
}

export const TEST_GIT_SHA = '1234567890abcdef1234567890abcdef12345678';
export const TEST_RELEASE_ID = 'test-release-0001';
export const TEST_DEPLOYMENT: DeploymentContext = {
  environment: 'staging',
  gitSha: TEST_GIT_SHA,
  releaseId: TEST_RELEASE_ID,
};

export const IDENTITY_STACK = 'm3tric-staging-LandingDeliveryIdentityStack';
export const SITE_STACK = 'm3tric-staging-LandingSiteStack';

// Feature flags in cdk.json change the synthesized output (e.g. partition
// literals, explicit stack tags). A bare `new App()` would test a different
// template from the one `cdk synth`/`cdk deploy` produce.
export function cdkJsonContext(): Record<string, unknown> {
  const cdkJson = JSON.parse(readFileSync(join(__dirname, '..', 'cdk.json'), 'utf8')) as {
    context: Record<string, unknown>;
  };
  return cdkJson.context;
}

export function newApp(): App {
  return new App({ context: cdkJsonContext() });
}

export function rawStagingConfig(): Record<string, any> {
  return JSON.parse(readFileSync(join(__dirname, '..', 'config', 'staging.json'), 'utf8')) as Record<string, any>;
}

export function stagingConfig(mutate?: (raw: Record<string, any>) => void): LandingConfig {
  const raw = rawStagingConfig();
  mutate?.(raw);
  return parseLandingConfig(raw);
}

// Well-formed but fictitious: the real certificate is created by the domain stack.
export const FIXTURE_CERTIFICATE_ARN =
  'arn:aws:acm:us-east-1:914800441297:certificate/11111111-2222-3333-4444-555555555555';

/** EAFIT staging config without a custom domain, whatever the file currently holds. */
export function eafitConfig(mutate?: (raw: Record<string, any>) => void): LandingConfig {
  const raw = JSON.parse(readFileSync(join(__dirname, '..', 'config', 'eafit-staging.json'), 'utf8')) as Record<string, any>;
  delete raw.customDomain;
  mutate?.(raw);
  return parseLandingConfig(raw);
}

/** EAFIT staging config with the fixture domain (apex + one www redirect). */
export function eafitDomainConfig(mutate?: (raw: Record<string, any>) => void): LandingConfig {
  return eafitConfig((raw) => {
    raw.customDomain = {
      apexDomain: 'm3tric.io',
      redirectDomains: ['www.m3tric.io'],
      certificateArn: FIXTURE_CERTIFICATE_ARN,
    };
    mutate?.(raw);
  });
}

export interface Synthesized {
  readonly app: App;
  readonly stacks: LandingStacks;
  readonly identity: TemplateJson;
  readonly site: TemplateJson;
}

export function synthesize(config: LandingConfig = stagingConfig()): Synthesized {
  const app = newApp();
  const stacks = buildLandingApp(app, config, TEST_DEPLOYMENT);
  return {
    app,
    stacks,
    identity: Template.fromStack(stacks.identity).toJSON() as TemplateJson,
    site: Template.fromStack(stacks.site).toJSON() as TemplateJson,
  };
}

export function resourcesOfType(template: TemplateJson, type: string): Array<[string, Resource]> {
  return Object.entries(template.Resources).filter(([, resource]) => resource.Type === type);
}

export function onlyResource(template: TemplateJson, type: string): [string, Resource] {
  const matches = resourcesOfType(template, type);
  expect(matches, `expected exactly one ${type}`).toHaveLength(1);
  return matches[0]!;
}

export function withoutTags(properties: Record<string, any> | undefined): Record<string, any> {
  return Object.fromEntries(
    Object.entries(properties ?? {}).filter(([key]) => key !== 'Tags' && key !== 'ResourceTags'),
  );
}

export function getAtt(logicalId: string, attribute: string): unknown {
  return { 'Fn::GetAtt': [logicalId, attribute] };
}

export function objectsArn(bucketLogicalId: string): unknown {
  return { 'Fn::Join': ['', [getAtt(bucketLogicalId, 'Arn'), '/*']] };
}

/** Every action granted by Allow statements, flattened and sorted. */
export function allowedActions(statements: ReadonlyArray<Record<string, any>>): string[] {
  return statements
    .filter((statement) => statement.Effect === 'Allow')
    .flatMap((statement) => (Array.isArray(statement.Action) ? statement.Action : [statement.Action]) as string[])
    .sort();
}

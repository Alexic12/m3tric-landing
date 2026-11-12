import { Aws, BootstraplessSynthesizer, CfnRule, CliCredentialsStackSynthesizer, DefaultStackSynthesizer, Fn, Tags, Validations, type App, type ISynthesisSession } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';

import { requiredTags, type DeploymentContext, type LandingConfig } from './config';
import { LandingDeliveryIdentityStack } from './delivery-identity-stack';
import { LandingSiteStack } from './landing-site-stack';
import { DELIVERY_IDENTITY_STACK_ID, SITE_ASSETS_PREFIX, SITE_STACK_ID, cdkAssetsBucketName, stackName } from './names';

export interface LandingStacks {
  readonly identity: LandingDeliveryIdentityStack;
  readonly site: LandingSiteStack;
}

// BootstraplessSynthesizer inherits default role ARNs in this CDK version.
// This manual, asset-free creation emits only the template; inherited asset
// methods still reject any future attempt to stage an asset through this path.
export class ManualSiteBootstrapSynthesizer extends BootstraplessSynthesizer {
  public override synthesize(session: ISynthesisSession): void {
    this.synthesizeTemplate(session);
    this.emitArtifact(session, {});
  }
}

/**
 * Builds both landing stacks into `app`. Shared by bin/landing.ts and the tests
 * so the tests assert on exactly what `cdk synth`/`cdk deploy` produce.
 */
export function buildLandingApp(app: App, config: LandingConfig, deployment: DeploymentContext): LandingStacks {
  if (config.bootstrapSiteOnly) throw new Error('Site-only configuration requires the explicit bootstrap app');
  if (deployment.environment !== config.environment) {
    throw new Error(`Context env ${deployment.environment} does not match configuration ${config.environment}`);
  }

  const tags = requiredTags(config, deployment);
  // Resource-level tags (template) ...
  for (const [key, value] of Object.entries(tags)) {
    Tags.of(app).add(key, value);
  }
  // ... and stack-level tags, which @aws-cdk/core:explicitStackTags requires to be
  // passed explicitly; CloudFormation propagates them to the stack itself.
  const common = {
    env: { account: config.account, region: config.region },
    tags: { ...tags },
  };

  // Construct ID == physical stack name, so `cdk deploy m3tric-staging-LandingSiteStack`
  // selects the stack by the same name CloudFormation shows.
  const identityName = stackName(config.environment, DELIVERY_IDENTITY_STACK_ID);
  const identity = new LandingDeliveryIdentityStack(app, identityName, {
    ...common,
    stackName: identityName,
    // A human admin deploys this stack, through the account's shared bootstrap.
    synthesizer: new DefaultStackSynthesizer({ qualifier: config.cdkQualifier }),
    config,
  });

  const siteName = stackName(config.environment, SITE_STACK_ID);
  const site = new LandingSiteStack(app, siteName, {
    ...common,
    stackName: siteName,
    // No shared bootstrap role at all (audit H2): the CLI's own credentials (the
    // GitHub role) stage the template in the landing's own assets bucket and
    // create the change set, and CloudFormation runs it as the role passed with
    // --role-arn (the scoped execution role). This synthesizer emits no
    // BootstrapVersion parameter/rule and no role ARNs to assume.
    synthesizer: new CliCredentialsStackSynthesizer({
      fileAssetsBucketName: cdkAssetsBucketName(config.environment, config.account, config.region),
      bucketPrefix: SITE_ASSETS_PREFIX,
    }),
    config,
  });

  if (config.account === '914800441297') new CfnRule(site, 'ExpectedMigrationTarget', { assertions: [
    { assert: Fn.conditionEquals(Aws.ACCOUNT_ID, config.account), assertDescription: 'EAFIT account is required' },
    { assert: Fn.conditionEquals(Aws.REGION, config.region), assertDescription: 'Ohio region is required' },
  ] });
  return { identity, site };
}

/** Asset-free initial site; a reviewed human CloudFormation change set creates it. */
export function buildLandingBootstrapApp(app: App, config: LandingConfig, deployment: DeploymentContext): { site: LandingSiteStack } {
  if (!config.bootstrapSiteOnly || config.account !== '914800441297' || config.region !== 'us-east-2'
      || config.siteCloudFront || deployment.environment !== 'staging' || config.environment !== 'staging') {
    throw new Error('Site bootstrap requires the explicit EAFIT staging configuration');
  }
  const tags = requiredTags(config, deployment);
  for (const [key, value] of Object.entries(tags)) Tags.of(app).add(key, value);
  const name = stackName(config.environment, SITE_STACK_ID);
  const site = new LandingSiteStack(app, name, {
    env: { account: config.account, region: config.region }, stackName: name, tags: { ...tags }, config,
    synthesizer: new ManualSiteBootstrapSynthesizer(),
  });
  new CfnRule(site, 'ExpectedMigrationTarget', { assertions: [
    { assert: Fn.conditionEquals(Aws.ACCOUNT_ID, '914800441297'), assertDescription: 'EAFIT account is required' },
    { assert: Fn.conditionEquals(Aws.REGION, 'us-east-2'), assertDescription: 'Ohio region is required' },
  ] });
  return { site };
}

/** Registers cdk-nag so `cdk synth`/`cdk deploy` fail on any unacknowledged finding. */
export function addNagChecks(app: App): void {
  Validations.of(app).addPlugins(new AwsSolutionsChecks(app, { verbose: true }));
}

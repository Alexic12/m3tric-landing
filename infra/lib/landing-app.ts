import { CliCredentialsStackSynthesizer, DefaultStackSynthesizer, Tags, Validations, type App } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';

import { requiredTags, type DeploymentContext, type LandingConfig } from './config';
import { LandingDeliveryIdentityStack } from './delivery-identity-stack';
import { LandingSiteStack } from './landing-site-stack';
import { DELIVERY_IDENTITY_STACK_ID, SITE_ASSETS_PREFIX, SITE_STACK_ID, cdkAssetsBucketName, stackName } from './names';

export interface LandingStacks {
  readonly identity: LandingDeliveryIdentityStack;
  readonly site: LandingSiteStack;
}

/**
 * Builds both landing stacks into `app`. Shared by bin/landing.ts and the tests
 * so the tests assert on exactly what `cdk synth`/`cdk deploy` produce.
 */
export function buildLandingApp(app: App, config: LandingConfig, deployment: DeploymentContext): LandingStacks {
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

  return { identity, site };
}

/** Registers cdk-nag so `cdk synth`/`cdk deploy` fail on any unacknowledged finding. */
export function addNagChecks(app: App): void {
  Validations.of(app).addPlugins(new AwsSolutionsChecks(app, { verbose: true }));
}

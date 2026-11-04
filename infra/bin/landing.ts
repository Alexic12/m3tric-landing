#!/usr/bin/env node

import { App } from 'aws-cdk-lib';

import { loadLandingConfig, loadLandingDeploymentConfig, readDeploymentContext, readLandingDeploymentProfile } from '../lib/config';
import { addNagChecks, buildLandingApp, buildLandingBootstrapApp } from '../lib/landing-app';

const app = new App();
const deployment = readDeploymentContext(app.node);
const profile = readLandingDeploymentProfile(app.node);
const config = profile === undefined ? loadLandingConfig(deployment.environment)
  : loadLandingDeploymentConfig(profile, deployment.environment);

if (config.bootstrapSiteOnly) buildLandingBootstrapApp(app, config, deployment);
else buildLandingApp(app, config, deployment);
addNagChecks(app);

app.synth();

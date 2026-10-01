#!/usr/bin/env node

import { App } from 'aws-cdk-lib';

import { loadLandingConfig, readDeploymentContext } from '../lib/config';
import { addNagChecks, buildLandingApp } from '../lib/landing-app';

const app = new App();
const deployment = readDeploymentContext(app.node);
const config = loadLandingConfig(deployment.environment);

buildLandingApp(app, config, deployment);
addNagChecks(app);

app.synth();

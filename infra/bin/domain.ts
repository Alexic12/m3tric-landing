#!/usr/bin/env node

import { App } from 'aws-cdk-lib';

import { loadDomainConfig } from '../lib/domain-config';
import { DomainStack } from '../lib/domain-stack';
import { addNagChecks } from '../lib/landing-app';

// Deliberately not wired into cdk.json: deploy.yml synthesizes the landing app only,
// and this stack is deployed by hand as a reviewed CloudFormation change set.
const app = new App();
new DomainStack(app, loadDomainConfig());
addNagChecks(app);

app.synth();

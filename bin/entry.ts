#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/stacks/network-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
  region: process.env.CDK_DEFAULT_REGION || process.env.AWS_DEFAULT_REGION,
};

const tags = {
  Environment: 'POC',
  Project: 'MyProject',
}

const projectName = 'my-project';


new NetworkStack(app, 'SaaSNetworkStack', {
  projectName,
  vpc: {
    vpcName: 'my-vpc-1',
    vpcCidr: '10.0.0.0/16',
    maxAzs: 3,
    maxNatGws: 1,
  },
  bastion: {
    create: true,
  },
  tags,
  env
});

app.synth();
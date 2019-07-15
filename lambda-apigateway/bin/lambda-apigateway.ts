#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { LambdaApigatewayStack } from '../lib/lambda-apigateway-stack';

const app = new cdk.App();
new LambdaApigatewayStack(app, 'LambdaApigatewayStack');
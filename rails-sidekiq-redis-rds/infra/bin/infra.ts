#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { RailsSidekiqRedisRwStack } from '../lib/rails-sidekiq-redis-rw-stack';

const app = new cdk.App();
new RailsSidekiqRedisRwStack(app, 'RailsSidekiqRedisRwStack');

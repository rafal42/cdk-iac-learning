import cdk = require('@aws-cdk/core');
import elasticache = require('@aws-cdk/aws-elasticache');

export class RailsSidekiqRedisRwStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const redisMessageQueue = new elasticache.CfnCacheCluster(
      this,
      'RedisMessageQueue',
      {
        engine: 'redis',
        cacheNodeType: 'cache.t1.micro',
        numCacheNodes: 1
      }
    );
  }
}

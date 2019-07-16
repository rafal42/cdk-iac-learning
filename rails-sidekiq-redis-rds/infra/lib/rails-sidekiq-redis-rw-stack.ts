import cdk = require('@aws-cdk/core');
import elasticache = require('@aws-cdk/aws-elasticache');
import ec2 = require("@aws-cdk/aws-ec2");
import ecs = require("@aws-cdk/aws-ecs");

export class RailsSidekiqRedisRwStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'MainVPC', {
      maxAzs: 3
    });

    const redisMessageQueueSG = new ec2.SecurityGroup(this, 'RedisMessageQueueSG', {
      vpc
    });

    const redisMessageQueueSubnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisMessageQueueSubnetGroup', {
      description: 'Redis Message Queue Subnet Group',
      subnetIds: vpc.privateSubnets.map(subnet => subnet.subnetId)
    });

    const redisMessageQueue = new elasticache.CfnCacheCluster(
      this,
      'RedisMessageQueue',
      {
        engine: 'redis',
        cacheNodeType: 'cache.t2.micro',
        numCacheNodes: 1,
        vpcSecurityGroupIds: [redisMessageQueueSG.securityGroupId],
        cacheSubnetGroupName: redisMessageQueueSubnetGroup.ref
      }
    );

    const cluster = new ecs.Cluster(this, 'FargateCluster', {
      vpc
    });

    const fargateWebTaskDefinition = new ecs.FargateTaskDefinition(this, 'FargateWebTaskDefinition', {
      cpu: 256,
      memoryLimitMiB: 512
    });


  }
}

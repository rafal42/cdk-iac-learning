import cdk = require('@aws-cdk/core');
import elasticache = require('@aws-cdk/aws-elasticache');
import ec2 = require("@aws-cdk/aws-ec2");
import ecs = require("@aws-cdk/aws-ecs");
import ecr = require('@aws-cdk/aws-ecr');
import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
import rds = require('@aws-cdk/aws-rds');
import s3 = require('@aws-cdk/aws-s3');

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

    const postgresql = new rds.DatabaseInstance(this, 'PostgreSQL', {
      masterUsername: 'rdsMasterUser',
      engine: rds.DatabaseInstanceEngine.POSTGRES,
      instanceClass: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      vpc
    });

    const postgresqlSecurityGroup = new ec2.SecurityGroup(this, 'PostgreSQLSecurityGroup', {
      vpc
    });

    postgresql.connections.allowDefaultPortFrom(postgresqlSecurityGroup);

    const ecrRepo = new ecr.Repository(this, 'ecrRepo');

    const cluster = new ecs.Cluster(this, 'FargateCluster', {
      vpc
    });

    const fargateWebTaskDefinition = new ecs.FargateTaskDefinition(this, 'FargateWebTaskDefinition', {
      cpu: 256,
      memoryLimitMiB: 512,
    });

    const fargateWebContainer = fargateWebTaskDefinition.addContainer('FargateWebContainer', {
      image: ecs.ContainerImage.fromEcrRepository(ecrRepo),
      command: ['bundle', 'exec', 'rails', 'server', '-p', '80'],
      environment: {
        REDIS_URL: redisMessageQueue.attrRedisEndpointAddress,
        DATABASE_URL: postgresql.dbInstanceEndpointAddress,
        environment: 'production'
      }
    });

    fargateWebContainer.addPortMappings({
      containerPort: 80,
      hostPort: 80,
      protocol: ecs.Protocol.TCP
    })

    const fargateWebService = new ecs.FargateService(this, 'FargateWebService', {
      cluster,
      taskDefinition: fargateWebTaskDefinition,
      desiredCount: 1
    });

    fargateWebService.connections.allowTo(postgresqlSecurityGroup, ec2.Port.tcp(5432));
    fargateWebService.connections.allowTo(redisMessageQueueSG, ec2.Port.tcp(6379));

    const fargateWebELB = new elbv2.ApplicationLoadBalancer(this, 'FargateWebApplicationELB', {
      vpc,
      internetFacing: true
    });

    const accessLogBucket = new s3.Bucket(this, 'accessLogBucket', {
      bucketName: 'rails-sidekiq-redis-rw-stack-access-log-bucket'
    });

    fargateWebELB.logAccessLogs(accessLogBucket);

    const listener = fargateWebELB.addListener('HTTPListener', { port: 80 });
    const target = listener.addTargets('ECSWebFargate', {
      port: 80,
      targets: [fargateWebService]
    });
  }
}

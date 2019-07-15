import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import apigateway = require('@aws-cdk/aws-apigateway');

import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class LambdaApigatewayStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const helloLambda = new lambda.Function(
      this,
      'HelloLambda',
      {
        runtime: lambda.Runtime.NODEJS_10_X,
        handler: 'hello.handler',
        code: lambda.Code.asset('src')
      }
    );

    const hitCounterHello = new HitCounter(this, 'HelloHitCounter', {
      downstream: helloLambda
    })

    const helloWithCounterGateway = new apigateway.LambdaRestApi(
      this,
      'helloWithCounterEndpoint',
      {
        handler: hitCounterHello.handler
      }
    );

    const hitCounterViewer = new TableViewer(
      this,
      'HitTableViewer',
      {
        title: 'Hello hits',
        table: hitCounterHello.table
      }
    )
  }
}

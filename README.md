# cdk-iac-learning
A repo hosting some sample cdk stacks built while learning aws cdk.

Resources:

https://docs.aws.amazon.com/cdk/latest/guide/
https://cdkworkshop.com


Lessons learned:

1. `cdk bootstrap` is required to start, which creates an S3 bucket for holding infra state.
2. Non-empty DynamoDB table is not removed upon `cdk destroy`

import { Duration, Stack, StackProps, Stage, StageProps,  } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { join } from 'path';

export class TechtalkCdkTestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'TechtalkCdkTestQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // create an S3 bucket
    const bucket = new Bucket(this, 'TechtalkCdkTestBucket');

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'MyPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('phuwin95/techtalk-cdk-test', 'main'),
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
      dockerEnabledForSynth: true,
    });

    const lambdaStage = new MyStage(this, 'LambdaStage');
  }
}

class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const myFunction = new NodejsFunction(this, 'my-function', {
      memorySize: 256,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_14_X,
      handler: 'main',
      entry: join(__dirname, `/../src/index.ts`),
    });
  }
}

class MyStage extends Stage {
    
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const stack = new MyStack(this, 'LambdaDynamodbStack');      
  }
}
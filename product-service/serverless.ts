import type { AWS } from '@serverless/typescript';

import getProductsList from '@functions/getProductsList';
import getProductsById from '@functions/getProductsById';
import postProduct from '@functions/postProduct';
import catalogBatchProcess from '@functions/catalogBatchProcess';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'eu-west-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      PRODUCTS_TABLE: 'art_shop_products',
      STOCKS_TABLE: 'art_shop_stocks',
      SQS_URL: { Ref: 'SQSQueue' },
      SNS_TOPIC_ARN: { Ref : 'CreateProductTopic' },
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['sqs:*'],
        Resource: [{'Fn::GetAtt' : ['SQSQueue', 'Arn']}]
      },
      {
        Effect: 'Allow',
        Action: ['sns:*'],
        Resource: [{ Ref : 'CreateProductTopic' }]
      }
    ]
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 's3ArtCatalogItemsQueue',
          RedrivePolicy: {
            deadLetterTargetArn : {'Fn::GetAtt' : [ 'MyDeadLetterQueue' , 'Arn' ]},
            maxReceiveCount : 5
          },
          ReceiveMessageWaitTimeSeconds: 5
        }
      },
      MyDeadLetterQueue : {
        Type : 'AWS::SQS::Queue'
      },
      CreateProductTopic : {
        Type : 'AWS::SNS::Topic',
        Properties : {
          TopicName : 'CreateProductTopic'
        }
      },
      EmailNotification : {
        Type : 'AWS::SNS::Subscription',
        Properties : {
          Endpoint : 'aleksandr_nikiforov@epam.com',
          Protocol : 'email',
          TopicArn : { Ref : 'CreateProductTopic' },
          FilterPolicy: {
            count: [{ 'numeric': [ '>=', 5 ] }]
          }
        }
      },
      EmailNotificationLowCount : {
        Type : 'AWS::SNS::Subscription',
        Properties : {
          Endpoint : 'alexander_kif@mail.ru',
          Protocol : 'email',
          TopicArn : { Ref : 'CreateProductTopic' },
          FilterPolicy: {
            'count': [{ numeric: [ '<', 5 ] }]
          }
        }
      }
    }
  },
  // import the function via paths
  functions: { getProductsList, getProductsById, postProduct, catalogBatchProcess },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;

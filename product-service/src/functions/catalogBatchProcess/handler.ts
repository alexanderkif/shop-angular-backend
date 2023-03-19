import { SQSEvent } from 'aws-lambda';
import { PublishCommand } from '@aws-sdk/client-sns';
import { snsClient } from '@libs/snsClient';

export const getMessageFromProducts = (products: any[]): string => {
  return products
    .reduce((resString, product) => `${resString}\n{${
      Object.keys(product).map(key => `${key}: ${product[key]}`).join(', ')
    }}`, 'Received products:')
}

export const catalogBatchProcess: any = async (event: SQSEvent) => {
  console.log('catalogBatchProcess event:', JSON.stringify(event));

  try {
    const products = [];
    event.Records.forEach(record => {
      products.push(JSON.parse(record.body));
    })
    const params = {
      Message: getMessageFromProducts(products),
      MessageAttributes: {
        count: {
          DataType: 'Number',
          StringValue: products.reduce((acc, el) => +el.count < +acc ? el.count : acc, '999')
        }
      },
      TopicArn: process.env.SNS_TOPIC_ARN,
    };
    const result = await snsClient.send(new PublishCommand(params));
    console.log('Function execution complited with success.', params, result);
    return params.Message; // For unit tests.
  } catch (error) {
    throw new Error(`Error occured during event processing: ${error}`);
  }
};

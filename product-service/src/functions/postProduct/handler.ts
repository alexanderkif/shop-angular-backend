import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { ddbDocClient } from "@libs/ddbDocClient";

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';

const productsTable = process.env.PRODUCTS_TABLE;
const stocksTable = process.env.STOCKS_TABLE;

const postProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event, context) => {
  console.log('postProduct event:', JSON.stringify(event));
  try {
    if (event.body.id && typeof event.body.id !== 'string') {
      return formatJSONResponse('The product id must be a string.', 400);
    }
    if (!event.body.title || typeof event.body.title !== 'string') {
      return formatJSONResponse('The product name is required and must be a string.', 400);
    }
    if (typeof event.body.description !== 'string') {
      return formatJSONResponse('The product description must be a string.', 400);
    }
    if (typeof event.body.price !== 'number') {
      return formatJSONResponse('The product price must be a number.', 400);
    }
    if (typeof event.body.count !== 'number') {
      return formatJSONResponse('The product count must be a number.', 400);
    }

    const productID = event.body.id || context.awsRequestId;
    const productParams = {
      TableName: productsTable,
      Item: {
        id: { S: productID },
        title: { S: event.body.title },
        description: { S: event.body.description },
        price: { N: `${event.body.price}` },
      },
    };
    const stockParams = {
      TableName: stocksTable,
      Item: {
        product_id: { S: productID },
        count: { N: `${event.body.count}` },
      },
    };
    await ddbDocClient.send(new PutItemCommand(productParams));
    await ddbDocClient.send(new PutItemCommand(stockParams));

    return formatJSONResponse({productID}, 200);
  } catch (error) {
    return formatJSONResponse(error, 500);
  }
};

export const main = middyfy(postProduct);

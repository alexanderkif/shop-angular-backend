import { ExecuteStatementCommand } from "@aws-sdk/client-dynamodb";
import { ddbDocClient } from "@libs/ddbDocClient";
import { unmarshall } from "@aws-sdk/util-dynamodb";

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';

const productsTable = process.env.PRODUCTS_TABLE;
const stocksTable = process.env.STOCKS_TABLE;

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  console.log('getProductsById event:', JSON.stringify(event));
  try {
    const productsData = await ddbDocClient.send(new ExecuteStatementCommand({
      Statement: `SELECT * FROM ${productsTable} WHERE "id" = '${event.pathParameters.id}'`
    }));

    if (!productsData?.Items[0]) {
      return formatJSONResponse('Product not found', 404);
    }
    const product = unmarshall(productsData.Items[0]);

    const stocksData = await ddbDocClient.send(new ExecuteStatementCommand({
      Statement: `SELECT * FROM ${stocksTable} WHERE "product_id" = '${product.id}'`
    }));
    product.count = unmarshall(stocksData.Items[0])?.count || 0;

    return formatJSONResponse({product}, 200);
  } catch (error) {
    return formatJSONResponse(error, 500);
  }
};

export const main = middyfy(getProductsById);

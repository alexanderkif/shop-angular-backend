import { ExecuteStatementCommand } from "@aws-sdk/client-dynamodb";
import { ddbDocClient } from "@libs/ddbDocClient";
import { unmarshall } from "@aws-sdk/util-dynamodb";

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';

const productsTable = process.env.PRODUCTS_TABLE;
const stocksTable = process.env.STOCKS_TABLE;

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  console.log('getProductsList start');
  try {
    const productsData = await ddbDocClient.send(new ExecuteStatementCommand({
      Statement: `SELECT * FROM ${productsTable}`
    }));
    let products = productsData.Items.map(i => unmarshall(i));

    const productIds = products.map(p => `'${p.id}'`);
    const stocksData = await ddbDocClient.send(new ExecuteStatementCommand({
      Statement: `SELECT * FROM ${stocksTable} WHERE "product_id" IN [${productIds}]`
    }));
    const stocks = stocksData.Items.map(i => unmarshall(i));

    products = products.map(p => ({...p, count: stocks.find(s => s.product_id === p.id).count || 0}));

    return formatJSONResponse(products, 200);
  } catch (error) {
    return formatJSONResponse(error, 500);
  }
};

export const main = middyfy(getProductsList);

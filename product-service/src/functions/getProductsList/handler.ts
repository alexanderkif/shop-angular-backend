import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import productsMock from './productsMock';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  try {
    const products = await Promise.resolve(productsMock);

    return formatJSONResponse(products, 200);
  } catch (error) {
    return formatJSONResponse(error, 500);
  }
};

export const main = middyfy(getProductsList);

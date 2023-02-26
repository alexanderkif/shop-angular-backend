import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import productsMock from '../getProductsList/productsMock';

import schema from './schema';

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const products = await Promise.resolve(productsMock);
  const product = products.find(p => p.id === event.pathParameters.id);

  return formatJSONResponse({
    product
  });
};

export const main = middyfy(getProductsById);

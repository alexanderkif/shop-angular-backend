import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import productsMock from '../getProductsList/productsMock';

import schema from './schema';

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const products = await Promise.resolve(productsMock);
    const product = products.find(p => p.id === event.pathParameters.id);

    if (!product) {
      return formatJSONResponse('Product not found', 404);
    }
    return formatJSONResponse(product, 200);
  } catch (error) {
    return formatJSONResponse(error, 500);
  }
};

export const main = middyfy(getProductsById);

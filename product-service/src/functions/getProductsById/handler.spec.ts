import { main } from './handler';
import productMock from '@functions/getProductsList/productsMock';
import { APIGatewayProxyEvent } from 'aws-lambda';

const eventTemplate: APIGatewayProxyEvent = {
  body: '',
  headers: undefined,
  multiValueHeaders: undefined,
  httpMethod: '',
  isBase64Encoded: false,
  path: '',
  pathParameters: undefined,
  queryStringParameters: undefined,
  multiValueQueryStringParameters: undefined,
  stageVariables: undefined,
  requestContext: undefined,
  resource: ''
};

jest.mock('@middy/core', () => {
  return (handler) => {
    return {
      use: jest.fn().mockReturnValue(handler),
    }
  }
})

describe('API getProductsById', () => {
  it('should return product by Id', async () => {
    const pathParameters = {id: '7'};
    const actual = await main({...eventTemplate, pathParameters, rawBody: ''}, null);
    const expected = {
      body: JSON.stringify(productMock[6]),
      statusCode: 200
    };

    expect(actual).toEqual(expected);
  });

  it('should return 404 status code', async () => {
    const pathParameters = {id: '77'};
    const actual = await main({...eventTemplate, pathParameters, rawBody: ''}, null);
    const expected = {
      body: 'Product not found',
      statusCode: 404
    };

    expect(actual).toEqual(expected);
  });
});

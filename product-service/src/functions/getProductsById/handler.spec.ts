import { main } from './handler';
import productMock from '@functions/getProductsList/productsMock';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { ddbDocClient } from '@libs/ddbDocClient';
import { marshall } from "@aws-sdk/util-dynamodb";

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
    ddbDocClient.send = jest.fn().mockReturnValue(
      {Items: productMock.map(i => ({...i, product_id: i.id})).map(i => marshall(i))}
    );
    const pathParameters = {id: '1'};
    const actual = await main({...eventTemplate, pathParameters, rawBody: ''}, null);
    const expected = {
      body: JSON.stringify({product: {...productMock[0], product_id: productMock[0].id}}),
      statusCode: 200
    };

    expect(actual).toEqual(expected);
  });

  it('should return 404 status code', async () => {
    ddbDocClient.send = jest.fn().mockReturnValue(
      {Items: []}
    );
    const pathParameters = {id: '77'};
    const actual = await main({...eventTemplate, pathParameters, rawBody: ''}, null);
    const expected = {
      body: 'Product not found',
      statusCode: 404
    };

    expect(actual).toEqual(expected);
  });
});

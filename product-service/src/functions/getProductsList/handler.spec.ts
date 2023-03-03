import { main } from './handler';
import productMock from './productsMock';
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

describe('API getProductsList', () => {
  it('should return list of products', async () => {
    const actual = await main({...eventTemplate, rawBody: ''}, null);
    const expected = {
      body: JSON.stringify(productMock),
      statusCode: 200
    };

    expect(actual).toEqual(expected);
  });
});

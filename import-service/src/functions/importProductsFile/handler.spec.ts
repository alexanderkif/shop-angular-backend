import { APIGatewayProxyEvent } from 'aws-lambda';
import { main } from './handler';

const eventTemplateMock: APIGatewayProxyEvent & { rawBody: string } = {
  body: '',
  headers: undefined,
  multiValueHeaders: undefined,
  httpMethod: '',
  isBase64Encoded: false,
  path: '',
  pathParameters: undefined,
  queryStringParameters: { name: 'catalog.csv' },
  multiValueQueryStringParameters: undefined,
  stageVariables: undefined,
  requestContext: undefined,
  resource: '',
  rawBody: ''
};
const SIGNED_URL_MOCK = 'https://signed.url';

jest.mock('@middy/core', () => {
  return (handler) => {
    return {
      use: jest.fn().mockReturnValue(handler),
    }
  }
})

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockReturnValue(Promise.resolve(SIGNED_URL_MOCK))
}))

describe('import-service importProductsFile', () => {
  it('should return response with SIGNED_URL_MOCK', async () => {
    const actual = await main(eventTemplateMock, null);
    const expected = {
      body: JSON.stringify({url: SIGNED_URL_MOCK}),
      statusCode: 200
    };

    expect(actual).toEqual(expected);
  });
  it('should return error 500 if no event.queryStringParameters.name', async () => {
    const actual = await main(null, null);
    const expected = {
      body: JSON.stringify({error: {}}),
      statusCode: 500
    };

    expect(actual).toEqual(expected);
  });
});

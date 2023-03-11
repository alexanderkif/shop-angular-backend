import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

const REGION = 'eu-west-1';
const BUCKET = 's3-art-import';
const CATALOG_PATH = 'uploaded/';

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  try {
    const client = new S3Client({ region: REGION });
    const params = {
      Bucket: BUCKET,
      Key: `${CATALOG_PATH}${event.queryStringParameters.name}`,
      ResponseContentType: 'text/csv'
    }
    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });

    return formatJSONResponse({url}, 200);
  } catch (error) {
    return formatJSONResponse({error}, 500);
  }
};

export const main = middyfy(importProductsFile);

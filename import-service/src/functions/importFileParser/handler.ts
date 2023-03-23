import { S3Event } from 'aws-lambda';
import { Readable } from 'stream';
import { S3Client, CopyObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { SendMessageCommand } from  '@aws-sdk/client-sqs';
import { formatJSONResponse } from '@libs/api-gateway';
import { sqsClient } from  '@libs/sqsClient';
import { Product } from '@libs/interfaces';

const csv = require('csv-parser');

const REGION = 'eu-west-1';
const BUCKET = 's3-art-import';
const CATALOG_UPLOADED_PATH = 'uploaded/';
const CATALOG_PARSED_PATH = 'parsed/';

export const importFileParser: any = async (event: S3Event ) => {
  console.log('importFileParser event:', event);

  const client = new S3Client({ region: REGION });
  for (const record of event.Records) {
    const fileKey = record?.s3?.object?.key;

    try {
      const commandGet = new GetObjectCommand({
        Bucket: BUCKET,
        Key: fileKey,
      });
      const response = await client.send(commandGet);
      const readStream = response.Body as Readable;

      readStream
        .pipe(csv({ separator: ';' }))
        .on('data', async (product: Product) => {
          const params = {
            MessageBody: JSON.stringify(product),
            QueueUrl: process.env.SQS_URL
          };
          try {
            const data = await sqsClient.send(new SendMessageCommand(params));
            console.log('Success, message sent. MessageID:', data.MessageId);
          } catch (err) {
            console.log('Error', err);
          }
        })
        .on('end', () => {
          console.log('End of reading the product list.');
        });

      const commandCopy = new CopyObjectCommand({
        CopySource: `${BUCKET}/${fileKey}`,
        Bucket: BUCKET,
        Key: fileKey.replace(CATALOG_UPLOADED_PATH, CATALOG_PARSED_PATH),
      });
      const commandDelete = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: fileKey,
      });

      await client.send(commandCopy);
      console.log(`File ${fileKey.split(CATALOG_UPLOADED_PATH)[1]} copy to folder ${CATALOG_PARSED_PATH}`);
      await client.send(commandDelete);
      console.log(`File ${fileKey.split(CATALOG_UPLOADED_PATH)[1]} delete from folder ${CATALOG_UPLOADED_PATH}`);
    } catch (err) {
      console.error(err);
    }
  }

  return formatJSONResponse(event, 202);
};

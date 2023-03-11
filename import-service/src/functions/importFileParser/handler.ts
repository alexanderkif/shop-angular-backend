import { S3Client, CopyObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { formatJSONResponse } from '@libs/api-gateway';
import { S3Event } from 'aws-lambda';
import { Readable } from "stream";

const csv = require('csv-parser');

const REGION = 'eu-west-1';
const BUCKET = 's3-art-import';
const CATALOG_UPLOADED_PATH = 'uploaded/';
const CATALOG_PARSED_PATH = 'parsed/';

export const importFileParser: any = async (event: S3Event ) => {
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
      const parsedData = [];

      readStream
        .pipe(csv({ separator: ';' }))
        .on('data', (data) => parsedData.push(data))
        .on('end', () => {
          console.log(parsedData);
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

import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.importFileParser`,
  events: [
    {
      s3: {
        bucket: 's3-art-import',
        event: 's3:ObjectCreated:*',
        rules: [{prefix: 'uploaded/'}],
        existing: true
      },
    },
  ],
};

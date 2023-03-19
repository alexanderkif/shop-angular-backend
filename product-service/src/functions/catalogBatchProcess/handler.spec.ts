import { SQSEvent } from 'aws-lambda';
import { snsClient } from '@libs/snsClient';
import { catalogBatchProcess, getMessageFromProducts } from './handler';

snsClient.send = jest.fn().mockReturnValue('');

describe('catalogBatchProcess handler', () => {
  it('should return product from ', async () => {
    const product = {id: 'id', title: 'title', description: '', price: 1, count: 2};
    const eventTemplate: SQSEvent = {
      Records: [
        {
          messageId: '',
          receiptHandle: '',
          body: JSON.stringify(product),
          attributes: null,
          messageAttributes: null,
          md5OfBody: '',
          eventSource: '',
          eventSourceARN: '',
          awsRegion: '',
        }
      ]
    };
    const actual = await catalogBatchProcess(eventTemplate);
    const expected = getMessageFromProducts([product]);

    expect(snsClient.send).toBeCalled();
    expect(actual).toBe(expected);
  });

  it('getMessageFromProducts method', () => {
    const actual = getMessageFromProducts([{abc: 'abc', num: 123},{def: 'def', num: 456}]);

    expect(actual).toEqual('Received products:\n{abc: abc, num: 123}\n{def: def, num: 456}');
  });
});

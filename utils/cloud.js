import fs from 'fs';
import config from 'config';
import aws from 'aws-sdk';

const s3 = new aws.S3({
  accessKeyId: config.get('aws.iam.key'),
  secretAccessKey: config.get('aws.iam.secret'),
  region: config.get('aws.region'),
  signatureVersion: 'v4',
  params: {
    Bucket: config.get('aws.s3.bucket'),
  },
});

const sqs = new aws.SQS({
  accessKeyId: config.get('aws.iam.key'),
  secretAccessKey: config.get('aws.iam.secret'),
  region: config.get('aws.region'),
});

/**
 * Upload a file to a remote location
 *
 * @param {string} source
 * @param {string} destination
 *
 * @return {Promise}
 */
export function upload(source, destination) {
  let body = source;

  if (typeof body === 'string') {
    body = fs.readFileSync(source);
  }

  return s3
    .putObject({
      Body: body,
      Key: destination,
    })
    .promise();
}

/**
 * Download a file from a remote location
 *
 * @param {string} source
 * @param {string?} destination
 *
 * @return {Promise}
 */
export function download(source, destination) {
  return s3
    .getObject({
      Key: source,
    })
    .promise()
    .then((data) => {
      if (destination) {
        fs.writeFileSync(destination, data.Body);
      }

      return data.Body;
    });
}

/**
 * Delete a file from a remote location
 *
 * @param {string} source
 *
 * @return {Promise}
 */
export function destroy(source) {
  return s3
    .deleteObject({
      Key: source,
    })
    .promise();
}

/**
 * Returns object's metadata
 *
 * @param {string} source
 *
 * @return {Promise}
 */
export function check(source) {
  return s3
    .headObject({
      Key: source,
    })
    .promise();
}

/**
 * Copy a file in the remote "fs"
 *
 * @param {string} source
 * @param {string} destination
 *
 * @return {Promise}
 */
export function copy(source, destination) {
  source = `${config.get('aws.s3.bucket')}/${source}`; // eslint-disable-line no-param-reassign

  return s3
    .copyObject({
      Key: destination,
      CopySource: source,
    })
    .promise();
}

function createQueueUrl(name) {
  return `https://sqs.${config.get('aws.region')}.amazonaws.com/${config.get('aws.accountId')}/${name}`;
}

/**
 * Receives messages from the queue
 *
 * @param {string} queue The name of the queue
 * @param {int}    max   Max number of messages to be received
 * @returns {Promise<SQS.Types.ReceiveMessageResult>}
 */
export function receiveMessage(queue, max = 1) {
  return sqs
    .receiveMessage({
      QueueUrl: createQueueUrl(queue),
      MaxNumberOfMessages: max,
    })
    .promise()
    .then(data => (data.Messages || []).map(message => ({
      ...message,
      deleteMessage: () => sqs.deleteMessage({
        QueueUrl: createQueueUrl(queue),
        ReceiptHandle: message.ReceiptHandle,
      }).promise(),
    })));
}

/**
 * Sends a message to the queue
 *
 * @param {string} queue      The name of the queue
 * @param {string} body       The body of the message
 * @param {object} attributes The attributes of the message
 * @returns {Promise<SQS.Types.SendMessageResult>}
 */
export function sendMessage(queue, body, attributes = null) {
  return sqs
    .sendMessage({
      QueueUrl: createQueueUrl(queue),
      MessageBody: body,
      MessageAttributes: attributes,
    })
    .promise();
}

/**
 * Purges a queue
 *
 * @param {string} queue The name of the queue
 * @returns {Promise<{}>}
 */
export function purgeQueue(queue) {
  return sqs
    .purgeQueue({
      QueueUrl: createQueueUrl(queue),
    })
    .promise();
}

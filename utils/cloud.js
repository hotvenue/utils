import fs from 'fs';
import config from 'config';
import aws from 'aws-sdk';

const awsConfig = config.get('aws');

const s3 = new aws.S3({
  params: {
    accessKeyId: awsConfig.iam.key,
    secretAccessKey: awsConfig.iam.secret,

    Bucket: awsConfig.s3.bucket,
    region: awsConfig.region,
  },
  signatureVersion: 'v4',
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
  source = `${awsConfig.s3.bucket}/${source}`; // eslint-disable-line no-param-reassign

  return s3
    .copyObject({
      Key: destination,
      CopySource: source,
    })
    .promise();
}

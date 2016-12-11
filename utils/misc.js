import fs from 'fs';
import crypto from 'crypto';

/**
 * Creates the hash of a file
 *
 * @param {string} path - The file I'm trying to hash
 * @param {string} algorithm - [default: sha512] The algorithm to use for the hashing
 *
 * @return {Promise<String>}
 */
export function hashFile(path, algorithm) { // eslint-disable-line import/prefer-default-export
  const shasum = crypto.createHash(algorithm || 'sha512');

  return new Promise((resolve, reject) => {
    fs.createReadStream(path)
      .on('data', (data) => {
        shasum.update(data);
      })
      .on('end', () => {
        resolve(shasum.digest('hex'));
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

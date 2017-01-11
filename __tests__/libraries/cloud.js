import fs from 'fs';
import path from 'path';

import { upload, download, destroy, check, copy } from '../../utils/cloud';

describe('Cloud', () => {
  describe('S3', () => {
    const dir = path.join(__dirname, '..', 'assets');

    const filename1 = 'file1.txt';
    const filename2 = 'file2.txt';
    const filename3 = 'file3.txt';

    const file1 = path.join(dir, filename1);
    const file2 = path.join(dir, filename2);
    const file3 = path.join(dir, filename3);

    beforeEach(() => Promise.all([
      upload(file1, filename1),
    ]));

    afterEach(() => Promise.all([
      destroy(filename1),
      destroy(filename2),
    ]));

    it('should upload a file', () => upload(file2, filename2)
      .then(() => check(filename2))
      .then((meta) => {
        expect(meta).toBeDefined();
        expect(meta).toBeInstanceOf(Object);
        expect(meta.AcceptRanges).toBeDefined();
        expect(meta.LastModified).toBeDefined();
        expect(meta.ContentLength).toBe('0');
        expect(meta.ETag).toBeDefined();
        expect(meta.ContentType).toBe('application/octet-stream');
      }));

    it('should download a file', () => download(filename1, file3)
      .then(() => fs.statSync(file3))
      .then((stats) => {
        expect(stats).toBeDefined();
        expect(stats.isFile()).toBeTruthy();

        fs.unlinkSync(file3);
      }));

    it('should download the content of a file', () => download(filename1)
      .then((body) => {
        expect(body).toBeDefined();
        expect(body).toBeInstanceOf(Buffer);
      }));

    it('should delete a file', () => destroy(filename1)
      .then(() => check(filename1))
      .catch(err => expect(err.code).toBe('NotFound')));

    it('should copy a file', () => copy(filename1, filename2)
      .then(() => check(filename2)));
  });
});

import path from 'path';

import { hashFile } from '../../utils/misc';

describe('Utils', () => {
  const dir = path.join(__dirname, '..', 'assets');

  const filename1 = 'file1.txt';

  const file1 = path.join(dir, filename1);

  it('should hash a file', () => hashFile(file1)
    .then(hash => expect(hash).toBe('cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e')));
});

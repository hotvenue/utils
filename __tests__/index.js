import * as utils from '../index';

describe('Utils', () => {
  it('should export all necessary utils', () => {
    expect(utils).toBeDefined();

    expect(utils.cloud).toBeDefined();
    expect(utils.log).toBeDefined();
    expect(utils.misc).toBeDefined();
  });
});

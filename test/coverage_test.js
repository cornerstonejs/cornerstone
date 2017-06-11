/* eslint-disable no-unused-expressions */
import { expect } from 'chai';

import * as cornerstone from '../src/index.js';

describe('A test that pulls in all modules', function () {
  it('pulls in all modules', function () {
    expect(cornerstone).to.exist;
  });
});

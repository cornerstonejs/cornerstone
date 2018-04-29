/* eslint-disable no-unused-expressions */
import { expect } from 'chai'; // eslint-disable-line import/extensions

import * as cornerstone from '../src/index.js';

describe('A test that pulls in all modules', function () {
  it('pulls in all modules', function () {
    expect(cornerstone).to.exist;
  });
});

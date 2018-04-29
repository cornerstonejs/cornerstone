import { assert } from 'chai'; // eslint-disable-line import/extensions

import { Transform } from '../../src/internal/transform.js';

describe('Transform', function () {
  it('clone', function () {
    // Act
    const transformObject = new Transform();
    const clonedObject = transformObject.clone();

    transformObject.m[0] = 0;

    // Assert
    assert.deepEqual(clonedObject.m, [1, 0, 0, 1, 0, 0], 'cloned identity matrix.');
  });
  it('multiply', function () {
    // Act
    const transformObject = new Transform();
    const newTransformObject = new Transform();

    newTransformObject.m = [1, 2, 3, 4, 5, 6];
    transformObject.multiply(newTransformObject);
    // Assert
    assert.deepEqual(newTransformObject.m, transformObject.m, 'Multiplication works.');
  });
  it('invert', function () {
    // Act
    const transformObject = new Transform();
    const clonedObject = new Transform();

    transformObject.m = [1, 2, 3, 4, 5, 6];
    clonedObject.m = [1, 1, 1, 1, 1, 2];
    transformObject.invert();
    clonedObject.invert();
    // Assert
    assert.deepEqual(transformObject.m, [-2, 1, 3 / 2, -1 / 2, 1, -2], 'Inversion works.');
    assert.deepEqual(clonedObject.m, [Infinity, -Infinity, -Infinity, Infinity, Infinity, -Infinity], 'Noninvertible inversion.');
  });
  it('transform point', function () {
    // Act
    const transformObject = new Transform();

    transformObject.m = [6, 5, 4, 3, 2, 1];
    const transformedPoints = transformObject.transformPoint(2, 3);

    // Assert
    assert.deepEqual([transformedPoints.x, transformedPoints.y], [26, 20], 'Point transformation works.');
  });
});

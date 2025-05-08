import test from 'node:test';
import assert from 'node:assert';

test('view', () => {
  Evolve.Given(undefined, 'counter1', [
    new Added('counter1', 1)
  ])

});

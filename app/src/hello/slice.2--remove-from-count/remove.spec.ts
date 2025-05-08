import test from 'node:test';
import assert from 'node:assert';

test('remove', () => {
  Evolve.Given(undefined, 'counter1', [
    new Added('counter1', 1)
  ])
    .When((undefined: undefined) => undefined.remove(new Remove('counter1', 1)))

});

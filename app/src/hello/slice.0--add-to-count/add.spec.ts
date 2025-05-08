import test from 'node:test';
import assert from 'node:assert';

test('add', () => {
  Evolve.Given(undefined, 'counter1', [
    new Added('counter1', 1)
  ])
    .When((undefined: undefined) => undefined.add(new Add('counter1', 1)))

});

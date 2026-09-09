import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';

// Use the project's compiler so the actual renderer runs on Node 20 and 22
// without relying on Node's version-dependent native TypeScript loader.
const source = await readFile(new URL('../../src/components/HeroUniverse/starfield.ts', import.meta.url), 'utf8');
const {outputText} = ts.transpileModule(source, {
  compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022},
});
const {createStarField} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

function canvasFixture() {
  const draws = [];
  const context = {
    fillStyle: '',
    setTransform() {},
    clearRect() { draws.length = 0; },
    beginPath() {},
    arc(x, y, radius) { draws.push({x, y, radius, color: this.fillStyle}); },
    fill() {},
  };
  return {
    draws,
    canvas: {parentElement: {clientWidth: 1440, clientHeight: 1000}, style: {}, getContext: () => context},
  };
}

test('static star pixels keep their layout across independent renderers and geometry rebuilds without runtime randomness', t => {
  const previousWindow = globalThis.window;
  globalThis.window = {devicePixelRatio: 1};
  t.after(() => {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  });
  const unexpectedRandomness = () => { throw new Error('Static star layouts must not read time or randomness'); };
  t.mock.method(Date, 'now', unexpectedRandomness);
  t.mock.method(Math, 'random', unexpectedRandomness);
  const first = canvasFixture();
  const second = canvasFixture();
  const field = createStarField(first.canvas);
  const baseline = structuredClone(first.draws);
  assert.ok(baseline.length > 100, 'the assertion covers a painted field');
  createStarField(second.canvas);
  assert.deepEqual(second.draws, baseline, 'independent instances paint the same stars');
  field.resize();
  assert.deepEqual(first.draws, baseline, 'same-size resize cannot reshuffle stars');
  first.canvas.parentElement.clientWidth = 390;
  field.resize();
  assert.notDeepEqual(first.draws, baseline, 'the renderer responds to new geometry');
  first.canvas.parentElement.clientWidth = 1440;
  field.resize();
  assert.deepEqual(first.draws, baseline, 'returning to the original geometry restores the layout');
});

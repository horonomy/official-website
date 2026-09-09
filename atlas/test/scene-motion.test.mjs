import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSceneMotion} from '../../src/components/primitives/sceneMotion.mjs';

function fixture(t, reduced = false) {
  const media = Object.assign(new EventTarget(), {matches: reduced});
  const page = Object.assign(new EventTarget(), {hidden: false});
  const frames = new Map();
  const stored = new Map();
  let nextFrame = 0;
  let intersection;
  const originalIntersection = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = class {
    constructor(callback) { intersection = callback; }
    observe() { intersection([{isIntersecting: true}]); }
    disconnect() { intersection = null; }
  };
  t.after(() => {
    if (originalIntersection === undefined) delete globalThis.IntersectionObserver;
    else globalThis.IntersectionObserver = originalIntersection;
  });
  const view = Object.assign(new EventTarget(), {
    matchMedia: () => media,
    requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); },
    sessionStorage: {getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value)},
  });
  return {
    media, page, frames, view,
    visibility(visible) { intersection([{isIntersecting: visible}]); },
    tick(time) {
      const pending = [...frames.values()];
      frames.clear();
      for (const callback of pending) callback(time);
    },
  };
}

test('one scene clock preserves static preference, pause and visibility across interruption and revisits', t => {
  const env = fixture(t, true);
  const element = {dataset: {}};
  const states = [];
  const calls = [[], []];
  let disposed = 0;
  const factories = calls.map(log => () => ({
    resize() {}, static() { log.push('static'); },
    frame(elapsed, delta) { log.push([elapsed, delta]); },
    destroy() { disposed++; },
  }));
  const options = {element, factories, onState: state => states.push(state), view: env.view, page: env.page};
  const motion = createSceneMotion(options);
  assert.equal(element.dataset.hnMotion, 'static');
  assert.equal(env.frames.size, 0);
  env.media.matches = false;
  env.media.dispatchEvent(new Event('change'));
  assert.equal(env.frames.size, 1, 'two renderers share a single scheduled frame');
  env.tick(100);
  env.tick(116);
  assert.deepEqual(calls[0].at(-1), [16, 16]);
  motion.setPaused(true);
  assert.equal(env.frames.size, 0);
  assert.equal(calls[0].at(-1), 'static');
  env.media.matches = true;
  env.media.dispatchEvent(new Event('change'));
  motion.setPaused(false);
  assert.equal(element.dataset.hnMotion, 'static', 'resume cannot override system reduced motion');
  assert.equal(env.frames.size, 0);
  env.media.matches = false;
  env.media.dispatchEvent(new Event('change'));
  env.tick(10000);
  assert.deepEqual(calls[0].at(-1), [16, 0], 'paused time never becomes a catch-up frame');
  env.page.hidden = true;
  env.page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(element.dataset.hnMotion, 'suspended');
  assert.equal(env.frames.size, 0);
  env.page.hidden = false;
  env.page.dispatchEvent(new Event('visibilitychange'));
  env.visibility(false);
  assert.equal(env.frames.size, 0, 'offscreen scenes stop too');
  env.visibility(true);
  env.tick(20000);
  assert.deepEqual(calls[0].at(-1), [16, 0]);
  assert.deepEqual(calls[0], calls[1]);
  motion.setPaused(true);
  motion.destroy();
  assert.equal(disposed, 2);
  const stateCount = states.length;
  env.media.dispatchEvent(new Event('change'));
  env.page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(states.length, stateCount, 'destroy removes preference and visibility listeners');
  assert.equal(env.frames.size, 0);
  const revisit = createSceneMotion(options);
  assert.equal(element.dataset.hnMotion, 'static');
  assert.equal(states.at(-1).paused, true, 'pause survives the scene being mounted again');
  revisit.destroy();
});

// @ts-check
/**
 * Browser-native lifecycle for optional decorative renderers. The DOM owns
 * content/actions; a renderer may fail without taking either down. One clock
 * feeds all renderers and advances only while the scene is visible and enabled.
 * Consumers: HeroUniverse's star field and meteor layer; CSS decoration follows
 * the same data-hn-motion state. No product IDs, navigation or pose logic live here.
 */

/** @typedef {{resize: () => void, frame: (elapsed: number, delta: number) => void, static: () => void, destroy?: () => void}} SceneRenderer */
/** @typedef {{mode: 'running' | 'static' | 'suspended' | 'failed', paused: boolean, reduced: boolean}} SceneMotionState */

/**
 * @param {{element: HTMLElement, factories: Array<() => SceneRenderer>, onState: (state: SceneMotionState) => void, view?: Window, page?: Document, storageKey?: string}} options
 */
export function createSceneMotion({element, factories, onState, view = window, page = document, storageKey = 'hn.scene.paused'}) {
  const media = view.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  try { paused = view.sessionStorage.getItem(storageKey) === 'true'; } catch { /* Storage may be unavailable; the local control still works. */ }
  let visible = false;
  let failed = false;
  let disposed = false;
  let raf = 0;
  let elapsed = 0;
  /** @type {number | null} */
  let previous = null;
  /** @type {SceneRenderer[]} */
  let renderers = [];
  /** @type {SceneMotionState['mode']} */
  let mode = 'static';

  function cancel() {
    if (raf) view.cancelAnimationFrame(raf);
    raf = 0;
    previous = null;
  }
  function release() {
    for (const renderer of renderers) {
      try { renderer.destroy?.(); } catch { /* A failed decoration cannot block cleanup of its siblings. */ }
    }
    renderers = [];
  }
  function publish() {
    element.dataset.hnMotion = mode;
    onState({mode, paused, reduced: media.matches});
  }
  /** @param {() => void} work */
  function safely(work) {
    try { work(); } catch {
      failed = true;
      cancel();
      release();
      mode = 'failed';
      publish();
    }
  }
  /** @param {number} time */
  function frame(time) {
    raf = 0;
    if (disposed || mode !== 'running') return;
    const delta = previous === null ? 0 : Math.min(50, time - previous);
    previous = time;
    elapsed += delta;
    safely(() => renderers.forEach(renderer => renderer.frame(elapsed, delta)));
    if (!failed) raf = view.requestAnimationFrame(frame);
  }
  function update() {
    if (disposed) return;
    cancel();
    mode = 'running';
    if (paused || media.matches || !intersection) mode = 'static';
    if (page.hidden || !visible) mode = 'suspended';
    if (failed) mode = 'failed';
    publish();
    if (mode === 'running') raf = view.requestAnimationFrame(frame);
    else if (mode === 'static') safely(() => renderers.forEach(renderer => renderer.static()));
  }
  function resize() {
    if (disposed || failed) return;
    safely(() => renderers.forEach(renderer => renderer.resize()));
    if (mode === 'static') safely(() => renderers.forEach(renderer => renderer.static()));
  }

  // Missing visibility APIs fail to the complete static presentation.
  const intersection = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    update();
  });
  const size = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
  safely(() => { for (const factory of factories) renderers.push(factory()); });
  media.addEventListener('change', update);
  page.addEventListener('visibilitychange', update);
  intersection?.observe(element);
  size?.observe(element);
  if (!intersection) visible = true;
  if (!size) view.addEventListener('resize', resize);
  resize();
  update();

  return {
    /** @param {boolean} value */
    setPaused(value) {
      paused = value;
      try { view.sessionStorage.setItem(storageKey, String(value)); } catch { /* Session persistence is optional, control is not. */ }
      update();
    },
    destroy() {
      disposed = true;
      cancel();
      intersection?.disconnect();
      size?.disconnect();
      media.removeEventListener('change', update);
      page.removeEventListener('visibilitychange', update);
      view.removeEventListener('resize', resize);
      release();
    },
  };
}

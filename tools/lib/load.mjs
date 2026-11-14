/**
 * Load the built client.js in Node with just enough browser surface for the
 * models to run: window/document/localStorage/matchMedia + a React stub.
 * Returns { window, api } where api is `window.__mathLab`.
 */
import { readFileSync } from 'node:fs';

const ReactStub = {
  createElement: (...args) => ({ kind: 'element', args }),
  useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
  useEffect: () => {},
  useRef: (initial) => ({ current: initial }),
  useCallback: (fn) => fn,
  useMemo: (fn) => fn(),
};

export function loadPlugin(clientPath, options) {
  const React = (options && options.react) || ReactStub;
  const code = readFileSync(clientPath, 'utf8');
  const store = new Map();
  const win = {};
  win.window = win;
  win.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  };
  win.devicePixelRatio = 1;
  win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  win.__ModuleLoader__ = {
    load(definition) {
      win.__pluginId = definition.id;
      win.__plugin = definition.factory((name) => (name === 'react' ? React : {}));
    },
  };

  const doc = {
    documentElement: { getAttribute: () => null },
    body: { getAttribute: () => null },
    createElement: () => ({ getContext: () => null, style: {} }),
  };
  const getComputedStyle = () => ({ getPropertyValue: () => '' });
  const performanceStub = { now: () => Date.now() };
  const raf = () => 0;

  const run = new Function(
    'window',
    'document',
    'performance',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'getComputedStyle',
    'ResizeObserver',
    'MutationObserver',
    `${code}\n//# sourceURL=dsh-math-lab-client.js`,
  );
  run(
    win,
    doc,
    performanceStub,
    raf,
    () => {},
    getComputedStyle,
    class {
      observe() {}
      disconnect() {}
    },
    class {
      observe() {}
      disconnect() {}
    },
  );

  return { window: win, api: win.__mathLab, plugin: win.__plugin };
}

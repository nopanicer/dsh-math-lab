/**
 * 面板级 SSR 冒烟测试：用真实 React 把 MathPanel 渲染成字符串。
 *
 * useEffect 不跑（canvas 不会真的画），但组件渲染路径、pick() 双语取值、
 * 24 个模型的参数区/读数区/讲解区/练习题区都会被真实执行一遍，
 * 能抓到 "某个模型一打开面板就白屏" 这类错误。
 *
 *   node build.mjs && node tools/ssr.mjs
 */
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlugin } from './lib/load.mjs';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const GLOBAL_ROOT = '/opt/homebrew/lib/node_modules';
let React;
let renderToString;
try {
  React = require(`${GLOBAL_ROOT}/react/index.js`);
  ({ renderToString } = require(`${GLOBAL_ROOT}/react-dom/server.node.js`));
} catch (error) {
  console.log(`跳过 SSR 测试：找不到全局 react / react-dom（${error.message}）`);
  process.exit(0);
}

const { window: win, api } = loadPlugin(resolve(root, 'client.js'), { react: React });
if (!api || !api.MathPanel) {
  console.error('client.js 没有导出 MathPanel（window.__mathLab.MathPanel）');
  process.exit(1);
}

// React 会把 & < > " ' 转义，比对前先还原
const decode = (html) =>
  html
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const dict = api.dictionaries.zh;
const t = (key) => (dict[key] === undefined ? key : dict[key]);
const failures = [];
let okCount = 0;

for (const model of api.MODELS) {
  win.localStorage.setItem('math-lab/v1', JSON.stringify({ modelId: model.id, params: {} }));
  try {
    const html = renderToString(React.createElement(api.MathPanel, { t }));
    const text = decode(html);
    if (!text || text.length < 500) throw new Error(`渲染结果过短（${text.length} 字符）`);
    if (!text.includes(model.name.zh)) throw new Error('渲染结果里找不到模型名');
    if (!text.includes('参数') || !text.includes('实时读数')) throw new Error('缺少参数/读数区块');
    okCount += 1;
  } catch (error) {
    failures.push(`${model.id}: ${error.message}`);
  }
}

// 再跑一遍英文
const dictEn = api.dictionaries.en;
const tEn = (key) => (dictEn[key] === undefined ? key : dictEn[key]);
for (const model of api.MODELS) {
  win.localStorage.setItem('math-lab/v1', JSON.stringify({ modelId: model.id, params: {} }));
  try {
    const html = decode(renderToString(React.createElement(api.MathPanel, { t: tEn })));
    if (!html.includes(model.name.en)) throw new Error('英文渲染里找不到模型名');
    okCount += 1;
  } catch (error) {
    failures.push(`${model.id} (en): ${error.message}`);
  }
}

if (failures.length) {
  console.log(`✗ ${failures.length} 个面板渲染失败：`);
  failures.forEach((line) => console.log('  · ' + line));
  process.exit(1);
}
console.log(`✓ ${okCount} 次面板渲染通过（24 模型 × 中英双语）`);

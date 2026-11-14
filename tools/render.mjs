/**
 * Headless render checker.
 *
 *   node tools/render.mjs --all                 # 每个模型渲染一张 PNG
 *   node tools/render.mjs quadratic ellipse     # 只渲染指定模型
 *   node tools/render.mjs --all --sheet         # 再拼一张 24 格总览图
 *   node tools/render.mjs --all --t 0.5         # 指定动画进度（0–1）
 *
 * 原理：把 model.draw() 接到 Canvas2D→SVG 记录器上，再用 sharp 光栅化。
 * 这样不开浏览器也能看见画面，改布局/坐标时先看图再交差。
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRecorder } from './lib/canvas2svg.mjs';
import { loadPlugin } from './lib/load.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const outDir = resolve(root, 'tools/out');

const SHARP_CANDIDATES = [
  'sharp',
  '/Users/nopanicer/.dsh/profiles/abab-new/node_modules/sharp/dist/index.mjs',
  '/opt/homebrew/lib/node_modules/sharp/dist/index.mjs',
];

async function loadSharp() {
  for (const candidate of SHARP_CANDIDATES) {
    try {
      const mod = await import(candidate.startsWith('/') ? candidate : candidate);
      return mod.default || mod;
    } catch (_error) {
      /* try the next one */
    }
  }
  return null;
}

function parseArgs(argv) {
  const args = { ids: [], all: false, sheet: false, t: 0.35, w: 860, h: 560, lang: 'zh', dark: false };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--all') args.all = true;
    else if (token === '--sheet') args.sheet = true;
    else if (token === '--dark') args.dark = true;
    else if (token === '--t') args.t = Number(argv[(i += 1)]);
    else if (token === '--w') args.w = Number(argv[(i += 1)]);
    else if (token === '--h') args.h = Number(argv[(i += 1)]);
    else if (token === '--lang') args.lang = argv[(i += 1)];
    else if (token === '--params') args.params = JSON.parse(argv[(i += 1)]);
    else if (token === '--client') args.client = argv[(i += 1)];
    else args.ids.push(token);
  }
  return args;
}

function initialParams(model) {
  const out = {};
  model.params.forEach((p) => {
    out[p.key] = p.init;
  });
  return out;
}

const args = parseArgs(process.argv.slice(2));
const { api } = loadPlugin(resolve(root, args.client || 'client.js'));
if (!api || !Array.isArray(api.MODELS)) {
  console.error('client.js 没有注册模型：window.__mathLab 缺失。先跑 node build.mjs。');
  process.exit(1);
}

const models = args.all ? api.MODELS : api.MODELS.filter((m) => args.ids.includes(m.id));
if (!models.length) {
  console.error('没有匹配的模型。可用：' + api.MODELS.map((m) => m.id).join(', '));
  process.exit(1);
}

const sharp = await loadSharp();
await mkdir(outDir, { recursive: true });

const palette = api.readPalette();
if (args.dark) {
  Object.assign(palette, {
    dark: true,
    text: '#e7e9ee',
    muted: '#98a1b0',
    grid: 'rgba(255,255,255,0.08)',
    axis: 'rgba(255,255,255,0.40)',
    area: 'rgba(76,141,255,0.22)',
    area2: 'rgba(245,165,36,0.22)',
    shade: 'rgba(160,107,255,0.20)',
    chip: 'rgba(12,15,20,0.86)',
  });
}

api.setDrawLang(args.lang);
api.setChip(palette.chip);

const rendered = [];
for (const model of models) {
  const params = Object.assign(initialParams(model), args.params || {});
  let total = 1;
  try {
    total = Math.max(0.2, model.duration(params));
  } catch (_error) {
    total = 1;
  }
  const t = Math.max(0, Math.min(1, args.t)) * total;
  let st;
  try {
    st = model.state(t, params);
  } catch (error) {
    console.error(`✗ ${model.id}: state() 抛错 → ${error.message}`);
    continue;
  }
  const box = (typeof model.box === 'function' ? model.box(params) : null) || { xMin: -5, xMax: 5, yMin: -4, yMax: 4 };
  const recorder = createRecorder(args.w, args.h);
  const view = api.createPlaneView(args.w, args.h, box.xMin, box.xMax, box.yMin, box.yMax, 34, Boolean(model.freeAspect));
  let drawError = null;
  try {
    if (!model.noAxes) {
      api.drawGrid(recorder.ctx, view, palette);
      api.drawAxes(recorder.ctx, view, palette, model.axisLabels || null);
    }
    model.draw(recorder.ctx, st, view, palette, { grid: true, aux: true, threeD: false }, params);
  } catch (error) {
    drawError = error;
  }
  const svg = recorder.toSvg({ background: args.dark ? '#12161d' : '#ffffff' });
  const svgPath = resolve(outDir, `${model.id}.svg`);
  const pngPath = resolve(outDir, `${model.id}.png`);
  await writeFile(svgPath, svg);
  if (sharp) {
    await sharp(Buffer.from(svg)).png().toFile(pngPath);
  }
  // 副图：和面板一样，没自实现 drawChart 就用 chartLabel + chartValue 自动画
  let chartPath = null;
  if (!model.noChart) {
    try {
      const chartRec = createRecorder(430, 140);
      if (typeof model.drawChart === 'function') {
        model.drawChart(chartRec.ctx, 430, 140, st, params, palette);
      } else {
        const series = api.seriesOf(model, params);
        api.drawChart(chartRec.ctx, 430, 140, series, palette, t, model.chartLabel ? api.pick(model.chartLabel, args.lang) : '');
      }
      const chartSvg = chartRec.toSvg({ background: args.dark ? '#12161d' : '#ffffff' });
      chartPath = resolve(outDir, `${model.id}_chart.png`);
      if (sharp) await sharp(Buffer.from(chartSvg)).png().toFile(chartPath);
      else await writeFile(resolve(outDir, `${model.id}_chart.svg`), chartSvg);
    } catch (chartError) {
      console.error(`  ! ${model.id} 副图渲染失败：${chartError.message}`);
      chartPath = null;
    }
  }

  const rowCount = Array.isArray(st && st.rows) ? st.rows.length : 0;
  console.log(
    `${drawError ? '✗' : '✓'} ${model.id.padEnd(18)} rows=${String(rowCount).padEnd(2)} svg=${(svg.length / 1024).toFixed(
      1,
    )}KB ${drawError ? 'draw: ' + drawError.message : ''}`,
  );
  rendered.push({ model, pngPath, svgPath, ok: !drawError });
}

if (args.sheet && sharp && rendered.length) {
  const cellW = 300;
  const cellH = Math.round((cellW * args.h) / args.w);
  const cols = Math.min(6, rendered.length);
  const rows = Math.ceil(rendered.length / cols);
  const composites = [];
  for (let i = 0; i < rendered.length; i += 1) {
    const thumb = await sharp(rendered[i].pngPath).resize(cellW, cellH, { fit: 'contain', background: args.dark ? '#12161d' : '#ffffff' }).png().toBuffer();
    composites.push({
      input: thumb,
      left: (i % cols) * cellW,
      top: Math.floor(i / cols) * cellH,
    });
  }
  const sheetPath = resolve(outDir, 'sheet.png');
  await sharp({
    create: {
      width: cols * cellW,
      height: rows * cellH,
      channels: 3,
      background: args.dark ? '#12161d' : '#ffffff',
    },
  })
    .composite(composites)
    .png()
    .toFile(sheetPath);
  console.log(`总览图：${sheetPath}`);
}

if (!sharp) console.log('（没找到 sharp：只写了 SVG，没光栅化）');

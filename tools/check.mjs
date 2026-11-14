/**
 * 契约检查：模型 / 讲解 / 出题 / 例题是否齐全且自洽。
 *
 *   node build.mjs && node tools/check.mjs
 *
 * 检查项：
 *   - 24 个模型、id 唯一、三组各 8 个
 *   - 每个模型：双语名称/公式/提示、参数合法、box/duration 有限
 *   - state() 在多个时间点都能给出读数行；draw() 不抛错（走 SVG 记录器）
 *   - 讲解：课文 + ≥3 条分步、双语、at 递增
 *   - 随机出题：30 个种子至少成功一次，答案有限、解析双语
 *   - 为例题：题干/解析/单位/答案齐全
 *   - 答案解析器常见写法
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRecorder } from './lib/canvas2svg.mjs';
import { loadPlugin } from './lib/load.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

// --only id1,id2：只检查这几个模型（各自开发时用，跳过 24 个的总数检查）
const onlyArg = process.argv.indexOf('--only');
const only = onlyArg >= 0 ? String(process.argv[onlyArg + 1] || '').split(',').filter(Boolean) : null;

const clientArg = process.argv.indexOf('--client');
const clientPath = clientArg >= 0 ? resolve(root, process.argv[clientArg + 1]) : resolve(root, 'client.js');
const { api } = loadPlugin(clientPath);
if (!api) {
  console.error('client.js 没有导出 window.__mathLab');
  process.exit(1);
}

const all = api.MODELS;
const { LESSONS, QUIZZES, EXAM_BANK, parseAnswer } = api;
const MODELS = only ? all.filter((m) => only.includes(m.id)) : all;
if (only) {
  const missing = only.filter((id) => !all.some((m) => m.id === id));
  if (missing.length) {
    console.error('这些 id 还不存在：' + missing.join(', '));
    process.exit(1);
  }
}

const errors = [];
const warnings = [];
const error = (id, message) => errors.push(`[${id}] ${message}`);
const warn = (id, message) => warnings.push(`[${id}] ${message}`);

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const bilingual = (value) => value && typeof value === 'object' && typeof value.zh === 'string' && typeof value.en === 'string';
const requireBilingual = (id, label, value) => {
  if (!bilingual(value) || !value.zh.trim() || !value.en.trim()) error(id, `${label} 需要 {zh,en} 双语且非空`);
};

function initialParams(model) {
  const out = {};
  model.params.forEach((p) => {
    out[p.key] = p.init;
  });
  return out;
}

// ---- 1. 模型数量与分组 ----
const ids = new Set();
const byGrade = { 1: 0, 2: 0, 3: 0 };
MODELS.forEach((model) => {
  if (!model.id) error('models', '存在没有 id 的模型');
  if (ids.has(model.id)) error(model.id, 'id 重复');
  ids.add(model.id);
  if (![1, 2, 3].includes(model.grade)) error(model.id, `grade=${model.grade} 不是 1/2/3`);
  else byGrade[model.grade] += 1;
});
if (!only) {
if (MODELS.length !== 24) error('models', `应有 24 个模型，实际 ${MODELS.length}`);
[1, 2, 3].forEach((grade) => {
  if (byGrade[grade] !== 8) error('models', `高${['', '一', '二', '三'][grade]}应有 8 个模型，实际 ${byGrade[grade]}`);
});
}

// ---- 2. 逐模型检查 ----
const palette = api.readPalette();
api.setDrawLang('zh');
api.setChip(palette.chip);

MODELS.forEach((model) => {
  const id = model.id || '(no id)';
  requireBilingual(id, 'name', model.name);
  requireBilingual(id, 'formula', model.formula);
  requireBilingual(id, 'hint', model.hint);

  if (!Array.isArray(model.params) || !model.params.length) {
    error(id, 'params 为空');
    return;
  }
  const seen = new Set();
  model.params.forEach((p) => {
    if (!p.key) error(id, '参数缺 key');
    if (seen.has(p.key)) error(id, `参数 key 重复：${p.key}`);
    seen.add(p.key);
    requireBilingual(id, `参数 ${p.key} 的 label`, p.label);
    if (p.kind === 'select') {
      if (!Array.isArray(p.options) || !p.options.length) error(id, `select 参数 ${p.key} 缺 options`);
      else
        p.options.forEach((opt) => {
          if (!('value' in opt)) error(id, `select 参数 ${p.key} 的 option 缺 value`);
          requireBilingual(id, `select ${p.key} 的 option label`, opt.label);
        });
      if (!p.options.some((opt) => String(opt.value) === String(p.init))) error(id, `select ${p.key} 的 init 不在 options 里`);
    } else {
      if (!Number.isFinite(p.min) || !Number.isFinite(p.max)) error(id, `参数 ${p.key} 的 min/max 不是数字`);
      else if (p.min >= p.max) error(id, `参数 ${p.key} 的 min >= max`);
      if (!Number.isFinite(p.init)) error(id, `参数 ${p.key} 的 init 不是数字`);
      else if (p.init < p.min - 1e-9 || p.init > p.max + 1e-9) error(id, `参数 ${p.key} 的 init 不在 [min,max]`);
      if (!Number.isFinite(p.step) || p.step <= 0) error(id, `参数 ${p.key} 的 step 非法`);
    }
  });

  const params = initialParams(model);
  if (typeof model.box !== 'function') {
    warn(id, '没有 box(p)，主图会用默认范围');
  } else {
    const box = model.box(params);
    if (!box || ![box.xMin, box.xMax, box.yMin, box.yMax].every(Number.isFinite) || box.xMin >= box.xMax || box.yMin >= box.yMax) {
      error(id, 'box(p) 必须返回 {xMin,xMax,yMin,yMax} 且递减/递增正确');
    }
  }

  let total = 0;
  try {
    total = model.duration(params);
  } catch (e) {
    error(id, `duration() 抛错：${e.message}`);
  }
  if (!Number.isFinite(total) || total <= 0) error(id, `duration() 应为正数，实际 ${total}`);

  if (typeof model.state !== 'function') {
    error(id, '缺 state()');
    return;
  }
  if (typeof model.draw !== 'function') {
    error(id, '缺 draw()');
    return;
  }

  const box = (typeof model.box === 'function' ? model.box(params) : null) || { xMin: -5, xMax: 5, yMin: -4, yMax: 4 };
  [0, 0.25, 0.5, 0.75, 1].forEach((fraction) => {
    const t = fraction * total;
    let st;
    try {
      st = model.state(t, params);
    } catch (e) {
      error(id, `state(${fraction}) 抛错：${e.message}`);
      return;
    }
    if (!st || !Array.isArray(st.rows)) {
      error(id, `state(${fraction}) 没有 rows 数组`);
      return;
    }
    if (st.rows.length < 3) error(id, `state(${fraction}) 只有 ${st.rows.length} 行读数（建议 ≥3）`);
    st.rows.forEach((row, i) => {
      if (!row || !row.label) error(id, `state(${fraction}) 第 ${i + 1} 行缺 label`);
      else requireBilingual(id, `state(${fraction}) 第 ${i + 1} 行 label`, row.label);
      if (!('value' in row) || row.value === undefined || row.value === null || String(row.value).trim() === '') {
        error(id, `state(${fraction}) 第 ${i + 1} 行缺 value`);
      }
    });
    if (st.summary) requireBilingual(id, `state(${fraction}) 的 summary`, st.summary);

    if (!model.noChart) {
      if (typeof model.drawChart === 'function') return;
      if (!Number.isFinite(st.chartValue)) error(id, `state(${fraction}).chartValue 不是有限数（或声明 noChart / 自己实现 drawChart）`);
    }

    // draw 不抛错
    const recorder = createRecorder(860, 560);
    const view = api.createPlaneView(860, 560, box.xMin, box.xMax, box.yMin, box.yMax, 34, Boolean(model.freeAspect));
    try {
      model.draw(recorder.ctx, st, view, palette, { grid: true, aux: true, threeD: false }, params);
      if (recorder.elements.length < 3) warn(id, `fraction=${fraction} 时画面元素过少（${recorder.elements.length}）`);
      const bounds = recorder.stats;
      if (bounds.points > 0) {
        const outside = bounds.maxX < 0 || bounds.minX > 860 || bounds.maxY < 0 || bounds.minY > 560;
        const huge = bounds.maxX - bounds.minX > 860 * 6 || bounds.maxY - bounds.minY > 560 * 6;
        if (outside) error(id, `draw() 的图形全部在画布外（bbox x ${Math.round(bounds.minX)}–${Math.round(bounds.maxX)}, y ${Math.round(bounds.minY)}–${Math.round(bounds.maxY)}）`);
        else if (huge) warn(id, `fraction=${fraction} 时坐标范围异常大（bbox ${Math.round(bounds.maxX - bounds.minX)}×${Math.round(bounds.maxY - bounds.minY)}）`);
      }
    } catch (e) {
      error(id, `draw() 在 fraction=${fraction} 抛错：${e.message}`);
    }
  });

  // ---- 讲解 ----
  const lesson = LESSONS[id];
  if (!lesson) error(id, '缺讲解 LESSONS[id]');
  else {
    requireBilingual(id, '讲解 lesson', lesson.lesson);
    if (!Array.isArray(lesson.steps) || lesson.steps.length < 3) error(id, '讲解要有 ≥3 条分步');
    else {
      let prev = -1;
      lesson.steps.forEach((step, i) => {
        if (typeof step.at !== 'number' || step.at < 0 || step.at > 1) error(id, `分步 ${i + 1} 的 at 应在 0–1`);
        if (step.at < prev - 1e-9) error(id, `分步 ${i + 1} 的 at 没有递增`);
        prev = step.at;
        requireBilingual(id, `分步 ${i + 1}`, step);
      });
    }
  }

  // ---- 随机出题 ----
  const gen = QUIZZES[id];
  if (typeof gen !== 'function') error(id, '缺随机出题 QUIZZES[id]');
  else {
    let ok = 0;
    for (let i = 0; i < 30; i += 1) {
      let quiz = null;
      try {
        quiz = gen(mulberry32(0x9e3779b9 ^ (i * 2654435761)));
      } catch (e) {
        error(id, `出题器抛错：${e.message}`);
        break;
      }
      if (!quiz) continue;
      ok += 1;
      if (!quiz.params || typeof quiz.params !== 'object') error(id, `随机题缺 params（第 ${i + 1} 次）`);
      else
        Object.keys(quiz.params).forEach((key) => {
          if (!Object.prototype.hasOwnProperty.call(params, key)) error(id, `随机题 params 有未知键 ${key}`);
        });
      requireBilingual(id, '随机题 question', quiz.question);
      requireBilingual(id, '随机题 solution', quiz.solution);
      if (typeof quiz.unit !== 'string') error(id, '随机题 unit 应为字符串');
      if (!Array.isArray(quiz.answers) && !Number.isFinite(quiz.answer)) error(id, '随机题答案不是有限数');
      if (Array.isArray(quiz.answers) && !quiz.answers.every(Number.isFinite)) error(id, '随机题 answers 含非数字');
      if (ok >= 3) break;
    }
    if (!ok) error(id, '随机出题 30 个种子都没出题');
  }

  // ---- 样例题 ----
  const exams = EXAM_BANK.filter((item) => item.modelId === id);
  if (!exams.length) warn(id, '没有样例题（真题模式会回落到随机题）');
  exams.forEach((item, i) => {
    if (!bilingual(item.stem)) error(id, `例题 ${i + 1} 的 stem 不是双语`);
    if (!bilingual(item.solution)) error(id, `例题 ${i + 1} 的 solution 不是双语`);
    if (typeof item.unit !== 'string') error(id, `例题 ${i + 1} 缺 unit`);
    if (!Array.isArray(item.answers) && !Number.isFinite(item.answer)) error(id, `例题 ${i + 1} 的 answer 不是数字`);
    if (!item.params || typeof item.params !== 'object') error(id, `例题 ${i + 1} 缺 params`);
  });
});

// ---- 3. 答案解析器 ----
const cases = [
  ['3/4', 0.75],
  ['0.75', 0.75],
  ['√3/2', Math.sqrt(3) / 2],
  ['2π/3', (2 * Math.PI) / 3],
  ['-1.5', -1.5],
  ['1,5', 1.5],
  ['2e-3', 0.002],
  ['π/6', Math.PI / 6],
  ['−3', -3],
];
cases.forEach(([input, expected]) => {
  const got = parseAnswer(input);
  if (!Number.isFinite(got) || Math.abs(got - expected) > 1e-6) {
    errors.push(`[parseAnswer] "${input}" 应得 ${expected}，实际 ${got}`);
  }
});

// ---- 输出 ----
const okModels = MODELS.length - new Set(errors.concat(warnings).map((line) => line.slice(1, line.indexOf(']')))).size;
console.log(`模型 ${MODELS.length} 个（高一 ${byGrade[1]} / 高二 ${byGrade[2]} / 高三 ${byGrade[3]}）· 讲解 ${Object.keys(LESSONS).length} · 出题器 ${Object.keys(QUIZZES).length} · 例题 ${EXAM_BANK.length}`);
if (warnings.length) {
  console.log(`\n提醒 ${warnings.length} 条：`);
  warnings.forEach((line) => console.log('  · ' + line));
}
if (errors.length) {
  console.log(`\n错误 ${errors.length} 条：`);
  errors.forEach((line) => console.log('  ✗ ' + line));
  process.exit(1);
}
console.log('\n✓ 契约检查通过');

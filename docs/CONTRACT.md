# dsh-math-lab 模型开发契约

这个插件是**纯客户端**的：所有图像都用解析式在浏览器里现算，不调模型、不联网。
一个模型 = 一个 JS 文件，`src/models/<id>.js`，里面同时放：

1. `defineModel({...})` —— 参数、坐标系范围、随时间变化的读数、Canvas 绘制
2. `defineLesson(id, {...})` —— 知识点 + 跟随动画的分步解说
3. `defineQuiz(id, (rng) => makeQuiz(...))` —— 随机出题（答案、解析）
4. `defineExams([...])` —— 高考风格样例题（真题模式用）

参考实现：`src/models/quadratic.js`（二次函数与判别式）。**先读它，再动手。**

---

## 0. 构建 / 自检 / 看图

```sh
node build.mjs                                  # 把 src/ 拼成 client.js
node tools/check.mjs --only <你的id列表>          # 契约检查（只查你负责的模型）
node tools/render.mjs <id> --t 0.5               # 渲染 PNG：tools/out/<id>.png
node tools/render.mjs <id> --t 0.2 --params '{"a":-1}'   # 换参数看别的形态
```

渲染出来一定要用 **read_image 打开看**，确认：坐标轴在、曲线在、点/标签不重叠、不越界、
不同参数下都合理。**没看过图不算完成。**

> `check.mjs` 不带 `--only` 时会要求 24 个模型都在，开发阶段请带 `--only`，
> 只看你负责的那几个；别人的错误不用管。

---

## 1. 文件骨架

```js
    // ---------------------------------------------------------------------------
    // 模型 n · 名字（高一/高二/高三）
    // ---------------------------------------------------------------------------

    defineModel({
      id: 'ellipse',
      grade: 2,
      name:    { zh: '椭圆', en: 'Ellipse' },
      formula: { zh: 'r₁ + r₂ = 2a', en: 'r₁ + r₂ = 2a' },
      hint:    { zh: '一句话点睛：……', en: 'One-line insight…' },
      chartLabel: { zh: '离心率 e', en: 'e' },     // 副图纵轴名；不写就用默认
      timeline:  { zh: '动画：动点沿椭圆走一圈', en: 'Animation: the point traces one lap' },
      params: [
        { key: 'a', label: { zh: '长半轴 a', en: 'Semi-major a' }, min: 2, max: 6, step: 0.1, init: 4, unit: '', digits: 1 },
        { key: 'kind', label: { zh: '类型', en: 'Type' }, kind: 'select', init: 'x', options: [
          { value: 'x', label: { zh: '焦点在 x 轴', en: 'Foci on x' } },
        ] },
      ],
      box(p) { return { xMin: -6, xMax: 6, yMin: -5, yMax: 5 }; },   // 可视范围（等比缩放）
      duration(p) { return 5; },                                     // 动画总时长（秒）
      state(t, p) { return { t, rows: [...], summary: {...}, chartValue: 0.5 }; },
      draw(ctx, st, view, pal, opts, p) { /* 只画自己的图形，轴由面板画 */ },
    });

    defineLesson('ellipse', {
      lesson: { zh: '……', en: '…' },
      steps: [
        { at: 0,    zh: '……', en: '…' },
        { at: 0.35, zh: '……', en: '…' },
        { at: 0.7,  zh: '……', en: '…' },
      ],
    });

    defineQuiz('ellipse', (rng) => {
      const a = rnum(rng, 3, 6, 0.5);
      const c = rnum(rng, 0.5, a - 0.5, 0.5);
      return makeQuiz(
        { a, b: Math.sqrt(a * a - c * c), c },
        { zh: '题干……', en: 'Stem…' },
        '',            // 单位
        1.234,         // 数值答案
        { zh: '代入过程……', en: 'Working…' },
        0.02,          // 相对容差（默认 0.02）
      );
    });

    defineExams([
      {
        id: 'ex-ellipse-1',
        modelId: 'ellipse',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '离心率', en: 'Eccentricity' },
        params: { a: 5, c: 3 },
        stem: { zh: '……', en: '…' },
        unit: '',
        answer: 0.6,
        tol: 0.01,
        solution: { zh: '……', en: '…' },
      },
    ]);
```

**文件是拼接进同一个 factory 作用域的脚本片段**：不要写 `import` / `export`，
不要用 `document` / `window`（渲染层不保证有），不要改别人的文件。

---

## 2. 模型对象字段

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✔ | 全局唯一，小驼峰，和文件名一致 |
| `grade` | ✔ | 1 高一 / 2 高二 / 3 高三 |
| `name` `formula` `hint` | ✔ | `{zh,en}` 双语，公式用 Unicode（²、√、π、≤、∈） |
| `params` | ✔ | 见下方参数规范；数量 2–4 个最佳 |
| `box(p)` | ✔ | `{xMin,xMax,yMin,yMax}`，**等比缩放**，宽高比接近 3:2 最稳 |
| `duration(p)` | ✔ | 动画时长（秒，>0）。静态模型也返回一个 ≥1 的数，state 忽略 t 即可 |
| `state(t,p)` | ✔ | 纯函数、便宜：返回 `{t, rows, summary, chartValue}` |
| `draw(ctx,st,view,pal,opts,p)` | ✔ | 画图。**不要画坐标轴/网格**（面板统一画），除非 `noAxes: true` |
| `chartLabel` | ○ | 副图纵轴名 `{zh,en}`；缺省 '' |
| `timeline` | ○ | 控制条右侧的一行说明 `{zh,en}` |
| `noChart` | ○ | true 时不画副图（绝大部分模型不该用） |
| `noAxes` | ○ | true 时面板不画坐标系（立体几何、概率柱状图这类自己排版的） |
| `sanitizeParams(p)` | ○ | 参数之间有依赖时（椭圆 c ≤ a、双曲线 c > a），返回要修正的字段；面板会把滑块值夹回去 |
| `freeAspect` | ○ | true 时 x/y 独立缩放。**函数值域和自变量范围差很多时用**（如 eˣ 在 [0,3] 上、概率密度 0.2、二项分布概率 0.1）。圆/椭圆/抛物线等要求图形等比，**不能**开 |
| `axisLabels` | ○ | `{xLabel,yLabel}` 传给 drawAxes |
| `has3D` | ○ | true 时控制条出现「3D 视角」开关，拖动旋转相机 |
| `playback` | ○ | 动画压缩到多少秒的观看时长（默认 6） |
| `loop` | ○ | true 时动画循环 |

### 参数规范

```js
{ key: 'theta', label: {zh,en}, min, max, step, init, unit: '°', digits: 0 }
{ key: 'kind',  label: {zh,en}, kind: 'select', init: 'up', options: [{value, label:{zh,en}}] }
```

- `key` 必须和 `state`/`draw` 里读的字段一致；`init` 要在 `[min,max]` 内。
- `digits` 控制滑块右侧读数的小数位。
- 需要“类型”切换（焦点在 x/y 轴、弹性/非弹性等）用 `kind:'select'`。

### state 返回

```js
{
  t: 当前时间,
  rows: [                       // 实时读数表格，3–7 行
    { label: {zh:'离心率 e', en:'Eccentricity'}, value: '0.60' },
  ],
  summary: { zh:'一句话结论', en:'one-line takeaway' },   // 可选
  chartValue: 0.6,              // 副图纵值（没有 drawChart 时必填，有限数）
}
```

- `state` 每帧都会调，**不要在里面做 10000 次采样**；需要绘图数据就放 `draw` 里现算。
- 副图横轴是动画时间；纵轴就是 `chartValue`。挑一个**随动画真正变化**的量。

---

## 3. 绘图 API（都在作用域里，直接用）

坐标工具：
```js
view.toX(x), view.toY(y), view.worldX(px), view.worldY(py), view.px(len)
view.x0/x1/y0/y1        // 当前可见世界范围
```

基础：
```js
plotFunction(ctx, view, pal, (x)=>y, { color, width, dash, lo, hi, samples })  // 自动断开渐近线
segmentWorld(ctx, view, x1,y1,x2,y2, color, width, dash)
polylineWorld(ctx, view, [[x,y],...], color, width, dash)
lineThroughWorld(ctx, view, x0,y0, dx,dy, color, width, dash)   // 无限直线，自动裁切
dotWorld(ctx, view, x, y, color, r)
circleWorld(ctx, view, cx, cy, r, strokeColor, width, fillColor)
arcWorld(ctx, view, cx, cy, r, a0, a1, color, width, dash)       // 弧度，世界方向逆时针
regionWorld(ctx, view, [[x,y],...], fillColor)                  // 多边形填充
arrowWorld / vectorWorld(ctx, view, ox,oy, vx,vy, color, label, width)
labelWorld(ctx, view, '文字', x, y, color, align, size)          // 世界坐标锚点
tag(ctx, '文字', px, py, color, align, size)                    // 屏幕坐标
rightAngle(ctx, view, x, y, dir1, dir2, color, size)            // 直角小方块
drawBars(ctx, view, pal, [{x,w,y,color,label,value}], {base,alpha})
drawGrid / drawAxes                                              // 面板会调，模型一般不用
```

数值：
```js
fnum(v, 2)     // 读数：去尾零
fx(v, 1)       // 定点小数
piText(rad)    // 0.7854 → 'π/4'
degText(rad)   // '45°'
numericDiff(f, x), integrate(f,a,b,n), bisect(f,a,b), factorial(n), binom(n,k), gcd, fracText
rnum(rng,min,max,step), rpick(rng,list), makeQuiz(...)
```

3D（立体几何）：
```js
const cam = makeCamera3D(view.width, view.height, span, [cx,cy,cz], pitch);
cam.project(x,y,z) → {x,y,z}
line3D(ctx, cam, [[x,y,z],...], color, width, dash)
arrow3D(ctx, cam, [x,y,z], [x,y,z], color, width)
tag3D(ctx, cam, '文字', [x,y,z], color, align, size)
grid3D(ctx, cam, y, x0,x1, z0,z1, pal, step)
```

颜色用 `pal`：`curve`（主曲线蓝）、`curve2`（紫）、`curve3`（青绿）、`point`（橙）、
`tangent`（红）、`area`（半透明蓝）、`area2`（半透明橙）、`shade`（半透明紫）、
`text`/`muted`/`grid`/`axis`/`chip`。不要写死颜色。

**文字标签规则**：`tag` 会自动用 `pal.chip` 垫底（面板已设置），避免线条穿过文字。
标签要么贴边、要么放在曲线外侧，别压住数据点。

---

## 4. 双语规则（会被 check.mjs 检查）

- `name/formula/hint/params[].label/rows[].label/summary/lesson/steps[].{zh,en}/
  quiz.question/solution/exam.stem/solution` 必须 `{zh,en}` 且都非空。
- 英文不要机翻腔：短句、术语准确（discriminant、eccentricity、tangent、symmetric…）。
- 画布上的文字用 `L({zh:'顶点', en:'vertex'})`，会跟界面语言切换。

---

## 5. 质量红线

1. **看渲染图**：至少看 `--t 0.2/0.5/0.8` 三张，确认无重叠、无越界、无空白。
2. **参数极端值**：每个参数拉到 min 和 max 各渲染一次，确认 `state`/`draw` 不抛错、
   坐标范围不爆炸（除零、log 负数、开根号负数都要防）。
3. **物理/数学正确性**：公式、读数、答案、解析互相对得上；能用解析解就别数值近似。
4. **state 便宜**：≤ 200 次简单运算；图线采样放 draw。
5. **答案好输入**：答案用数值（解析器支持 `3/4`、`√3/2`、`2π/3`），避免“请写表达式”。
6. 只改自己负责的 `src/models/<id>.js`；要加公共工具先找 Lead。

---

## 6. 交付物

- `src/models/<id>.js`（每个模型一个文件，含 lesson/quiz/exams）
- 一次 `node tools/check.mjs --only ...` 全绿
- 渲染图自检通过（在回复里写：看了哪几张、有没有发现并修掉的问题）
- 回报：每个模型一句“参数 → 动画 → 读数”的说明，以及任何需要 Lead 处理的公共改动。

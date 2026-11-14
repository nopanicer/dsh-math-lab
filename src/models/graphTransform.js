    // ---------------------------------------------------------------------------
    // 模型 · 函数图像变换 y = a·f(b(x − h)) + k（高一）
    // ---------------------------------------------------------------------------

    const graphTransformDefs = {
      square: { expr: 'x²', f: (x) => x * x, hasAnchor: true, anchorName: { zh: '顶点', en: 'vertex' } },
      abs: { expr: '|x|', f: (x) => Math.abs(x), hasAnchor: true, anchorName: { zh: '顶点', en: 'vertex' } },
      sqrt: { expr: '√x', f: (x) => (x >= 0 ? Math.sqrt(x) : NaN), hasAnchor: true, anchorName: { zh: '起点', en: 'endpoint' } },
      recip: { expr: '1/x', f: (x) => (Math.abs(x) < 1e-9 ? NaN : 1 / x), hasAnchor: false, anchorName: { zh: '渐近线', en: 'asymptotes' } },
      cube: { expr: 'x³', f: (x) => x * x * x, hasAnchor: true, anchorName: { zh: '对称中心', en: 'centre' } },
    };

    const graphTransformStageName = [
      { zh: '① 纵向伸缩 a', en: '① vertical stretch a' },
      { zh: '② 横向伸缩 b', en: '② horizontal stretch b' },
      { zh: '③ 左右平移 h', en: '③ horizontal shift h' },
      { zh: '④ 上下平移 k', en: '④ vertical shift k' },
    ];

    function graphTransformDuration() {
      return 8;
    }

    /** 四段进度：0–4 等分，每段只动一个参数（先后顺序与解析式的嵌套顺序一致） */
    function graphTransformStage(u) {
      const s = clamp(u, 0, 1) * 4;
      const stage = Math.min(3, Math.floor(s));
      const v = clamp(s - stage, 0, 1);
      return { stage, v, e: v * v * (3 - 2 * v) };
    }

    /** 当前中间形态的参数：y = a_t·f(b_t(x − h_t)) + k_t */
    function graphTransformCur(p, u) {
      const { stage, e } = graphTransformStage(u);
      return {
        a: stage > 0 ? p.a : lerp(1, p.a, e),
        b: stage > 1 ? p.b : stage === 1 ? lerp(1, p.b, e) : 1,
        h: stage > 2 ? p.h : stage === 2 ? lerp(0, p.h, e) : 0,
        k: stage === 3 ? lerp(0, p.k, e) : 0,
      };
    }

    function graphTransformFn(base) {
      return graphTransformDefs[base] || graphTransformDefs.square;
    }

    /** y = a·f(b(x − h)) + k 在 x 处的值；超出定义域返回 NaN */
    function graphTransformValue(base, q, x) {
      const def = graphTransformFn(base);
      const inner = q.b * (x - q.h);
      const v = def.f(inner);
      return v * q.a + q.k;
    }

    /** b(x − h) 展开成课本里的写法：x、x − 2、1.5x + 0.9 */
    function graphTransformInner(q) {
      const bTxt = Math.abs(q.b - 1) < 1e-9 ? '' : fnum(q.b, 2);
      if (Math.abs(q.h) < 5e-3) return bTxt ? `${bTxt}x` : 'x';
      const bh = q.b * q.h;
      if (!bTxt) return q.h > 0 ? `x − ${fnum(q.h, 2)}` : `x + ${fnum(-q.h, 2)}`;
      return `${bTxt}x ${bh > 0 ? '−' : '+'} ${fnum(Math.abs(bh), 2)}`;
    }

    /** 当前解析式文本 */
    function graphTransformExpr(base, q) {
      const inner = graphTransformInner(q);
      const bare = inner === 'x'; // 只有一个 x 时不用加括号
      const aTxt = Math.abs(q.a - 1) < 1e-9 ? '' : fnum(q.a, 2);
      let body;
      let lead = aTxt;
      if (base === 'abs') body = `|${inner}|`;
      else if (base === 'sqrt') body = bare ? '√x' : `√(${inner})`;
      else if (base === 'recip') {
        // 分子直接吃掉 a，避免出现 “1.51/(x−1)” 这种会被读错的东西
        body = `${aTxt || '1'}/${bare ? 'x' : `(${inner})`}`;
        lead = '';
      } else if (base === 'cube') body = bare ? 'x³' : `(${inner})³`;
      else body = bare ? 'x²' : `(${inner})²`;
      const kTxt = Math.abs(q.k) < 5e-3 ? '' : `${q.k > 0 ? ' + ' : ' − '}${fnum(Math.abs(q.k), 2)}`;
      return `y = ${lead}${body}${kTxt}`;
    }

    let graphTransformSeriesCache = null;

    /** 副图：关键点 K(1,1) 的像的纵坐标 a_t + k_t 随动画变化（只有 a、k 两段会动它） */
    function graphTransformChartSeries(p) {
      const key = `${p.base}|${p.a}|${p.b}|${p.h}|${p.k}`;
      if (graphTransformSeriesCache && graphTransformSeriesCache.key === key) return graphTransformSeriesCache.series;
      const total = graphTransformDuration();
      const pts = [];
      for (let i = 0; i <= 96; i += 1) {
        const q = graphTransformCur(p, i / 96);
        pts.push({ t: (total * i) / 96, v: q.a * 1 + q.k });
      }
      const series = { total, pts };
      graphTransformSeriesCache = { key, series };
      return series;
    }

    defineModel({
      id: 'graphTransform',
      grade: 1,
      name: { zh: '函数图像变换', en: 'Function transformations' },
      formula: { zh: 'y = a·f(b(x − h)) + k　（先伸缩后平移）', en: 'y = a·f(b(x − h)) + k (stretch, then shift)' },
      hint: {
        zh: '四个旋钮各管一件事：a 纵向拉压，b 横向拉压（注意是 1/b 倍），h 左右平移，k 上下平移。最容易错的是横向：y = f(bx) 向右平移 h 得到的是 f(b(x − h))，括号里是 h 而不是 h/b。',
        en: 'Four knobs: a stretches vertically, b compresses horizontally (by 1/b), h shifts sideways, k shifts up or down. The classic trap is horizontal: shifting y = f(bx) right by h gives f(b(x − h)) — the inside is h, not h/b.',
      },
      timeline: { zh: '动画：a → b → h → k 依次变形，从 f(x) 连续走到目标图像', en: 'Animation: a → b → h → k, morphing f(x) into the target step by step' },
      params: [
        {
          key: 'base',
          label: { zh: '原函数 f(x)', en: 'Base function f(x)' },
          kind: 'select',
          init: 'square',
          options: [
            { value: 'square', label: { zh: 'y = x²', en: 'y = x²' } },
            { value: 'abs', label: { zh: 'y = |x|', en: 'y = |x|' } },
            { value: 'sqrt', label: { zh: 'y = √x', en: 'y = √x' } },
            { value: 'recip', label: { zh: 'y = 1/x', en: 'y = 1/x' } },
            { value: 'cube', label: { zh: 'y = x³', en: 'y = x³' } },
          ],
        },
        { key: 'a', label: { zh: '纵向伸缩 a', en: 'Vertical stretch a' }, min: 0.5, max: 2, step: 0.1, init: 1.5, unit: '', digits: 1 },
        { key: 'b', label: { zh: '横向伸缩 b', en: 'Horizontal stretch b' }, min: 0.5, max: 2, step: 0.1, init: 1.5, unit: '', digits: 1 },
        { key: 'h', label: { zh: '左右平移 h', en: 'Shift h' }, min: -4, max: 4, step: 0.5, init: 2, unit: '', digits: 1 },
        { key: 'k', label: { zh: '上下平移 k', en: 'Shift k' }, min: -4, max: 4, step: 0.5, init: 1.5, unit: '', digits: 1 },
      ],
      box(p) {
        // 画面要同时容下：原点（原函数）、顶点/起点的像、关键点 (1,1) 的像
        const xs = [0, p.h, 1 / p.b + p.h];
        const ys = [0, p.k, p.a + p.k];
        return {
          xMin: Math.min.apply(null, xs) - 3.1,
          xMax: Math.max.apply(null, xs) + 3.1,
          yMin: Math.min.apply(null, ys) - 2.5,
          yMax: Math.max.apply(null, ys) + 2.5,
        };
      },
      duration() {
        return graphTransformDuration();
      },
      state(t, p) {
        const total = graphTransformDuration();
        const u = clamp(t / total, 0, 1);
        const q = graphTransformCur(p, u);
        const stage = graphTransformStage(u).stage;
        const def = graphTransformFn(p.base);
        const kx = 1 / q.b + q.h; // 关键点 (1,1) 的像
        const ky = q.a + q.k;
        const anchorValue = p.base === 'recip' ? `x = ${fnum(q.h, 2)}，y = ${fnum(q.k, 2)}` : `(${fnum(q.h, 2)}, ${fnum(q.k, 2)})`;

        return {
          t: Math.min(Math.max(t, 0), total),
          q,
          stage,
          rows: [
            { label: { zh: '当前阶段', en: 'Stage' }, value: L(graphTransformStageName[stage]) },
            { label: { zh: '原函数 f(x)', en: 'Base f(x)' }, value: `y = ${def.expr}` },
            { label: { zh: '当前解析式', en: 'Current rule' }, value: graphTransformExpr(p.base, q) },
            { label: { zh: '目标解析式', en: 'Target rule' }, value: graphTransformExpr(p.base, p) },
            { label: { zh: '关键点 K(1,1) 的像', en: 'Image of K(1,1)' }, value: `(${fnum(kx, 2)}, ${fnum(ky, 2)})` },
            { label: def.hasAnchor ? def.anchorName : { zh: '特征（渐近线）', en: 'Feature (asymptotes)' }, value: anchorValue },
          ],
          summary: {
            zh: `纵向伸缩 a = ${fnum(p.a, 2)}，横向伸缩 b = ${fnum(p.b, 2)}（横坐标变成 1/b），左右平移 h = ${fnum(p.h, 1)}，上下平移 k = ${fnum(p.k, 1)}；顺序 a → b → h → k。`,
            en: `Vertical stretch a = ${fnum(p.a, 2)}, horizontal stretch b = ${fnum(p.b, 2)} (x scales by 1/b), shift h = ${fnum(p.h, 1)}, vertical shift k = ${fnum(p.k, 1)}, in that order.`,
          },
          chartValue: isFinite(ky) ? ky : 0,
        };
      },
      drawChart(ctx, width, height, st, p, pal) {
        drawChart(ctx, width, height, graphTransformChartSeries(p), pal, st.t, L({ zh: 'K′ 的纵坐标', en: 'y of K′' }));
      },
      draw(ctx, st, view, pal, opts, p) {
        const def = graphTransformFn(p.base);
        const q = st.q;
        const spanX = view.x1 - view.x0;
        const spanY = view.y1 - view.y0;
        const pxW = 1 / view.scale;

        // 原函数（虚线参考）+ 当前中间形态（实线）
        if (p.base === 'recip') {
          segmentWorld(ctx, view, q.h, view.y0, q.h, view.y1, pal.grid, 1.2, [4, 6]);
          segmentWorld(ctx, view, view.x0, q.k, view.x1, q.k, pal.grid, 1.2, [4, 6]);
        }
        plotFunction(ctx, view, pal, (x) => def.f(x), { color: pal.muted, width: 1.8, dash: [6, 6] });
        plotFunction(ctx, view, pal, (x) => graphTransformValue(p.base, q, x), { color: pal.curve, width: 2.6 });

        // 关键点 K(1,1) 与它的像
        dotWorld(ctx, view, 1, 1, pal.muted, 3.2);
        labelWorld(ctx, view, 'K(1,1)', 1 - 8 * pxW, 1 - 14 * pxW, pal.muted, 'right', 10);
        const kx = 1 / q.b + q.h;
        const ky = q.a + q.k;
        if (opts.aux) segmentWorld(ctx, view, 1, 1, kx, ky, pal.muted, 1, [3, 4]);
        dotWorld(ctx, view, kx, ky, pal.point, 4.4);
        labelWorld(ctx, view, 'K′', kx + 9 * pxW, ky + 15 * pxW, pal.point, 'left', 10);

        // 顶点 / 起点 / 对称中心（1/x 画渐近线，已在上面画过）
        if (def.hasAnchor) {
          dotWorld(ctx, view, q.h, q.k, pal.curve3, 3.6);
          labelWorld(
            ctx,
            view,
            L(def.anchorName),
            q.h + 9 * pxW,
            q.k - 14 * pxW,
            pal.curve3,
            'left',
            10,
          );
        } else {
          labelWorld(ctx, view, `x = ${fnum(q.h, 2)}`, q.h + 6 * pxW, view.y1 - 0.09 * spanY, pal.muted, 'left', 10);
          labelWorld(ctx, view, `y = ${fnum(q.k, 2)}`, view.x0 + 0.02 * spanX, q.k + 13 * pxW, pal.muted, 'left', 10);
        }

        // 左下角：当前阶段
        setChip(pal.chip);
        labelWorld(
          ctx,
          view,
          L(graphTransformStageName[st.stage]),
          view.x0 + 0.015 * spanX,
          view.y0 + 0.055 * spanY,
          pal.curve2,
          'left',
          11,
        );
        // 左上角：当前解析式
        labelWorld(ctx, view, graphTransformExpr(p.base, q), view.x0 + 0.015 * spanX, view.y1 - 0.05 * spanY, pal.text, 'left', 11);
        setChip(null);
      },
    });

    defineLesson('graphTransform', {
      lesson: {
        zh: 'y = a·f(b(x − h)) + k 是把 f(x) 连续变形的说明书：先纵向拉压（a）、再横向拉压（b）、再左右平移（h）、最后上下平移（k）。记住两条“反直觉”：b > 1 图像反而变窄，因为横坐标被压成 1/b；y = f(bx) 向右平移 h 之后解析式是 f(b(x − h))，括号里填 h 而不是 h/b。',
        en: 'y = a·f(b(x − h)) + k is a recipe: stretch vertically (a), then horizontally (b), then shift sideways (h), then shift up or down (k). Two counter-intuitive facts: b > 1 makes the graph narrower (x is scaled by 1/b), and shifting y = f(bx) right by h gives f(b(x − h)) — h goes inside, not h/b.',
      },
      steps: [
        { at: 0, zh: '第一步只动 a：每个函数值乘 a，图像被纵向拉长（a > 1）或压扁（a < 1），零点不动。', en: 'Only a moves: every value is multiplied by a, so the graph is stretched vertically (a > 1) or squashed (a < 1); zeros stay put.' },
        { at: 0.25, zh: '第二步只动 b：y = a·f(bx)。b > 1 时横坐标被压成原来的 1/b，图像反而变窄——这是最容易被说反的一步。', en: 'Only b moves: y = a·f(bx). With b > 1 the x-coordinates shrink to 1/b, so the graph gets narrower.' },
        { at: 0.5, zh: '第三步只动 h：y = a·f(b(x − h))。注意是 f(b(x − h)) 而不是 f(bx − h)，所以平移量就是 h，不用再除 b。', en: 'Only h moves: y = a·f(b(x − h)), not f(bx − h), so the shift is exactly h — no division by b.' },
        { at: 0.75, zh: '最后只动 k：整条曲线上下搬 k 个单位，形状一个像素都不变。关键点 K(1,1) 的像落在 (1/b + h, a + k)。', en: 'Finally k: the whole curve moves up or down by k without changing shape. The image of K(1,1) is (1/b + h, a + k).' },
      ],
    });

    defineQuiz('graphTransform', (rng) => {
      const base = rpick(rng, ['square', 'abs', 'sqrt', 'cube']);
      const a = rnum(rng, 0.5, 2, 0.5);
      const b = rnum(rng, 0.5, 2, 0.5);
      const h = rnum(rng, -3, 2, 1);
      const k = rnum(rng, -3, 3, 1);
      const q = { a, b, h, k };
      const params = { base, a, b, h, k };
      const expr = graphTransformExpr(base, q);
      const kind = Math.floor(rng() * 3);

      if (kind === 0) {
        // 一定要落在定义域里：√ 要求 b(x − h) ≥ 0
        const x0 = base === 'sqrt' ? h + rpick(rng, [1, 2, 3, 4]) : rpick(rng, [-2, -1, 0, 1, 2, 3]);
        const y0 = graphTransformValue(base, q, x0);
        return makeQuiz(
          params,
          { zh: `已知函数 ${expr}，求 f(${fnum(x0, 2)}) 的值。`, en: `For ${expr}, evaluate f(${fnum(x0, 2)}).` },
          '',
          y0,
          {
            zh: `先算括号里 b(x − h) = ${fnum(b, 2)} × (${fnum(x0, 2)} − ${fnum(h, 2)}) = ${fnum(b * (x0 - h), 3)}，再代入 f，最后乘 a 加 k，得 ${fnum(y0, 3)}。`,
            en: `Compute b(x − h) = ${fnum(b * (x0 - h), 3)}, apply f, then scale by a and add k: ${fnum(y0, 3)}.`,
          },
          0.01,
        );
      }
      if (kind === 1) {
        return makeQuiz(
          params,
          {
            zh: `函数 ${expr} 的图像可以由 y = ${graphTransformFn(base).expr} 经过若干次变换得到。求图像的${base === 'sqrt' ? '左端点' : base === 'cube' ? '对称中心' : '顶点'}的横坐标。`,
            en: `The graph of ${expr} comes from y = ${graphTransformFn(base).expr} by transformations. Find the x-coordinate of its ${base === 'sqrt' ? 'endpoint' : base === 'cube' ? 'centre' : 'vertex'}.`,
          },
          '',
          h,
          {
            zh: `括号里 b(x − h) = 0 时取到“出发点”，解得 x = h = ${fnum(h, 2)}；横向伸缩 b 不改变这个平移量。`,
            en: `Set b(x − h) = 0 to get x = h = ${fnum(h, 2)}; the horizontal stretch does not change the shift.`,
          },
          0.01,
        );
      }
      const yIntercept = graphTransformValue(base, q, 0);
      if (!Number.isFinite(yIntercept)) {
        // √ 的定义域要求 x ≥ h，h > 0 时图像根本碰不到 y 轴：改问定义域左端点
        return makeQuiz(
          params,
          { zh: `求函数 ${expr} 的定义域的左端点。`, en: `Find the left endpoint of the domain of ${expr}.` },
          '',
          h,
          { zh: `被开方数 b(x − h) ≥ 0，b > 0，所以 x ≥ h = ${fnum(h, 2)}。`, en: `Need b(x − h) ≥ 0 with b > 0, so x ≥ h = ${fnum(h, 2)}.` },
          0.01,
        );
      }
      return makeQuiz(
        params,
        { zh: `求函数 ${expr} 的图像与 y 轴交点的纵坐标。`, en: `Find the y-intercept of ${expr}.` },
        '',
        yIntercept,
        {
          zh: `令 x = 0：b(0 − h) = ${fnum(-b * h, 2)}，代入得 y = a·f(b(0 − h)) + k = ${fnum(yIntercept, 3)}。`,
          en: `Put x = 0: b(0 − h) = ${fnum(-b * h, 2)}, so y = a·f(b(0 − h)) + k = ${fnum(yIntercept, 3)}.`,
        },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-graphTransform-1',
        modelId: 'graphTransform',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '图像平移', en: 'Shifting graphs' },
        params: { base: 'square', a: 1, b: 1, h: 2, k: 3 },
        stem: {
          zh: '把 y = x² 的图像向右平移 2 个单位、再向上平移 3 个单位，得到 y = (x − 2)² + 3。求这个图像的顶点纵坐标。',
          en: 'Shift y = x² right by 2 and up by 3 to get y = (x − 2)² + 3. Find the y-coordinate of its vertex.',
        },
        unit: '',
        answer: 3,
        tol: 0.01,
        solution: {
          zh: '顶点由 (0, 0) 平移到 (2, 3)，所以纵坐标是 3（也就是解析式末尾的常数 k）。',
          en: 'The vertex moves from (0, 0) to (2, 3), so the y-coordinate is 3 — the constant k.',
        },
      },
      {
        id: 'ex-graphTransform-2',
        modelId: 'graphTransform',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '函数值', en: 'Function value' },
        params: { base: 'square', a: 2, b: 1, h: -1, k: -3 },
        stem: { zh: '已知 f(x) = 2(x + 1)² − 3，求 f(0) 的值。', en: 'Given f(x) = 2(x + 1)² − 3, find f(0).' },
        unit: '',
        answer: -1,
        tol: 0.01,
        solution: {
          zh: 'f(0) = 2 × (0 + 1)² − 3 = 2 − 3 = −1。它也是图像与 y 轴交点的纵坐标。',
          en: 'f(0) = 2 × 1² − 3 = −1, the y-intercept.',
        },
      },
      {
        id: 'ex-graphTransform-3',
        modelId: 'graphTransform',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '定义域', en: 'Domain' },
        params: { base: 'sqrt', a: 1, b: 2, h: 1, k: 0 },
        stem: {
          zh: '函数 f(x) = √(2x − 2) 的定义域是 [m, +∞)，求 m。',
          en: 'The domain of f(x) = √(2x − 2) is [m, +∞). Find m.',
        },
        unit: '',
        answer: 1,
        tol: 0.01,
        solution: {
          zh: '被开方数 2x − 2 ≥ 0，得 x ≥ 1，所以 m = 1。写成 a·f(b(x − h)) 就是 √(2(x − 1))：h = 1 正是定义域的左端点。',
          en: 'Need 2x − 2 ≥ 0, so x ≥ 1 and m = 1. In the form √(2(x − 1)), h = 1 is the left endpoint.',
        },
      },
    ]);

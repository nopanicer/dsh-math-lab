    // ---------------------------------------------------------------------------
    // 模型 1 · 二次函数与判别式（高一）
    // ---------------------------------------------------------------------------

    /** y = ax² + bx + c 读起来像课本那样：省略 1、0、负号 */
    function quadExpr(a, b, c) {
      const parts = [];
      const coef = (v) => (Math.abs(Math.abs(v) - 1) < 1e-9 ? '' : fnum(Math.abs(v), 1));
      if (Math.abs(a) > 1e-9) parts.push(`${vSign(parts.length, a)}${coef(a)}x²`);
      if (Math.abs(b) > 1e-9) parts.push(`${vSign(parts.length, b)}${coef(b)}x`);
      if (Math.abs(c) > 1e-9 || !parts.length) parts.push(`${vSign(parts.length, c)}${fnum(Math.abs(c), 1)}`);
      return 'y = ' + parts.join(' ').trim();
    }
    function vSign(index, value) {
      const neg = value < 0;
      if (index === 0) return neg ? '−' : '';
      return neg ? '− ' : '+ ';
    }

    defineModel({
      id: 'quadratic',
      grade: 1,
      name: { zh: '二次函数与判别式', en: 'Quadratic graph' },
      formula: { zh: 'y = ax² + bx + c　Δ = b² − 4ac　顶点 (−b/2a, (4ac − b²)/4a)', en: 'y = ax²+bx+c, Δ = b²−4ac, vertex (−b/2a, (4ac−b²)/4a)' },
      hint: {
        zh: 'a 决定开口方向与宽窄：|a| 越大开口越窄；Δ 决定与 x 轴的交点个数，Δ > 0 两个、Δ = 0 一个、Δ < 0 没有。对称轴 x = −b/2a 把图像分成左右两支，顶点处取到最值。',
        en: 'a sets the opening direction and width; Δ decides the number of x-intercepts; the axis x = −b/2a splits the curve, and the vertex is the extremum.',
      },
      chartLabel: { zh: 'f(x)', en: 'f(x)' },
      timeline: { zh: '动画：扫描点沿图像从左往右移动', en: 'Animation: a probe slides along the curve' },
      params: [
        { key: 'a', label: { zh: '二次项系数 a', en: 'Coefficient a' }, min: -2, max: 2, step: 0.1, init: 1, unit: '', digits: 1 },
        { key: 'b', label: { zh: '一次项系数 b', en: 'Coefficient b' }, min: -6, max: 6, step: 0.5, init: 0, unit: '', digits: 1 },
        { key: 'c', label: { zh: '常数项 c', en: 'Constant c' }, min: -6, max: 6, step: 0.5, init: -3, unit: '', digits: 1 },
      ],
      derive(p) {
        const eps = 1e-9;
        const linear = Math.abs(p.a) < 1e-6;
        const delta = p.b * p.b - 4 * p.a * p.c;
        const xv = linear ? 0 : -p.b / (2 * p.a);
        const yv = linear ? 0 : p.a * xv * xv + p.b * xv + p.c;
        const discriminant = linear ? NaN : delta;
        let roots = [];
        if (!linear && delta >= -eps) {
          const sq = Math.sqrt(Math.max(0, delta));
          roots = [(-p.b - sq) / (2 * p.a), (-p.b + sq) / (2 * p.a)].sort((m, n) => m - n);
          if (roots.length === 2 && Math.abs(roots[0] - roots[1]) < 1e-7) roots = [roots[0]];
        }
        return { linear, delta: discriminant, xv, yv, roots, up: p.a > 0 };
      },
      box(p) {
        const d = this.derive(p);
        let reach = 3.4;
        if (!d.linear) reach = Math.max(reach, Math.abs(d.xv) + 2.2);
        d.roots.forEach((r) => {
          reach = Math.max(reach, Math.abs(r) + 1.1);
        });
        const reachY = 2.4;
        const top = Math.max(0, d.linear ? p.c : d.yv, p.c) + reachY;
        const bottom = Math.min(0, d.linear ? p.c : d.yv, p.c) - reachY;
        return { xMin: -reach, xMax: reach, yMin: bottom, yMax: top };
      },
      duration() {
        return 4.2;
      },
      state(t, p) {
        const d = this.derive(p);
        const total = this.duration(p);
        const box = this.box(p);
        const tt = Math.min(Math.max(t, 0), total);
        const xLeft = box.xMin + (box.xMax - box.xMin) * 0.08;
        const xRight = box.xMin + (box.xMax - box.xMin) * 0.92;
        const x = xLeft + (xRight - xLeft) * (tt / total);
        const y = p.a * x * x + p.b * x + p.c;

        const rootsText = d.linear
          ? '—'
          : d.roots.length === 2
            ? `x₁ = ${fnum(d.roots[0], 2)}，x₂ = ${fnum(d.roots[1], 2)}`
            : d.roots.length === 1
              ? `x = ${fnum(d.roots[0], 2)}`
              : L({ zh: '没有实数根', en: 'no real root' });

        let summary;
        if (d.linear) {
          summary = { zh: 'a = 0 时退化成一次函数 y = bx + c，图像是一条直线。', en: 'With a = 0 this degenerates into the line y = bx + c.' };
        } else if (d.delta > 1e-9) {
          summary = {
            zh: `开口${d.up ? '向上' : '向下'}，Δ = ${fnum(d.delta, 2)} > 0：图像与 x 轴有两个交点。`,
            en: `${d.up ? 'Opens up' : 'Opens down'}, Δ = ${fnum(d.delta, 2)} > 0: two x-intercepts.`,
          };
        } else if (d.delta > -1e-9) {
          summary = {
            zh: `Δ = 0：图像与 x 轴相切于顶点，方程有一个二重根 x = ${fnum(d.xv, 2)}。`,
            en: `Δ = 0: the curve touches the x-axis at the vertex — one double root x = ${fnum(d.xv, 2)}.`,
          };
        } else {
          summary = {
            zh: `Δ = ${fnum(d.delta, 2)} < 0：图像与 x 轴没有交点，方程无实数根。`,
            en: `Δ = ${fnum(d.delta, 2)} < 0: no x-intercept, no real root.`,
          };
        }

        return {
          t: tt,
          x,
          y,
          xv: d.xv,
          yv: d.yv,
          roots: d.roots,
          delta: d.delta,
          linear: d.linear,
          up: d.up,
          summary,
          chartValue: isFinite(y) ? y : 0,
          rows: [
            { label: { zh: '当前点 P', en: 'Probe P' }, value: `(${fnum(x, 2)}, ${fnum(y, 2)})` },
            { label: { zh: '顶点', en: 'Vertex' }, value: d.linear ? '—' : `(${fnum(d.xv, 2)}, ${fnum(d.yv, 2)})` },
            { label: { zh: '对称轴', en: 'Axis' }, value: d.linear ? '—' : `x = ${fnum(d.xv, 2)}` },
            { label: { zh: '判别式 Δ', en: 'Discriminant Δ' }, value: d.linear ? '—' : fnum(d.delta, 2) },
            { label: { zh: '零点', en: 'Roots' }, value: rootsText },
            { label: { zh: '最值', en: 'Extremum' }, value: d.linear ? '—' : `${d.up ? 'min' : 'max'} = ${fnum(d.yv, 2)}` },
          ],
        };
      },
      draw(ctx, st, view, pal, opts, p) {
        const f = (x) => p.a * x * x + p.b * x + p.c;

        // 对称轴
        if (!st.linear) {
          segmentWorld(ctx, view, st.xv, view.y0, st.xv, view.y1, pal.muted, 1.2, [4, 5]);
          labelWorld(ctx, view, `x = ${fnum(st.xv, 2)}`, st.xv, view.y1 - (view.y1 - view.y0) * 0.06, pal.muted, 'center', 10);
        }

        // 曲线
        plotFunction(ctx, view, pal, f, { color: pal.curve, width: 2.4 });

        // 顶点
        if (!st.linear) {
          dotWorld(ctx, view, st.xv, st.yv, pal.point, 4.4);
          tag(
            ctx,
            L({ zh: '顶点', en: 'vertex' }),
            view.toX(st.xv) + 9,
            view.toY(st.yv) + 15,
            pal.point,
            'left',
            10,
          );
        }

        // 与 x 轴的交点
        if (opts.aux) {
          st.roots.forEach((r, i) => {
            dotWorld(ctx, view, r, 0, pal.curve3, 3.6);
            labelWorld(ctx, view, st.roots.length === 2 ? `x${i + 1}` : 'x₀', r, -0.55, pal.curve3, 'center', 10);
          });
        }

        // 扫描点 + 投影虚线
        if (opts.aux) {
          segmentWorld(ctx, view, st.x, 0, st.x, st.y, pal.muted, 1, [3, 4]);
          segmentWorld(ctx, view, 0, st.y, st.x, st.y, pal.muted, 1, [3, 4]);
        }
        dotWorld(ctx, view, st.x, st.y, pal.tangent, 4.6);
        setChip(pal.chip);
        tag(ctx, `P(${fnum(st.x, 2)}, ${fnum(st.y, 2)})`, view.toX(st.x) + 10, view.toY(st.y) - 13, pal.tangent, 'left', 10);
        setChip(null);

        // 解析式角标
        setChip(pal.chip);
        labelWorld(ctx, view, quadExpr(p.a, p.b, p.c), view.x0 + (view.x1 - view.x0) * 0.02, view.y1 - (view.y1 - view.y0) * 0.05, pal.text, 'left', 11);
        setChip(null);
      },
    });

    defineLesson('quadratic', {
      lesson: {
        zh: '二次函数的一切都藏在配方里：y = a(x + b/2a)² + (4ac − b²)/4a。括号里的平方项 ≥ 0，所以 a > 0 时顶点是最低点、a < 0 时是最高点。判别式 Δ = b² − 4ac 就是顶点纵坐标的分子再取负号，它决定了图像和 x 轴的关系。',
        en: 'Complete the square: y = a(x + b/2a)² + (4ac − b²)/4a. The square is ≥ 0, so the vertex is a minimum for a > 0 and a maximum for a < 0. Δ = b² − 4ac decides how many x-intercepts there are.',
      },
      steps: [
        { at: 0, zh: '扫描点从左端出发，图像在下降（a > 0）。x 越小，ax² 越大，图像向上升——抛物线左右对称地“张开”。', en: 'The probe starts on the left where the curve falls. Symmetric branches open away from the axis.' },
        { at: 0.32, zh: '越靠近对称轴 x = −b/2a，函数值越接近最值；到顶点时切线水平，导数为 0。', en: 'Approaching the axis x = −b/2a the value nears its extremum; at the vertex the tangent is horizontal.' },
        { at: 0.55, zh: '经过顶点后开始上升。顶点纵坐标就是最值：(4ac − b²)/4a，它和 Δ 关系是 −Δ/4a。', en: 'Past the vertex the curve rises. The vertex value (4ac − b²)/4a equals −Δ/4a.' },
        { at: 0.78, zh: '曲线穿过 x 轴的位置就是方程的根。Δ > 0 有两个、Δ = 0 时顶点正好落在 x 轴上、Δ < 0 一个也没有。', en: 'Where the curve crosses the x-axis are the roots: two if Δ > 0, one if Δ = 0, none if Δ < 0.' },
      ],
    });

    defineQuiz('quadratic', (rng) => {
      const a = rpick(rng, [1, 2, -1, -2, 0.5]);
      const b = rnum(rng, -6, 6, 2);
      const c = rnum(rng, -8, 8, 1);
      const delta = b * b - 4 * a * c;
      const xv = -b / (2 * a);
      const yv = c - (b * b) / (4 * a);
      const kind = Math.floor(rng() * 4);
      const params = { a, b, c };
      const expr = quadExpr(a, b, c);

      if (kind === 0) {
        return makeQuiz(
          params,
          { zh: `已知二次函数 ${expr}，求图像顶点的横坐标。`, en: `For ${expr}, find the x-coordinate of the vertex.` },
          '',
          xv,
          { zh: `顶点横坐标 x = −b/2a = −(${fnum(b, 1)}) / (2 × ${fnum(a, 1)}) = ${fnum(xv, 2)}`, en: `x = −b/2a = ${fnum(xv, 2)}` },
          0.01,
        );
      }
      if (kind === 1) {
        return makeQuiz(
          params,
          { zh: `已知二次函数 ${expr}，求判别式 Δ = b² − 4ac 的值。`, en: `For ${expr}, compute Δ = b² − 4ac.` },
          '',
          delta,
          { zh: `Δ = (${fnum(b, 1)})² − 4 × ${fnum(a, 1)} × (${fnum(c, 1)}) = ${fnum(delta, 2)}`, en: `Δ = ${fnum(delta, 2)}` },
          0.01,
        );
      }
      if (kind === 2) {
        return makeQuiz(
          params,
          {
            zh: `已知二次函数 ${expr} 的图像与 x 轴交于两点，求这两个交点的横坐标之和。`,
            en: `For ${expr} with two x-intercepts, find the sum of their x-coordinates.`,
          },
          '',
          -b / a,
          { zh: `由韦达定理 x₁ + x₂ = −b/a = −(${fnum(b, 1)}) / ${fnum(a, 1)} = ${fnum(-b / a, 2)}`, en: `x₁ + x₂ = −b/a = ${fnum(-b / a, 2)}` },
          0.01,
        );
      }
      return makeQuiz(
        params,
        {
          zh: `已知二次函数 ${expr}，求它在实数范围内的最值（${a > 0 ? '最小值' : '最大值'}）。`,
          en: `For ${expr}, find its extremum (${a > 0 ? 'minimum' : 'maximum'}).`,
        },
        '',
        yv,
        {
          zh: `最值 y = (4ac − b²)/4a = (4 × ${fnum(a, 1)} × ${fnum(c, 1)} − ${fnum(b * b, 1)}) / (4 × ${fnum(a, 1)}) = ${fnum(yv, 2)}`,
          en: `extremum = (4ac − b²)/4a = ${fnum(yv, 2)}`,
        },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-quadratic-1',
        modelId: 'quadratic',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '二次函数最值', en: 'Quadratic extremum' },
        params: { a: 1, b: -4, c: 3 },
        stem: {
          zh: '已知二次函数 f(x) = x² − 4x + 3。求 f(x) 的最小值。',
          en: 'Given f(x) = x² − 4x + 3, find its minimum value.',
        },
        unit: '',
        answer: -1,
        tol: 0.01,
        solution: {
          zh: '配方：f(x) = (x − 2)² − 1，所以当 x = 2 时取最小值 −1（也可用 (4ac − b²)/4a = (12 − 16)/4 = −1）。',
          en: 'f(x) = (x − 2)² − 1, so the minimum is −1 at x = 2.',
        },
      },
      {
        id: 'ex-quadratic-2',
        modelId: 'quadratic',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '判别式', en: 'Discriminant' },
        params: { a: 2, b: -4, c: -6 },
        stem: {
          zh: '已知二次函数 f(x) = 2x² − 4x − 6 的图像与 x 轴交于 A、B 两点，求 |AB|（即两交点间的距离）。',
          en: 'The graph of f(x) = 2x² − 4x − 6 meets the x-axis at A and B. Find |AB|.',
        },
        unit: '',
        answer: 4,
        tol: 0.01,
        solution: {
          zh: 'Δ = 16 + 48 = 64，x = (4 ± 8)/4，得 x₁ = −1、x₂ = 3，所以 |AB| = 4。一般地 |AB| = √Δ / |a| = 8/2 = 4。',
          en: 'Δ = 64, roots −1 and 3, so |AB| = 4 (= √Δ/|a|).',
        },
      },
    ]);

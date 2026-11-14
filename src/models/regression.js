    // ---------------------------------------------------------------------------
    // 模型 · 统计与一元线性回归（高三）
    // ---------------------------------------------------------------------------

    /** 固定的 8 组观测：x = 1…8，y = 1.3x + 2 + noise·sin(i·1.7) */
    const regXS = [1, 2, 3, 4, 5, 6, 7, 8];

    function regPoints(noise) {
      return regXS.map((x, i) => ({
        x,
        y: 1.3 * x + 2 + noise * Math.sin((i + 1) * 1.7),
      }));
    }

    /** 最小二乘：斜率、截距、相关系数、残差平方和的最小值 */
    function regFit(points) {
      const n = points.length;
      let sx = 0;
      let sy = 0;
      points.forEach((pt) => {
        sx += pt.x;
        sy += pt.y;
      });
      const xb = sx / n;
      const yb = sy / n;
      let sxx = 0;
      let sxy = 0;
      let syy = 0;
      points.forEach((pt) => {
        const dx = pt.x - xb;
        const dy = pt.y - yb;
        sxx += dx * dx;
        sxy += dx * dy;
        syy += dy * dy;
      });
      const slope = sxx > 1e-12 ? sxy / sxx : 0;
      const intercept = yb - slope * xb;
      const r = sxx > 1e-12 && syy > 1e-12 ? sxy / Math.sqrt(sxx * syy) : 0;
      return { n, xb, yb, sxx, sxy, syy, slope, intercept, r, sseMin: Math.max(0, syy - (sxy * sxy) / Math.max(sxx, 1e-12)) };
    }

    /** 斜率取 m 时（直线仍过样本中心）的残差平方和 */
    function regSSE(fit, m) {
      return Math.max(0, fit.syy - 2 * m * fit.sxy + m * m * fit.sxx);
    }

    defineModel({
      id: 'regression',
      grade: 3,
      name: { zh: '统计与一元线性回归', en: 'Least-squares regression' },
      formula: {
        zh: 'b̂ = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²　â = ȳ − b̂x̄　直线必过样本中心 (x̄, ȳ)',
        en: 'b̂ = Σ(xᵢ−x̄)(yᵢ−ȳ)/Σ(xᵢ−x̄)², â = ȳ − b̂x̄; the line passes through (x̄, ȳ)',
      },
      hint: {
        zh: '把“最贴合”翻译成一句话：让每个点的残差（观测值 − 预测值）的平方和最小。对一条斜率固定的直线，平方和是关于斜率 m 的二次函数，最小值在 m = b̂ 处取到——配方以后就是 b̂ = Σ(x−x̄)(y−ȳ)/Σ(x−x̄)²。因为两边都减了均值，直线自动经过样本中心，转动斜率时只需转这一条。',
        en: '“Best fit” means minimising the sum of squared residuals. For a fixed slope the sum is a quadratic in m with its minimum at m = b̂. The line always passes through the sample mean point, so only the slope has to be chosen.',
      },
      chartLabel: { zh: '残差平方和 Σe²', en: 'SSE Σe²' },
      timeline: { zh: '动画：拟合直线从水平（斜率 0）转到最小二乘斜率', en: 'Animation: the line swings from horizontal to the least-squares slope' },
      params: [
        { key: 'noise', label: { zh: '噪声强度', en: 'Noise' }, min: 0, max: 1, step: 0.02, init: 0.5, unit: '', digits: 2 },
        { key: 'xq', label: { zh: '预测点 x₀', en: 'Predict at x₀' }, min: 1, max: 9, step: 0.5, init: 8, unit: '', digits: 1 },
      ],
      box() {
        // y 轴必须包住 0 与全部观测值；等比缩放下可视 x 会更宽，正好放回归线的延长线
        return { xMin: -1.5, xMax: 10.5, yMin: 0, yMax: 14.5 };
      },
      duration() {
        return 5;
      },
      playback: 5,
      loop: true,
      state(t, p) {
        const total = this.duration(p);
        const prog = clamp(total > 0 ? t / total : 1, 0, 1);
        const pts = regPoints(clamp(p.noise, 0, 1));
        const fit = regFit(pts);
        const m = fit.slope * prog;
        const sse = regSSE(fit, m);
        const xq = clamp(p.xq, 1, 9);
        const pred = fit.intercept + fit.slope * xq;
        const curPred = fit.yb + m * (xq - fit.xb);

        return {
          t: prog * total,
          prog,
          pts,
          fit,
          m,
          sse,
          xq,
          pred,
          curPred,
          summary: {
            zh: `斜率 m = ${fnum(m, 3)} 时残差平方和 = ${fnum(sse, 3)}；最小二乘解 b̂ = ${fnum(fit.slope, 3)}，此时最小值为 ${fnum(fit.sseMin, 3)}。相关系数 r = ${fnum(fit.r, 3)}，说明线性相关${Math.abs(fit.r) > 0.9 ? '很强' : '一般'}。`,
            en: `At slope ${fnum(m, 3)} the SSE is ${fnum(sse, 3)}; the least-squares slope b̂ = ${fnum(fit.slope, 3)} gives the minimum ${fnum(fit.sseMin, 3)}. r = ${fnum(fit.r, 3)}.`,
          },
          chartValue: isFinite(sse) ? sse : 0,
          rows: [
            { label: { zh: '当前斜率 m', en: 'Current slope m' }, value: fnum(m, 3) },
            { label: { zh: '最小二乘斜率 b̂', en: 'Least-squares slope b̂' }, value: fnum(fit.slope, 3) },
            { label: { zh: '截距 â', en: 'Intercept â' }, value: fnum(fit.intercept, 3) },
            { label: { zh: '相关系数 r', en: 'Correlation r' }, value: fnum(fit.r, 3) },
            { label: { zh: '残差平方和 Σe²', en: 'SSE Σe²' }, value: fnum(sse, 3) },
            {
              label: { zh: `预测 ŷ(x₀ = ${fnum(xq, 1)})`, en: `Prediction at x₀ = ${fnum(xq, 1)}` },
              value: fnum(pred, 3),
            },
          ],
        };
      },
      draw(ctx, st, view, pal, opts, p) {
        const { fit, pts, m, xq } = st;
        const spanY = view.y1 - view.y0;

        // 最小二乘直线（虚线对照）
        lineThroughWorld(ctx, view, fit.xb, fit.yb, 1, fit.slope, pal.curve3, 1.8, [6, 5]);

        // 当前直线：始终过样本中心
        lineThroughWorld(ctx, view, fit.xb, fit.yb, 1, m, pal.tangent, 2.4);

        // 残差竖线
        pts.forEach((pt) => {
          const yHat = fit.yb + m * (pt.x - fit.xb);
          segmentWorld(ctx, view, pt.x, pt.y, pt.x, yHat, pal.muted, 1.2);
          dotWorld(ctx, view, pt.x, yHat, pal.tangent, 2.2);
        });

        // 观测点
        pts.forEach((pt) => dotWorld(ctx, view, pt.x, pt.y, pal.curve, 4));

        // 样本中心 + 在 x₀ 处的预测
        dotWorld(ctx, view, fit.xb, fit.yb, pal.point, 4.6);
        if (opts.aux) {
          segmentWorld(ctx, view, fit.xb, 0, fit.xb, fit.yb, pal.point, 1, [3, 4]);
          segmentWorld(ctx, view, 0, fit.yb, fit.xb, fit.yb, pal.point, 1, [3, 4]);
        }
        segmentWorld(ctx, view, xq, 0, xq, st.pred, pal.curve2, 1.3, [4, 4]);
        circleWorld(ctx, view, xq, st.pred, 4.2 / view.scale, pal.curve2, 2, pal.dot);

        // 标注
        setChip(pal.chip);
        labelWorld(ctx, view, L({ zh: '样本中心', en: 'mean point' }), fit.xb + (view.x1 - view.x0) * 0.022, fit.yb + spanY * 0.03, pal.point, 'left', 10);
        labelWorld(
          ctx,
          view,
          `ŷ(${fnum(xq, 1)}) = ${fnum(st.pred, 2)}`,
          xq + (view.x1 - view.x0) * 0.015,
          st.pred,
          pal.curve2,
          'left',
          10,
        );
        setChip(null);

        // 左上角：回归方程与 r
        setChip(pal.chip);
        const textX = view.x0 + (view.x1 - view.x0) * 0.06;
        const textY = view.y1 - spanY * 0.06;
        labelWorld(
          ctx,
          view,
          `ŷ = ${fnum(fit.slope, 2)}x ${fit.intercept >= 0 ? '+' : '−'} ${fnum(Math.abs(fit.intercept), 2)}`,
          textX,
          textY,
          pal.curve3,
          'left',
          13,
        );
        labelWorld(
          ctx,
          view,
          `r = ${fnum(fit.r, 3)}　R² = ${fnum(fit.r * fit.r, 3)}`,
          textX,
          textY - spanY * 0.065,
          pal.muted,
          'left',
          10,
        );
        labelWorld(
          ctx,
          view,
          L({ zh: '虚线：最小二乘解　实线：当前斜率', en: 'dashed: least squares · solid: current slope' }),
          textX,
          textY - spanY * 0.125,
          pal.muted,
          'left',
          10,
        );
        setChip(null);
      },
    });

    defineLesson('regression', {
      lesson: {
        zh: '回归直线要“离所有点最近”。把每个点的残差 eᵢ = yᵢ − (â + b̂xᵢ) 平方后相加，就是残差平方和。固定斜率 m、让直线必须过样本中心 (x̄, ȳ)，则 Σe² = Σ(yᵢ − ȳ)² − 2mΣ(xᵢ − x̄)(yᵢ − ȳ) + m²Σ(xᵢ − x̄)²，这是关于 m 的二次函数，开口向上，顶点就是最小二乘斜率 b̂ = Σ(x−x̄)(y−ȳ)/Σ(x−x̄)²。代回得 â = ȳ − b̂x̄。',
        en: 'The fit minimises the sum of squared residuals. Holding the line through the sample mean point, Σe² is a quadratic in the slope with its vertex at b̂ = Σ(x−x̄)(y−ȳ)/Σ(x−x̄)²; then â = ȳ − b̂x̄.',
      },
      steps: [
        {
          at: 0,
          zh: '动画从斜率 0 开始：这时直线就是水平线 y = ȳ，残差就是每个点的偏差，平方和最大。橙点是样本中心 (x̄, ȳ)，任何回归直线都要经过它。',
          en: 'The animation starts with slope 0: the line is the horizontal y = ȳ and the squared errors are largest. The orange dot is the sample centre, which every regression line passes through.',
        },
        {
          at: 0.3,
          zh: '斜率增大，竖线（残差）有的变长、有的变短，但平方和一直下降——因为我们现在正沿着抛物线 Σe²(m) 向顶点走。',
          en: 'As the slope grows some residuals shrink and others grow, but the sum of squares keeps falling: we are walking toward the vertex of Σe²(m).',
        },
        {
          at: 0.62,
          zh: '斜率刚好等于 b̂ 时到达最低点，此时的实线与虚线重合。b̂ 的公式里分子是“x 与 y 一起偏离中心的程度”，分母是 x 自己的分散程度。',
          en: 'At m = b̂ the sum of squares bottoms out and the solid line meets the dashed one.',
        },
        {
          at: 0.82,
          zh: '读数：b̂ ≈ 1.3 就是数据生成时用的斜率；r 接近 1 说明点几乎在一条直线上（噪声越大 r 越小）。把 x₀ 代进 ŷ = â + b̂x₀ 就得到预测值，注意外推要谨慎。',
          en: 'Readings: b̂ ≈ 1.3 recovers the generating slope; r near 1 means the points are almost collinear. Substitute x₀ into ŷ = â + b̂x₀, but be careful when extrapolating.',
        },
      ],
    });

    defineQuiz('regression', (rng) => {
      const xs = [1, 2, 3, 4];
      const s = rpick(rng, [1, 1.5, 2, 2.5, 3]);
      const t = rpick(rng, [1, 2, 3]);
      const errs = rpick(rng, [
        [0, 1, -1, 0],
        [1, -1, 0, 0],
        [0, 0, 1, -1],
        [-1, 0, 0, 1],
      ]);
      const ys = xs.map((x, i) => s * x + t + errs[i]);
      const fit = regFit(xs.map((x, i) => ({ x, y: ys[i] })));
      const params = { noise: rpick(rng, [0.2, 0.5, 0.8]), xq: rpick(rng, [5, 6, 7, 8]) };
      const table = xs.map((x, i) => `(${x}, ${ys[i]})`).join('、');
      const tableEn = xs.map((x, i) => `(${x}, ${ys[i]})`).join(', ');
      const kind = Math.floor(rng() * 3);

      if (kind === 0) {
        return makeQuiz(
          params,
          {
            zh: `已知四组数据 ${table}，求 y 关于 x 的回归直线斜率 b̂。`,
            en: `For the data ${tableEn}, find the least-squares slope b̂.`,
          },
          '',
          fit.slope,
          {
            zh: `x̄ = 2.5，ȳ = ${fnum(fit.yb, 3)}；Σ(xᵢ − x̄)(yᵢ − ȳ) = ${fnum(fit.sxy, 3)}，Σ(xᵢ − x̄)² = 5，所以 b̂ = ${fnum(fit.sxy, 3)}/5 = ${fnum(fit.slope, 3)}。`,
            en: `x̄ = 2.5 and Σ(x−x̄)² = 5; Σ(x−x̄)(y−ȳ) = ${fnum(fit.sxy, 3)}, so b̂ = ${fnum(fit.slope, 3)}.`,
          },
          0.01,
        );
      }
      if (kind === 1) {
        return makeQuiz(
          params,
          {
            zh: `已知四组数据 ${table}，求 y 关于 x 的回归直线的截距 â。`,
            en: `For the data ${tableEn}, find the least-squares intercept â.`,
          },
          '',
          fit.intercept,
          {
            zh: `b̂ = ${fnum(fit.slope, 3)}，回归直线过样本中心 (2.5, ${fnum(fit.yb, 3)})，所以 â = ȳ − b̂·x̄ = ${fnum(fit.yb, 3)} − ${fnum(fit.slope, 3)} × 2.5 = ${fnum(fit.intercept, 3)}。`,
            en: `The line passes through (2.5, ${fnum(fit.yb, 3)}), so â = ȳ − b̂x̄ = ${fnum(fit.intercept, 3)}.`,
          },
          0.01,
        );
      }
      return makeQuiz(
        params,
        {
          zh: `已知四组数据 ${table}，求 y 与 x 的相关系数 r（保留三位小数）。`,
          en: `For the data ${tableEn}, find the correlation coefficient r (3 dp).`,
        },
        '',
        fit.r,
        {
          zh: `Σ(xᵢ − x̄)(yᵢ − ȳ) = ${fnum(fit.sxy, 3)}，Σ(xᵢ − x̄)² = 5，Σ(yᵢ − ȳ)² = ${fnum(fit.syy, 3)}，所以 r = ${fnum(fit.sxy, 3)}/√(5 × ${fnum(fit.syy, 3)}) = ${fnum(fit.r, 3)}。`,
          en: `r = ${fnum(fit.sxy, 3)}/√(5 × ${fnum(fit.syy, 3)}) = ${fnum(fit.r, 3)}.`,
        },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-regression-1',
        modelId: 'regression',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '回归直线斜率', en: 'Regression slope' },
        params: { noise: 0, xq: 6 },
        stem: {
          zh: '已知 5 组数据：x = 1, 2, 3, 4, 5；y = 2, 3, 5, 6, 9。求 y 关于 x 的回归直线斜率 b̂。',
          en: 'Given five pairs: x = 1,2,3,4,5 and y = 2,3,5,6,9, find the least-squares slope b̂.',
        },
        unit: '',
        answer: 1.7,
        tol: 0.005,
        solution: {
          zh: 'x̄ = 3，ȳ = 5。Σ(xᵢ − x̄)(yᵢ − ȳ) = (−2)(−3) + (−1)(−2) + 0×0 + 1×1 + 2×4 = 6 + 2 + 0 + 1 + 8 = 17；Σ(xᵢ − x̄)² = 4 + 1 + 0 + 1 + 4 = 10。所以 b̂ = 17/10 = 1.7，â = 5 − 1.7 × 3 = −0.1。',
          en: 'Σ(x−x̄)(y−ȳ) = 17 and Σ(x−x̄)² = 10, so b̂ = 1.7 and â = −0.1.',
        },
      },
      {
        id: 'ex-regression-2',
        modelId: 'regression',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '用回归方程预测', en: 'Prediction' },
        params: { noise: 0.3, xq: 9 },
        stem: {
          zh: '某回归直线经过样本中心 (4, 7.5)，斜率为 1.2。求 x = 10 时的预测值 ŷ。',
          en: 'A regression line passes through the sample mean point (4, 7.5) with slope 1.2. Find the prediction at x = 10.',
        },
        unit: '',
        answer: 14.7,
        tol: 0.005,
        solution: {
          zh: '回归直线过样本中心，所以 ŷ = 7.5 + 1.2(x − 4)。代入 x = 10 得 ŷ = 7.5 + 1.2 × 6 = 14.7。',
          en: 'The line passes through the mean point, so ŷ = 7.5 + 1.2(x − 4); at x = 10 this is 14.7.',
        },
      },
    ]);

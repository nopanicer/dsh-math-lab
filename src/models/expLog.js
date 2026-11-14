    // ---------------------------------------------------------------------------
    // 模型 · 指数函数与对数函数（高一）
    // ---------------------------------------------------------------------------

    const expLogBoxX0 = -2.9;
    const expLogBoxX1 = 4.8;
    const expLogBoxY0 = -2.9;
    const expLogBoxY1 = 4.4;

    /** 底数兜底：a 必须 > 0 且 ≠ 1 */
    function expLogBase(p) {
      const a = Number(p.a);
      return !Number.isFinite(a) || a <= 0 ? 1.5 : a;
    }

    function expLogValid(a) {
      return Math.abs(a - 1) > 1e-6;
    }

    function expLogDuration() {
      return 5.4;
    }

    /** 动点 P 的扫描区间：让 aˣ 落在 [0.12, 3.7]、x 不出画布（P 与镜像 Q 都留在框里） */
    function expLogSweep(a) {
      const lna = Math.log(a);
      const x1 = Math.log(3.7) / lna;
      const x2 = Math.log(0.12) / lna;
      let xA = Math.min(x1, x2);
      let xB = Math.max(x1, x2);
      xA = Math.max(xA, expLogBoxX0 + 0.2);
      xB = Math.min(xB, expLogBoxX1 - 0.2);
      if (xB - xA < 1.4) {
        const mid = (xA + xB) / 2;
        xA = Math.max(expLogBoxX0 + 0.2, mid - 0.7);
        xB = Math.min(expLogBoxX1 - 0.2, mid + 0.7);
      }
      return { xA, xB };
    }

    /** y = aˣ 与 y = log_a x 的交点：都在 y = x 上，即 aˣ = x 的根 */
    function expLogCrossings(a) {
      const limit = Math.pow(Math.E, 1 / Math.E); // ≈ 1.4447
      if (!expLogValid(a)) return { roots: [], kind: 'invalid' };
      if (a < 1) {
        const r = bisect((x) => Math.pow(a, x) - x, 0.02, 1, 60);
        return { roots: r === null ? [] : [r], kind: 'one' };
      }
      if (a > limit) return { roots: [], kind: 'none' };
      // aˣ − x 的极小值点 x* = log_a(1 / ln a)；a < e^(1/e) 时有两个根
      const xStar = Math.log(1 / Math.log(a)) / Math.log(a);
      const f = (x) => Math.pow(a, x) - x;
      const roots = [];
      const r1 = bisect(f, 0, xStar, 60);
      const r2 = bisect(f, xStar, Math.max(xStar * 3, 60), 60);
      if (r1 !== null && isFinite(r1) && r1 > 0) roots.push(r1);
      if (r2 !== null && isFinite(r2) && Math.abs(r2 - r1) > 1e-6) roots.push(r2);
      return { roots, kind: roots.length >= 2 ? 'two' : roots.length ? 'one' : 'none' };
    }

    let expLogDeriveCache = null;

    /** 与时间无关的量：底数、扫描区间、交点（按底数缓存，state 每帧都可放心调） */
    function expLogDerive(p) {
      const a = expLogBase(p);
      const key = String(a);
      if (expLogDeriveCache && expLogDeriveCache.key === key) return expLogDeriveCache.value;
      const value = {
        a,
        valid: expLogValid(a),
        sweep: expLogSweep(a),
        cross: expLogCrossings(a),
      };
      expLogDeriveCache = { key, value };
      return value;
    }

    let expLogSeriesCache = null;

    /** 副图：动点的 y = aˣ 随时间变化 */
    function expLogChartSeries(p) {
      const d = expLogDerive(p);
      const key = `${d.a}|${d.sweep.xA}|${d.sweep.xB}`;
      if (expLogSeriesCache && expLogSeriesCache.key === key) return expLogSeriesCache.series;
      const total = expLogDuration();
      const pts = [];
      for (let i = 0; i <= 96; i += 1) {
        const u = i / 96;
        pts.push({ t: total * u, v: Math.pow(d.a, d.sweep.xA + (d.sweep.xB - d.sweep.xA) * u) });
      }
      const series = { total, pts };
      expLogSeriesCache = { key, series };
      return series;
    }

    defineModel({
      id: 'expLog',
      grade: 1,
      name: { zh: '指数函数与对数函数', en: 'Exponential & logarithm' },
      formula: { zh: 'y = aˣ　y = log_a x　（a > 0，a ≠ 1）　两图像关于 y = x 对称', en: 'y = aˣ and y = log_a x (a > 0, a ≠ 1) are mirror images in y = x' },
      hint: {
        zh: '指数函数与对数函数互为反函数：把 y = aˣ 上每一点的坐标交换，就落在 y = log_a x 上。所以两条曲线关于 y = x 对称，定义域与值域也互换：(0, +∞) 与 ℝ。底数远离 1 时曲线更陡，靠近 1 时更平（或更陡地贴住 y 轴）。',
        en: 'Exponential and logarithm are inverse functions: swapping the coordinates of every point on y = aˣ lands on y = log_a x, so the two graphs mirror in y = x and their domain and range trade places. The further a is from 1, the steeper the curves.',
      },
      timeline: { zh: '动画：P 沿指数曲线从左往右走，Q 同步沿对数曲线镜像移动', en: 'Animation: P slides along the exponential curve, Q mirrors it on the logarithm' },
      params: [
        { key: 'a', label: { zh: '底数 a', en: 'Base a' }, min: 0.3, max: 3, step: 0.15, init: 1.8, unit: '', digits: 2 },
        { key: 'x0', label: { zh: '观察点 x₀', en: 'Observation x₀' }, min: -2, max: 3, step: 0.5, init: 1, unit: '', digits: 1 },
      ],
      box() {
        return { xMin: expLogBoxX0, xMax: expLogBoxX1, yMin: expLogBoxY0, yMax: expLogBoxY1 };
      },
      duration() {
        return expLogDuration();
      },
      state(t, p) {
        const d = expLogDerive(p);
        const a = d.a;
        const total = expLogDuration();
        const u = clamp(t / total, 0, 1);
        const x = d.sweep.xA + (d.sweep.xB - d.sweep.xA) * u;
        const y = Math.pow(a, x);
        const x0 = Number(p.x0);
        const y0 = Math.pow(a, x0);
        const log0 = x0 > 0 ? Math.log(x0) / Math.log(a) : NaN;
        const roots = d.cross.roots;

        let crossText = '—';
        if (!d.valid) crossText = '—';
        else if (!roots.length) crossText = d.cross.kind === 'none' ? '∅' : '—';
        else crossText = roots.map((r) => fnum(r, 2)).join(', ');

        let summary;
        if (!d.valid) {
          summary = {
            zh: 'a = 1 不是合法底数：y = 1ˣ 是常函数，log₁x 没有定义。',
            en: 'a = 1 is not allowed: y = 1ˣ is constant and log₁x is undefined.',
          };
        } else if (d.cross.kind === 'none') {
          summary = {
            zh: `a = ${fnum(a, 2)} > e^(1/e) ≈ 1.44，方程 aˣ = x 无解，两条曲线没有交点。`,
            en: `a = ${fnum(a, 2)} > e^(1/e) ≈ 1.44, so aˣ = x has no solution and the curves never meet.`,
          };
        } else if (roots.length) {
          summary = {
            zh: `交点都在 y = x 上（解 aˣ = x）：x = ${roots.map((r) => fnum(r, 2)).join('、')}。因为 log_a(aˣ) = x，交换坐标不会离开这条对称轴。`,
            en: `Intersections lie on y = x (solve aˣ = x): x = ${roots.map((r) => fnum(r, 2)).join(', ')}. Since log_a(aˣ) = x, swapped coordinates stay on the axis.`,
          };
        } else {
          summary = {
            zh: '两条曲线关于 y = x 对称：P 在指数曲线上时，交换坐标得到的 Q 一定在对数曲线上。',
            en: 'The graphs mirror in y = x: swap the coordinates of P on the exponential and you land on the logarithm.',
          };
        }

        return {
          t: Math.min(Math.max(t, 0), total),
          a,
          x,
          y,
          px: x,
          py: y,
          qx: y,
          qy: x,
          valid: d.valid,
          roots,
          rows: [
            { label: { zh: '动点 P(x, aˣ)', en: 'Probe P(x, aˣ)' }, value: `(${fnum(x, 2)}, ${fnum(y, 2)})` },
            { label: { zh: '镜像点 Q(aˣ, x)', en: 'Mirror Q(aˣ, x)' }, value: `(${fnum(y, 2)}, ${fnum(x, 2)})` },
            { label: { zh: '观察点 a^x₀', en: 'At x₀: a^x₀' }, value: d.valid ? fnum(y0, 3) : '—' },
            { label: { zh: '观察点 log_a x₀（需 x₀ > 0）', en: 'At x₀: log_a x₀ (x₀ > 0)' }, value: isFinite(log0) ? fnum(log0, 3) : '—' },
            { label: { zh: '定义域 / 值域', en: 'Domain / range' }, value: 'aˣ: ℝ → (0, +∞)　log: (0, +∞) → ℝ' },
            { label: { zh: '单调性（两曲线同向）', en: 'Monotonicity (both alike)' }, value: a > 1 ? '↗ (a > 1)' : '↘ (0 < a < 1)' },
            { label: { zh: '交点（都在 y = x 上）', en: 'Intersections (on y = x)' }, value: crossText },
          ],
          summary,
          chartValue: isFinite(y) ? y : 0,
        };
      },
      drawChart(ctx, width, height, st, p, pal) {
        drawChart(ctx, width, height, expLogChartSeries(p), pal, st.t, L({ zh: '动点 y = aˣ', en: 'Probe value aˣ' }));
      },
      draw(ctx, st, view, pal, opts, p) {
        const a = st.a;
        const spanX = view.x1 - view.x0;
        const spanY = view.y1 - view.y0;
        const pxW = 1 / view.scale;
        const x0 = Number(p.x0);

        // 对称轴 y = x
        lineThroughWorld(ctx, view, 0, 0, 1, 1, pal.muted, 1.2, [6, 6]);

        // 指数曲线
        plotFunction(ctx, view, pal, (x) => Math.pow(a, x), { color: pal.curve, width: 2.4 });

        if (st.valid) {
          // 对数曲线：只在 x > 0 上有定义
          plotFunction(
            ctx,
            view,
            pal,
            (x) => (x > 0 ? Math.log(x) / Math.log(a) : NaN),
            { color: pal.curve2, width: 2.4, lo: Math.max(view.x0, 1e-4), hi: view.x1 },
          );
        }

        // 曲线标签：都取曲线上的点，再从若干候选里挑离动点最远的那个，避免被 P/Q 压住
        const heights = [0.35, 1.2, 2.6, -0.8, -2.2];
        const obsY = Math.pow(a, x0);
        const clearPx = (x, y) => {
          const dx = view.toX(x);
          const dy = view.toY(y);
          const far = (ux, uy) => Math.hypot(dx - view.toX(ux), dy - view.toY(uy));
          let d = far(st.px, st.py);
          if (st.valid) d = Math.min(d, far(st.qx, st.qy));
          d = Math.min(d, far(x0, obsY), far(obsY, x0)); // 观察点那一对也别压住
          return d;
        };
        const bestSpot = (cands) => {
          if (!cands.length) return null;
          return cands.reduce((best, c) => (clearPx(c[0], c[1]) > clearPx(best[0], best[1]) ? c : best), cands[0]);
        };
        const inView = (x, y) =>
          x > view.x0 + 0.05 * spanX && x < view.x1 - 0.16 * spanX && y > view.y0 + 0.07 * spanY && y < view.y1 - 0.07 * spanY;

        const expSpot = bestSpot(
          heights
            .map((h) => [Math.log(h) / Math.log(a), h])
            .filter(([x, h]) => isFinite(x) && inView(x, h)),
        );
        if (expSpot) labelWorld(ctx, view, `y = ${fnum(a, 2)}ˣ`, expSpot[0], expSpot[1] + 18 * pxW, pal.curve, 'center', 11);

        const logSpot =
          st.valid
            ? bestSpot(
                heights
                  .map((h) => [Math.pow(a, h), h])
                  .filter(([x, h]) => isFinite(x) && x > 0 && inView(x, h)),
              )
            : null;
        if (logSpot) labelWorld(ctx, view, 'y = logₐ x', logSpot[0] + 10 * pxW, logSpot[1], pal.curve2, 'left', 11);
        labelWorld(
          ctx,
          view,
          'y = x',
          clamp(view.x1 - spanX * 0.17, view.y0 + 0.25 * spanY, view.y1 - 0.12 * spanY),
          clamp(view.x1 - spanX * 0.17, view.y0 + 0.25 * spanY, view.y1 - 0.12 * spanY) + 19 * pxW,
          pal.muted,
          'center',
          10,
        );

        // 交点
        if (opts.aux) {
          st.roots.forEach((r) => {
            dotWorld(ctx, view, r, r, pal.curve3, 3.6);
          });
        }

        // 观察点 x₀ 与它的镜像（都在画布内才画）
        const y0 = Math.pow(a, x0);
        const inside = (x, y) => x > view.x0 + 0.1 && x < view.x1 - 0.1 && y > view.y0 + 0.1 && y < view.y1 - 0.1;
        if (st.valid && inside(x0, y0)) {
          dotWorld(ctx, view, x0, y0, pal.point, 3.6);
          dotWorld(ctx, view, y0, x0, pal.point, 3.6);
          if (opts.aux) segmentWorld(ctx, view, x0, y0, y0, x0, pal.muted, 1, [3, 4]);
          labelWorld(ctx, view, 'x₀', x0, y0 - 17 * pxW, pal.point, 'center', 10);
        }

        // 动点 P 与镜像点 Q
        if (st.valid && opts.aux) {
          segmentWorld(ctx, view, st.px, st.py, st.qx, st.qy, pal.muted, 1.1, [4, 4]);
        }
        dotWorld(ctx, view, st.px, st.py, pal.tangent, 4.6);
        labelWorld(ctx, view, 'P', st.px + 13 * pxW, st.py + 15 * pxW, pal.tangent, 'center', 11);
        if (st.valid) {
          dotWorld(ctx, view, st.qx, st.qy, pal.tangent, 4.6);
          labelWorld(ctx, view, 'Q', st.qx + 13 * pxW, st.qy - 15 * pxW, pal.tangent, 'center', 11);
        }

        // 顶角提示：底数越远离 1，曲线越陡
        setChip(pal.chip);
        labelWorld(
          ctx,
          view,
          st.valid ? `a = ${fnum(a, 2)}` : L({ zh: 'a = 1 不是合法底数', en: 'a = 1 is not allowed' }),
          view.x0 + spanX * 0.015,
          view.y1 - spanY * 0.05,
          pal.text,
          'left',
          11,
        );
        setChip(null);
      },
    });

    defineLesson('expLog', {
      lesson: {
        zh: 'y = aˣ 的定义域是全体实数、值域是 (0, +∞)：x 轴是它的水平渐近线，曲线永远碰不到。把曲线上一点 P(x, aˣ) 的横纵坐标交换，得到 Q(aˣ, x)；因为 log_a(aˣ) = x，Q 正好在 y = log_a x 上。交换坐标就是关于 y = x 对称，这就是“互为反函数”的几何意思：定义域与值域也互换。',
        en: 'y = aˣ has domain ℝ and range (0, +∞): the x-axis is a horizontal asymptote it never touches. Swap the coordinates of P(x, aˣ) and you get Q(aˣ, x); since log_a(aˣ) = x, Q lies on y = log_a x. Swapping coordinates is a reflection in y = x — that is what “inverse functions” means geometrically, and domain and range trade places.',
      },
      steps: [
        { at: 0, zh: 'P 从左端出发，aˣ 很小但不为 0：曲线贴着 x 轴走，却永远不相交。这就是值域 (0, +∞)。', en: 'P starts at the left where aˣ is tiny but never 0: the curve hugs the x-axis without touching it — that is the range (0, +∞).' },
        { at: 0.32, zh: '把 P(x, aˣ) 的坐标交换得到 Q：Q 落在对数曲线上。虚线 PQ 垂直于 y = x 且被它平分。', en: 'Swap the coordinates of P to get Q on the logarithm. The dashed PQ is perpendicular to y = x and bisected by it.' },
        { at: 0.62, zh: '对数曲线的定义域正是指数曲线的值域：(0, +∞)。log_a x 在 x ≤ 0 处根本没有定义。', en: 'The log domain is exactly the exponential range: (0, +∞). log_a x is undefined for x ≤ 0.' },
        { at: 0.82, zh: '两条曲线的交点必在 y = x 上：交点满足 aˣ = x。底数越大，曲线越陡，交点也越靠外。', en: 'Any intersection lies on y = x, where aˣ = x. A bigger base makes the curves steeper and the intersection farther out.' },
      ],
    });

    defineQuiz('expLog', (rng) => {
      const a = rpick(rng, [2, 2.5, 3, 0.5, 0.4]);
      const k = rpick(rng, [-2, -1, 1, 2, 3]);
      const N = Math.pow(a, k);
      const params = { a, x0: Math.min(k, 1) };
      const kind = Math.floor(rng() * 4);

      if (kind === 0) {
        return makeQuiz(
          params,
          { zh: `求 log_${fnum(a, 2)} ${fnum(N, 4)} 的值。`, en: `Evaluate log_${fnum(a, 2)} ${fnum(N, 4)}.` },
          '',
          k,
          { zh: `因为 ${fnum(a, 2)}^${fnum(k, 2)} = ${fnum(N, 4)}，所以 log_${fnum(a, 2)} ${fnum(N, 4)} = ${fnum(k, 2)}。`, en: `Since ${fnum(a, 2)}^${fnum(k, 2)} = ${fnum(N, 4)}, the logarithm is ${fnum(k, 2)}.` },
          0.01,
        );
      }
      if (kind === 1) {
        return makeQuiz(
          params,
          { zh: `求 ${fnum(a, 2)}^${fnum(k, 2)} 的值。`, en: `Evaluate ${fnum(a, 2)}^${fnum(k, 2)}.` },
          '',
          N,
          {
            zh: `${fnum(a, 2)}^${fnum(k, 2)} = ${k < 0 ? `1 / ${fnum(a, 2)}^${fnum(-k, 2)} = ` : ''}${fnum(N, 4)}`,
            en: `${fnum(a, 2)}^${fnum(k, 2)} = ${fnum(N, 4)}`,
          },
          0.01,
        );
      }
      if (kind === 2) {
        return makeQuiz(
          params,
          { zh: `已知 log_a ${fnum(N, 4)} = ${fnum(k, 2)}，求底数 a（a > 0，a ≠ 1）。`, en: `Given log_a ${fnum(N, 4)} = ${fnum(k, 2)}, find the base a.` },
          '',
          a,
          { zh: `由定义 a^${fnum(k, 2)} = ${fnum(N, 4)}，所以 a = ${fnum(N, 4)}^(1/${fnum(k, 2)}) = ${fnum(a, 2)}。`, en: `a^${fnum(k, 2)} = ${fnum(N, 4)}, so a = ${fnum(a, 2)}.` },
          0.01,
        );
      }
      return makeQuiz(
        params,
        {
          zh: `求 ${fnum(a, 2)}^(log_${fnum(a, 2)} ${fnum(N, 4)}) 的值。`,
          en: `Evaluate ${fnum(a, 2)}^(log_${fnum(a, 2)} ${fnum(N, 4)}).`,
        },
        '',
        N,
        { zh: `指数与对数互为反函数：a^(log_a N) = N = ${fnum(N, 4)}。`, en: `They are inverse functions: a^(log_a N) = N = ${fnum(N, 4)}.` },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-expLog-1',
        modelId: 'expLog',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '对数求值', en: 'Evaluate a logarithm' },
        params: { a: 2, x0: 1 },
        stem: { zh: '求 log₂ 8 的值。', en: 'Evaluate log₂ 8.' },
        unit: '',
        answer: 3,
        tol: 0.01,
        solution: { zh: '因为 2³ = 8，所以 log₂ 8 = 3。（在图上找 y = log₂ x 上纵坐标为 3 的点，横坐标就是 8。）', en: 'Since 2³ = 8, log₂ 8 = 3.' },
      },
      {
        id: 'ex-expLog-2',
        modelId: 'expLog',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '指数求值', en: 'Evaluate a power' },
        params: { a: 2, x0: 0.5 },
        stem: { zh: '求 2^(1/2) 的值（保留三位小数）。', en: 'Evaluate 2^(1/2) (three decimals).' },
        unit: '',
        answer: Math.SQRT2,
        tol: 0.01,
        solution: { zh: '2^(1/2) = √2 ≈ 1.414。它与 log₂ √2 = 1/2 互为反函数的一对：把 (1/2, √2) 的坐标交换就得到 (√2, 1/2)，落在 y = log₂ x 上。', en: '2^(1/2) = √2 ≈ 1.414, paired with log₂ √2 = 1/2 by the inverse relation.' },
      },
    ]);

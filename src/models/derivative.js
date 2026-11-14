    // ---------------------------------------------------------------------------
    // 模型 9 · 导数与切线（高二）
    // ---------------------------------------------------------------------------

    /** 可选函数库：f 与 f′ 一律用解析式（不用差分近似），并附表达式文本 */
    const derivativeFns = {
      sq: { f: (x) => x * x, df: (x) => 2 * x, expr: 'x²', dexpr: '2x', xCap: 3 },
      cube: { f: (x) => x * x * x, df: (x) => 3 * x * x, expr: 'x³', dexpr: '3x²', xCap: 2.4 },
      inv: { f: (x) => 1 / x, df: (x) => -1 / (x * x), expr: '1/x', dexpr: '−1/x²', xCap: 3 },
      sin: { f: (x) => Math.sin(x), df: (x) => Math.cos(x), expr: 'sin x', dexpr: 'cos x', xCap: 3 },
      exp: { f: (x) => Math.exp(x), df: (x) => Math.exp(x), expr: 'eˣ', dexpr: 'eˣ', xCap: 2 },
    };

    /**
     * 把 x₀ 收进「图像看得清」的范围（1/x 避开 0，eˣ / x³ 限制在陡坡之外），
     * 再定出 h 的起点：要求 |f(x₀+h) − f(x₀)| ≤ 2.2，割线才不会一上来就冲出画面。
     */
    function derivativeSetup(p) {
      const spec = derivativeFns[p.fn] || derivativeFns.sq;
      let x0 = Math.max(-3, Math.min(3, Number(p.x0) || 0));
      let adjusted = '';
      if (p.fn === 'inv' && Math.abs(x0) < 0.6) {
        x0 = x0 < 0 ? -0.6 : 0.6;
        adjusted = 'pole';
      }
      if (Math.abs(x0) > spec.xCap) {
        x0 = (x0 < 0 ? -1 : 1) * spec.xCap;
        adjusted = 'cap';
      }
      const dir = p.fn === 'inv' && x0 < 0 ? -1 : 1;
      const y0 = spec.f(x0);
      let h0 = 0.06;
      for (let i = 0; i <= 40; i += 1) {
        const hh = 1.5 - (1.44 * i) / 40;
        const yy = spec.f(x0 + dir * hh);
        if (Number.isFinite(yy) && Math.abs(yy - y0) <= 2.2) {
          h0 = hh;
          break;
        }
      }
      return { spec, x0, dir, y0, h0, hEnd: 0.01, adjusted };
    }

    /** 副图：割线斜率 k 随 h（对数横轴）收敛到 f′(x₀) */
    function derivativeChart(ctx, width, height, st, p, pal) {
      const w = Math.max(80, width);
      const hgt = Math.max(56, height);
      const padL = 52;
      const padR = 14;
      const padT = 22;
      const padB = 20;
      const plotW = Math.max(10, w - padL - padR);
      const plotH = Math.max(10, hgt - padT - padB);
      const spec = derivativeFns[st.fn] || derivativeFns.sq;
      const hEnd = st.hEnd || 0.01;
      const hTop = Math.max(st.h0, hEnd * 1.05);
      const lTop = Math.log10(hTop);
      const lBot = Math.log10(hEnd);
      const f0 = spec.f(st.x0);
      const pts = [];
      for (let i = 0; i <= 72; i += 1) {
        const u = i / 72;
        const hh = Math.pow(10, lTop + (lBot - lTop) * u);
        const kk = (spec.f(st.x0 + st.dir * hh) - f0) / (st.dir * hh);
        if (Number.isFinite(kk)) pts.push({ u, k: kk });
      }
      let lo = st.kT;
      let hi = st.kT;
      pts.forEach((pt) => {
        lo = Math.min(lo, pt.k);
        hi = Math.max(hi, pt.k);
      });
      let span = Math.max(hi - lo, Math.max(Math.abs(st.kT), 1) * 0.3, 1e-3);
      const mid = (lo + hi) / 2;
      lo = mid - span * 0.68;
      hi = mid + span * 0.68;
      span = hi - lo;
      const toX = (u) => padL + plotW * u;
      const toY = (k) => padT + plotH * (1 - (k - lo) / span);

      ctx.save();
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, padT, plotW, plotH);
      // 目标值 f′(x₀)
      ctx.strokeStyle = pal.tangent;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, toY(st.kT));
      ctx.lineTo(padL + plotW, toY(st.kT));
      ctx.stroke();
      ctx.setLineDash([]);
      // k(h) 曲线
      ctx.strokeStyle = pal.curve2;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      pts.forEach((pt, i) => {
        const x = toX(pt.u);
        const y = toY(pt.k);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      // 当前位置
      const uNow = Math.max(0, Math.min(1, (lTop - Math.log10(Math.max(st.h, hEnd))) / Math.max(1e-6, lTop - lBot)));
      const xNow = toX(uNow);
      ctx.strokeStyle = pal.muted;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(xNow, padT);
      ctx.lineTo(xNow, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = pal.point;
      ctx.beginPath();
      ctx.arc(xNow, toY(st.kS), 3.6, 0, Math.PI * 2);
      ctx.fill();
      // 文字
      ctx.fillStyle = pal.muted;
      ctx.font = `500 10px ${FONT_UI}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(fnum(hi, 2), padL - 6, padT + 3);
      ctx.fillText(fnum(lo, 2), padL - 6, padT + plotH - 3);
      if (lo < st.kT && hi > st.kT) ctx.fillText(fnum(st.kT, 2), padL - 6, toY(st.kT));
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = pal.curve2;
      ctx.fillText(L({ zh: '割线斜率 k(h)', en: 'Secant slope k(h)' }), padL + 2, 5);
      ctx.fillStyle = pal.tangent;
      ctx.textAlign = 'right';
      ctx.fillText(`f′(x₀) = ${fnum(st.kT, 2)}`, padL + plotW - 2, Math.max(0, toY(st.kT) - 12));
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`h = ${fnum(hTop, 2)}`, padL, padT + plotH + 4);
      ctx.textAlign = 'right';
      ctx.fillText(`h = ${fnum(hEnd, 3)}`, padL + plotW, padT + plotH + 4);
      ctx.restore();
    }

    defineModel({
      id: 'derivative',
      grade: 2,
      name: { zh: '导数与切线', en: 'Derivative & tangent' },
      formula: {
        zh: 'f′(x₀) = lim(h→0) [f(x₀+h) − f(x₀)] / h　切线：y − f(x₀) = f′(x₀)(x − x₀)',
        en: 'f′(x₀) = lim(h→0) [f(x₀+h) − f(x₀)]/h; tangent: y − f(x₀) = f′(x₀)(x − x₀)',
      },
      hint: {
        zh: '导数是割线斜率的极限：h 越小，割线 PQ 越贴近切线，斜率 k 越接近 f′(x₀)。所以「割线转切线」不是几何巧合，而是极限过程。',
        en: 'The derivative is the limit of the secant slope: as h → 0 the chord PQ turns into the tangent at P.',
      },
      timeline: { zh: '动画：h 按对数尺度从 h₀ 缩到 0.01，割线绕 P 转成切线', en: 'Animation: h shrinks (log scale) and the secant rotates into the tangent' },
      params: [
        {
          key: 'fn',
          label: { zh: '函数', en: 'Function' },
          kind: 'select',
          init: 'sq',
          options: [
            { value: 'sq', label: { zh: 'f(x) = x²', en: 'f(x) = x²' } },
            { value: 'cube', label: { zh: 'f(x) = x³', en: 'f(x) = x³' } },
            { value: 'inv', label: { zh: 'f(x) = 1/x', en: 'f(x) = 1/x' } },
            { value: 'sin', label: { zh: 'f(x) = sin x', en: 'f(x) = sin x' } },
            { value: 'exp', label: { zh: 'f(x) = eˣ', en: 'f(x) = eˣ' } },
          ],
        },
        { key: 'x0', label: { zh: '切点横坐标 x₀', en: 'Point x₀' }, min: -3, max: 3, step: 0.1, init: 1, unit: '', digits: 1 },
      ],
      box(p) {
        const d = derivativeSetup(p);
        const xq = d.x0 + d.dir * d.h0;
        const yq = d.spec.f(xq);
        let lo = Math.min(d.y0, yq);
        let hi = Math.max(d.y0, yq);
        if (lo > 0 && lo < 3.2) lo = 0;
        if (hi < 0 && hi > -3.2) hi = 0;
        const pad = Math.max(0.55, (hi - lo) * 0.22);
        const xPad = 0.75;
        let xMin = Math.min(d.x0, xq) - xPad;
        let xMax = Math.max(d.x0, xq) + xPad;
        // 离原点不远时把 y 轴纳进来，否则面板会把纵轴压到画布边缘（轴名也被裁）
        const span = xMax - xMin;
        const margin = 0.1 * span;
        if (xMin > 0 && xMin < 1.2 * span) xMin = -margin;
        if (xMax < 0 && -xMax < 1.2 * span) xMax = margin;
        return { xMin, xMax, yMin: lo - pad, yMax: hi + pad };
      },
      duration() {
        return 6;
      },
      state(t, p) {
        const d = derivativeSetup(p);
        const total = 6;
        const tt = Math.max(0, Math.min(total, t));
        const u = tt / total;
        // 对数尺度：h 从 h₀ 等比缩到 0.01
        const h = d.h0 * Math.pow(d.hEnd / d.h0, u);
        const xq = d.x0 + d.dir * h;
        const yq = d.spec.f(xq);
        const step = d.dir * h;
        const kS = Math.abs(step) > 1e-9 ? (yq - d.y0) / step : d.spec.df(d.x0);
        const kT = d.spec.df(d.x0);
        const gap = Math.abs(kS - kT);
        const tangentText = `y = ${fnum(kT, 2)}(x − ${fnum(d.x0, 2)}) + ${fnum(d.y0, 2)}`;

        let summary;
        if (u > 0.9) {
          summary = {
            zh: `h = ${fnum(h, 3)}：割线几乎和切线重合，|k − f′(x₀)| 只有 ${fnum(gap, 4)}。导数就是这个极限。`,
            en: `h = ${fnum(h, 3)}: the chord nearly coincides with the tangent; the gap is only ${fnum(gap, 4)}.`,
          };
        } else {
          summary = {
            zh: `h 变小，Q 沿曲线滑向 P，割线 PQ 绕 P 旋转；斜率 k = ${fnum(kS, 2)} 正在逼近 f′(x₀) = ${fnum(kT, 2)}。`,
            en: `As h shrinks, Q slides toward P and the chord rotates; its slope ${fnum(kS, 2)} approaches f′(x₀) = ${fnum(kT, 2)}.`,
          };
        }
        if (d.adjusted === 'pole') {
          summary = {
            zh: '1/x 在 x = 0 处没有定义，x₀ 已自动收到 0.6（同一条分支上取割线）。' + summary.zh,
            en: '1/x is undefined at 0, so x₀ was moved to 0.6 and Q stays on the same branch. ' + summary.en,
          };
        } else if (d.adjusted === 'cap') {
          const cap = d.spec.xCap;
          summary = {
            zh: `${p.fn === 'exp' ? 'eˣ' : 'x³'} 在 x₀ 较大时太陡，画面放不下，x₀ 已限制在 ${fnum(cap, 1)} 以内。` + summary.zh,
            en: `The curve is too steep out there, so x₀ is capped at ${fnum(cap, 1)}. ` + summary.en,
          };
        }

        return {
          t: tt,
          h,
          h0: d.h0,
          hEnd: d.hEnd,
          x0: d.x0,
          y0: d.y0,
          xq,
          yq,
          kS,
          kT,
          dir: d.dir,
          fn: p.fn,
          summary,
          chartValue: Number.isFinite(kS) ? kS : 0,
          rows: [
            { label: { zh: '切点 P', en: 'Point P' }, value: `(${fnum(d.x0, 2)}, ${fnum(d.y0, 2)})` },
            { label: { zh: '动点 Q（x₀ + h）', en: 'Point Q (x₀ + h)' }, value: `(${fnum(xq, 2)}, ${fnum(yq, 2)})` },
            { label: { zh: 'h', en: 'h' }, value: fnum(h, 3) },
            { label: { zh: '割线斜率 k', en: 'Secant slope k' }, value: fnum(kS, 3) },
            { label: { zh: '切线斜率 f′(x₀)', en: 'Tangent slope f′(x₀)' }, value: fnum(kT, 3) },
            { label: { zh: '切线方程', en: 'Tangent line' }, value: tangentText },
          ],
        };
      },
      draw(ctx, st, view, pal, opts, p) {
        const spec = derivativeFns[p.fn] || derivativeFns.sq;
        const f = spec.f;

        // 曲线
        plotFunction(ctx, view, pal, f, { color: pal.curve, width: 2.4 });

        // 切线（虚线，避免和割线叠在一起时看不清）
        lineThroughWorld(ctx, view, st.x0, st.y0, 1, st.kT, pal.tangent, 2, [7, 5]);
        // 割线
        lineThroughWorld(ctx, view, st.x0, st.y0, 1, st.kS, pal.curve2, 2.2);

        // 斜率三角形：Δx = h、Δy
        const pxH = Math.abs(st.h) * view.scale;
        if (opts.aux && pxH > 18) {
          const xq = st.xq;
          segmentWorld(ctx, view, st.x0, st.y0, xq, st.y0, pal.muted, 1, [3, 4]);
          segmentWorld(ctx, view, xq, st.y0, xq, st.yq, pal.muted, 1, [3, 4]);
          const midX = st.x0 + 0.62 * (xq - st.x0);
          const lowY = Math.min(st.y0, st.yq);
          setChip(pal.chip);
          if (pxH > 26) {
            labelWorld(ctx, view, `h = ${fnum(st.h, 2)}`, midX, st.y0 - 14 / view.scale, pal.muted, 'center', 10);
          }
          if (Math.abs(st.yq - st.y0) * view.scale > 34) {
            labelWorld(ctx, view, 'Δy', xq + 16 / view.scale, (lowY + Math.max(st.y0, st.yq)) / 2, pal.muted, 'left', 10);
          }
          setChip(null);
        }

        // P、Q 两点
        dotWorld(ctx, view, st.x0, st.y0, pal.point, 4.6);
        dotWorld(ctx, view, st.xq, st.yq, pal.curve3, 4.2);
        // P、Q 的标签各自朝外，给中间的 h / Δy 让出位置
        const qRight = st.xq >= st.x0;
        tag(
          ctx,
          `P(${fnum(st.x0, 2)}, ${fnum(st.y0, 2)})`,
          view.toX(st.x0) + (qRight ? -10 : 10),
          view.toY(st.y0) + 16,
          pal.point,
          qRight ? 'right' : 'left',
          10,
        );
        if (pxH > 26) {
          tag(
            ctx,
            `Q(${fnum(st.xq, 2)}, ${fnum(st.yq, 2)})`,
            view.toX(st.xq) + (qRight ? 10 : -10),
            view.toY(st.yq) - 14,
            pal.curve3,
            qRight ? 'left' : 'right',
            10,
          );
        }

        // 左上角：解析式
        setChip(pal.chip);
        labelWorld(
          ctx,
          view,
          `f(x) = ${spec.expr}，f′(x) = ${spec.dexpr}`,
          view.x0 + (view.x1 - view.x0) * 0.02,
          view.y1 - (view.y1 - view.y0) * 0.05,
          pal.text,
          'left',
          11,
        );
        setChip(null);

        // 右上角：两条线的斜率读数
        setChip(pal.chip);
        tag(ctx, `k = ${fnum(st.kS, 2)}`, view.width - 14, 22, pal.curve2, 'right', 11);
        tag(ctx, `f′(x₀) = ${fnum(st.kT, 2)}`, view.width - 14, 40, pal.tangent, 'right', 11);
        setChip(null);
      },
      drawChart: derivativeChart,
    });

    defineLesson('derivative', {
      lesson: {
        zh: '导数是一个极限：先看割线 PQ 的斜率 [f(x₀+h) − f(x₀)]/h，再让 h 趋于 0。几何上，Q 沿着曲线滑向 P，割线绕 P 旋转，最终停下来的那条直线就是切线；它的斜率就是 f′(x₀)。所以「切线斜率」= 「割线斜率的极限」，这也是导数的定义。',
        en: 'The derivative is a limit: take the chord slope [f(x₀+h) − f(x₀)]/h and let h → 0. Geometrically Q slides along the curve toward P, the chord pivots about P, and the line it settles on is the tangent — whose slope is f′(x₀).',
      },
      steps: [
        { at: 0, zh: 'h 还很大时，P、Q 分得很开，割线 PQ 明显是「穿过去」的一条斜线，斜率 k 和 f′(x₀) 差得远。', en: 'With a large h, P and Q are far apart and the chord clearly cuts through the curve.' },
        { at: 0.3, zh: 'h 变小，Q 沿曲线靠近 P。注意 k 的变化方向：对 x² 它在减小，对 x³ 也在减小——因为割线的斜率总是朝着切线靠。', en: 'As h shrinks, Q slides toward P and the chord slope moves toward the tangent slope.' },
        { at: 0.6, zh: '右下的副图把这件事画清楚了：横轴是 h（对数），纵轴是割线斜率 k，曲线单调地爬向虚线 f′(x₀)。', en: 'The side chart plots k against h on a log scale; the curve creeps toward the dashed line f′(x₀).' },
        { at: 0.85, zh: 'h = 0.01 时割线与切线在画面上几乎重合，k 与 f′(x₀) 的差已小于百分之一。导数不是近似，是这个极限的值。', en: 'At h = 0.01 the chord and tangent nearly coincide — the derivative is that limit, not an approximation.' },
      ],
    });

    defineQuiz('derivative', (rng) => {
      const fn = rpick(rng, ['sq', 'cube', 'inv']);
      const xs = [-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3];
      const x0 = rpick(rng, xs);
      const kind = Math.floor(rng() * 3);
      const spec = derivativeFns[fn];
      const y0 = spec.f(x0);
      const k = spec.df(x0);
      const name = { sq: { zh: 'f(x) = x²', en: 'f(x) = x²' }, cube: { zh: 'f(x) = x³', en: 'f(x) = x³' }, inv: { zh: 'f(x) = 1/x', en: 'f(x) = 1/x' } }[fn];

      if (kind === 0) {
        return makeQuiz(
          { fn, x0 },
          { zh: `已知 ${name.zh}，求 f′(${fnum(x0, 1)})。`, en: `Given ${name.en}, find f′(${fnum(x0, 1)}).` },
          '',
          k,
          { zh: `f′(x) = ${spec.dexpr}，代入 x = ${fnum(x0, 1)} 得 f′(x₀) = ${fnum(k, 3)}。`, en: `f′(x) = ${spec.dexpr}, so f′(${fnum(x0, 1)}) = ${fnum(k, 3)}.` },
          0.01,
        );
      }
      if (kind === 1) {
        const h = rpick(rng, [0.5, 1, 0.2]);
        const sec = (spec.f(x0 + h) - y0) / h;
        return makeQuiz(
          { fn, x0 },
          {
            zh: `已知 ${name.zh}，在 x₀ = ${fnum(x0, 1)} 处取 h = ${fnum(h, 1)}，求割线斜率 k = [f(x₀+h) − f(x₀)] / h。`,
            en: `For ${name.en} at x₀ = ${fnum(x0, 1)} with h = ${fnum(h, 1)}, find the secant slope k = [f(x₀+h) − f(x₀)]/h.`,
          },
          '',
          sec,
          {
            zh: `f(x₀) = ${fnum(y0, 3)}，f(x₀+h) = ${fnum(spec.f(x0 + h), 3)}，所以 k = (${fnum(spec.f(x0 + h), 3)} − ${fnum(y0, 3)}) / ${fnum(h, 1)} = ${fnum(sec, 3)}。它比 f′(x₀) = ${fnum(k, 3)} 略大（或略小），h 越小越接近。`,
            en: `k = (${fnum(spec.f(x0 + h), 3)} − ${fnum(y0, 3)}) / ${fnum(h, 1)} = ${fnum(sec, 3)}, close to f′(x₀) = ${fnum(k, 3)}.`,
          },
          0.01,
        );
      }
      const b = y0 - k * x0;
      return makeQuiz(
        { fn, x0 },
        {
          zh: `已知 ${name.zh}，求它在 x = ${fnum(x0, 1)} 处的切线在 y 轴上的截距。`,
          en: `For ${name.en}, find the y-intercept of the tangent at x = ${fnum(x0, 1)}.`,
        },
        '',
        b,
        {
          zh: `f(x₀) = ${fnum(y0, 3)}，f′(x₀) = ${fnum(k, 3)}，切线 y = ${fnum(k, 3)}(x − ${fnum(x0, 1)}) + ${fnum(y0, 3)}，截距 = ${fnum(y0, 3)} − ${fnum(k, 3)} × ${fnum(x0, 1)} = ${fnum(b, 3)}。`,
          en: `Tangent: y = ${fnum(k, 3)}(x − ${fnum(x0, 1)}) + ${fnum(y0, 3)}, so the y-intercept is ${fnum(b, 3)}.`,
        },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-derivative-1',
        modelId: 'derivative',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '切线截距', en: 'Tangent intercept' },
        params: { fn: 'sq', x0: 1 },
        stem: {
          zh: '已知 f(x) = x²，求曲线在点 (1, 1) 处的切线与 y 轴交点的纵坐标。',
          en: 'For f(x) = x², find the y-coordinate where the tangent at (1, 1) meets the y-axis.',
        },
        unit: '',
        answer: -1,
        tol: 0.01,
        solution: {
          zh: 'f′(x) = 2x，所以切线斜率 k = f′(1) = 2。切线为 y − 1 = 2(x − 1)，即 y = 2x − 1，令 x = 0 得截距 −1。',
          en: 'f′(x) = 2x gives slope 2; the tangent is y = 2x − 1, so the intercept is −1.',
        },
      },
      {
        id: 'ex-derivative-2',
        modelId: 'derivative',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '导数定义', en: 'Derivative definition' },
        params: { fn: 'inv', x0: 2 },
        stem: {
          zh: '已知 f(x) = 1/x，求 f′(2) 的值，并说明它与割线斜率的关系。答案只填 f′(2)。',
          en: 'For f(x) = 1/x find f′(2) (the limit of the secant slopes). Enter f′(2) only.',
        },
        unit: '',
        answer: -0.25,
        tol: 0.01,
        solution: {
          zh: 'f′(x) = −1/x²，所以 f′(2) = −1/4 = −0.25。验证：h 很小时 [1/(2+h) − 1/2]/h = −1/(4 + 2h) → −1/4。',
          en: 'f′(x) = −1/x², so f′(2) = −1/4. Check: [1/(2+h) − 1/2]/h = −1/(4+2h) → −1/4.',
        },
      },
      {
        id: 'ex-derivative-3',
        modelId: 'derivative',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '切点纵坐标', en: 'Point of tangency' },
        params: { fn: 'cube', x0: 1 },
        stem: {
          zh: '已知 f(x) = x³，曲线在点 (1, 1) 处的切线为 y = 3x − 2。求该切线与曲线除切点外的另一个交点的横坐标。',
          en: 'For f(x) = x³ the tangent at (1, 1) is y = 3x − 2. Find the x-coordinate of the other intersection of this line with the curve.',
        },
        unit: '',
        answer: -2,
        tol: 0.01,
        solution: {
          zh: '令 x³ = 3x − 2，即 x³ − 3x + 2 = 0。因 x = 1 是二重根，x³ − 3x + 2 = (x − 1)²(x + 2)，另一交点为 x = −2。',
          en: 'x³ = 3x − 2 gives (x − 1)²(x + 2) = 0, so the other intersection is at x = −2.',
        },
      },
    ]);

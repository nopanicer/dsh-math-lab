    // ---------------------------------------------------------------------------
    // 模型 11 · 定积分与面积（高二）
    // ---------------------------------------------------------------------------

    /** 四个被积函数：f、从 0 到 b 的精确积分、表达式 */
    const integralSpecs = {
      sq: { f: (x) => x * x, exact: (b) => (b * b * b) / 3, expr: 'x²' },
      sqrt: { f: (x) => Math.sqrt(Math.max(0, x)), exact: (b) => (2 / 3) * Math.pow(b, 1.5), expr: '√x' },
      sin: { f: (x) => Math.sin(x), exact: (b) => 1 - Math.cos(b), expr: 'sin x' },
      exp: { f: (x) => Math.exp(x), exact: (b) => Math.exp(b) - 1, expr: 'eˣ' },
    };

    /** 右端点黎曼和 */
    function integralSum(f, b, n) {
      const count = Math.max(1, Math.round(n));
      const dx = b / count;
      let sum = 0;
      for (let i = 1; i <= count; i += 1) sum += f(i * dx);
      return sum * dx;
    }

    /** 动画进度 → 分割数 n（1 → 64，对数步进） */
    function integralCount(t, total) {
      const u = total > 0 ? clamp(t, 0, total) / total : 1;
      return clamp(Math.round(Math.pow(64, u)), 1, 64);
    }

    /** 副图：黎曼和的误差随 n 的变化（双对数，误差 ∝ 1/n 时是直线） */
    function integralChart(ctx, width, height, st, p, pal) {
      const w = Math.max(80, width);
      const hgt = Math.max(56, height);
      const padL = 50;
      const padR = 16;
      const padT = 18;
      const padB = 20;
      const plotW = Math.max(10, w - padL - padR);
      const plotH = Math.max(10, hgt - padT - padB);
      const spec = integralSpecs[st.fn];
      const exact = st.exact;
      const pts = [];
      let lo = Infinity;
      let hi = -Infinity;
      for (let n = 1; n <= 64; n += 1) {
        const err = Math.abs(integralSum(spec.f, st.b, n) - exact);
        const ly = Math.log10(Math.max(err, 1e-9));
        pts.push({ n, e: err, ly });
        lo = Math.min(lo, ly);
        hi = Math.max(hi, ly);
      }
      if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
        lo = -4;
        hi = 0;
      }
      if (hi - lo < 0.6) {
        const mid = (hi + lo) / 2;
        lo = mid - 0.3;
        hi = mid + 0.3;
      }
      const pad = (hi - lo) * 0.16;
      lo -= pad;
      hi += pad;
      const lx = (n) => padL + (plotW * Math.log2(n)) / 6;
      const lyToPx = (v) => padT + plotH * (1 - (v - lo) / (hi - lo));

      ctx.save();
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, padT, plotW, plotH);
      [1, 4, 16, 64].forEach((n) => {
        ctx.strokeStyle = pal.grid;
        ctx.beginPath();
        ctx.moveTo(lx(n), padT);
        ctx.lineTo(lx(n), padT + plotH);
        ctx.stroke();
      });
      // 参考斜率：误差 ∝ 1/n
      const nowErr = Math.max(Math.abs(st.sum - exact), 1e-9);
      const lxn = Math.log2(Math.max(st.n, 1));
      ctx.strokeStyle = pal.muted;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(lx(Math.max(1, st.n)), lyToPx(Math.log10(nowErr)));
      ctx.lineTo(lx(64), lyToPx(Math.log10(nowErr) - (6 - lxn) * Math.log10(2)));
      ctx.stroke();
      ctx.setLineDash([]);
      // 误差曲线
      ctx.strokeStyle = pal.curve2;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      pts.forEach((pt, i) => {
        const x = lx(pt.n);
        const y = lyToPx(pt.ly);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      // 当前 n
      const markerY = lyToPx(Math.log10(nowErr));
      ctx.strokeStyle = pal.text;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(lx(st.n), padT);
      ctx.lineTo(lx(st.n), padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = pal.point;
      ctx.beginPath();
      ctx.arc(lx(st.n), clamp(markerY, padT + 2, padT + plotH - 2), 3.4, 0, Math.PI * 2);
      ctx.fill();
      // 文字
      ctx.font = `500 10px ${FONT_UI}`;
      ctx.fillStyle = pal.curve2;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(L({ zh: '误差随 n 的变化（双对数）', en: 'error vs n (log–log)' }), padL + 2, 4);
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      [1, 4, 16, 64].forEach((n) => {
        ctx.fillText(String(n), lx(n), padT + plotH + 4);
      });
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(fnum(Math.pow(10, hi), 3), padL - 6, padT + 4);
      ctx.fillText(fnum(Math.pow(10, lo), 3), padL - 6, padT + plotH - 4);
      ctx.restore();
    }

    defineModel({
      id: 'integral',
      grade: 2,
      freeAspect: true,
      name: { zh: '定积分与面积', en: 'Definite integral' },
      formula: {
        zh: '∫ₐᵇ f(x) dx = lim(n→∞) Σ f(xᵢ)Δx　（Δx = (b − a)/n）',
        en: '∫ₐᵇ f(x) dx = lim(n→∞) Σ f(xᵢ)Δx with Δx = (b − a)/n',
      },
      hint: {
        zh: '定积分是「把曲边梯形切成无穷多条细长条再求和」的极限。n 越大，矩形越贴合曲线，黎曼和越接近精确值 I。',
        en: 'The definite integral is the limit of finer and finer Riemann sums: more rectangles, smaller error.',
      },
      timeline: { zh: '动画：分割数 n 从 1 增到 64，矩形逐渐贴合曲线', en: 'Animation: the number of rectangles grows from 1 to 64' },
      params: [
        {
          key: 'fn',
          label: { zh: '被积函数', en: 'Integrand' },
          kind: 'select',
          init: 'sq',
          options: [
            { value: 'sq', label: { zh: 'f(x) = x²', en: 'f(x) = x²' } },
            { value: 'sqrt', label: { zh: 'f(x) = √x', en: 'f(x) = √x' } },
            { value: 'sin', label: { zh: 'f(x) = sin x', en: 'f(x) = sin x' } },
            { value: 'exp', label: { zh: 'f(x) = eˣ', en: 'f(x) = eˣ' } },
          ],
        },
        { key: 'b', label: { zh: '积分上限 b', en: 'Upper limit b' }, min: 0.5, max: 3, step: 0.1, init: 1, unit: '', digits: 1 },
      ],
      box(p) {
        const spec = integralSpecs[p.fn] || integralSpecs.sq;
        const b = clamp(Number(p.b) || 1, 0.5, 3);
        let top = 0;
        for (let i = 0; i <= 40; i += 1) {
          const y = spec.f((b * i) / 40);
          if (Number.isFinite(y)) top = Math.max(top, y);
        }
        top = Math.max(top, 0.4);
        return { xMin: -0.28, xMax: b + 0.62, yMin: -0.09 * top, yMax: 1.14 * top };
      },
      duration() {
        return 7;
      },
      state(t, p) {
        const spec = integralSpecs[p.fn] || integralSpecs.sq;
        const b = clamp(Number(p.b) || 1, 0.5, 3);
        const total = 7;
        const tt = clamp(t, 0, total);
        const n = integralCount(tt, total);
        const dx = b / n;
        const sum = integralSum(spec.f, b, n);
        const exact = spec.exact(b);
        const err = sum - exact;
        const rel = Math.abs(exact) > 1e-9 ? Math.abs(err / exact) : 0;
        const better = Math.abs(err) < 0.02 * Math.max(Math.abs(exact), 1);

        return {
          t: tt,
          n,
          b,
          dx,
          sum,
          exact,
          err,
          fn: p.fn,
          summary: better
            ? { zh: `n = ${n} 时黎曼和与精确值只差 ${fnum(Math.abs(err), 4)}，已经非常接近：定积分就是这个和的极限。`, en: `At n = ${n} the Riemann sum is within ${fnum(Math.abs(err), 4)} of the exact value — that limit is the integral.` }
            : { zh: `把 [0, ${fnum(b, 1)}] 等分成 ${n} 份，矩形面积和 = ${fnum(sum, 4)}，比精确值 ${fnum(exact, 4)} 差了 ${fnum(err, 4)}（${fnum(rel * 100, 1)}%）。`, en: `${n} rectangles give ${fnum(sum, 4)}, off the exact ${fnum(exact, 4)} by ${fnum(err, 4)}.` },
          chartValue: Number.isFinite(err) ? err : 0,
          rows: [
            { label: { zh: '分割数 n', en: 'Rectangles n' }, value: String(n) },
            { label: { zh: '步长 Δx', en: 'Step Δx' }, value: fnum(dx, 4) },
            { label: { zh: '黎曼和 Rₙ', en: 'Riemann sum' }, value: fnum(sum, 4) },
            { label: { zh: '定积分 I', en: 'Integral I' }, value: fnum(exact, 4) },
            { label: { zh: '误差 Rₙ − I', en: 'Error' }, value: fnum(err, 4) },
            { label: { zh: '相对误差', en: 'Relative error' }, value: `${fnum(rel * 100, 2)}%` },
          ],
        };
      },
      draw(ctx, st, view, pal, opts, p) {
        const spec = integralSpecs[p.fn] || integralSpecs.sq;
        const b = st.b;
        const n = st.n;
        const dx = b / n;

        // 曲边梯形（精确面积）
        const areaPts = [[0, 0]];
        for (let i = 0; i <= 80; i += 1) {
          const x = (b * i) / 80;
          areaPts.push([x, spec.f(x)]);
        }
        areaPts.push([b, 0]);
        regionWorld(ctx, view, areaPts, pal.area);

        // 矩形：一根 path 一次填充，避免半透明边缝
        ctx.save();
        ctx.beginPath();
        for (let i = 1; i <= n; i += 1) {
          const x1 = (i - 1) * dx;
          const x2 = i * dx;
          const h = Math.max(0, spec.f(x2));
          const px = view.toX(x1);
          const py = view.toY(h);
          ctx.rect(px, py, Math.max(1, view.toX(x2) - px), Math.max(1, view.toY(0) - py));
        }
        ctx.fillStyle = pal.area2;
        ctx.fill();
        if (n <= 32) {
          ctx.strokeStyle = pal.curve3;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();

        // 曲线
        plotFunction(ctx, view, pal, spec.f, { color: pal.curve, width: 2.6, lo: 0, hi: b });

        // 右端点（采样点）
        if (n <= 24) {
          for (let i = 1; i <= n; i += 1) {
            const x = i * dx;
            dotWorld(ctx, view, x, spec.f(x), pal.curve3, n > 12 ? 2.2 : 3);
          }
        }

        // 上限 b 的虚线
        segmentWorld(ctx, view, b, 0, b, spec.f(b), pal.muted, 1.2, [4, 4]);

        // 左上角：积分式与读数
        setChip(pal.chip);
        const intText = `y = ${spec.expr}，x ∈ [0, ${fnum(b, 1)}]`;
        labelWorld(
          ctx,
          view,
          intText,
          view.x0 + (view.x1 - view.x0) * 0.02,
          view.y1 - (view.y1 - view.y0) * 0.05,
          pal.text,
          'left',
          11,
        );
        labelWorld(
          ctx,
          view,
          `n = ${n}，R = ${fnum(st.sum, 3)}，I = ${fnum(st.exact, 3)}`,
          view.x0 + (view.x1 - view.x0) * 0.02,
          view.y1 - (view.y1 - view.y0) * 0.12,
          pal.curve3,
          'left',
          11,
        );
        setChip(null);

        // 右上角：误差
        setChip(pal.chip);
        tag(
          ctx,
          `${L({ zh: '误差', en: 'error' })} ${fnum(Math.abs(st.err), 3)}`,
          view.width - 14,
          22,
          pal.point,
          'right',
          11,
        );
        setChip(null);
      },
      drawChart: integralChart,
    });

    defineLesson('integral', {
      lesson: {
        zh: '曲边梯形的面积没法直接用公式算，于是把它切成 n 个窄条，每个窄条用一个矩形代替（高取右端点的函数值）。n 越大，矩形越多越窄，锯齿状的台阶就越贴近曲线，矩形面积和 Rₙ 就越接近真正的面积 I。这个极限就是定积分 ∫ₐᵇ f(x) dx。',
        en: 'Cut the curved region into n thin strips and replace each by a rectangle whose height is the value at the right endpoint. As n grows the staircase hugs the curve and the sum approaches the area — that limit is the definite integral.',
      },
      steps: [
        { at: 0, zh: 'n = 1 时只有一个矩形，从 0 盖到 b，高度取右端点；它和曲边梯形的差距非常明显。', en: 'With n = 1 there is a single rectangle and the gap to the curved region is huge.' },
        { at: 0.3, zh: 'n 增加到十几个，台阶变细。多出来的小三角（右端点取高造成的高估）越来越薄。', en: 'By a dozen rectangles the staircase is fine and the overhanging slivers get thin.' },
        { at: 0.6, zh: '注意副图：横轴是 n（对数），纵轴是误差（对数）。曲线近似一条直线，说明误差大致与 1/n 成正比。', en: 'The side chart plots error against n on log axes; the near-straight line means the error is roughly proportional to 1/n.' },
        { at: 0.88, zh: 'n = 64 时矩形几乎和曲线重合，Rₙ 与 I 的差已在千分位。定积分不是「近似」，是 n → ∞ 的极限。', en: 'At n = 64 the rectangles almost coincide with the curve; the integral is the limit, not an approximation.' },
      ],
    });

    defineQuiz('integral', (rng) => {
      const kind = Math.floor(rng() * 3);
      if (kind === 0) {
        const b = rpick(rng, [1, 2, 3]);
        return makeQuiz(
          { fn: 'sq', b },
          { zh: `计算定积分 ∫₀^${fnum(b, 1)} x² dx。`, en: `Evaluate ∫₀^${fnum(b, 1)} x² dx.` },
          '',
          (b * b * b) / 3,
          { zh: `∫₀^${fnum(b, 1)} x² dx = [x³/3]₀^${fnum(b, 1)} = ${fnum(b, 1)}³/3 = ${fnum((b * b * b) / 3, 4)}。`, en: `∫₀^${fnum(b, 1)} x² dx = b³/3 = ${fnum((b * b * b) / 3, 4)}.` },
          0.01,
        );
      }
      if (kind === 1) {
        const which = Math.floor(rng() * 2);
        if (which === 0) {
          return makeQuiz(
            { fn: 'sin', b: Math.PI / 2 },
            { zh: '计算定积分 ∫₀^(π/2) sin x dx。', en: 'Evaluate ∫₀^(π/2) sin x dx.' },
            '',
            1,
            { zh: '∫₀^(π/2) sin x dx = [−cos x]₀^(π/2) = −cos(π/2) + cos 0 = 0 + 1 = 1。', en: '∫₀^(π/2) sin x dx = [−cos x] = 1.' },
            0.01,
          );
        }
        return makeQuiz(
          { fn: 'exp', b: Math.log(2) },
          { zh: '计算定积分 ∫₀^(ln 2) eˣ dx。', en: 'Evaluate ∫₀^(ln 2) eˣ dx.' },
          '',
          1,
          { zh: '∫₀^(ln 2) eˣ dx = [eˣ]₀^(ln 2) = e^(ln 2) − e⁰ = 2 − 1 = 1。', en: 'e^(ln 2) − e⁰ = 2 − 1 = 1.' },
          0.01,
        );
      }
      const n = rpick(rng, [2, 4]);
      const b = rpick(rng, [1, 2]);
      const dx = b / n;
      let s = 0;
      for (let i = 1; i <= n; i += 1) s += (i * dx) * (i * dx) * dx;
      return makeQuiz(
        { fn: 'sq', b },
        {
          zh: `把 [0, ${fnum(b, 1)}] 等分成 ${n} 份，取右端点的函数值作高，求黎曼和 R${n}（被积函数 f(x) = x²）。`,
          en: `Split [0, ${fnum(b, 1)}] into ${n} equal parts and use right endpoints to form the Riemann sum for f(x) = x². Find R${n}.`,
        },
        '',
        s,
        {
          zh: `Δx = ${fnum(dx, 3)}，右端点 xᵢ = i·Δx，R = Σ (i·Δx)²·Δx = ${fnum(s, 4)}。它比精确值 ${fnum((b * b * b) / 3, 4)} 略大。`,
          en: `Δx = ${fnum(dx, 3)}; R = Σ (iΔx)²Δx = ${fnum(s, 4)}, slightly above the exact ${fnum((b * b * b) / 3, 4)}.`,
        },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-integral-1',
        modelId: 'integral',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '定积分', en: 'Definite integral' },
        params: { fn: 'sq', b: 1 },
        stem: { zh: '计算 ∫₀¹ x² dx。', en: 'Evaluate ∫₀¹ x² dx.' },
        unit: '',
        answer: 1 / 3,
        tol: 0.01,
        solution: { zh: '∫₀¹ x² dx = [x³/3]₀¹ = 1/3。', en: '∫₀¹ x² dx = [x³/3]₀¹ = 1/3.' },
      },
      {
        id: 'ex-integral-2',
        modelId: 'integral',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '定积分 · 三角', en: 'Trigonometric integral' },
        params: { fn: 'sin', b: Math.PI / 2 },
        stem: { zh: '计算 ∫₀^(π/2) sin x dx。', en: 'Evaluate ∫₀^(π/2) sin x dx.' },
        unit: '',
        answer: 1,
        tol: 0.01,
        solution: { zh: '原函数是 −cos x，代入上下限：−cos(π/2) − (−cos 0) = 0 + 1 = 1。', en: 'The antiderivative is −cos x, so the value is 0 + 1 = 1.' },
      },
      {
        id: 'ex-integral-3',
        modelId: 'integral',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '面积', en: 'Area' },
        params: { fn: 'sqrt', b: 3 },
        stem: {
          zh: '曲线 y = √x 与 x 轴、直线 x = 3 围成的曲边梯形面积是多少？',
          en: 'Find the area under y = √x from x = 0 to x = 3.',
        },
        unit: '',
        answer: 2 * Math.sqrt(3),
        tol: 0.01,
        solution: {
          zh: '面积 = ∫₀³ √x dx = [(2/3)x^(3/2)]₀³ = (2/3)·3√3 = 2√3 ≈ 3.464。',
          en: 'Area = ∫₀³ √x dx = (2/3)·3√3 = 2√3 ≈ 3.464.',
        },
      },
    ]);

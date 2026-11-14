    // ---------------------------------------------------------------------------
    // 模型 12 · 数列与前 n 项和（高二）
    // ---------------------------------------------------------------------------

    /**
     * 等差 / 等比数列的通项与部分和。
     * 等比公比 q = 1 时通项与求和公式都退化，所以把 q 收离 1；
     * 项值太大（|aₙ| > 60）时只显示前面几项，否则等比数列会把图压成一根竖线。
     */
    function seriesSpec(p) {
      const kind = p.kind === 'geo' ? 'geo' : 'ari';
      const a1 = clamp(Number(p.a1) || 0, -3, 3);
      const raw = clamp(Number(p.r) || 0, -2, 2);
      const snapped = kind === 'geo' && Math.abs(raw - 1) < 0.06;
      const r = snapped ? (raw < 1 ? 0.9 : 1.1) : raw;
      const want = clamp(Math.round(Number(p.n) || 8), 3, 15);
      const term = (k) => (kind === 'geo' ? a1 * Math.pow(r, k - 1) : a1 + (k - 1) * r);
      const termsAll = [];
      for (let k = 1; k <= want; k += 1) termsAll.push(term(k));
      const sumAll = [];
      let accAll = 0;
      termsAll.forEach((v) => {
        accAll += v;
        sumAll.push(accAll);
      });
      // 只影响画图：项值太大时截断显示，计算（出题）仍用完整数列
      let shown = want;
      for (let k = 1; k <= want; k += 1) {
        if (Math.abs(termsAll[k - 1]) > 60) {
          shown = Math.max(1, k - 1);
          break;
        }
      }
      const terms = termsAll.slice(0, shown);
      const sums = sumAll.slice(0, shown);
      const aMax = Math.max(...terms);
      const aMin = Math.min(...terms);
      const limit = kind === 'geo' && Math.abs(r) < 1 ? a1 / (1 - r) : null;

      // 单调性：看相邻两项的差
      let up = 0;
      let down = 0;
      for (let k = 1; k < shown; k += 1) {
        const diff = terms[k] - terms[k - 1];
        if (diff > 1e-9) up += 1;
        else if (diff < -1e-9) down += 1;
      }
      let trend;
      if (!up && !down) trend = { zh: '常数列', en: 'constant' };
      else if (!down) trend = { zh: '递增', en: 'increasing' };
      else if (!up) trend = { zh: '递减', en: 'decreasing' };
      else trend = { zh: '正负摆动', en: 'oscillating' };

      const formula =
        kind === 'geo'
          ? `aₙ = ${fnum(a1, 2)} × ${fnum(r, 2)}ⁿ⁻¹`
          : `aₙ = ${fnum(a1, 2)} ${r < 0 ? '−' : '+'} (n − 1) × ${fnum(Math.abs(r), 2)}`;
      const sumFormula =
        kind === 'geo'
          ? Math.abs(r) < 1
            ? { zh: `Sₙ → a₁/(1 − q) = ${fnum(limit, 3)}`, en: `Sₙ → a₁/(1−q) = ${fnum(limit, 3)}` }
            : { zh: 'Sₙ = a₁(1 − qⁿ)/(1 − q)，|q| ≥ 1 时发散', en: 'Sₙ = a₁(1−qⁿ)/(1−q); diverges for |q| ≥ 1' }
          : { zh: 'Sₙ = n·a₁ + n(n − 1)d/2', en: 'Sₙ = n·a₁ + n(n−1)d/2' };

      return { kind, a1, r, want, shown, snapped, terms, sums, termsAll, sumAll, aMax, aMin, limit, trend, formula, sumFormula };
    }

    /** 副图：前 k 项和 Sₖ 的折线（等比收敛时画出极限虚线） */
    function seriesChart(ctx, width, height, st, p, pal) {
      const w = Math.max(80, width);
      const hgt = Math.max(56, height);
      const padL = 44;
      const padR = 16;
      const padT = 18;
      const padB = 18;
      const plotW = Math.max(10, w - padL - padR);
      const plotH = Math.max(10, hgt - padT - padB);
      const d = st.spec;
      const n = Math.max(1, d.shown);
      let lo = Math.min(...d.sums);
      let hi = Math.max(...d.sums);
      if (d.limit !== null && Number.isFinite(d.limit)) {
        lo = Math.min(lo, d.limit);
        hi = Math.max(hi, d.limit);
      }
      if (hi - lo < 1e-6) {
        lo -= 1;
        hi += 1;
      }
      const pad = (hi - lo) * 0.16;
      lo -= pad;
      hi += pad;
      const toX = (k) => padL + (plotW * (k - 1)) / Math.max(1, n - 1);
      const toY = (v) => padT + plotH * (1 - (v - lo) / (hi - lo));

      ctx.save();
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, padT, plotW, plotH);

      // 等比收敛的极限
      if (d.limit !== null && Number.isFinite(d.limit)) {
        ctx.strokeStyle = pal.curve3;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(padL, toY(d.limit));
        ctx.lineTo(padL + plotW, toY(d.limit));
        ctx.stroke();
        ctx.setLineDash([]);
      }
      // 零线（只有在区间内才画）
      if (lo < 0 && hi > 0) {
        ctx.strokeStyle = pal.axis;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(padL, toY(0));
        ctx.lineTo(padL + plotW, toY(0));
        ctx.stroke();
      }

      // Sₖ 折线 + 点
      ctx.strokeStyle = pal.curve2;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      d.sums.forEach((v, i) => {
        const x = toX(i + 1);
        const y = toY(v);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.fillStyle = pal.curve2;
      d.sums.forEach((v, i) => {
        ctx.beginPath();
        ctx.arc(toX(i + 1), toY(v), 2.4, 0, Math.PI * 2);
        ctx.fill();
      });

      // 当前位置
      const kNow = Math.max(1, Math.min(n, Math.round(st.count)));
      ctx.strokeStyle = pal.text;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(toX(kNow), padT);
      ctx.lineTo(toX(kNow), padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = pal.point;
      ctx.beginPath();
      ctx.arc(toX(kNow), toY(d.sums[kNow - 1] || 0), 3.4, 0, Math.PI * 2);
      ctx.fill();

      // 文字
      ctx.font = `500 10px ${FONT_UI}`;
      ctx.fillStyle = pal.curve2;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(L({ zh: '前 k 项和 S', en: 'partial sum S' }), padL + 2, 4);
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('1', padL, padT + plotH + 4);
      ctx.textAlign = 'right';
      ctx.fillText(String(n), padL + plotW, padT + plotH + 4);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(fnum(hi, 2), padL - 6, padT + 4);
      ctx.fillText(fnum(lo, 2), padL - 6, padT + plotH - 4);
      if (d.limit !== null && Number.isFinite(d.limit)) {
        ctx.fillStyle = pal.curve3;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(L({ zh: '极限', en: 'limit' }), padL + plotW - 4, toY(d.limit) - 2);
      }
      ctx.restore();
    }

    defineModel({
      id: 'series',
      grade: 2,
      freeAspect: true,
      name: { zh: '数列与部分和', en: 'Sequences & sums' },
      formula: {
        zh: '等差 aₙ = a₁ + (n−1)d，Sₙ = n(a₁ + aₙ)/2；等比 aₙ = a₁qⁿ⁻¹，Sₙ = a₁(1 − qⁿ)/(1 − q)',
        en: 'arithmetic aₙ = a₁+(n−1)d, Sₙ = n(a₁+aₙ)/2; geometric aₙ = a₁qⁿ⁻¹',
      },
      hint: {
        zh: '点列 aₙ 记录每一项本身，Sₙ 记录「到目前为止一共加了多少」。等差 aₙ 落在一条直线上，Sₙ 是抛物线；等比 |q| < 1 时 aₙ → 0 且 Sₙ 收敛到一个有限值。',
        en: 'The dots show each term; the partial sums add them up. Arithmetic terms lie on a line, sums on a parabola; geometric sums converge when |q| < 1.',
      },
      timeline: { zh: '动画：逐项累加，橙色点是当前项，副图同步画出 Sₖ', en: 'Animation: terms are added one by one; the side chart tracks Sₖ' },
      params: [
        {
          key: 'kind',
          label: { zh: '类型', en: 'Type' },
          kind: 'select',
          init: 'ari',
          options: [
            { value: 'ari', label: { zh: '等差数列', en: 'Arithmetic' } },
            { value: 'geo', label: { zh: '等比数列', en: 'Geometric' } },
          ],
        },
        { key: 'a1', label: { zh: '首项', en: 'First term' }, min: -3, max: 3, step: 0.1, init: 2, unit: '', digits: 1 },
        { key: 'r', label: { zh: '公差 d / 公比 q', en: 'Difference d / ratio q' }, min: -2, max: 2, step: 0.1, init: 1, unit: '', digits: 1 },
        { key: 'n', label: { zh: '项数 n', en: 'Terms n' }, min: 3, max: 15, step: 1, init: 8, unit: '', digits: 0 },
      ],
      box(p) {
        const d = seriesSpec(p);
        const n = Math.max(1, d.shown);
        let lo = Math.min(0, d.aMin);
        let hi = Math.max(0, d.aMax);
        if (hi - lo < 1.2) {
          const mid = (hi + lo) / 2;
          lo = mid - 0.6;
          hi = mid + 0.6;
        }
        const pad = (hi - lo) * 0.05;
        return { xMin: -0.55, xMax: n + 0.95, yMin: lo - pad, yMax: hi + pad };
      },
      duration() {
        return 5;
      },
      state(t, p) {
        const d = seriesSpec(p);
        const total = 5;
        const tt = clamp(t, 0, total);
        const u = total > 0 ? tt / total : 1;
        const n = Math.max(1, d.shown);
        const count = clamp(1 + Math.floor(u * n * 0.999), 1, n);
        const ak = d.terms[count - 1];
        const sk = d.sums[count - 1];
        const dd = d.kind === 'geo' ? d.r : d.r;
        const lastTerm = d.terms[n - 1];
        const converge =
          d.kind === 'geo'
            ? Math.abs(d.r) < 1
              ? { zh: `收敛：Sₙ → ${fnum(d.limit, 3)}`, en: `converges to ${fnum(d.limit, 3)}` }
              : { zh: '发散（|q| ≥ 1）', en: 'diverges (|q| ≥ 1)' }
            : Math.abs(d.r) < 1e-9
              ? { zh: '常数列：Sₙ = n·a₁（a₁ ≠ 0 时发散）', en: 'constant terms: Sₙ = n·a₁ (diverges unless a₁ = 0)' }
              : { zh: '发散（Sₙ 无界）', en: 'diverges (Sₙ unbounded)' };

        let summary = {
          zh: `第 ${count} 项 a${count} = ${fnum(ak, 2)}，前 ${count} 项和 S${count} = ${fnum(sk, 2)}。`,
          en: `Term ${count} is ${fnum(ak, 2)}; the partial sum is ${fnum(sk, 2)}.`,
        };
        if (d.snapped) {
          summary = {
            zh: `等比数列的公比不能取 1（那样通项和求和公式都会退化），已把 q 调成 ${fnum(d.r, 2)}。` + summary.zh,
            en: `q = 1 would degenerate the formulas, so q was moved to ${fnum(d.r, 2)}. ` + summary.en,
          };
        } else if (d.shown < d.want) {
          summary = {
            zh: `n = ${d.want} 时第 ${d.shown + 1} 项已超过 60，等比增长太快、图上会挤成一条竖线，只显示前 ${d.shown} 项。`,
            en: `Beyond ${d.shown} terms the values exceed 60 and the picture collapses, so only the first ${d.shown} terms are drawn.`,
          };
        }

        return {
          t: tt,
          count,
          spec: d,
          summary,
          chartValue: Number.isFinite(sk) ? sk : 0,
          rows: [
            { label: { zh: `第 ${count} 项`, en: `Term ${count}` }, value: fnum(ak, 3) },
            { label: { zh: `前 ${count} 项和`, en: `Sum S${count}` }, value: fnum(sk, 3) },
            {
              label: d.kind === 'geo' ? { zh: '公比 q', en: 'Common ratio q' } : { zh: '公差 d', en: 'Common difference d' },
              value: fnum(dd, 2),
            },
            { label: { zh: '通项公式', en: 'General term' }, value: d.formula },
            { label: { zh: `第 ${n} 项`, en: `Term ${n}` }, value: fnum(lastTerm, 3) },
            { label: { zh: '走势', en: 'Trend' }, value: L(d.trend) },
            { label: { zh: '收敛性', en: 'Convergence' }, value: L(converge) },
          ],
        };
      },
      draw(ctx, st, view, pal, opts, p) {
        const d = st.spec;
        const n = Math.max(1, d.shown);
        const count = st.count;

        // 零线 + 每一项的竖线
        segmentWorld(ctx, view, view.x0, 0, view.x1, 0, pal.muted, 1, [4, 4]);
        for (let k = 1; k <= n; k += 1) {
          const y = d.terms[k - 1];
          const revealed = k <= count;
          segmentWorld(ctx, view, k, 0, k, y, revealed ? pal.curve : pal.grid, revealed ? 1.6 : 1, null);
        }

        // 相邻项的连线（走势）
        if (n > 1) {
          const pts = [];
          for (let k = 1; k <= n; k += 1) pts.push([k, d.terms[k - 1]]);
          ctx.save();
          ctx.globalAlpha = 0.45;
          polylineWorld(ctx, view, pts, pal.curve, 1.6, [4, 4]);
          ctx.restore();
        }

        // 点列：已累加的实心，未到的浅色
        for (let k = 1; k <= n; k += 1) {
          const y = d.terms[k - 1];
          if (k <= count) dotWorld(ctx, view, k, y, pal.curve, 4);
          else dotWorld(ctx, view, k, y, pal.muted, 3.2);
        }

        // 当前项
        const ak = d.terms[count - 1];
        dotWorld(ctx, view, count, ak, pal.point, 5);
        setChip(pal.chip);
        tag(
          ctx,
          `a${count} = ${fnum(ak, 2)}`,
          view.toX(count) + 10,
          view.toY(ak) - 14,
          pal.point,
          'left',
          10,
        );
        setChip(null);

        // 左上角：首项、公差/公比、项数
        setChip(pal.chip);
        const kindText =
          d.kind === 'geo'
            ? L({ zh: `等比数列　a₁ = ${fnum(d.a1, 2)}，q = ${fnum(d.r, 2)}，共 ${n} 项`, en: `Geometric a₁ = ${fnum(d.a1, 2)}, q = ${fnum(d.r, 2)}, ${n} terms` })
            : L({ zh: `等差数列　a₁ = ${fnum(d.a1, 2)}，d = ${fnum(d.r, 2)}，共 ${n} 项`, en: `Arithmetic a₁ = ${fnum(d.a1, 2)}, d = ${fnum(d.r, 2)}, ${n} terms` });
        labelWorld(
          ctx,
          view,
          kindText,
          view.x0 + (view.x1 - view.x0) * 0.02,
          view.y1 - (view.y1 - view.y0) * 0.05,
          pal.text,
          'left',
          11,
        );
        setChip(null);

        // 右上角：当前和
        setChip(pal.chip);
        tag(ctx, `S${count} = ${fnum(d.sums[count - 1], 2)}`, view.width - 14, 22, pal.curve2, 'right', 11);
        setChip(null);
      },
      drawChart: seriesChart,
    });

    defineLesson('series', {
      lesson: {
        zh: '数列是把自然数映射到实数：a₁, a₂, a₃, … 每一项都是图像上的一个点。前 n 项和 Sₙ 是另一个数列，它的通项就是「加到这里为止」。等差数列的差恒定，所以 aₙ 的点在一条直线上；等比数列的公比恒定，所以 aₙ 按倍数放大缩小，|q| < 1 时越来越接近 0，Sₙ 则越来越接近一个极限 a₁/(1 − q)。',
        en: 'A sequence maps ℕ to ℝ: each term is a point. The partial sum Sₙ is another sequence. Constant differences put the terms on a line; a ratio with |q| < 1 sends terms to 0 and sums to a₁/(1−q).',
      },
      steps: [
        { at: 0, zh: '第 1 项就是 a₁。观察它落在 y 轴的右侧一格：横坐标是项号，纵坐标是这一项的值。', en: 'The first dot is a₁ at n = 1: the x-axis is the index, the y-axis the value.' },
        { at: 0.32, zh: '等差时相邻点等高差：每往右一格，高度变化 d。等比时每往右一格，高度乘以 q——所以它是「弯」的。', en: 'Arithmetic: each step adds d (a straight line). Geometric: each step multiplies by q, which bends the dots.' },
        { at: 0.6, zh: '副图画出 Sₖ：每加一项，折线就跳一下。等差时 Sₖ 是抛物线，等比 |q| < 1 时 Sₖ 逼近虚线 a₁/(1 − q)。', en: 'The side chart is Sₖ: it jumps at every term. It is a parabola for arithmetic sequences and approaches a₁/(1−q) for geometric ones with |q| < 1.' },
        { at: 0.85, zh: '注意 |q| > 1 的等比数列：项和和都会爆炸式增长，导数式增长都赶不上它——这就是等比数列的威力（也是复利、倍增问题的来源）。', en: 'For |q| > 1 both terms and sums blow up exponentially — the reason geometric sequences model compounding.' },
      ],
    });

    defineQuiz('series', (rng) => {
      const geo = rng() < 0.5;
      const a1 = rnum(rng, -3, 3, 0.5) || 2;
      const n = Math.round(rnum(rng, 4, 10, 1));
      if (geo) {
        const q = rpick(rng, [2, 3, -2, 0.5, -1.5]);
        const spec = seriesSpec({ kind: 'geo', a1, r: q, n });
        if (rng() < 0.5) {
          return makeQuiz(
            { kind: 'geo', a1, r: q, n },
            { zh: `等比数列中 a₁ = ${fnum(a1, 2)}，q = ${fnum(q, 2)}，求第 ${n} 项 a${n}。`, en: `A geometric sequence has a₁ = ${fnum(a1, 2)}, q = ${fnum(q, 2)}. Find term ${n}.` },
            '',
            spec.termsAll[n - 1],
            { zh: `a${n} = a₁·q^(n−1) = ${fnum(a1, 2)} × (${fnum(q, 2)})^${n - 1} = ${fnum(spec.termsAll[n - 1], 4)}。`, en: `a${n} = ${fnum(a1, 2)} × (${fnum(q, 2)})^${n - 1} = ${fnum(spec.termsAll[n - 1], 4)}.` },
            0.01,
          );
        }
        return makeQuiz(
          { kind: 'geo', a1, r: q, n },
          { zh: `等比数列中 a₁ = ${fnum(a1, 2)}，q = ${fnum(q, 2)}，求前 ${n} 项和 S${n}。`, en: `A geometric sequence has a₁ = ${fnum(a1, 2)}, q = ${fnum(q, 2)}. Find S${n}.` },
          '',
          spec.sumAll[n - 1],
          {
            zh: `S${n} = a₁(1 − q^${n})/(1 − q) = ${fnum(a1, 2)} × (1 − (${fnum(q, 2)})^${n}) / (1 − ${fnum(q, 2)}) = ${fnum(spec.sumAll[n - 1], 4)}。`,
            en: `S${n} = a₁(1 − q^${n})/(1 − q) = ${fnum(spec.sumAll[n - 1], 4)}.`,
          },
          0.01,
        );
      }
      const dd = rnum(rng, -3, 3, 0.5);
      const spec = seriesSpec({ kind: 'ari', a1, r: dd, n });
      if (rng() < 0.5) {
        return makeQuiz(
          { kind: 'ari', a1, r: dd, n },
          { zh: `等差数列中 a₁ = ${fnum(a1, 2)}，d = ${fnum(dd, 2)}，求第 ${n} 项 a${n}。`, en: `An arithmetic sequence has a₁ = ${fnum(a1, 2)}, d = ${fnum(dd, 2)}. Find term ${n}.` },
          '',
          spec.termsAll[n - 1],
          { zh: `a${n} = a₁ + (n − 1)d = ${fnum(a1, 2)} + ${n - 1} × ${fnum(dd, 2)} = ${fnum(spec.termsAll[n - 1], 3)}。`, en: `a${n} = a₁ + (n−1)d = ${fnum(spec.termsAll[n - 1], 3)}.` },
          0.01,
        );
      }
      return makeQuiz(
        { kind: 'ari', a1, r: dd, n },
        { zh: `等差数列中 a₁ = ${fnum(a1, 2)}，d = ${fnum(dd, 2)}，求前 ${n} 项和 S${n}。`, en: `An arithmetic sequence has a₁ = ${fnum(a1, 2)}, d = ${fnum(dd, 2)}. Find S${n}.` },
        '',
        spec.sumAll[n - 1],
        {
          zh: `S${n} = n·a₁ + n(n − 1)d/2 = ${n} × ${fnum(a1, 2)} + ${n} × ${n - 1} / 2 × ${fnum(dd, 2)} = ${fnum(spec.sumAll[n - 1], 3)}。`,
          en: `S${n} = n·a₁ + n(n−1)d/2 = ${fnum(spec.sumAll[n - 1], 3)}.`,
        },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-series-1',
        modelId: 'series',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '等差求和', en: 'Arithmetic sum' },
        params: { kind: 'ari', a1: 2, r: 3, n: 10 },
        stem: { zh: '等差数列中 a₁ = 2，d = 3，求前 10 项和 S₁₀。', en: 'An arithmetic sequence has a₁ = 2, d = 3. Find S₁₀.' },
        unit: '',
        answer: 155,
        tol: 0.01,
        solution: {
          zh: 'a₁₀ = 2 + 9 × 3 = 29，S₁₀ = 10 × (2 + 29)/2 = 155（也可用 Sₙ = n a₁ + n(n−1)d/2 = 20 + 135）。',
          en: 'a₁₀ = 29 and S₁₀ = 10(2+29)/2 = 155.',
        },
      },
      {
        id: 'ex-series-2',
        modelId: 'series',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '等比求和', en: 'Geometric sum' },
        params: { kind: 'geo', a1: 3, r: 2, n: 5 },
        stem: { zh: '等比数列中 a₁ = 3，q = 2，求前 5 项和 S₅。', en: 'A geometric sequence has a₁ = 3, q = 2. Find S₅.' },
        unit: '',
        answer: 93,
        tol: 0.01,
        solution: {
          zh: 'S₅ = a₁(1 − q⁵)/(1 − q) = 3(1 − 32)/(1 − 2) = 3 × 31 = 93。',
          en: 'S₅ = 3(1 − 32)/(1 − 2) = 93.',
        },
      },
      {
        id: 'ex-series-3',
        modelId: 'series',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '无穷等比', en: 'Infinite geometric series' },
        params: { kind: 'geo', a1: 2, r: 0.5, n: 10 },
        stem: { zh: '等比数列 a₁ = 2，q = 0.5，求所有项之和 S（即 Sₙ 的极限）。', en: 'A geometric sequence has a₁ = 2, q = 0.5. Find the sum of all terms (the limit of Sₙ).' },
        unit: '',
        answer: 4,
        tol: 0.01,
        solution: { zh: '|q| < 1 时 Sₙ 收敛于 a₁/(1 − q) = 2/(1 − 0.5) = 4。', en: 'For |q| < 1, Sₙ → a₁/(1−q) = 2/0.5 = 4.' },
      },
    ]);

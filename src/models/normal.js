    // ---------------------------------------------------------------------------
    // 模型 · 正态分布 N(μ, σ²)（高三）
    // ---------------------------------------------------------------------------

    /** 正态密度 φ(x) = 1/(σ√2π)·e^{−(x−μ)²/(2σ²)} */
    function normalPdf(mu, sigma, x) {
      const s = Math.max(1e-9, sigma);
      const z = (x - mu) / s;
      return Math.exp(-0.5 * z * z) / (s * Math.sqrt(2 * PI));
    }

    /**
     * 标准正态分布函数 Φ(x)。
     * Abramowitz–Stegun 26.2.17：|误差| < 7.5e-8，足够教学使用，不依赖内置 erf。
     */
    function normalCdf(x) {
      const ax = Math.abs(x);
      const t = 1 / (1 + 0.2316419 * ax);
      const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
      const tail = (Math.exp(-0.5 * ax * ax) / Math.sqrt(2 * PI)) * poly;
      return x >= 0 ? 1 - tail : tail;
    }

    /** 数值文本：负号用 U+2212，避免出现 "− -2" 这种叠字 */
    function normalNum(v, digits) {
      return fnum(v, digits === undefined ? 2 : digits).replace('-', '−');
    }

    /** 百分比读数 */
    function normalPct(v, digits) {
      const d = digits === undefined ? 2 : digits;
      return `${fx(Math.min(1, Math.max(0, v)) * 100, d)}%`;
    }

    /** 刻度步长：让 span 大约分 7–9 格 */
    function normalStep(span) {
      const bases = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20];
      const min = Math.max(1e-6, span / 9);
      for (let i = 0; i < bases.length; i += 1) {
        if (bases[i] >= min) return bases[i];
      }
      return bases[bases.length - 1];
    }

    defineModel({
      id: 'normal',
      grade: 3,
      name: { zh: '正态分布 N(μ, σ²)', en: 'Normal distribution' },
      formula: {
        zh: 'φ(x) = 1/(σ√2π) · e^{−(x−μ)²/(2σ²)}　·　P(a<X<b) = Φ((b−μ)/σ) − Φ((a−μ)/σ)',
        en: 'φ(x) = 1/(σ√2π)·e^{−(x−μ)²/(2σ²)} · P(a<X<b) = Φ((b−μ)/σ) − Φ((a−μ)/σ)',
      },
      hint: {
        zh: '正态曲线是钟形的：μ 决定中心位置，σ 决定胖瘦（σ 越小越高越窄）。曲线下的总面积恒为 1，所以一段区间上的面积就是概率。±1σ、±2σ、±3σ 分别覆盖 68.27%、95.45%、99.73%，这就是“3σ 原则”。',
        en: 'The normal curve is bell-shaped: μ places the centre, σ sets the spread (smaller σ is taller and narrower). The total area is always 1, so the area over an interval is its probability. ±1σ, ±2σ and ±3σ cover 68.27%, 95.45% and 99.73% — the “3σ rule”.',
      },
      chartLabel: { zh: 'Φ(t/σ)', en: 'Φ(t/σ)' },
      timeline: {
        zh: '动画：区间从 μ 向两侧张开到 ±kσ，阴影面积随之增大',
        en: 'Animation: the interval opens symmetrically from μ out to ±kσ while the shaded area grows',
      },
      // 密度峰值只有 1/(σ√2π)，等比缩放会把曲线压成一条矮带，这里自己定纵轴比例
      noAxes: true,
      params: [
        { key: 'mu', label: { zh: '均值 μ', en: 'Mean μ' }, min: -3, max: 3, step: 0.1, init: 0, unit: '', digits: 1 },
        { key: 'sigma', label: { zh: '标准差 σ', en: 'Std. deviation σ' }, min: 0.4, max: 2, step: 0.05, init: 1, unit: '', digits: 2 },
        {
          key: 'band',
          label: { zh: '区间 ±kσ', en: 'Interval ±kσ' },
          kind: 'select',
          init: '2',
          options: [
            { value: '1', label: { zh: '±1σ', en: '±1σ' } },
            { value: '2', label: { zh: '±2σ', en: '±2σ' } },
            { value: '3', label: { zh: '±3σ', en: '±3σ' } },
          ],
        },
      ],
      box(p) {
        const sigma = Math.max(0.2, p.sigma || 1);
        const mu = Number(p.mu) || 0;
        const peak = normalPdf(mu, sigma, mu);
        return { xMin: mu - 4.2 * sigma, xMax: mu + 4.2 * sigma, yMin: 0, yMax: peak * 1.2 };
      },
      duration() {
        return 5;
      },
      state(t, p) {
        const mu = Number(p.mu) || 0;
        const sigma = Math.max(0.1, Number(p.sigma) || 1);
        const k = Math.min(3, Math.max(1, Math.round(Number(p.band) || 1)));
        const peak = normalPdf(mu, sigma, mu);
        const total = this.duration(p);
        const tt = clamp(t, 0, total);
        const progress = total > 0 ? tt / total : 1;
        const half = clamp(k * sigma * progress, 0, k * sigma);
        const z = half / sigma;
        const cdf = normalCdf(z);
        const inside = Math.min(1, Math.max(0, 2 * cdf - 1));
        const bandProb = 2 * normalCdf(k) - 1;

        let summary;
        if (progress < 0.02) {
          summary = {
            zh: '区间还缩在 μ 上，面积为 0。把区间向两侧张开，曲线下的面积就是落在区间里的概率。',
            en: 'The interval is still collapsed at μ, so the area is 0. Widen it symmetrically: the area under the curve is the probability.',
          };
        } else if (progress > 0.995) {
          summary = {
            zh: `±${k}σ 覆盖 ${normalPct(bandProb, 2)} 的概率；σ 越大曲线越矮越宽，但曲线下总面积恒为 1。`,
            en: `±${k}σ covers ${normalPct(bandProb, 2)} of the probability; a larger σ makes the curve lower and wider, but the total area stays 1.`,
          };
        } else {
          summary = {
            zh: '阴影面积随 t 增大：t = σ 时正好 68.27%，t = 2σ 时 95.45%，t = 3σ 时 99.73%。',
            en: 'The shaded area grows with t: at t = σ it is exactly 68.27%, at 2σ 95.45%, at 3σ 99.73%.',
          };
        }

        return {
          t: tt,
          mu,
          sigma,
          k,
          peak,
          half,
          z,
          cdf,
          inside,
          bandProb,
          progress,
          summary,
          chartValue: isFinite(cdf) ? cdf : 0.5,
          rows: [
            {
              label: { zh: '区间 [μ−t, μ+t]', en: 'Interval [μ−t, μ+t]' },
              value: `[${normalNum(mu - half, 2)}, ${normalNum(mu + half, 2)}]`,
            },
            { label: { zh: '标准化 z = t/σ', en: 'Standardised z = t/σ' }, value: fnum(z, 2) },
            { label: { zh: '累计 F(μ+t) = Φ(z)', en: 'Cumulative F(μ+t) = Φ(z)' }, value: fx(cdf, 4) },
            { label: { zh: '阴影 P(区间)', en: 'Shaded P(interval)' }, value: normalPct(inside, 2) },
            { label: { zh: '峰值 φ(μ)', en: 'Peak φ(μ)' }, value: fx(peak, 4) },
            {
              label: { zh: '±1σ / ±2σ / ±3σ', en: '±1σ / ±2σ / ±3σ' },
              value: `${normalPct(2 * normalCdf(1) - 1, 2)} / ${normalPct(2 * normalCdf(2) - 1, 2)} / ${normalPct(2 * normalCdf(3) - 1, 2)}`,
            },
          ],
        };
      },
      draw(ctx, st, view, pal, opts, p) {
        const w = view.width;
        const h = view.height;
        const mu = st.mu;
        const sigma = st.sigma;
        const peak = st.peak;
        const pdf = (x) => normalPdf(mu, sigma, x);
        const padL = 56;
        const padR = 18;
        const top = 52;
        const bottom = h - 46;
        const plotW = Math.max(60, w - padL - padR);
        const plotH = Math.max(50, bottom - top);

        const x0 = mu - 4.2 * sigma;
        const x1 = mu + 4.2 * sigma;
        const yMax = peak * 1.2;
        const toX = (x) => padL + ((x - x0) / (x1 - x0)) * plotW;
        const toY = (y) => bottom - (y / yMax) * plotH;
        const gview = {
          width: w,
          height: h,
          toX,
          toY,
          x0,
          x1,
          y0: 0,
          y1: yMax,
          px: (len) => (len / (x1 - x0)) * plotW,
          scale: plotW / (x1 - x0),
          unitsPerPx: (x1 - x0) / plotW,
        };

        // ---- 标题行 ----
        ctx.save();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.font = `600 12px ${FONT_UI}`;
        ctx.fillStyle = pal.text;
        ctx.fillText(`X ~ N(${fnum(mu, 2)}, ${fnum(sigma, 2)}²)`, padL, 15);
        ctx.font = `500 10px ${FONT_UI}`;
        ctx.fillStyle = pal.muted;
        ctx.fillText(`${L({ zh: '峰值 φ(μ)', en: 'peak φ(μ)' })} = ${fx(peak, 4)}`, padL, 32);
        ctx.textAlign = 'right';
        ctx.fillStyle = pal.muted;
        ctx.fillText(`z = ${fnum(st.z, 2)}　Φ(z) = ${fx(st.cdf, 4)}`, w - padR, 32);
        ctx.font = `700 14px ${FONT_UI}`;
        ctx.fillStyle = pal.point;
        ctx.fillText(`P = ${normalPct(st.inside, 2)}`, w - padR, 15);
        ctx.restore();

        // ---- 纵轴：密度刻度 ----
        const yStep = peak > 0.0001 ? normalStep(yMax) : 0.2;
        ctx.save();
        ctx.font = `500 10px ${FONT_UI}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let v = 0; v <= yMax + 1e-9; v += yStep) {
          const py = toY(v);
          if (v > 1e-9) {
            ctx.strokeStyle = pal.grid;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padL, py);
            ctx.lineTo(padL + plotW, py);
            ctx.stroke();
          }
          ctx.fillStyle = pal.muted;
          ctx.fillText(v < 1e-9 ? '0' : fx(v, yStep < 0.05 ? 3 : 2), padL - 8, py);
        }
        ctx.restore();
        tag(ctx, 'φ(x)', padL - 8, top - 12, pal.muted, 'right', 9);

        // ---- 横轴：刻度 ----
        const xStep = normalStep(x1 - x0);
        ctx.save();
        ctx.strokeStyle = pal.axis;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(padL, top - 6);
        ctx.lineTo(padL, bottom);
        ctx.lineTo(padL + plotW, bottom);
        ctx.stroke();
        ctx.font = `500 10px ${FONT_UI}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = pal.muted;
        const startX = Math.ceil(x0 / xStep) * xStep;
        for (let x = startX; x <= x1 + 1e-9; x += xStep) {
          const px = toX(x);
          if (px < padL - 1 || px > padL + plotW + 1) continue;
          ctx.strokeStyle = pal.axis;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, bottom);
          ctx.lineTo(px, bottom + 4);
          ctx.stroke();
          ctx.fillStyle = pal.muted;
          ctx.fillText(fnum(x, 2), px, bottom + 7);
        }
        ctx.textAlign = 'right';
        ctx.font = `600 11px ${FONT_UI}`;
        ctx.fillText('x', padL + plotW, bottom + 24);
        ctx.restore();

        // ---- μ 的对称轴 ----
        segmentWorld(ctx, gview, mu, 0, mu, peak * 1.06, pal.muted, 1.1, [4, 5]);
        dotWorld(ctx, gview, mu, peak, pal.point, 3.6);
        tag(ctx, 'μ', toX(mu), bottom + 25, pal.point, 'center', 11);

        // ---- 阴影：P(μ−t < X < μ+t) ----
        const half = st.half;
        if (half > 1e-6) {
          const shade = [];
          shade.push([mu - half, 0]);
          for (let i = 0; i <= 110; i += 1) {
            const x = mu - half + (2 * half * i) / 110;
            shade.push([x, pdf(x)]);
          }
          shade.push([mu + half, 0]);
          regionWorld(ctx, gview, shade, pal.area);
        }

        // ---- 密度曲线 ----
        const curve = [];
        for (let i = 0; i <= 240; i += 1) {
          const x = x0 + ((x1 - x0) * i) / 240;
          curve.push([x, pdf(x)]);
        }
        polylineWorld(ctx, gview, curve, pal.curve, 2.4);

        // ---- 区间边界 ----
        if (half > 1e-6) {
          const lo = mu - half;
          const hi = mu + half;
          segmentWorld(ctx, gview, lo, 0, lo, pdf(lo), pal.curve, 1.2, [3, 4]);
          segmentWorld(ctx, gview, hi, 0, hi, pdf(hi), pal.curve, 1.2, [3, 4]);
          // 只在曲线还有一定高度时标端点；到了尾部会和轴上的 σ 刻度撞在一起
          if (pdf(lo) > 0.18 * peak) {
            tag(ctx, 'μ−t', toX(lo), toY(pdf(lo)) - 12, pal.curve, 'center', 9);
            tag(ctx, 'μ+t', toX(hi), toY(pdf(hi)) - 12, pal.curve, 'center', 9);
          }
        }

        // ---- σ 刻度：±1σ、±2σ、±3σ ----
        ctx.save();
        ctx.font = `500 9px ${FONT_UI}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 1; i <= 3; i += 1) {
          [mu - i * sigma, mu + i * sigma].forEach((x) => {
            if (x < x0 + 0.02 * sigma || x > x1 - 0.02 * sigma) return;
            const px = toX(x);
            ctx.strokeStyle = pal.curve3;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(px, bottom);
            ctx.lineTo(px, bottom - 5);
            ctx.stroke();
            tag(ctx, i === 1 ? 'σ' : `${i}σ`, px, bottom - 14, pal.curve3, 'center', 9);
          });
        }
        ctx.restore();
      },
    });

    defineLesson('normal', {
      lesson: {
        zh: '正态分布的密度曲线由两个参数定死：μ 是中心，σ 是尺度。曲线关于 x = μ 对称，最高点 φ(μ) = 1/(σ√2π)；σ 越大，曲线被压得越矮越宽，但曲线下的总面积永远等于 1。概率就是面积，所以求 P(a < X < b) 就是求曲线下那一块的面积——标准化成 z = (x−μ)/σ 后，查 Φ 表或直接算。',
        en: 'A normal density is fixed by two numbers: μ is the centre and σ the scale. The curve is symmetric about x = μ with peak φ(μ) = 1/(σ√2π); a larger σ squashes it lower and wider, but the total area is always 1. Probability is area, so P(a<X<b) is the area over that interval — standardise with z = (x−μ)/σ and use Φ.',
      },
      steps: [
        { at: 0, zh: '区间从 μ 开始，宽度为 0，面积自然是 0；曲线在 μ 处最高，两侧对称下降。', en: 'The interval starts at μ with zero width, so the area is 0; the curve peaks at μ and falls away symmetrically.' },
        { at: 0.3, zh: '区间向两边张开。面积增长先快后慢——钟形的中部最“厚”，边上的尾部很薄。', en: 'The interval opens up. The area grows fast then slowly: the middle of the bell carries most of the density, the tails very little.' },
        { at: 0.6, zh: 't = σ 时阴影面积正好是 68.27%；曲线在 μ ± σ 处有拐点。', en: 'At t = σ the shaded area is exactly 68.27%; the curve has inflection points at μ ± σ.' },
        { at: 0.88, zh: 't = 2σ 得 95.45%，t = 3σ 得 99.73%：几乎全部概率都落在 ±3σ 内，这就是 3σ 原则。', en: 't = 2σ gives 95.45% and t = 3σ gives 99.73% — almost all probability lies within ±3σ, the 3σ rule.' },
      ],
    });

    defineQuiz('normal', (rng) => {
      const mu = rnum(rng, -2, 2, 1);
      const sigma = rpick(rng, [0.5, 1, 2]);
      const band = rpick(rng, ['1', '2', '3']);
      const k = Number(band);
      const params = { mu, sigma, band };
      const kind = Math.floor(rng() * 4);
      const pct = (v) => Math.round(v * 10000) / 100;

      if (kind === 0) {
        const inside = 2 * normalCdf(k) - 1;
        const lo = normalNum(mu - k * sigma, 2);
        const hi = normalNum(mu + k * sigma, 2);
        return makeQuiz(
          params,
          {
            zh: `已知 X ~ N(${normalNum(mu, 1)}, ${fnum(sigma, 2)}²)，求 P(${lo} < X < ${hi})，用百分数作答（保留两位小数）。`,
            en: `Given X ~ N(${normalNum(mu, 1)}, ${fnum(sigma, 2)}²), find P(${lo} < X < ${hi}) as a percentage (2 decimals).`,
          },
          '%',
          pct(inside),
          {
            zh: `区间端点正是 μ ∓ ${k}σ：z = ±${k}，所以 P = 2Φ(${k}) − 1 = ${normalPct(inside, 2)}。`,
            en: `The endpoints are μ ∓ ${k}σ, so z = ±${k} and P = 2Φ(${k}) − 1 = ${normalPct(inside, 2)}.`,
          },
          0.005,
        );
      }
      if (kind === 1) {
        const above = 1 - normalCdf(k);
        return makeQuiz(
          params,
          {
            zh: `已知 X ~ N(${normalNum(mu, 1)}, ${fnum(sigma, 2)}²)，求 P(X > ${normalNum(mu + k * sigma, 1)})，用百分数作答（保留两位小数）。`,
            en: `Given X ~ N(${normalNum(mu, 1)}, ${fnum(sigma, 2)}²), find P(X > ${normalNum(mu + k * sigma, 1)}) as a percentage (2 decimals).`,
          },
          '%',
          pct(above),
          {
            zh: `μ + ${k}σ = ${normalNum(mu + k * sigma, 2)}，z = ${k}，P(X > μ+${k}σ) = 1 − Φ(${k}) = ${normalPct(above, 2)}。`,
            en: `μ + ${k}σ = ${normalNum(mu + k * sigma, 2)} and z = ${k}, so P(X > μ+${k}σ) = 1 − Φ(${k}) = ${normalPct(above, 2)}.`,
          },
          0.005,
        );
      }
      if (kind === 2) {
        const below = normalCdf(k);
        return makeQuiz(
          params,
          {
            zh: `已知 X ~ N(${normalNum(mu, 1)}, ${fnum(sigma, 2)}²)，求 P(X < ${normalNum(mu + k * sigma, 1)})，用百分数作答（保留两位小数）。`,
            en: `Given X ~ N(${normalNum(mu, 1)}, ${fnum(sigma, 2)}²), find P(X < ${normalNum(mu + k * sigma, 1)}) as a percentage (2 decimals).`,
          },
          '%',
          pct(below),
          {
            zh: `z = (${normalNum(mu + k * sigma, 2)} − ${normalNum(mu, 1)})/${fnum(sigma, 2)} = ${k}，P(X < μ+${k}σ) = Φ(${k}) = ${normalPct(below, 2)}。`,
            en: `z = ${k}, so P(X < μ+${k}σ) = Φ(${k}) = ${normalPct(below, 2)}.`,
          },
          0.005,
        );
      }
      const outside = 2 * (1 - normalCdf(k));
      const lo = normalNum(mu - k * sigma, 2);
      const hi = normalNum(mu + k * sigma, 2);
      return makeQuiz(
        params,
        {
          zh: `已知 X ~ N(${normalNum(mu, 1)}, ${fnum(sigma, 2)}²)，求 P(X < ${lo} 或 X > ${hi})，用百分数作答（保留两位小数）。`,
          en: `Given X ~ N(${normalNum(mu, 1)}, ${fnum(sigma, 2)}²), find P(X < ${lo} or X > ${hi}) as a percentage (2 decimals).`,
        },
        '%',
        pct(outside),
        {
          zh: `先算区间内：2Φ(${k}) − 1 = ${normalPct(2 * normalCdf(k) - 1, 2)}；区间外是它的补集：P = 2(1 − Φ(${k})) = ${normalPct(outside, 2)}。`,
          en: `Inside the interval: 2Φ(${k}) − 1 = ${normalPct(2 * normalCdf(k) - 1, 2)}. Outside is the complement: P = 2(1 − Φ(${k})) = ${normalPct(outside, 2)}.`,
        },
        0.005,
      );
    });

    defineExams([
      {
        id: 'ex-normal-1',
        modelId: 'normal',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '正态曲线面积', en: 'Area under the curve' },
        params: { mu: 0, sigma: 1, band: '1' },
        stem: {
          zh: '已知随机变量 X ~ N(0, 1)，求 P(|X| < 1)，用百分数作答（保留两位小数）。',
          en: 'Given X ~ N(0, 1), find P(|X| < 1) as a percentage (2 decimals).',
        },
        unit: '%',
        answer: 68.27,
        tol: 0.005,
        solution: {
          zh: 'P(|X| < 1) = P(−1 < X < 1) = 2Φ(1) − 1 = 2 × 0.8413 − 1 = 0.6827 = 68.27%，这正是 ±1σ 的经典值。',
          en: 'P(|X| < 1) = P(−1 < X < 1) = 2Φ(1) − 1 = 2 × 0.8413 − 1 = 0.6827 = 68.27%, the classic ±1σ value.',
        },
      },
      {
        id: 'ex-normal-2',
        modelId: 'normal',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '一般正态标准化', en: 'Standardising' },
        params: { mu: -1, sigma: 2, band: '1' },
        stem: {
          zh: '已知随机变量 X ~ N(−1, 4)，求 P(X > 1)，用百分数作答（保留两位小数）。',
          en: 'Given X ~ N(−1, 4), find P(X > 1) as a percentage (2 decimals).',
        },
        unit: '%',
        answer: 15.87,
        tol: 0.005,
        solution: {
          zh: 'σ = √4 = 2，z = (1 − (−1))/2 = 1。P(X > 1) = 1 − Φ(1) = 1 − 0.8413 = 0.1587 = 15.87%，正好是单侧 σ 以外的尾部。',
          en: 'σ = √4 = 2 and z = (1 − (−1))/2 = 1. So P(X > 1) = 1 − Φ(1) = 1 − 0.8413 = 0.1587 = 15.87%, the one-sided σ tail.',
        },
      },
      {
        id: 'ex-normal-3',
        modelId: 'normal',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '3σ 原则', en: '3σ rule' },
        params: { mu: 0, sigma: 2, band: '3' },
        stem: {
          zh: '某厂零件的长度 X ~ N(0, 2²)（单位：cm）。求长度落在 (−6, 6) 内的概率，用百分数作答（保留两位小数）。',
          en: 'A part length is X ~ N(0, 2²) cm. Find the probability that it lies in (−6, 6), as a percentage (2 decimals).',
        },
        unit: '%',
        answer: 99.73,
        tol: 0.005,
        solution: {
          zh: '−6 与 6 恰好是 μ ∓ 3σ（σ = 2）。所以 P = 2Φ(3) − 1 = 0.9973 = 99.73%，即 3σ 原则：几乎全部零件都落在 ±3σ 内。',
          en: '−6 and 6 are exactly μ ∓ 3σ with σ = 2. So P = 2Φ(3) − 1 = 0.9973 = 99.73% — the 3σ rule: nearly every part lies within ±3σ.',
        },
      },
    ]);

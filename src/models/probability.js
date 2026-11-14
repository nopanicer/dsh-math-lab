    // ---------------------------------------------------------------------------
    // 模型 · 二项分布 B(n, p)（高三）
    // ---------------------------------------------------------------------------

    /**
     * 二项分布整行概率 P(X = k)，k = 0…n。
     * 递推：P(k+1) / P(k) = (n−k)/(k+1) · p/(1−p)，省掉组合数与阶乘。
     */
    function probBinomialRow(n, p) {
      const row = [];
      if (!(p > 0)) {
        for (let k = 0; k <= n; k += 1) row.push(k === 0 ? 1 : 0);
        return row;
      }
      if (!(p < 1)) {
        for (let k = 0; k <= n; k += 1) row.push(k === n ? 1 : 0);
        return row;
      }
      const q = 1 - p;
      let value = Math.pow(q, n);
      row.push(value);
      for (let k = 0; k < n; k += 1) {
        value = (value * (n - k) * p) / ((k + 1) * q);
        row.push(value);
      }
      return row;
    }

    /** 二项分布的最可能值：floor((n+1)p)；当 (n+1)p 是整数时有两个并列的峰 */
    function probModes(n, p) {
      const m = (n + 1) * p;
      const out = [Math.min(Math.max(Math.floor(m + 1e-12), 0), n)];
      if (Math.abs(m - Math.round(m)) < 1e-9) {
        const other = Math.round(m) - 1;
        if (other >= 0 && other <= n && other !== out[0]) out.push(other);
      }
      return out.sort((a, b) => a - b);
    }

    /** 概率读数：0.17623 → 0.1762 */
    function probNumText(v, digits) {
      const d = digits === undefined ? 4 : digits;
      return fx(Math.min(1, Math.max(0, v)), d);
    }

    /** 百分比读数：0.17623 → 17.62% */
    function probPctText(v, digits) {
      const d = digits === undefined ? 2 : digits;
      return `${fx(Math.min(1, Math.max(0, v)) * 100, d)}%`;
    }

    /** 纵轴刻度步长：0…yMax 大约分 4–5 格 */
    function probYStep(yMax) {
      const steps = [0.001, 0.002, 0.005, 0.01, 0.02, 0.025, 0.05, 0.1, 0.2, 0.25, 0.5];
      for (let i = 0; i < steps.length; i += 1) {
        if (yMax / steps[i] <= 5.5) return steps[i];
      }
      return steps[steps.length - 1];
    }

    /** 刻度数字：0 写 0，其余按步长取位 */
    function probTickText(v, step) {
      if (Math.abs(v) < 1e-12) return '0';
      return fx(v, step < 0.01 ? 3 : 2);
    }

    defineModel({
      id: 'probability',
      grade: 3,
      name: { zh: '二项分布 B(n, p)', en: 'Binomial distribution' },
      formula: {
        zh: 'P(X = k) = C(n,k) pᵏ(1 − p)ⁿ⁻ᵏ　·　E(X) = np　·　D(X) = np(1 − p)',
        en: 'P(X=k) = C(n,k) pᵏ(1−p)ⁿ⁻ᵏ · E(X) = np · D(X) = np(1−p)',
      },
      hint: {
        zh: 'n 次独立重复试验里“成功 k 次”的概率按 k 排开就是二项分布：峰在 np 附近，柱子先升后降，所有柱高之和恒为 1。所以 P(X ≤ k) 就是把左边这些柱子加起来——动画里那截橙色就是它。',
        en: 'Lay out the chance of exactly k successes in n independent trials: the bars peak near np and always sum to 1. So P(X ≤ k) is just the bars from 0 to k added up — the orange ones in the animation.',
      },
      chartLabel: { zh: 'P(X = k)', en: 'P(X = k)' },
      timeline: {
        zh: '动画：k 从 0 扫到目标 k，累计概率一格一格加上去',
        en: 'Animation: k sweeps 0 → target, adding the cumulative probability bar by bar',
      },
      // 21 根柱子挤在等比缩放的坐标系里只有几像素高，这里自己管横纵比例
      noAxes: true,
      params: [
        { key: 'n', label: { zh: '试验次数 n', en: 'Trials n' }, min: 5, max: 20, step: 1, init: 10, unit: '', digits: 0 },
        { key: 'p', label: { zh: '单次成功概率 p', en: 'Success probability p' }, min: 0.05, max: 0.95, step: 0.05, init: 0.5, unit: '', digits: 2 },
        { key: 'k', label: { zh: '目标次数 k', en: 'Target k' }, min: 0, max: 20, step: 1, init: 7, unit: '', digits: 0 },
      ],
      box(p) {
        const n = Math.max(1, Math.round(p.n));
        return { xMin: -0.5, xMax: n + 0.5, yMin: 0, yMax: 1 };
      },
      duration() {
        return 4.4;
      },
      state(t, p) {
        const n = Math.round(p.n);
        const pp = clamp(p.p, 0, 1);
        const row = probBinomialRow(n, pp);
        let maxP = 0;
        row.forEach((v) => {
          if (v > maxP) maxP = v;
        });
        const target = Math.min(Math.max(0, Math.round(p.k)), n);
        const total = this.duration(p);
        const tt = Math.min(Math.max(t, 0), total);
        const progress = total > 0 ? tt / total : 1;
        const r = Math.min(target, Math.round(target * progress));
        let cum = 0;
        for (let i = 0; i <= r; i += 1) cum += row[i];
        cum = Math.min(1, Math.max(0, cum));

        const mean = n * pp;
        const variance = n * pp * (1 - pp);
        const sigma = Math.sqrt(Math.max(0, variance));
        const modes = probModes(n, pp);
        const modeText = modes.length > 1 ? `${modes[0]} / ${modes[1]}` : String(modes[0]);

        const current = row[r];
        const skew = Math.abs(pp - 0.5) < 1e-9 ? 'sym' : pp < 0.5 ? 'right' : 'left';
        let summary;
        if (skew === 'sym') {
          summary = {
            zh: `p = 0.5：分布关于 k = n/2 = ${fnum(n / 2, 1)} 对称，最可能值是 k = ${modeText}；P(X ≤ k) 随 k 单调增加到 1。`,
            en: `p = 0.5: the distribution is symmetric about k = n/2 = ${fnum(n / 2, 1)}, with modes k = ${modeText}; P(X ≤ k) climbs monotonically to 1.`,
          };
        } else if (skew === 'right') {
          summary = {
            zh: `p < 0.5，分布右偏（右侧长尾）；峰在 k = ${modeText}，而均值 np = ${fnum(mean, 2)} 被长尾拉向右边。`,
            en: `p < 0.5 gives a right-skewed shape: the mode is k = ${modeText} but the mean np = ${fnum(mean, 2)} is pulled right by the tail.`,
          };
        } else {
          summary = {
            zh: `p > 0.5，分布左偏（左侧长尾）；峰在 k = ${modeText}，而均值 np = ${fnum(mean, 2)} 被长尾拉向左边。`,
            en: `p > 0.5 gives a left-skewed shape: the mode is k = ${modeText} but the mean np = ${fnum(mean, 2)} is pulled left by the tail.`,
          };
        }

        return {
          t: tt,
          n,
          p: pp,
          r,
          row,
          maxP,
          cum,
          mean,
          variance,
          sigma,
          modes,
          modeText,
          summary,
          chartValue: isFinite(current) ? current : 0,
          rows: [
            { label: { zh: '当前 k', en: 'Current k' }, value: `k = ${r}` },
            { label: { zh: 'P(X = k)', en: 'P(X = k)' }, value: probNumText(current, 4) },
            { label: { zh: '累计 P(X ≤ k)', en: 'Cumulative P(X ≤ k)' }, value: `${probNumText(cum, 3)} (${probPctText(cum, 1)})` },
            { label: { zh: '期望 E(X) = np', en: 'Mean E(X) = np' }, value: fnum(mean, 2) },
            { label: { zh: '方差 D(X) = np(1−p)', en: 'Variance D(X) = np(1−p)' }, value: fnum(variance, 2) },
            { label: { zh: '标准差 √D(X)', en: 'Std. deviation √D(X)' }, value: fnum(sigma, 2) },
            { label: { zh: '最可能值', en: 'Most likely k' }, value: modeText },
          ],
        };
      },
      draw(ctx, st, view, pal, opts, p) {
        const w = view.width;
        const h = view.height;
        const n = st.n;
        const row = st.row;
        const padL = w < 460 ? 42 : 52;
        const padR = 16;
        const top = 50;
        const bottom = h - 44;
        const plotW = Math.max(60, w - padL - padR);
        const plotH = Math.max(40, bottom - top);
        const maxP = Math.max(st.maxP, 1e-9);
        const yMax = maxP * 1.18;
        const sx = plotW / (n + 1);
        const sy = plotH / yMax;
        const toX = (x) => padL + (x + 0.5) * sx;
        const toY = (y) => bottom - y * sy;
        const gview = {
          width: w,
          height: h,
          toX,
          toY,
          x0: -0.5,
          x1: n + 0.5,
          y0: 0,
          y1: yMax,
          px: (len) => len * sx,
          scale: sx,
          unitsPerPx: 1 / Math.max(sx, 1e-6),
        };

        // ---- 顶部：分布记号 + 累计概率进度条 ----
        ctx.save();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.font = `600 12px ${FONT_UI}`;
        ctx.fillStyle = pal.text;
        ctx.fillText(`X ~ B(${n}, ${fnum(st.p, 2)})`, padL, 14);
        ctx.textAlign = 'right';
        ctx.font = `500 10px ${FONT_UI}`;
        ctx.fillStyle = pal.muted;
        ctx.fillText(`E(X) = np = ${fnum(st.mean, 2)}`, w - padR, 14);
        ctx.restore();

        const meterY = 30;
        const meterW = Math.min(plotW * 0.4, 320);
        const mview = {
          toX: (u) => padL + u * meterW,
          toY: (v) => meterY + 4 - v * 8,
        };
        regionWorld(ctx, mview, [[0, 0], [1, 0], [1, 1], [0, 1]], pal.track);
        if (st.cum > 1e-6) {
          regionWorld(ctx, mview, [[0, 0], [st.cum, 0], [st.cum, 1], [0, 1]], pal.point);
        }
        tag(
          ctx,
          `P(X ≤ ${st.r}) = ${probNumText(st.cum, 3)} · ${probPctText(st.cum, 1)}`,
          padL + meterW + 9,
          meterY,
          pal.point,
          'left',
          10,
        );

        // ---- 纵轴：网格 + 刻度 ----
        const yStep = probYStep(yMax);
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
          ctx.fillText(probTickText(v, yStep), padL - 7, py);
        }
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = pal.axis;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(padL, top - 4);
        ctx.lineTo(padL, bottom);
        ctx.lineTo(padL + plotW, bottom);
        ctx.stroke();
        ctx.restore();
        tag(ctx, 'P(X = k)', padL + 4, top - 6, pal.muted, 'left', 9);

        // ---- 期望线 ----
        segmentWorld(ctx, gview, st.mean, 0, st.mean, yMax, pal.muted, 1, [4, 4]);
        tag(
          ctx,
          `np = ${fnum(st.mean, 2)}`,
          clamp(toX(st.mean), padL + 34, w - padR - 34),
          top + 9,
          pal.muted,
          'center',
          10,
        );

        // ---- 柱子：未累计的蓝色，累计到的橙色 ----
        const allBars = [];
        for (let k = 0; k <= n; k += 1) allBars.push({ x: k, w: 0.68, y: row[k], color: pal.curve });
        drawBars(ctx, gview, pal, allBars, { base: 0, alpha: 0.3 });
        const doneBars = [];
        for (let k = 0; k <= Math.min(st.r, n); k += 1) doneBars.push({ x: k, w: 0.68, y: row[k], color: pal.point });
        drawBars(ctx, gview, pal, doneBars, { base: 0, alpha: 0.92 });

        // 当前柱描边
        const barW = 0.68 * sx;
        const curTop = toY(row[st.r]);
        ctx.save();
        ctx.strokeStyle = pal.tangent;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(toX(st.r) - barW / 2, curTop, barW, Math.max(1, bottom - curTop));
        ctx.restore();

        // ---- 柱顶概率（只在放得下时逐根标，保证不重叠）----
        ctx.save();
        ctx.font = `500 9px ${FONT_UI}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = pal.muted;
        if (sx >= 30) {
          for (let k = 0; k <= n; k += 1) {
            if (k === st.r) continue;
            if (row[k] < maxP * 0.02) continue;
            ctx.fillText(probNumText(row[k], 3), toX(k), toY(row[k]) - 5);
          }
        }
        ctx.restore();
        tag(
          ctx,
          probNumText(row[st.r], 4),
          toX(st.r),
          toY(row[st.r]) - 13,
          pal.tangent,
          'center',
          10,
        );

        // ---- 横轴刻度 ----
        const every = sx >= 18 ? 1 : sx >= 10 ? 2 : Math.ceil(n / 8);
        ctx.save();
        ctx.font = `500 9.5px ${FONT_UI}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = pal.muted;
        let kk = 0;
        for (; kk <= n; kk += 1) {
          const px = toX(kk);
          if (kk % every !== 0 && kk !== n) continue;
          ctx.strokeStyle = pal.axis;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, bottom);
          ctx.lineTo(px, bottom + 4);
          ctx.stroke();
          ctx.fillText(String(kk), px, bottom + 7);
        }
        ctx.textAlign = 'right';
        ctx.font = `600 11px ${FONT_UI}`;
        ctx.fillText('k', padL + plotW, bottom + 21);
        ctx.restore();

        // ---- 右上角：最可能值提示 ----
        if (w >= 520) {
          tag(
            ctx,
            `${L({ zh: '最可能值', en: 'mode' })} k = ${st.modeText}`,
            w - padR,
            30,
            pal.curve3,
            'right',
            10,
          );
        }
      },
    });

    defineLesson('probability', {
      lesson: {
        zh: '二项分布是“n 次独立重复试验中成功次数”的分布律。它只由两个数决定：试验次数 n 和每次成功的概率 p。P(X = k) = C(n,k)pᵏ(1−p)ⁿ⁻ᵏ 里，C(n,k) 数的是“哪 k 次成功”，pᵏ(1−p)ⁿ⁻ᵏ 是每一种具体情形的概率。峰出现在 np 附近，柱子越高表示那个 k 越容易出现。',
        en: 'The binomial distribution is the law of the number of successes in n independent trials; it depends only on n and p. In P(X=k)=C(n,k)pᵏ(1−p)ⁿ⁻ᵏ, C(n,k) counts which k trials succeed and pᵏ(1−p)ⁿ⁻ᵏ is the probability of each pattern. The peak sits near np: taller bars mean likelier counts.',
      },
      steps: [
        { at: 0, zh: 'k = 0 时只有“一次都不成功”这一种情形，概率是 (1−p)ⁿ。此时累计概率就等于它自己。', en: 'At k = 0 only the all-failures case remains, with probability (1−p)ⁿ — and that is the cumulative probability too.' },
        { at: 0.3, zh: 'k 往右走，组合数 C(n,k) 变大，柱子迅速升高；累计概率把这些柱高一段段加起来。', en: 'As k grows, C(n,k) grows and the bars shoot up; the cumulative probability adds those heights up.' },
        { at: 0.6, zh: '峰落在 np 附近（精确说是 floor((n+1)p)）。p = 0.5 时图形左右对称，p 偏离 0.5 就会偏斜。', en: 'The peak sits near np — exactly at floor((n+1)p). With p = 0.5 the picture is symmetric; otherwise it skews.' },
        { at: 0.85, zh: '全部柱子的高之和恒为 1，所以扫到 k = n 时累计概率到达 1；E(X) = np 是柱子的重心。', en: 'All bar heights sum to 1, so at k = n the cumulative probability reaches 1; E(X) = np is the balance point of the bars.' },
      ],
    });

    defineQuiz('probability', (rng) => {
      const n = rnum(rng, 5, 12, 1);
      const p = rpick(rng, [0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 0.8]);
      const k = rnum(rng, 0, Math.min(n, 6), 1);
      const row = probBinomialRow(n, p);
      const mode = probModes(n, p)[0];
      const params = { n, p, k };
      const kind = Math.floor(rng() * 5);
      const pct = (v) => v * 100;

      if (kind === 0) {
        return makeQuiz(
          params,
          {
            zh: `随机变量 X ~ B(${n}, ${fnum(p, 2)})，求 P(X = ${k})，用百分数作答（保留两位小数）。`,
            en: `For X ~ B(${n}, ${fnum(p, 2)}), find P(X = ${k}) as a percentage (2 decimals).`,
          },
          '%',
          pct(row[k]),
          {
            zh: `P(X = ${k}) = C(${n},${k}) × ${fnum(p, 2)}^${k} × ${fnum(1 - p, 2)}^${n - k} = ${probPctText(row[k], 2)}`,
            en: `P(X = ${k}) = C(${n},${k})·${fnum(p, 2)}^${k}·${fnum(1 - p, 2)}^${n - k} = ${probPctText(row[k], 2)}`,
          },
          0.005,
        );
      }
      if (kind === 1) {
        return makeQuiz(
          params,
          {
            zh: `随机变量 X ~ B(${n}, ${fnum(p, 2)})，求期望 E(X)。`,
            en: `For X ~ B(${n}, ${fnum(p, 2)}), find E(X).`,
          },
          '',
          n * p,
          { zh: `E(X) = np = ${n} × ${fnum(p, 2)} = ${fnum(n * p, 2)}`, en: `E(X) = np = ${n} × ${fnum(p, 2)} = ${fnum(n * p, 2)}` },
          0.005,
        );
      }
      if (kind === 2) {
        return makeQuiz(
          params,
          {
            zh: `随机变量 X ~ B(${n}, ${fnum(p, 2)})，求方差 D(X)。`,
            en: `For X ~ B(${n}, ${fnum(p, 2)}), find D(X).`,
          },
          '',
          n * p * (1 - p),
          {
            zh: `D(X) = np(1−p) = ${n} × ${fnum(p, 2)} × ${fnum(1 - p, 2)} = ${fnum(n * p * (1 - p), 3)}`,
            en: `D(X) = np(1−p) = ${n} × ${fnum(p, 2)} × ${fnum(1 - p, 2)} = ${fnum(n * p * (1 - p), 3)}`,
          },
          0.005,
        );
      }
      if (kind === 3) {
        const modes = probModes(n, p);
        const twoPeaks = modes.length > 1;
        return makeQuiz(
          params,
          {
            zh: `随机变量 X ~ B(${n}, ${fnum(p, 2)})，求使 P(X = k) 最大的 k（若有两个，填较小的那个）。`,
            en: `For X ~ B(${n}, ${fnum(p, 2)}), find the k that maximises P(X = k) (the smaller one if there are two).`,
          },
          '',
          mode,
          twoPeaks
            ? {
                zh: `(n+1)p = ${fnum((n + 1) * p, 2)} 是整数，所以 k = ${modes[0]} 与 k = ${modes[1]} 两处概率并列最大（都是 ${probPctText(row[mode], 2)}），取较小的 ${mode}。`,
                en: `(n+1)p = ${fnum((n + 1) * p, 2)} is an integer, so k = ${modes[0]} and k = ${modes[1]} tie for the maximum (${probPctText(row[mode], 2)}); take the smaller, ${mode}.`,
              }
            : {
                zh: `峰在 k = ⌊(n+1)p⌋ = ⌊${fnum((n + 1) * p, 2)}⌋ = ${mode}，此处 P(X = ${mode}) = ${probPctText(row[mode], 2)}。`,
                en: `The mode is ⌊(n+1)p⌋ = ⌊${fnum((n + 1) * p, 2)}⌋ = ${mode}, where P(X = ${mode}) = ${probPctText(row[mode], 2)}.`,
              },
          0.005,
        );
      }
      let cum = 0;
      for (let i = 0; i <= k; i += 1) cum += row[i];
      return makeQuiz(
        params,
        {
          zh: `随机变量 X ~ B(${n}, ${fnum(p, 2)})，求 P(X ≤ ${k})，用百分数作答（保留两位小数）。`,
          en: `For X ~ B(${n}, ${fnum(p, 2)}), find P(X ≤ ${k}) as a percentage (2 decimals).`,
        },
        '%',
        pct(cum),
        {
          zh: `P(X ≤ ${k}) = P(X=0) + … + P(X=${k}) = ${probPctText(cum, 2)}（前 ${k + 1} 根柱子的高之和）。`,
          en: `P(X ≤ ${k}) = P(X=0) + … + P(X=${k}) = ${probPctText(cum, 2)} (the first ${k + 1} bars added up).`,
        },
        0.005,
      );
    });

    defineExams([
      {
        id: 'ex-probability-1',
        modelId: 'probability',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '二项分布', en: 'Binomial probability' },
        params: { n: 10, p: 0.3, k: 3 },
        stem: {
          zh: '某射手每次射击命中目标的概率为 0.3，各次射击相互独立。他射击 10 次，求恰好命中 3 次的概率（用百分数作答，保留两位小数）。',
          en: 'A shooter hits the target with probability 0.3 on each independent shot. After 10 shots, find the probability of exactly 3 hits (as a percentage, 2 decimals).',
        },
        unit: '%',
        answer: 26.68,
        tol: 0.005,
        solution: {
          zh: '设命中次数 X，则 X ~ B(10, 0.3)。P(X = 3) = C(10,3) × 0.3³ × 0.7⁷ = 120 × 0.027 × 0.0823543 ≈ 0.2668 = 26.68%。',
          en: 'Let X be the number of hits: X ~ B(10, 0.3). P(X = 3) = C(10,3)·0.3³·0.7⁷ = 120 × 0.027 × 0.0823543 ≈ 0.2668 = 26.68%.',
        },
      },
      {
        id: 'ex-probability-2',
        modelId: 'probability',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '累计概率', en: 'Cumulative probability' },
        params: { n: 6, p: 0.5, k: 4 },
        stem: {
          zh: '掷一枚均匀硬币 6 次，求正面至少出现 4 次的概率（用百分数作答，保留两位小数）。',
          en: 'A fair coin is tossed 6 times. Find the probability of at least 4 heads (as a percentage, 2 decimals).',
        },
        unit: '%',
        answer: 34.38,
        tol: 0.005,
        solution: {
          zh: 'X ~ B(6, 0.5)，P(X ≥ 4) = P(X=4) + P(X=5) + P(X=6) = (15 + 6 + 1)/64 = 22/64 = 0.34375 = 34.38%。',
          en: 'X ~ B(6, 0.5): P(X ≥ 4) = P(4)+P(5)+P(6) = (15+6+1)/64 = 22/64 = 0.34375 = 34.38%.',
        },
      },
      {
        id: 'ex-probability-3',
        modelId: 'probability',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '期望与方差', en: 'Mean and variance' },
        params: { n: 20, p: 0.3, k: 6 },
        stem: {
          zh: '某元件在某段时间内发生故障的概率为 0.3，且各元件相互独立。现有 20 个这样的元件，记发生故障的元件数为 X，求 D(X)。',
          en: 'Each of 20 independent components fails in a given period with probability 0.3. Let X be the number of failures; find D(X).',
        },
        unit: '',
        answer: 4.2,
        tol: 0.005,
        solution: {
          zh: 'X ~ B(20, 0.3)，D(X) = np(1−p) = 20 × 0.3 × 0.7 = 4.2。',
          en: 'X ~ B(20, 0.3), so D(X) = np(1−p) = 20 × 0.3 × 0.7 = 4.2.',
        },
      },
    ]);

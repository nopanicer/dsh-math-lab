    // ---------------------------------------------------------------------------
    // 模型 · 排列组合与二项式定理（高三）
    // ---------------------------------------------------------------------------

    /** 上标数字：7 → ⁷，10 → ¹⁰ */
    function binomialSup(value) {
      const map = '⁰¹²³⁴⁵⁶⁷⁸⁹';
      return String(value)
        .split('')
        .map((ch) => map[Number(ch)] || ch)
        .join('');
    }

    /** 杨辉三角第 n 行：C(n,0) … C(n,n) */
    function binomialRow(n) {
      const row = [];
      for (let k = 0; k <= n; k += 1) row.push(binom(n, k));
      return row;
    }

    /** 排列数 A(n,k) = n(n−1)…(n−k+1) */
    function binomialPerm(n, k) {
      let out = 1;
      for (let i = 0; i < k; i += 1) out *= n - i;
      return out;
    }

    /** (x+1)ⁿ 里含 xᵏ 的项：C(n,k)xᵏ（系数为 1 时省略） */
    function binomialTermText(n, k) {
      const c = binom(n, k);
      if (k === 0) return String(c);
      const coef = c === 1 ? '' : String(c);
      return `${coef}x${k === 1 ? '' : binomialSup(k)}`;
    }

    defineModel({
      id: 'binomial',
      grade: 3,
      name: { zh: '排列组合与二项式定理', en: 'Binomial theorem & Pascal’s triangle' },
      formula: {
        zh: '(x + 1)ⁿ = Σ C(n,k)·xᵏ　·　C(n,k) = n!/(k!(n−k)!)　·　A(n,k) = n!/(n−k)!',
        en: '(x+1)ⁿ = Σ C(n,k)·xᵏ · C(n,k) = n!/(k!(n−k)!) · A(n,k) = n!/(n−k)!',
      },
      hint: {
        zh: '杨辉三角第 n 行就是 (x+1)ⁿ 的二项式系数：C(n,k) 表示从 n 个里选 k 个。每个数等于肩上的两数之和，整行关于中间对称、总和是 2ⁿ。A(n,k) 比 C(n,k) 多乘了 k!，因为选出来还要排队。',
        en: 'Row n of Pascal’s triangle is the coefficient list of (x+1)ⁿ: C(n,k) counts choosing k of n. Each entry is the sum of the two above it, the row is symmetric and sums to 2ⁿ. A(n,k) is C(n,k) times k! because the chosen items can be ordered.',
      },
      chartLabel: { zh: 'C(n,k)', en: 'C(n,k)' },
      timeline: {
        zh: '动画：k 从 0 扫到目标 k，杨辉三角与系数柱同步高亮',
        en: 'Animation: k sweeps 0 → target, highlighting both Pascal’s triangle and the coefficient bars',
      },
      // 三角 + 柱状图是复合图，没有单一坐标系，自己排版（noAxes）
      noAxes: true,
      params: [
        { key: 'n', label: { zh: '行数 n', en: 'Row n' }, min: 3, max: 10, step: 1, init: 6, unit: '', digits: 0 },
        { key: 'k', label: { zh: '目标 k（超过 n 时截到 n）', en: 'Target k (clamped to n)' }, min: 0, max: 10, step: 1, init: 3, unit: '', digits: 0 },
      ],
      box(p) {
        const n = Math.max(1, Math.round(p.n));
        return { xMin: -1, xMax: n + 1, yMin: 0, yMax: 1 };
      },
      duration() {
        return 4.4;
      },
      state(t, p) {
        const n = Math.round(p.n);
        const row = binomialRow(n);
        const target = Math.min(Math.max(0, Math.round(p.k)), n);
        const total = this.duration(p);
        const tt = clamp(t, 0, total);
        const progress = total > 0 ? tt / total : 1;
        const k = Math.min(target, Math.round(target * progress));
        const coeff = row[k];
        const perm = binomialPerm(n, k);
        const totalSum = Math.pow(2, n);
        const half = Math.floor(n / 2);
        const maxCoeff = row[half];
        const maxText = n % 2 === 0 ? `C(${n},${half})` : `C(${n},${half}) = C(${n},${half + 1})`;
        const term = binomialTermText(n, k);

        const peakAt = n % 2 === 0 ? `${half}` : `${half}、${half + 1}`;
        const onPeak = k === half || (n % 2 === 1 && k === half + 1);
        let summary;
        if (onPeak) {
          summary =
            n % 2 === 0
              ? {
                  zh: `k = ${half} 正好是整行的对称中心：C(${n},${half}) = ${maxCoeff} 是最大系数，两边 C(${n},${half}±i) 成对相等。`,
                  en: `k = ${half} is the centre of the row: C(${n},${half}) = ${maxCoeff} is the largest coefficient and the entries pair up on both sides.`,
                }
              : {
                  zh: `n = ${n} 是奇数，中间两项 k = ${half} 与 ${half + 1} 并列最大，C(${n},${half}) = ${maxCoeff}，两边成对相等。`,
                  en: `With odd n = ${n} the two middle terms k = ${half} and ${half + 1} tie for the maximum, C(${n},${half}) = ${maxCoeff}, and the row mirrors around the centre.`,
                };
        } else if (k < half) {
          summary = {
            zh: `还没到中间：往右系数还在增大（C(n,k+1)/C(n,k) = (n−k)/(k+1) > 1），最大在 k = ${peakAt}。`,
            en: `Still left of the centre: the coefficients keep growing to the right (C(n,k+1)/C(n,k) = (n−k)/(k+1) > 1), peaking at k = ${peakAt}.`,
          };
        } else {
          summary = {
            zh: `越过中间后系数开始减小，但 C(${n},${k}) = C(${n},${n - k}) = ${coeff} 与对称位置相等；整行和 = 2^${n} = ${totalSum}。`,
            en: `Past the centre the coefficients shrink, but C(${n},${k}) = C(${n},${n - k}) = ${coeff} matches its mirror; the full row sums to 2^${n} = ${totalSum}.`,
          };
        }

        return {
          t: tt,
          n,
          k,
          row,
          coeff,
          perm,
          term,
          half,
          maxCoeff,
          maxText,
          totalSum,
          progress,
          summary,
          chartValue: coeff,
          rows: [
            { label: { zh: '当前 k', en: 'Current k' }, value: `k = ${k}` },
            { label: { zh: '组合数 C(n,k)', en: 'Combination C(n,k)' }, value: `C(${n},${k}) = ${coeff}` },
            { label: { zh: '排列数 A(n,k)', en: 'Permutation A(n,k)' }, value: `A(${n},${k}) = ${perm}` },
            { label: { zh: `(x+1)${binomialSup(n)} 中含 x${binomialSup(k)} 的项`, en: `Term in x${binomialSup(k)}` }, value: term },
            { label: { zh: '系数和 2ⁿ', en: 'Coefficient sum 2ⁿ' }, value: `2${binomialSup(n)} = ${totalSum}` },
            { label: { zh: '最大系数', en: 'Largest coefficient' }, value: `${maxText} = ${maxCoeff}` },
          ],
        };
      },
      draw(ctx, st, view, pal, opts, p) {
        const w = view.width;
        const h = view.height;
        const n = st.n;
        const row = st.row;
        const maxCoeff = Math.max(1, st.maxCoeff);
        const padX = w < 420 ? 18 : 28;
        const tight = h < 340;
        const triTop = 40;
        const triBottom = Math.round(h * (tight ? 0.44 : 0.5));
        const base = h - 30;
        const barsTop = Math.min(triBottom + 40, base - 70);

        // ---- 顶部标题 ----
        ctx.save();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.font = `600 12px ${FONT_UI}`;
        ctx.fillStyle = pal.text;
        const titleText = L({ zh: '杨辉三角', en: 'Pascal’s triangle' });
        ctx.fillText(titleText, padX, 16);
        const titleW = ctx.measureText(titleText).width;
        ctx.font = `500 10px ${FONT_UI}`;
        ctx.fillStyle = pal.muted;
        ctx.textAlign = 'right';
        ctx.fillText(`${L({ zh: '系数和', en: 'row sum' })} 2${binomialSup(n)} = ${st.totalSum}`, w - padX, 16);
        ctx.textAlign = 'left';
        ctx.fillStyle = pal.muted;
        ctx.fillText(`(x + 1)${binomialSup(n)}`, padX + titleW + 14, 17);
        ctx.restore();

        // ---- 杨辉三角：行距、字号、横距 ----
        const triH = Math.max(40, triBottom - triTop);
        const rowsWanted = Math.max(3, Math.min(n + 1, Math.floor(triH / 15)));
        const startRow = n + 1 - rowsWanted;
        const dy = Math.min(40, triH / rowsWanted);
        const triOffset = Math.max(0, (triH - rowsWanted * dy) * 0.5);
        const dx = Math.min(46, (w - padX * 2 - 16) / Math.max(n, 1));
        const font = clamp(Math.min(dy * 0.52, dx * 0.5), 7.5, 12);
        const cx = w / 2;
        const rowY = (r) => triBottom - triOffset - (n - r) * dy - dy * 0.5;

        if (startRow > 0) {
          ctx.save();
          ctx.font = `600 ${font}px ${FONT_UI}`;
          ctx.fillStyle = pal.muted;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⋮', cx, rowY(startRow) - dy * 0.9);
          ctx.restore();
        }

        const triangle = [];
        for (let r = 0; r <= n; r += 1) triangle.push(binomialRow(r));
        for (let r = Math.max(0, startRow); r <= n; r += 1) {
          const y = rowY(r);
          const isLast = r === n;
          if (isLast) {
            const halfW = (r * dx) / 2 + dx * 0.56;
            ctx.save();
            ctx.fillStyle = pal.area;
            roundRect(ctx, cx - halfW, y - dy * 0.38, halfW * 2, dy * 0.76, 6);
            ctx.fill();
            ctx.restore();
          }
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `${isLast ? 600 : 500} ${isLast ? font : font * 0.92}px ${FONT_UI}`;
          for (let c = 0; c <= r; c += 1) {
            const x = cx + (c - r / 2) * dx;
            if (isLast && c === st.k) {
              const boxW = Math.max(font * 2.1, 22);
              const boxH = font * 1.5;
              ctx.fillStyle = pal.point;
              roundRect(ctx, x - boxW / 2, y - boxH / 2, boxW, boxH, boxH / 2);
              ctx.fill();
              ctx.fillStyle = pal.dot;
            } else {
              ctx.fillStyle = isLast ? pal.text : pal.muted;
            }
            ctx.fillText(String(triangle[r][c]), x, y + 0.5);
          }
          ctx.restore();
        }

        // ---- 柱状图标题 ----
        ctx.save();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.font = `500 10px ${FONT_UI}`;
        ctx.fillStyle = pal.muted;
        ctx.fillText(L({ zh: '二项式系数 C(n,k)', en: 'Binomial coefficients C(n,k)' }), padX, barsTop - 14);
        if (w >= 470) {
          ctx.textAlign = 'right';
          ctx.fillStyle = pal.point;
          ctx.fillText(`${L({ zh: '当前项', en: 'term' })} ${st.term}`, w - padX, barsTop - 14);
        }
        ctx.restore();

        // ---- 柱状图 ----
        const barLeft = padX + 6;
        const barRight = w - padX;
        const step = Math.max(6, (barRight - barLeft) / (n + 1));
        const barW = Math.max(4, step * 0.68);
        const barArea = Math.max(30, base - barsTop);
        ctx.save();
        ctx.strokeStyle = pal.axis;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(barLeft, base);
        ctx.lineTo(barRight, base);
        ctx.stroke();
        ctx.restore();

        for (let k = 0; k <= n; k += 1) {
          const left = barLeft + k * step + (step - barW) / 2;
          const hgt = Math.max(row[k] > 0 ? 1.5 : 0, (row[k] / maxCoeff) * barArea);
          ctx.save();
          ctx.fillStyle = k === st.k ? pal.point : pal.curve;
          ctx.globalAlpha = k === st.k ? 1 : 0.38;
          ctx.fillRect(left, base - hgt, barW, hgt);
          ctx.restore();
        }

        // 最大系数的柱子用虚线框提示
        if (st.k !== st.half) {
          const left = barLeft + st.half * step + (step - barW) / 2;
          ctx.save();
          ctx.strokeStyle = pal.curve3;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(left, base - barArea, barW, barArea);
          ctx.restore();
        }

        // 当前柱描边
        {
          const left = barLeft + st.k * step + (step - barW) / 2;
          const hgt = Math.max(1.5, (row[st.k] / maxCoeff) * barArea);
          ctx.save();
          ctx.strokeStyle = pal.tangent;
          ctx.lineWidth = 1.4;
          ctx.strokeRect(left, base - hgt, barW, hgt);
          ctx.restore();
        }

        // ---- 柱顶数值与底部 k 刻度 ----
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.font = `500 9.5px ${FONT_UI}`;
        for (let k = 0; k <= n; k += 1) {
          const centre = barLeft + k * step + step / 2;
          const showValue = step >= 26 || k === st.k || k === st.half;
          if (showValue) {
            ctx.fillStyle = k === st.k ? pal.tangent : pal.muted;
            ctx.fillText(String(row[k]), centre, base - Math.max(1.5, (row[k] / maxCoeff) * barArea) - 4);
          }
        }
        ctx.textBaseline = 'top';
        ctx.font = `500 10px ${FONT_UI}`;
        const every = step >= 19 ? 1 : Math.ceil(19 / step);
        for (let k = 0; k <= n; k += 1) {
          if (k % every !== 0 && k !== n && k !== st.k) continue;
          ctx.fillStyle = k === st.k ? pal.tangent : pal.muted;
          ctx.fillText(String(k), barLeft + k * step + step / 2, base + 7);
        }
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.font = `600 10px ${FONT_UI}`;
        ctx.fillStyle = pal.muted;
        ctx.fillText('k', barRight + 3, base + 12);
        ctx.restore();
      },
    });

    defineLesson('binomial', {
      lesson: {
        zh: '杨辉三角的每一行就是 (x+1)ⁿ 展开式的系数。行的第 k 个数是 C(n,k) = n!/(k!(n−k)!)，它数的是“从 n 个里选出 k 个”的方案数；如果选出来还要排队，就再乘 k!，得到排列数 A(n,k) = n!/(n−k)!。整行关于中间对称，因为“选 k 个”和“留 n−k 个”是一一对应的；整行加起来是 2ⁿ。',
        en: 'Each row of Pascal’s triangle lists the coefficients of (x+1)ⁿ. The k-th entry is C(n,k) = n!/(k!(n−k)!), the number of ways to choose k of n; if the chosen items are then ordered, multiply by k! to get A(n,k) = n!/(n−k)!. The row is symmetric because choosing k is the same as leaving n−k, and the row sums to 2ⁿ.',
      },
      steps: [
        { at: 0, zh: 'k = 0 时只有“一个都不选”这一种方案，C(n,0) = 1，柱子最矮；三角每行两端的 1 就是这个意思。', en: 'At k = 0 there is only the empty choice, C(n,0) = 1 — the shortest bar and the 1 at each end of the triangle.' },
        { at: 0.28, zh: 'k 增大，C(n,k) 迅速变大：从 n 个里选 k 个的方案数在中间最多。每个数都是肩上两数之和。', en: 'As k grows, C(n,k) grows fast: the number of k-subsets is largest in the middle. Each entry is the sum of the two above it.' },
        { at: 0.6, zh: '峰在 k = ⌊n/2⌋ 处；n 为奇数时中间两个数相等，因此柱状图有两个一样高的峰。', en: 'The peak is at k = ⌊n/2⌋; for odd n the two middle entries are equal, so the bars have two equal peaks.' },
        { at: 0.85, zh: '过峰后系数成对下降：C(n,k) = C(n,n−k)。整行和 = (1+1)ⁿ = 2ⁿ，这也解释了二项式系数之和。', en: 'Past the peak the coefficients fall in mirror pairs: C(n,k) = C(n,n−k). The row sums to (1+1)ⁿ = 2ⁿ, which is why the binomial coefficients add up to 2ⁿ.' },
      ],
    });

    defineQuiz('binomial', (rng) => {
      const n = rnum(rng, 4, 9, 1);
      const k = rnum(rng, 1, n, 1);
      const params = { n, k };
      const kind = Math.floor(rng() * 4);

      if (kind === 0) {
        return makeQuiz(
          params,
          { zh: `求组合数 C(${n},${k}) 的值。`, en: `Find the combination C(${n},${k}).` },
          '',
          binom(n, k),
          {
            zh: `C(${n},${k}) = ${n}!/(${k}!·${n - k}!) = ${binom(n, k)}。`,
            en: `C(${n},${k}) = ${n}!/(${k}!·${n - k}!) = ${binom(n, k)}.`,
          },
          0.005,
        );
      }
      if (kind === 1) {
        const factors = [];
        for (let i = 0; i < k; i += 1) factors.push(n - i);
        const chain = factors.join('×');
        return makeQuiz(
          params,
          { zh: `求排列数 A(${n},${k}) 的值。`, en: `Find the permutation A(${n},${k}).` },
          '',
          binomialPerm(n, k),
          {
            zh: `A(${n},${k}) = ${chain} = ${binomialPerm(n, k)}（也可用 C(${n},${k})×${k}! = ${binom(n, k)}×${factorial(k)}）。`,
            en: `A(${n},${k}) = ${chain} = ${binomialPerm(n, k)} (= C(${n},${k}) × ${k}! = ${binom(n, k)}×${factorial(k)}).`,
          },
          0.005,
        );
      }
      if (kind === 2) {
        return makeQuiz(
          params,
          {
            zh: `(x + 1)${binomialSup(n)} 的展开式中，含 x${binomialSup(k)} 的项的系数是多少？`,
            en: `In the expansion of (x + 1)${binomialSup(n)}, what is the coefficient of x${binomialSup(k)}?`,
          },
          '',
          binom(n, k),
          {
            zh: `第 k 项是 C(${n},${k})·x${binomialSup(k)}·1${binomialSup(n - k)}，所以系数为 C(${n},${k}) = ${binom(n, k)}。`,
            en: `The term is C(${n},${k})·x${binomialSup(k)}, so the coefficient is C(${n},${k}) = ${binom(n, k)}.`,
          },
          0.005,
        );
      }
      return makeQuiz(
        params,
        {
          zh: `求 (x + 1)${binomialSup(n)} 展开式各项系数之和。`,
          en: `Find the sum of all coefficients in the expansion of (x + 1)${binomialSup(n)}.`,
        },
        '',
        Math.pow(2, n),
        {
          zh: `令 x = 1：各项系数之和 = (1+1)${binomialSup(n)} = 2${binomialSup(n)} = ${Math.pow(2, n)}（也就是杨辉三角第 ${n} 行之和）。`,
          en: `Set x = 1: the coefficient sum is (1+1)${binomialSup(n)} = 2${binomialSup(n)} = ${Math.pow(2, n)} — row ${n} of Pascal’s triangle added up.`,
        },
        0.005,
      );
    });

    defineExams([
      {
        id: 'ex-binomial-1',
        modelId: 'binomial',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '二项展开系数', en: 'Binomial coefficient' },
        params: { n: 5, k: 2 },
        stem: {
          zh: '求 (x + 1)⁵ 的展开式中 x² 的系数。',
          en: 'Find the coefficient of x² in the expansion of (x + 1)⁵.',
        },
        unit: '',
        answer: 10,
        tol: 0.005,
        solution: {
          zh: '展开式的第 k 项为 C(5,k)·xᵏ，令 k = 2 得系数 C(5,2) = 5!/(2!·3!) = 10。',
          en: 'The term is C(5,k)xᵏ; with k = 2 the coefficient is C(5,2) = 5!/(2!·3!) = 10.',
        },
      },
      {
        id: 'ex-binomial-2',
        modelId: 'binomial',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '组合数计算', en: 'Combination' },
        params: { n: 8, k: 3 },
        stem: {
          zh: '从 8 名同学中选出 3 名参加座谈会，共有多少种不同的选法？',
          en: 'In how many ways can 3 students be chosen from 8 for a seminar?',
        },
        unit: '',
        answer: 56,
        tol: 0.005,
        solution: {
          zh: '选人不排序，用组合数：C(8,3) = 8!/(3!·5!) = (8×7×6)/(3×2×1) = 56 种。',
          en: 'Order does not matter, so use C(8,3) = 8!/(3!·5!) = (8×7×6)/(3×2×1) = 56.',
        },
      },
      {
        id: 'ex-binomial-3',
        modelId: 'binomial',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '系数和', en: 'Sum of coefficients' },
        params: { n: 6, k: 3 },
        stem: {
          zh: '求 (x + 1)⁶ 的展开式各项系数之和。',
          en: 'Find the sum of all coefficients in the expansion of (x + 1)⁶.',
        },
        unit: '',
        answer: 64,
        tol: 0.005,
        solution: {
          zh: '令 x = 1，展开式变成 (1+1)⁶ = 2⁶ = 64，正好是杨辉三角第 6 行之和。',
          en: 'Set x = 1: the expansion becomes (1+1)⁶ = 2⁶ = 64 — the sum of row 6 of Pascal’s triangle.',
        },
      },
    ]);

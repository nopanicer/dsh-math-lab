    // ---------------------------------------------------------------------------
    // 模型 · 函数零点与二分法（高三）
    // ---------------------------------------------------------------------------

    /** 二分法：返回每一步的区间，[0] 是初始区间 */
    function zroBisect(f, lo0, hi0, n) {
      const chain = [[lo0, hi0]];
      let lo = lo0;
      let hi = hi0;
      let flo = f(lo);
      for (let i = 0; i < n; i += 1) {
        const mid = (lo + hi) / 2;
        const fm = f(mid);
        if (!isFinite(fm)) break;
        if (flo === 0) break;
        if (flo * fm <= 0) {
          hi = mid;
        } else {
          lo = mid;
          flo = fm;
        }
        chain.push([lo, hi]);
      }
      return chain;
    }

    /** 零点的函数表：每个 f 都有自己的初始区间与视野 */
    const zroFns = [
      {
        value: 'cubic',
        label: { zh: 'x³ − 2x − 5', en: 'x³ − 2x − 5' },
        expr: 'f(x) = x³ − 2x − 5',
        f: (x) => x * x * x - 2 * x - 5,
        lo: 2,
        hi: 3,
        root: 2.094551481542327,
        box: { xMin: 0, xMax: 4, yMin: -1.24, yMax: 1.24 },
      },
      {
        value: 'sqrt2',
        label: { zh: 'x² − 2（求 √2）', en: 'x² − 2' },
        expr: 'f(x) = x² − 2',
        f: (x) => x * x - 2,
        lo: 1,
        hi: 2,
        root: Math.SQRT2,
        box: { xMin: -0.3, xMax: 2.9, yMin: -0.99, yMax: 0.99 },
      },
      {
        value: 'log',
        label: { zh: 'ln x + x − 3', en: 'ln x + x − 3' },
        expr: 'f(x) = ln x + x − 3',
        f: (x) => (x > 0 ? Math.log(x) + x - 3 : NaN),
        lo: 2,
        hi: 3,
        root: 2.207940031569323,
        box: { xMin: 0, xMax: 4, yMin: -1.24, yMax: 1.24 },
      },
      {
        value: 'exp',
        label: { zh: 'eˣ − 3x', en: 'eˣ − 3x' },
        expr: 'f(x) = eˣ − 3x',
        f: (x) => Math.exp(x) - 3 * x,
        lo: 0,
        hi: 1,
        root: 0.6190612867359451,
        box: { xMin: -1.1, xMax: 2.1, yMin: -0.99, yMax: 0.99 },
      },
    ];

    function zroPick(value) {
      return zroFns.find((item) => item.value === value) || zroFns[0];
    }

    /** f(a)、f(b) 的符号文字 */
    function zroSign(v) {
      if (!isFinite(v)) return '—';
      if (Math.abs(v) < 1e-9) return '0';
      return v > 0 ? '+' : '−';
    }

    defineModel({
      id: 'zeros',
      grade: 3,
      name: { zh: '函数零点与二分法', en: 'Zeros and bisection' },
      formula: { zh: 'f(a)·f(b) < 0 ⇒ 存在零点；每次取中点 m，保留含零点的半区间，区间长度减半', en: 'f(a)·f(b) < 0 ⇒ a zero exists; keep the half containing it, so the interval halves each step' },
      hint: {
        zh: '零点存在定理只保证“有”，二分法把它变成“准”：只要 f(a) 与 f(b) 异号，[a,b] 里就至少有一个零点。取中点 m 算出 f(m)，哪一半两端异号就把另一半扔掉。每次迭代区间长度减半，误差上界也就是长度本身——所以 10 次迭代能把 1 的区间压到 0.001 以内。',
        en: 'If f(a) and f(b) have opposite signs, a zero lies between them. Test the midpoint and keep the half with the sign change: the interval halves every step, so its length is the error bound.',
      },
      chartLabel: { zh: '精确位数 −log₁₀(区间长)', en: 'Correct digits −log₁₀(length)' },
      timeline: { zh: '动画：逐次二分，区间一步步收缩到零点', en: 'Animation: the bracket shrinks step by step' },
      params: [
        {
          key: 'fn',
          label: { zh: '函数 f(x)', en: 'Function f(x)' },
          kind: 'select',
          init: 'cubic',
          options: zroFns.map((item) => ({ value: item.value, label: item.label })),
        },
        { key: 'iters', label: { zh: '迭代次数', en: 'Iterations' }, min: 1, max: 12, step: 1, init: 5, unit: '', digits: 0 },
      ],
      // 视野只由初始区间 [a₀, b₀] 决定，动画中固定不动（y 轴必须在画面内，否则面板的刻度会被裁掉）：
      // 区间带在这块固定取景框里逐步收缩，长短对比才看得出来。
      box(p) {
        return zroPick(p.fn).box;
      },
      duration() {
        return 6;
      },
      playback: 6,
      state(t, p) {
        const def = zroPick(p.fn);
        const total = this.duration(p);
        const prog = clamp(total > 0 ? t / total : 1, 0, 1);
        const n = Math.round(clamp(p.iters, 1, 12));
        const chain = zroBisect(def.f, def.lo, def.hi, n);
        // 动画：k 从 0 连续长到 n，整数部分表示已经完成的迭代
        const kf = prog * n;
        const k = Math.min(chain.length - 1, Math.floor(kf + 1e-9));
        const [lo, hi] = chain[k];
        const prev = k > 0 ? chain[k - 1] : null;
        const mid = (lo + hi) / 2;
        const fMid = def.f(mid);
        const fLo = def.f(lo);
        const fHi = def.f(hi);
        const length = hi - lo;
        const digits = length > 0 ? Math.abs(-Math.log10(length)) < 1e-12 ? 0 : -Math.log10(length) : 0;

        return {
          t: prog * total,
          prog,
          kf,
          k,
          n,
          lo,
          hi,
          prev,
          mid,
          fMid,
          fLo,
          fHi,
          root: def.root,
          def,
          expr: def.expr,
          summary: {
            zh: `第 ${k} 次迭代：区间 [${fnum(lo, 4)}, ${fnum(hi, 4)}]，长度 ${fnum(length, 4)}；中点 m = ${fnum(mid, 4)}，f(m) = ${fnum(fMid, 3)}。零点真值 x* ≈ ${fnum(def.root, 4)}。`,
            en: `Step ${k}: the bracket is [${fnum(lo, 4)}, ${fnum(hi, 4)}] with length ${fnum(length, 4)}; m = ${fnum(mid, 4)}, f(m) = ${fnum(fMid, 3)}.`,
          },
          chartValue: isFinite(digits) ? digits : 0,
          rows: [
            {
              label: { zh: '当前区间 [a, b]', en: 'Bracket [a, b]' },
              value: `[${fnum(lo, 4)}, ${fnum(hi, 4)}]`,
            },
            { label: { zh: '区间长度 b − a', en: 'Length b − a' }, value: fnum(length, 4) },
            { label: { zh: '中点 m', en: 'Midpoint m' }, value: fnum(mid, 4) },
            {
              label: { zh: 'f(a)、f(b) 符号', en: 'Signs of f(a), f(b)' },
              value: `${zroSign(fLo)} 与 ${zroSign(fHi)}（异号）`,
            },
            { label: { zh: '中点函数值 f(m)', en: 'f(m)' }, value: fnum(fMid, 3) },
            {
              label: { zh: '误差上界 (b − a)/2', en: 'Error bound (b − a)/2' },
              value: fnum(length / 2, 4),
            },
            {
              label: { zh: '零点真值 x*', en: 'Exact zero x*' },
              value: fnum(def.root, 5),
            },
          ],
        };
      },
      draw(ctx, st, view, pal, opts, p) {
        const def = st.def;
        const spanY = view.y1 - view.y0;
        const below = -spanY * 0.055;

        // 曲线：把远离视野的值夹住，避免把画布撑成一条竖直长线（视野外的部分本来也看不见）
        const yLoClip = view.y0 - spanY * 2;
        const yHiClip = view.y1 + spanY * 2;
        const shown = (x) => {
          const y = def.f(x);
          return isFinite(y) ? clamp(y, yLoClip, yHiClip) : y;
        };
        plotFunction(ctx, view, pal, shown, { color: pal.curve, width: 2.3 });


        // 上一轮的区间（淡紫色，能看出“扔掉了一半”）
        if (st.prev) {
          regionWorld(
            ctx,
            view,
            [
              [st.prev[0], view.y0],
              [st.prev[1], view.y0],
              [st.prev[1], view.y1],
              [st.prev[0], view.y1],
            ],
            pal.shade,
          );
        }
        // 当前区间
        regionWorld(
          ctx,
          view,
          [
            [st.lo, view.y0],
            [st.hi, view.y0],
            [st.hi, view.y1],
            [st.lo, view.y1],
          ],
          pal.area2,
        );
        segmentWorld(ctx, view, st.lo, view.y0, st.lo, view.y1, pal.point, 1.6);
        segmentWorld(ctx, view, st.hi, view.y0, st.hi, view.y1, pal.point, 1.6);

        // 零点真值（画在区间带之上，区间再窄也看得见）
        segmentWorld(ctx, view, def.root, view.y0, def.root, view.y1, pal.curve3, 1.3, [6, 5]);
        setChip(pal.chip);
        labelWorld(ctx, view, `x* ≈ ${fnum(def.root, 4)}`, def.root, view.y0 + spanY * 0.07, pal.curve3, 'center', 10);
        setChip(null);

        // 顶部标尺：初始区间的长度固定在这里，当前区间带与它对比就能读出「收缩了多少」
        const rulerY = view.y1 - spanY * 0.055;
        segmentWorld(ctx, view, def.lo, rulerY, def.hi, rulerY, pal.muted, 1.2, [3, 4]);
        segmentWorld(ctx, view, def.lo, rulerY - spanY * 0.035, def.lo, rulerY + spanY * 0.035, pal.muted, 1.2);
        segmentWorld(ctx, view, def.hi, rulerY - spanY * 0.035, def.hi, rulerY + spanY * 0.035, pal.muted, 1.2);

        // 中点：竖线 + 曲线上的点
        segmentWorld(ctx, view, st.mid, view.y0, st.mid, view.y1, pal.tangent, 1.4, [4, 4]);
        if (isFinite(st.fMid) && st.fMid > view.y0 && st.fMid < view.y1) dotWorld(ctx, view, st.mid, st.fMid, pal.tangent, 4.2);
        dotWorld(ctx, view, st.mid, 0, pal.tangent, 3.6);

        // 端点读数：a 写在线左侧、b 写在线右侧，区间再窄也不会挤在一起
        setChip(pal.chip);
        const sideOff = (view.x1 - view.x0) * 0.012;
        labelWorld(ctx, view, 'a', st.lo - sideOff, below, pal.point, 'right', 11);
        labelWorld(ctx, view, 'b', st.hi + sideOff, below, pal.point, 'left', 11);
        labelWorld(ctx, view, 'm', st.mid + sideOff, -below * 0.85, pal.tangent, 'left', 11);
        setChip(null);

        // 左上角信息块：函数、初始区间、当前迭代
        setChip(pal.chip);
        const textX = view.x0 + (view.x1 - view.x0) * 0.1;
        const textY = view.y1 - spanY * 0.09;
        labelWorld(ctx, view, def.expr, textX, textY, pal.text, 'left', 11);
        labelWorld(
          ctx,
          view,
          `a = ${fnum(st.lo, 5)}　b = ${fnum(st.hi, 5)}`,
          textX,
          textY - spanY * 0.075,
          pal.point,
          'left',
          10,
        );
        labelWorld(
          ctx,
          view,
          L({ zh: `第 ${st.k} 步 · 区间长 ${fnum(st.hi - st.lo, 4)}`, en: `step ${st.k} · length ${fnum(st.hi - st.lo, 4)}` }),
          textX,
          textY - spanY * 0.15,
          pal.tangent,
          'left',
          10,
        );
        setChip(null);
      },
    });

    defineLesson('zeros', {
      lesson: {
        zh: '零点存在定理：如果 f 在 [a,b] 上连续且 f(a)·f(b) < 0，那么 (a,b) 内至少有一个零点。二分法不猜、只判断：取中点 m，算 f(m)，它必须和 f(a)、f(b) 中的一个异号，把同号的那一半扔掉，零点被关在剩下的一半里。区间长度每次减半，所以迭代 n 次后误差不超过 (b−a)/2ⁿ——这就是为什么二分法慢但一定收敛。',
        en: 'The existence theorem says a sign change guarantees a zero. Bisection never guesses: evaluate the midpoint, keep the half where the signs still differ, and the length halves each time, so after n steps the error is at most (b−a)/2ⁿ.',
      },
      steps: [
        {
          at: 0,
          zh: '先看两端：f(a) 与 f(b) 异号，所以曲线一定穿过了 x 轴，零点就在这段橙色区间里。这就是“存在性”的来源。',
          en: 'The endpoints have opposite signs, so the curve must cross the axis inside the orange bracket — that is the existence theorem.',
        },
        {
          at: 0.2,
          zh: '取中点 m 并算出 f(m)。符号没有变的那一半（紫色）被扔掉，零点一定在保留的那一半里。',
          en: 'Take the midpoint m and evaluate f(m); discard the half whose endpoints keep the same sign (purple), so the zero stays in the kept half.',
        },
        {
          at: 0.55,
          zh: '每迭代一次，区间长度减半，误差上界也跟着减半。读数里的“精确位数”就是 −log₁₀(区间长)：大约每 3 次迭代多一位十进制精度。',
          en: 'Each step halves the length, hence the error bound. The digits readout is −log₁₀(length): about one decimal digit per 3.3 iterations.',
        },
        {
          at: 0.82,
          zh: '多迭代几次后，橙色区间窄到几乎看不见，中点已经很接近零点真值（青色虚线）。每一步只靠一个符号就砍掉一半，跟函数弯成什么样无关——这就是二分法“慢但一定收敛”的原因。',
          en: 'After enough steps the bracket is a thin sliver and the midpoint sits close to the exact zero. Each step uses one sign to discard half, whatever the curve looks like: slow but guaranteed.',
        },
      ],
    });

    defineQuiz('zeros', (rng) => {
      const def = rpick(rng, zroFns);
      const iters = rpick(rng, [3, 4, 5, 6]);
      const span = def.hi - def.lo;
      const params = { fn: def.value, iters };
      const kind = Math.floor(rng() * 3);
      const chain = zroBisect(def.f, def.lo, def.hi, iters);
      if (kind === 0) {
        const target = rpick(rng, [0.5, 0.1, 0.05, 0.01]);
        const need = Math.ceil(Math.log2(span / target) - 1e-9);
        return makeQuiz(
          params,
          {
            zh: `用二分法求 ${def.expr} 在 [${fnum(def.lo, 1)}, ${fnum(def.hi, 1)}] 内的零点，要使区间长度小于 ${target}，至少需要迭代几次？`,
            en: `Bisection on ${def.expr} over [${fnum(def.lo, 1)}, ${fnum(def.hi, 1)}]: how many steps are needed so the interval is shorter than ${target}?`,
          },
          '',
          need,
          {
            zh: `每迭代一次长度减半：需要 (${fnum(span, 2)})/2ⁿ < ${target}，即 2ⁿ > ${fnum(span / target, 1)}，n ≥ ${need}。`,
            en: `Length after n steps is ${fnum(span, 2)}/2ⁿ < ${target}, so 2ⁿ > ${fnum(span / target, 1)} and n ≥ ${need}.`,
          },
          1e-9,
        );
      }
      if (kind === 1) {
        const [lo, hi] = chain[chain.length - 1];
        return makeQuiz(
          params,
          {
            zh: `用二分法求 ${def.expr} 在 [${fnum(def.lo, 1)}, ${fnum(def.hi, 1)}] 内的零点，第 ${iters} 次迭代后区间的长度是多少？`,
            en: `Bisection on ${def.expr} over [${fnum(def.lo, 1)}, ${fnum(def.hi, 1)}]: what is the interval length after ${iters} steps?`,
          },
          '',
          hi - lo,
          {
            zh: `长度为初始长度的 1/2^${iters}：${fnum(span, 2)} / ${Math.pow(2, iters)} = ${fnum(hi - lo, 5)}。`,
            en: `The length is ${fnum(span, 2)}/2^${iters} = ${fnum(hi - lo, 5)}.`,
          },
          0.01,
        );
      }
      return makeQuiz(
        params,
        {
          zh: `用二分法求 ${def.expr} 在 [${fnum(def.lo, 1)}, ${fnum(def.hi, 1)}] 内的零点，第 ${iters} 次迭代后区间的中点是多少？（保留两位小数）`,
          en: `Bisection on ${def.expr} over [${fnum(def.lo, 1)}, ${fnum(def.hi, 1)}]: what is the midpoint after ${iters} steps? (2 dp)`,
        },
        '',
        (chain[chain.length - 1][0] + chain[chain.length - 1][1]) / 2,
        {
          zh: `每一步的区间是：${chain
            .map(([l, h]) => `[${fnum(l, 4)}, ${fnum(h, 4)}]`)
            .join(' → ')}，所以第 ${iters} 次的中点约为 ${fnum((chain[chain.length - 1][0] + chain[chain.length - 1][1]) / 2, 4)}。`,
          en: `The brackets are ${chain.map(([l, h]) => `[${fnum(l, 4)}, ${fnum(h, 4)}]`).join(' → ')}, so the final midpoint is about ${fnum((chain[chain.length - 1][0] + chain[chain.length - 1][1]) / 2, 4)}.`,
        },
        0.02,
      );
    });

    defineExams([
      {
        id: 'ex-zeros-1',
        modelId: 'zeros',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '二分法求近似解', en: 'Bisection' },
        params: { fn: 'cubic', iters: 6 },
        stem: {
          zh: '用二分法求方程 x³ − 2x − 5 = 0 在区间 (2, 3) 内的近似解（精确到 0.01）。',
          en: 'Use bisection to solve x³ − 2x − 5 = 0 on (2, 3), accurate to 0.01.',
        },
        unit: '',
        answer: 2.09,
        tol: 0.01,
        solution: {
          zh: 'f(2) = −1 < 0，f(3) = 16 > 0。取中点：f(2.5) ≈ 5.63 > 0 ⇒ 区间缩到 [2, 2.5]；f(2.25) ≈ 1.39 > 0 ⇒ [2, 2.25]；f(2.125) ≈ 0.34 > 0 ⇒ [2, 2.125]；f(2.0625) ≈ −0.35 < 0 ⇒ [2.0625, 2.125]；f(2.09375) ≈ −0.008 < 0 ⇒ [2.09375, 2.125]；再一步得 [2.09375, 2.109375]。区间长度已小于 0.01，取中点约 2.10，精确到 0.01 为 2.09（真值 2.0946）。',
          en: 'f(2) < 0 < f(3). Repeated bisection narrows the bracket to about [2.094, 2.109], whose midpoint is ≈ 2.10, i.e. 2.09 to two decimals (exact value 2.0946).',
        },
      },
      {
        id: 'ex-zeros-2',
        modelId: 'zeros',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '二分法的精度', en: 'Bisection accuracy' },
        params: { fn: 'sqrt2', iters: 5 },
        stem: {
          zh: '用二分法求 x² − 2 = 0 在区间 (1, 2) 内的根，要使所得近似根的误差不超过 0.05，至少要迭代几次？',
          en: 'For bisection on x² − 2 = 0 over (1, 2), how many steps are needed so the error is at most 0.05?',
        },
        unit: '',
        answer: 5,
        tol: 1e-9,
        solution: {
          zh: '第 n 次迭代后区间长为 1/2ⁿ，取中点作近似值，误差不超过区间长的一半，但按“误差 ≤ 区间长”估计：要 1/2ⁿ < 0.05，即 2ⁿ > 20，n ≥ 5。（严格按误差 ≤ 半长，(1/2ⁿ)/2 ≤ 0.05 也得 n ≥ 4，考试通常按区间长度 0.05 这个口径算 5 次。）',
          en: 'After n steps the interval is 1/2ⁿ; requiring 1/2ⁿ < 0.05 gives 2ⁿ > 20, so n ≥ 5.',
        },
      },
    ]);

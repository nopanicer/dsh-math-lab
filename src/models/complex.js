    // ---------------------------------------------------------------------------
    // 模型 · 复数与复平面（高三）
    // ---------------------------------------------------------------------------

    /** 复数 a + bi 的课本写法：'1.5 − 0.87i'、'1.73 + i' */
    function cplxFmt(re, im) {
      const eps = 5e-3;
      const ri = fnum(re, 2).replace(/^-(?=[\d.])/, '−');
      const ai = Math.abs(im);
      const ia = Math.abs(ai - 1) < eps ? '' : fnum(ai, 2);
      if (ai < eps) return ri;
      if (Math.abs(re) < eps) return `${im < 0 ? '−' : ''}${ia}i`;
      return `${ri} ${im < 0 ? '−' : '+'} ${ia}i`;
    }

    /** 模 + 辐角（度）→ 实部 / 虚部 */
    function cplxFromPolar(mod, deg) {
      const rad = deg * DEG;
      return { re: mod * Math.cos(rad), im: mod * Math.sin(rad) };
    }

    /** 辐角规范到 [0,360) */
    function cplxDegNorm(deg) {
      const v = ((deg % 360) + 360) % 360;
      return 360 - v < 1e-9 ? 0 : v;
    }

    /** 慢慢转出来：s ∈ [0,1] 的缓动 */
    function cplxEase(s) {
      const x = clamp(s, 0, 1);
      return x * x * (3 - 2 * x);
    }

    defineModel({
      id: 'complex',
      grade: 3,
      name: { zh: '复数与复平面', en: 'Complex numbers on the plane' },
      formula: {
        zh: 'z·w = |z||w|·[cos(θ₁+θ₂) + i·sin(θ₁+θ₂)]　arg(z·w) = θ₁ + θ₂',
        en: 'z·w = |z||w|[cos(θ₁+θ₂) + i sin(θ₁+θ₂)], arg(z·w) = θ₁+θ₂',
      },
      hint: {
        zh: '复数乘法不必先乘开再合并：模相乘、辐角相加。乘 w 就是把 z 绕原点先转 θ₂、再把长度拉成 r₂ 倍。复平面上的点、向量、复数本来就是同一个东西——点旋转，就是复数乘法。',
        en: 'Multiplying by w rotates z by θ₂ and scales it by r₂: moduli multiply, arguments add. A point, a vector and a complex number are the same object in the plane.',
      },
      chartLabel: { zh: '已转过的角 (°)', en: 'Angle swept (°)' },
      timeline: { zh: '动画：先绕原点旋转 θ₂，再按 r₂ 伸缩', en: 'Animation: rotate by θ₂, then scale by r₂' },
      axisLabels: { xLabel: 'Re', yLabel: 'Im' },
      params: [
        { key: 'r1', label: { zh: '|z| 模', en: '|z| modulus' }, min: 0.5, max: 4, step: 0.1, init: 2, unit: '', digits: 1 },
        { key: 'theta1', label: { zh: 'θ₁ 辐角', en: 'θ₁ argument' }, min: 0, max: 360, step: 5, init: 35, unit: '°', digits: 0 },
        { key: 'r2', label: { zh: '|w| 模', en: '|w| modulus' }, min: 0.4, max: 2, step: 0.1, init: 1.5, unit: '', digits: 1 },
        { key: 'theta2', label: { zh: 'θ₂ 辐角', en: 'θ₂ argument' }, min: 0, max: 360, step: 5, init: 75, unit: '°', digits: 0 },
      ],
      box(p) {
        // 画布宽高比 ≈ 1.61：把框也拉成这个比例，图形才填满画布（平面视图等比缩放）
        const reach = Math.max(p.r1, p.r2, p.r1 * p.r2, 1) * 1.16;
        return { xMin: -reach * 1.62, xMax: reach * 1.62, yMin: -reach, yMax: reach };
      },
      duration() {
        return 5.4;
      },
      playback: 5.4,
      loop: true,
      state(t, p) {
        const total = this.duration(p);
        const prog = clamp(total > 0 ? t / total : 1, 0, 1);
        const z = cplxFromPolar(p.r1, p.theta1);
        const w = cplxFromPolar(p.r2, p.theta2);
        const prod = { re: z.re * w.re - z.im * w.im, im: z.re * w.im + z.im * w.re };
        const span = clamp(p.theta2, 0, 360);
        const split = 0.52;
        let swept;
        let modNow;
        if (prog < split) {
          swept = span * cplxEase(prog / split);
          modNow = p.r1;
        } else {
          const s = split < 1 ? (prog - split) / (1 - split) : 1;
          swept = span;
          modNow = p.r1 * (1 + (p.r2 - 1) * cplxEase(s));
        }
        const moving = cplxFromPolar(modNow, p.theta1 + swept);
        const argZ = cplxDegNorm(p.theta1);
        const argW = cplxDegNorm(p.theta2);
        const argProd = cplxDegNorm(p.theta1 + p.theta2);
        const sum = p.theta1 + p.theta2;
        const sumText =
          Math.abs(sum - argProd) > 0.5
            ? `${fnum(p.theta1, 0)}° + ${fnum(p.theta2, 0)}° = ${fnum(sum, 0)}° ≡ ${fnum(argProd, 0)}°`
            : `${fnum(p.theta1, 0)}° + ${fnum(p.theta2, 0)}° = ${fnum(argProd, 0)}°`;

        let summary;
        if (span > 359) {
          summary = {
            zh: `θ₂ = 360°：转一整圈又回到原处，所以 z·w 与 z 同向，只是长度乘了 r₂ = ${fnum(p.r2, 2)}（辐角按 360° 取模）。`,
            en: 'θ₂ = 360°: a full turn brings the argument back to θ₁, so z·w is collinear with z but scaled by r₂.',
          };
        } else if (prog < split) {
          summary = {
            zh: `乘法先看旋转：|z| 不变，辐角从 ${fnum(argZ, 0)}° 扫向 ${fnum(argProd, 0)}°，这一步就是在乘单位复数 cosθ₂ + i·sinθ₂。`,
            en: 'Rotation first: |z| is unchanged while the argument sweeps from θ₁ to θ₁+θ₂.',
          };
        } else if (Math.abs(modNow - p.r1 * p.r2) < 1e-6) {
          summary = {
            zh: `到位：|z·w| = |z|·|w| = ${fnum(p.r1, 2)} × ${fnum(p.r2, 2)} = ${fnum(p.r1 * p.r2, 2)}，arg(z·w) = θ₁ + θ₂。`,
            en: `Done: |z·w| = |z||w| and arg(z·w) = θ₁+θ₂.`,
          };
        } else {
          summary = {
            zh: `再缩放：辐角停在 ${fnum(argProd, 0)}°，长度按 r₂ = ${fnum(p.r2, 2)} 伸缩，|z| 从 ${fnum(p.r1, 2)} 变到 ${fnum(p.r1 * p.r2, 2)}。`,
            en: `Then scale: the argument stays at θ₁+θ₂ while the modulus changes by the factor r₂.`,
          };
        }

        return {
          t: prog * total,
          prog,
          z,
          w,
          prod,
          moving,
          swept,
          modNow,
          argZ,
          argW,
          argProd,
          summary,
          chartValue: swept,
          rows: [
            { label: { zh: '复数 z', en: 'z' }, value: cplxFmt(z.re, z.im) },
            { label: { zh: '复数 w', en: 'w' }, value: cplxFmt(w.re, w.im) },
            { label: { zh: '乘积 z·w', en: 'z·w' }, value: cplxFmt(prod.re, prod.im) },
            {
              label: { zh: '模 |z|·|w|', en: '|z|·|w|' },
              value: `${fnum(p.r1, 2)} × ${fnum(p.r2, 2)} = ${fnum(p.r1 * p.r2, 2)}`,
            },
            { label: { zh: '辐角 arg(z·w)', en: 'arg(z·w)' }, value: sumText },
            { label: { zh: '当前乘数', en: 'Multiplier' }, value: `${fnum(modNow / p.r1, 2)}∠${fnum(swept, 0)}°` },
          ],
        };
      },
      draw(ctx, st, view, pal, opts, p) {
        const { z, w, prod, moving } = st;
        const reach = Math.max(view.x1 - view.x0, view.y1 - view.y0);
        const px = (n) => n / view.scale; // 屏幕像素 → 世界长度

        // 单位圆：|z| = 1 的分界
        circleWorld(ctx, view, 0, 0, 1, pal.track, 1.2);

        // 辐角圆弧：z、w、以及从 θ₁ 扫到 θ₁ + θ₂ 的旋转角
        const rZArc = Math.min(Math.max(p.r1 * 0.42, px(26)), reach * 0.3);
        const rWArc = Math.min(Math.max(p.r2 * 0.34, px(20)), reach * 0.26);
        const rSweep = Math.min(Math.max(st.modNow * 0.56, px(34)), reach * 0.5);
        if (st.argZ > 0.5) arcWorld(ctx, view, 0, 0, rZArc, 0, st.argZ * DEG, pal.curve, 1.4, [4, 4]);
        if (st.argW > 0.5) arcWorld(ctx, view, 0, 0, rWArc, 0, st.argW * DEG, pal.curve2, 1.4, [4, 4]);
        if (st.swept > 0.5) {
          // 旋转扫过的扇形：让“转了多大角”一眼可见
          const wedge = [[0, 0]];
          for (let i = 0; i <= 24; i += 1) {
            const a = (p.theta1 + (st.swept * i) / 24) * DEG;
            wedge.push([Math.cos(a) * rSweep, Math.sin(a) * rSweep]);
          }
          regionWorld(ctx, view, wedge, pal.area2);
          arcWorld(ctx, view, 0, 0, rSweep, p.theta1 * DEG, (p.theta1 + st.swept) * DEG, pal.tangent, 1.8);
        }

        // w 向量（紫）
        arrowWorld(ctx, view, 0, 0, w.re, w.im, pal.curve2, 2);
        // 动点向量（红）：先画，起始时与 z 重合，让 z 压在上面
        arrowWorld(ctx, view, 0, 0, moving.re, moving.im, pal.tangent, 2.4);
        // z 向量（蓝）
        arrowWorld(ctx, view, 0, 0, z.re, z.im, pal.curve, 2.2);
        // 目标 z·w（虚线参照 + 实心点）
        segmentWorld(ctx, view, 0, 0, prod.re, prod.im, pal.curve3, 1.6, [5, 5]);
        dotWorld(ctx, view, prod.re, prod.im, pal.curve3, 4.2);
        // 动点本身：始终看得见红点
        dotWorld(ctx, view, moving.re, moving.im, pal.tangent, 3.4);

        // 共轭点：只有 z 离开实轴时才画（否则与 z 重合）
        if (opts.aux && Math.abs(z.im) > px(4)) {
          segmentWorld(ctx, view, 0, 0, z.re, -z.im, pal.muted, 1, [2, 4]);
          dotWorld(ctx, view, z.re, -z.im, pal.muted, 3.2);
          labelWorld(ctx, view, 'z̄', z.re + (z.re >= 0 ? px(12) : -px(12)), -z.im - px(12), pal.muted, 'center', 10);
        }

        // 顶点标签：一律离开尖端 ≥ 8px，三个标签分别朝上 / 朝下 / 沿半径外，互不重叠
        const tip = (cx, cy, text, color, size, side) => {
          const d = Math.hypot(cx, cy) || 1;
          const off = px(15);
          const ux = cx / d;
          const uy = cy / d;
          // 垂直于向量的方向（屏幕向上优先，side=-1 时朝下）
          let nx = -uy;
          let ny = ux;
          if (ny < 0) {
            nx = -nx;
            ny = -ny;
          }
          const nxo = nx * side;
          const nyo = ny * side;
          const radial = side === 0 ? 1.15 : 0.55;
          const perp = side === 0 ? 0 : 1;
          labelWorld(
            ctx,
            view,
            text,
            cx + ux * off * radial + nxo * off * perp,
            cy + uy * off * radial + nyo * off * perp,
            color,
            'center',
            size || 11,
          );
        };
        tip(z.re, z.im, 'z', pal.curve, 13, 1);
        tip(w.re, w.im, 'w', pal.curve2, 13, -1);
        tip(prod.re, prod.im, 'z·w', pal.curve3, 13, 0);

        // 复数的实部、虚部在轴上留个投影
        if (opts.aux) {
          segmentWorld(ctx, view, prod.re, prod.im, prod.re, 0, pal.muted, 1, [3, 4]);
          segmentWorld(ctx, view, prod.re, prod.im, 0, prod.im, pal.muted, 1, [3, 4]);
        }

        // 左上角：把乘法的两条结论写在画面上
        setChip(pal.chip);
        const textX = view.x0 + (view.x1 - view.x0) * 0.03;
        const textY = view.y1 - (view.y1 - view.y0) * 0.06;
        labelWorld(ctx, view, `z·w = ${cplxFmt(prod.re, prod.im)}`, textX, textY, pal.text, 'left', 11);
        labelWorld(
          ctx,
          view,
          L({ zh: '模相乘、辐角相加', en: 'moduli multiply, arguments add' }),
          textX,
          textY - px(19),
          pal.muted,
          'left',
          10,
        );
        labelWorld(
          ctx,
          view,
          `${L({ zh: '已转', en: 'swept' })} ${fnum(st.swept, 0)}° / θ₂ = ${fnum(p.theta2, 0)}°`,
          textX,
          textY - px(38),
          pal.tangent,
          'left',
          10,
        );
        setChip(null);
      },
    });

    defineLesson('complex', {
      lesson: {
        zh: '把复数 a + bi 看成平面上的点 (a, b)：模 |z| 是它到原点的距离，辐角 arg z 是它和正实轴的夹角。于是 z = |z|(cosθ + i·sinθ)。两个复数相乘时，把两个三角式乘开、用和角公式合并，立刻得到 |z·w| = |z||w|、arg(z·w) = θ₁ + θ₂：长度相乘，角度相加。这正是“乘一个复数 = 旋转 + 缩放”，也是复数能描述平面旋转的原因。',
        en: 'Read a + bi as the point (a, b): modulus = distance from the origin, argument = angle with the positive real axis. Multiplying the two polar forms and using the addition formulas gives |z·w| = |z||w| and arg(z·w) = θ₁+θ₂ — lengths multiply, angles add. Multiplying by a complex number is exactly a rotation plus a scaling.',
      },
      steps: [
        {
          at: 0,
          zh: '先认出三个点：z（蓝，模 2、辐角 60°）、w（紫，模 1.5、辐角 45°），以及虚线指出的目标 z·w。单位圆把 |z| > 1 和 |z| < 1 分开。',
          en: 'Meet the three points: z (blue), w (purple), and the dashed target z·w. The unit circle separates |z| > 1 from |z| < 1.',
        },
        {
          at: 0.24,
          zh: '第一阶段只旋转：红色向量长度保持 |z|，辐角从 θ₁ 扫到 θ₁ + θ₂。这一步相当于乘了单位复数 cosθ₂ + i·sinθ₂，红弧标出的就是 θ₂。',
          en: 'Stage one is pure rotation: the red vector keeps its length |z| while its argument sweeps to θ₁+θ₂ — multiplying by the unit complex number cosθ₂ + i·sinθ₂.',
        },
        {
          at: 0.55,
          zh: '第二阶段只缩放：角度不再变，长度乘上 r₂ = |w|。原来的 |z| 变成 |z||w|，红箭头的尖端正好落在虚线目标的端点。',
          en: 'Stage two is pure scaling: the argument is frozen and the length is multiplied by r₂ = |w|, so the tip lands on the dashed target.',
        },
        {
          at: 0.8,
          zh: '到位后的读数：|z·w| = |z||w| = 3，arg(z·w) = 60° + 45° = 105°。共轭点 z̄ 与 z 关于实轴对称，因为取共轭只把辐角变成 −θ。',
          en: 'The readings: |z·w| = |z||w| = 3 and arg(z·w) = 60° + 45° = 105°. The conjugate z̄ is the mirror image across the real axis.',
        },
      ],
    });

    defineQuiz('complex', (rng) => {
      const r1 = rpick(rng, [1, 1.5, 2, 2.5, 3, 4]);
      const r2 = rpick(rng, [0.5, 1, 1.5, 2]);
      const t1 = rpick(rng, [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330]);
      const t2 = rpick(rng, [0, 30, 45, 60, 90, 120, 135, 180, 225, 270, 315]);
      const params = { r1, theta1: t1, r2, theta2: t2 };
      const z = cplxFromPolar(r1, t1);
      const w = cplxFromPolar(r2, t2);
      const prod = { re: z.re * w.re - z.im * w.im, im: z.re * w.im + z.im * w.re };
      const argProd = cplxDegNorm(t1 + t2);
      const polar = (mod, deg) =>
        `${Math.abs(mod - 1) < 1e-9 ? '' : `${fnum(mod, 2)}·`}(cos${fnum(deg, 0)}° + i·sin${fnum(deg, 0)}°)`;
      const zText = polar(r1, t1);
      const wText = polar(r2, t2);
      const kind = Math.floor(rng() * 4);
      const rad = (t1 + t2) * DEG;

      if (kind === 0) {
        return makeQuiz(
          params,
          { zh: `设 z = ${zText}，w = ${wText}，求 |z·w|。`, en: `Let z = ${zText}, w = ${wText}. Find |z·w|.` },
          '',
          r1 * r2,
          {
            zh: `模相乘：|z·w| = |z|·|w| = ${fnum(r1, 2)} × ${fnum(r2, 2)} = ${fnum(r1 * r2, 2)}。`,
            en: `|z·w| = |z||w| = ${fnum(r1, 2)} × ${fnum(r2, 2)} = ${fnum(r1 * r2, 2)}.`,
          },
          0.01,
        );
      }
      if (kind === 1) {
        return makeQuiz(
          params,
          {
            zh: `设 z = ${zText}，w = ${wText}，求 arg(z·w)（用角度制，写 0°–360° 之间的值）。`,
            en: `Let z = ${zText}, w = ${wText}. Find arg(z·w) in degrees, between 0° and 360°.`,
          },
          '°',
          argProd,
          {
            zh: `辐角相加：arg(z·w) = ${fnum(t1, 0)}° + ${fnum(t2, 0)}° = ${fnum(t1 + t2, 0)}°${
              Math.abs(t1 + t2 - argProd) > 0.5 ? `，再模 360° 得 ${fnum(argProd, 0)}°` : ''
            }。`,
            en: `arg(z·w) = θ₁ + θ₂ = ${fnum(t1 + t2, 0)}°${Math.abs(t1 + t2 - argProd) > 0.5 ? ` ≡ ${fnum(argProd, 0)}° (mod 360°)` : ''}.`,
          },
          0.01,
        );
      }
      if (kind === 2) {
        return makeQuiz(
          params,
          { zh: `设 z = ${zText}，w = ${wText}，求 z·w 的实部。`, en: `Let z = ${zText}, w = ${wText}. Find the real part of z·w.` },
          '',
          prod.re,
          {
            zh: `|z·w| = ${fnum(r1 * r2, 2)}，arg(z·w) = ${fnum(argProd, 0)}°，所以实部 = ${fnum(r1 * r2, 2)}·cos${fnum(argProd, 0)}° = ${fnum(prod.re, 2)}。`,
            en: `|z·w| = ${fnum(r1 * r2, 2)} at ${fnum(argProd, 0)}°, so Re = ${fnum(prod.re, 2)}.`,
          },
          0.01,
        );
      }
      return makeQuiz(
        params,
        {
          zh: `设 z = ${zText}，w = ${wText}，求 cos[arg(z·w)]。`,
          en: `Let z = ${zText}, w = ${wText}. Find cos[arg(z·w)].`,
        },
        '',
        Math.cos(rad),
        {
          zh: `arg(z·w) = ${fnum(argProd, 0)}°，直接取余弦：cos${fnum(argProd, 0)}° = ${fnum(Math.cos(rad), 3)}。`,
          en: `arg(z·w) = ${fnum(argProd, 0)}°, so the cosine is ${fnum(Math.cos(rad), 3)}.`,
        },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-complex-1',
        modelId: 'complex',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '复数乘法的模', en: 'Modulus of a product' },
        params: { r1: 1.414, theta1: 45, r2: 2, theta2: 30 },
        stem: {
          zh: '设 z = 1 + i，w = √3 + i。求 |z·w|。',
          en: 'Let z = 1 + i and w = √3 + i. Find |z·w|.',
        },
        unit: '',
        answer: 2 * Math.SQRT2,
        tol: 0.005,
        solution: {
          zh: '|z| = √2，|w| = √(3 + 1) = 2，由模相乘得 |z·w| = 2√2 ≈ 2.828。顺带：arg z = 45°、arg w = 30°，所以 arg(z·w) = 75°。',
          en: '|z| = √2 and |w| = 2, so |z·w| = 2√2 ≈ 2.828. Also arg z = 45°, arg w = 30°, hence arg(z·w) = 75°.',
        },
      },
      {
        id: 'ex-complex-2',
        modelId: 'complex',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '共轭与乘法', en: 'Conjugates' },
        params: { r1: 1.414, theta1: 45, r2: 1.414, theta2: 315 },
        stem: {
          zh: '设 z = 1 + i，w = 1 − i。求 z·w 的实部。',
          en: 'Let z = 1 + i and w = 1 − i. Find the real part of z·w.',
        },
        unit: '',
        answer: 2,
        tol: 0.005,
        solution: {
          zh: '直接乘：(1 + i)(1 − i) = 1 − i² = 2，实部为 2、虚部为 0。用极式看更直接：|z| = |w| = √2，辐角 45° 与 −45° 相加为 0，所以 z·w = √2·√2 = 2 是实数——互为共轭的两个复数相乘得模的平方。',
          en: '(1+i)(1−i) = 1 − i² = 2, so the real part is 2. In polar form the arguments 45° and −45° add to 0, so the product is the real number |z|².',
        },
      },
    ]);

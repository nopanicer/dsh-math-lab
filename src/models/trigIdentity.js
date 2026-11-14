    // ---------------------------------------------------------------------------
    // 模型 · 三角恒等与单位圆：sin(α + β) 的几何意义（高一）
    // ---------------------------------------------------------------------------

    function trigIdentityDuration() {
      return 6;
    }

    let trigIdentitySeriesCache = null;

    /** 副图：sin(α + β(t))，β 从 0 连续增大到参数值 */
    function trigIdentityChartSeries(p) {
      const key = `${p.alpha}|${p.beta}`;
      if (trigIdentitySeriesCache && trigIdentitySeriesCache.key === key) return trigIdentitySeriesCache.series;
      const total = trigIdentityDuration();
      const al = Number(p.alpha) * DEG;
      const be = Number(p.beta) * DEG;
      const pts = [];
      for (let i = 0; i <= 96; i += 1) {
        const u = i / 96;
        pts.push({ t: total * u, v: Math.sin(al + be * u) });
      }
      const series = { total, pts };
      trigIdentitySeriesCache = { key, series };
      return series;
    }

    defineModel({
      id: 'trigIdentity',
      grade: 1,
      name: { zh: '三角恒等与单位圆', en: 'Angle addition on the unit circle' },
      formula: { zh: 'sin(α + β) = sinα·cosβ + cosα·sinβ　cos(α + β) = cosα·cosβ − sinα·sinβ', en: 'sin(α+β) = sinαcosβ + cosαsinβ, cos(α+β) = cosαcosβ − sinαsinβ' },
      hint: {
        zh: '“和角”不是在凑公式：把 α 的终边当新横轴，β 的斜边长度是 1，于是沿 α 方向走 cosβ、再垂直走 sinβ 就到 P。两段位移的竖直分量相加，正好是 sinα·cosβ + cosα·sinβ = sin(α+β)。',
        en: 'The addition formula is pure geometry: use the α terminal side as a new axis; the hypotenuse has length 1, so walk cosβ along α, then sinβ perpendicular to reach P. The two vertical components add up to sinαcosβ + cosαsinβ = sin(α+β).',
      },
      timeline: { zh: '动画：β 从 0 连续增大到参数值，终边扫过、读数实时更新', en: 'Animation: β grows from 0 to its value, the terminal side sweeps, readings update live' },
      params: [
        { key: 'alpha', label: { zh: '角 α', en: 'Angle α' }, min: 0, max: 80, step: 5, init: 35, unit: '°', digits: 0 },
        { key: 'beta', label: { zh: '角 β', en: 'Angle β' }, min: 0, max: 80, step: 5, init: 40, unit: '°', digits: 0 },
      ],
      box() {
        // 单位圆画在左边，右边留给公式卡片
        return { xMin: -1.18, xMax: 2.0, yMin: -1.25, yMax: 1.25 };
      },
      duration() {
        return trigIdentityDuration();
      },
      state(t, p) {
        const total = trigIdentityDuration();
        const u = clamp(t / total, 0, 1);
        const al = Number(p.alpha) * DEG;
        const beParam = Number(p.beta) * DEG;
        const be = beParam * u;
        const sum = al + be;
        const sinA = Math.sin(al);
        const cosA = Math.cos(al);
        const sinB = Math.sin(be);
        const cosB = Math.cos(be);
        const sinS = Math.sin(sum);
        const cosS = Math.cos(sum);
        const term1 = sinA * cosB;
        const term2 = cosA * sinB;

        return {
          t: Math.min(Math.max(t, 0), total),
          u,
          al,
          be,
          beParam,
          sum,
          sinA,
          cosA,
          sinB,
          cosB,
          sinS,
          cosS,
          term1,
          term2,
          rows: [
            { label: { zh: 'sin α / cos α', en: 'sin α / cos α' }, value: `${fnum(sinA, 3)} / ${fnum(cosA, 3)}` },
            { label: { zh: 'sin β / cos β', en: 'sin β / cos β' }, value: `${fnum(sinB, 3)} / ${fnum(cosB, 3)}` },
            { label: { zh: 'sin(α + β)', en: 'sin(α + β)' }, value: fnum(sinS, 3) },
            { label: { zh: 'cos(α + β)', en: 'cos(α + β)' }, value: fnum(cosS, 3) },
            { label: { zh: '第一项 sinα·cosβ', en: 'Term 1 sinα·cosβ' }, value: fnum(term1, 3) },
            { label: { zh: '第二项 cosα·sinβ', en: 'Term 2 cosα·sinβ' }, value: fnum(term2, 3) },
            { label: { zh: '两项之和（= sin(α+β)）', en: 'Sum of terms (= sin(α+β))' }, value: fnum(term1 + term2, 3) },
          ],
          summary: {
            zh: `sin(${fnum((p.alpha * 1 + (be * 180) / PI), 1)}°) = sinαcosβ + cosαsinβ = ${fnum(term1, 3)} + ${fnum(term2, 3)} = ${fnum(term1 + term2, 3)}：两个直角三角形的竖直边正好拼成 P 的高度。`,
            en: `sin(α+β) = sinαcosβ + cosαsinβ = ${fnum(term1, 3)} + ${fnum(term2, 3)} = ${fnum(term1 + term2, 3)}: the two vertical legs stack into the height of P.`,
          },
          chartValue: isFinite(sinS) ? sinS : 0,
        };
      },
      drawChart(ctx, width, height, st, p, pal) {
        drawChart(ctx, width, height, trigIdentityChartSeries(p), pal, st.t, L({ zh: 'sin(α + β)', en: 'sin(α + β)' }));
      },
      draw(ctx, st, view, pal, opts, p) {
        const pxW = 1 / view.scale;
        const al = st.al;
        const be = st.be;
        const sum = al + be;
        const ux = Math.cos(al);
        const uy = Math.sin(al);
        const vx = -uy; // α 终边的单位法向（逆时针 90°）
        const vy = ux;
        const ax = ux; // A = (cos α, sin α)
        const ay = uy;
        const px = Math.cos(sum); // P = (cos(α+β), sin(α+β))
        const py = Math.sin(sum);
        const t1x = Math.cos(be) * ux; // T1 = cosβ · u
        const t1y = Math.cos(be) * uy;

        // 单位圆与两条终边
        circleWorld(ctx, view, 0, 0, 1, pal.muted, 1.3);
        segmentWorld(ctx, view, 0, 0, ax, ay, pal.curve, 2);
        segmentWorld(ctx, view, 0, 0, px, py, pal.curve2, 2);

        // 两个直角三角形：O-T1-P（∠O = β，斜边 1）与 O-(0,t1y)-T1（∠O = α）
        segmentWorld(ctx, view, 0, 0, t1x, t1y, pal.curve3, 3);
        segmentWorld(ctx, view, t1x, t1y, px, py, pal.point, 3);
        if (opts.aux) {
          segmentWorld(ctx, view, t1x, t1y, 0, t1y, pal.curve3, 1.2, [3, 4]);
          segmentWorld(ctx, view, px, py, px, 0, pal.muted, 1.1, [3, 4]);
          segmentWorld(ctx, view, px, py, 0, py, pal.muted, 1.1, [3, 4]);
          rightAngle(ctx, view, t1x, t1y, [-ux, -uy], [vx, vy], pal.muted, 9);
          rightAngle(ctx, view, 0, t1y, [1, 0], [0, 1], pal.muted, 8);
        }

        // 角弧：α 从 0 到 α，β 从 α 到 α+β
        if (al > 1e-3) arcWorld(ctx, view, 0, 0, 0.26, 0, al, pal.curve, 1.5);
        if (be > 1e-3) arcWorld(ctx, view, 0, 0, 0.5, al, sum, pal.curve2, 1.5);

        // 关键点
        dotWorld(ctx, view, ax, ay, pal.curve, 3.6);
        dotWorld(ctx, view, px, py, pal.curve2, 4.2);
        dotWorld(ctx, view, t1x, t1y, pal.curve3, 3.2);
        if (opts.aux) {
          dotWorld(ctx, view, 0, t1y, pal.curve3, 2.6);
          dotWorld(ctx, view, px, 0, pal.muted, 2.2);
          dotWorld(ctx, view, 0, py, pal.muted, 2.2);
        }

        // 角标签
        if (al > 1e-3) labelWorld(ctx, view, 'α', Math.cos(al / 2) * 0.15, Math.sin(al / 2) * 0.15, pal.curve, 'center', 11);
        if (be > 1e-3) labelWorld(ctx, view, 'β', Math.cos((al + sum) / 2) * 0.4, Math.sin((al + sum) / 2) * 0.4, pal.curve2, 'center', 11);
        if (be > 0.05) labelWorld(ctx, view, 'A', ax * 1.1, ay * 1.1 + 0.07, pal.curve, 'center', 11);
        labelWorld(ctx, view, 'P', px * 1.12, py * 1.12 + 0.06, pal.curve2, 'center', 11);

        // 两条腿的长度标签：cosβ 沿 α 终边，sinβ 与之垂直；腿太短就不标，避免糊成一团
        if (Math.cos(be) > 0.3) {
          labelWorld(ctx, view, `cosβ = ${fnum(Math.cos(be), 3)}`, t1x * 0.5 - vx * 0.08, t1y * 0.5 - vy * 0.08, pal.curve3, 'center', 10);
        }
        if (Math.sin(be) > 0.3) {
          labelWorld(ctx, view, `sinβ = ${fnum(Math.sin(be), 3)}`, (t1x + px) / 2 - ux * 0.07, (t1y + py) / 2 - uy * 0.07, pal.point, 'center', 10);
        }

        // P 的投影：竖直分量就是 sin(α+β)，它被 y = t1y 分成两段
        if (opts.aux) {
          const flip = px < 0;
          labelWorld(ctx, view, `sin(α+β) = ${fnum(py, 3)}`, px + (flip ? -0.06 : 0.06), py / 2, pal.text, flip ? 'right' : 'left', 10);
          if (Math.abs(px) > 0.3) labelWorld(ctx, view, `cos(α+β) = ${fnum(px, 3)}`, px / 2, -0.24, pal.text, "center", 10);
          // 往左让开 y 轴刻度数字（它们贴着轴画）
          if (t1y > 0.1) labelWorld(ctx, view, `sinα·cosβ = ${fnum(t1y, 3)}`, -0.28, t1y / 2, pal.curve3, 'right', 9.5);
          if (py - t1y > 0.1) labelWorld(ctx, view, `cosα·sinβ = ${fnum(py - t1y, 3)}`, -0.28, (t1y + py) / 2, pal.point, 'right', 9.5);
        }

        // 右侧公式卡片
        const cardX = 1.2;
        setChip(null);
        labelWorld(ctx, view, 'sin(α+β)', cardX, 0.62, pal.text, 'left', 12);
        labelWorld(ctx, view, '= sinα·cosβ + cosα·sinβ', cardX, 0.44, pal.text, 'left', 10.5);
        setChip(pal.chip);
        labelWorld(ctx, view, `= ${fnum(st.term1, 3)} + ${fnum(st.term2, 3)}`, cardX, 0.26, pal.muted, 'left', 10.5);
        labelWorld(ctx, view, `= ${fnum(st.sinS, 3)}`, cardX, 0.08, pal.curve2, 'left', 11);
        labelWorld(ctx, view, `cos(α+β) = cosαcosβ − sinαsinβ = ${fnum(st.cosS, 3)}`, cardX, -0.3, pal.muted, 'left', 9);
        setChip(null);
      },
    });

    defineLesson('trigIdentity', {
      lesson: {
        zh: '在单位圆上，α 的终边把平面“转”了一次，β 又转一次。把 α 的终边当作新横轴建一个坐标系，P 的斜边 OP = 1，于是 P 可以拆成：沿 α 方向走 cosβ，再垂直走 sinβ。把这两个位移的竖直分量加起来——cosβ·sinα 与 sinβ·cosα——就得到 P 的高度 sin(α+β)。',
        en: 'On the unit circle the terminal side turns by α, then by β again. Take the α side as a new x-axis: since OP = 1, P split into cosβ along that axis plus sinβ perpendicular to it. Adding the vertical components — cosβ·sinα and sinβ·cosα — gives the height of P, sin(α+β).',
      },
      steps: [
        { at: 0, zh: 'β = 0 时 P 与 A 重合，公式退化成 sinα = sinα·1 + cosα·0，两边相等。', en: 'At β = 0, P coincides with A and the formula collapses to sinα = sinα·1 + cosα·0.' },
        { at: 0.3, zh: 'β 增大，P 沿圆周向前走。线段 OT₁ 的长度是 cosβ，T₁P 的长度是 sinβ，二者垂直——这是第一个直角三角形。', en: 'As β grows, P slides along the circle. OT₁ = cosβ and T₁P = sinβ are perpendicular: the first right triangle.' },
        { at: 0.55, zh: '第二个直角三角形 O-(0,t₁y)-T₁ 的竖直边是 sinα·cosβ：它就是 T₁ 的高度，也就是 P 高度的第一段。', en: 'The second right triangle O-(0,t₁y)-T₁ has vertical leg sinα·cosβ — the height of T₁, the first piece of the height of P.' },
        { at: 0.78, zh: '从 T₁ 走到 P 又升高了 cosα·sinβ。两段竖直位移拼起来就是 sin(α+β)，这正是和角公式。', en: 'From T₁ to P the height gains another cosα·sinβ. The two vertical pieces stack into sin(α+β) — that is the addition formula.' },
      ],
    });

    defineQuiz('trigIdentity', (rng) => {
      const al = rpick(rng, [15, 30, 45, 60]);
      const be = rpick(rng, [15, 30, 45, 60]);
      const A = (al * PI) / 180;
      const B = (be * PI) / 180;
      const params = { alpha: al, beta: be };
      const kind = Math.floor(rng() * 3);

      if (kind === 0) {
        const ans = Math.sin(A + B);
        return makeQuiz(
          params,
          { zh: `已知 α = ${al}°，β = ${be}°，求 sin(α + β) 的值（保留三位小数）。`, en: `Given α = ${al}° and β = ${be}°, find sin(α + β).` },
          '',
          ans,
          {
            zh: `sin(α+β) = sin${al}°·cos${be}° + cos${al}°·sin${be}° = ${fnum(Math.sin(A), 3)}×${fnum(Math.cos(B), 3)} + ${fnum(Math.cos(A), 3)}×${fnum(Math.sin(B), 3)} = ${fnum(ans, 3)}`,
            en: `sin(α+β) = sinαcosβ + cosαsinβ = ${fnum(ans, 3)}`,
          },
          0.01,
        );
      }
      if (kind === 1) {
        const ans = Math.cos(A + B);
        return makeQuiz(
          params,
          { zh: `已知 α = ${al}°，β = ${be}°，求 cos(α + β) 的值（保留三位小数）。`, en: `Given α = ${al}° and β = ${be}°, find cos(α + β).` },
          '',
          ans,
          {
            zh: `cos(α+β) = cosα·cosβ − sinα·sinβ = ${fnum(Math.cos(A), 3)}×${fnum(Math.cos(B), 3)} − ${fnum(Math.sin(A), 3)}×${fnum(Math.sin(B), 3)} = ${fnum(ans, 3)}`,
            en: `cos(α+β) = cosαcosβ − sinαsinβ = ${fnum(ans, 3)}`,
          },
          0.01,
        );
      }
      const ans = Math.cos(A - B);
      return makeQuiz(
        params,
        { zh: `已知 α = ${al}°，β = ${be}°，求 cos(α − β) 的值（保留三位小数）。`, en: `Given α = ${al}° and β = ${be}°, find cos(α − β).` },
        '',
        ans,
        {
          zh: `cos(α−β) = cosα·cosβ + sinα·sinβ = ${fnum(Math.cos(A), 3)}×${fnum(Math.cos(B), 3)} + ${fnum(Math.sin(A), 3)}×${fnum(Math.sin(B), 3)} = ${fnum(ans, 3)}`,
          en: `cos(α−β) = cosαcosβ + sinαsinβ = ${fnum(ans, 3)}`,
        },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-trigIdentity-1',
        modelId: 'trigIdentity',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '两角和的正弦', en: 'Sine of a sum' },
        params: { alpha: 45, beta: 30 },
        stem: {
          zh: '利用两角和的正弦公式求 sin75° 的值（保留三位小数）。',
          en: 'Use the addition formula to evaluate sin75° (three decimals).',
        },
        unit: '',
        answer: Math.sin((75 * PI) / 180),
        tol: 0.01,
        solution: {
          zh: 'sin75° = sin(45° + 30°) = sin45°cos30° + cos45°sin30° = (√2/2)(√3/2) + (√2/2)(1/2) = (√6 + √2)/4 ≈ 0.966。',
          en: 'sin75° = sin45°cos30° + cos45°sin30° = (√6 + √2)/4 ≈ 0.966.',
        },
      },
      {
        id: 'ex-trigIdentity-2',
        modelId: 'trigIdentity',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '两角和的余弦', en: 'Cosine of a sum' },
        params: { alpha: 45, beta: 60 },
        stem: {
          zh: '求 cos105° 的值（保留三位小数）。',
          en: 'Evaluate cos105° (three decimals).',
        },
        unit: '',
        answer: Math.cos((105 * PI) / 180),
        tol: 0.01,
        solution: {
          zh: 'cos105° = cos(45° + 60°) = cos45°cos60° − sin45°sin60° = (√2/2)(1/2) − (√2/2)(√3/2) = (√2 − √6)/4 ≈ −0.259。',
          en: 'cos105° = cos45°cos60° − sin45°sin60° = (√2 − √6)/4 ≈ −0.259.',
        },
      },
    ]);

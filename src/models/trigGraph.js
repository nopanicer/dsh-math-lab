    // ---------------------------------------------------------------------------
    // 模型 · 三角函数图像 y = A sin(ωx + φ) + k（高一）
    // ---------------------------------------------------------------------------

    /** ω 兜底：万一被滑到 0 附近，别把周期撑成无穷 */
    function trigGraphOmega(p) {
      const w = Number(p.omega);
      return Math.abs(w) < 1e-3 ? 1e-3 : w;
    }

    /** φ 在参数里以 π 为单位存，这里换成弧度 */
    function trigGraphPhi(p) {
      return Number(p.phi || 0) * PI;
    }

    function trigGraphPeriod(p) {
      return TAU / trigGraphOmega(p);
    }

    /** 相位零点（五点法起点）：ωx + φ = 0 处的 x */
    function trigGraphStart(p) {
      return -trigGraphPhi(p) / trigGraphOmega(p);
    }

    function trigGraphDuration() {
      return 6;
    }

    /** 带符号的 π 项：π/3 → ' + π/3'、−π/2 → ' − π/2' */
    function trigGraphSignedPi(rad) {
      if (Math.abs(rad) < 1e-9) return '';
      return `${rad > 0 ? ' + ' : ' − '}${piText(Math.abs(rad))}`;
    }

    /** 解析式文本：省略系数 1、φ = 0、k = 0 */
    function trigGraphExpr(A, w, phi, k) {
      const amp = Math.abs(Math.abs(A) - 1) < 1e-9 ? (A < 0 ? '−' : '') : `${A < 0 ? '−' : ''}${fnum(Math.abs(A), 2)}`;
      let inner = Math.abs(Math.abs(w) - 1) < 1e-9 ? 'x' : `${fnum(w, 2)}x`;
      if (Math.abs(phi) > 1e-9) inner += `${phi > 0 ? ' + ' : ' − '}${piText(Math.abs(phi))}`;
      const tail = Math.abs(k) > 1e-9 ? `${k > 0 ? ' + ' : ' − '}${fnum(Math.abs(k), 2)}` : '';
      return `y = ${amp}sin(${inner})${tail}`;
    }

    let trigGraphSeriesCache = null;

    /** 副图数据：一个周期内 y 随相位变化（参数不变就复用，避免每帧重算） */
    function trigGraphChartSeries(p) {
      const key = `${p.A}|${p.omega}|${p.phi}|${p.k}`;
      if (trigGraphSeriesCache && trigGraphSeriesCache.key === key) return trigGraphSeriesCache.series;
      const total = trigGraphDuration();
      const pts = [];
      for (let i = 0; i <= 96; i += 1) {
        const u = i / 96;
        pts.push({ t: total * u, v: p.k + p.A * Math.sin(TAU * u) });
      }
      const series = { total, pts };
      trigGraphSeriesCache = { key, series };
      return series;
    }

    defineModel({
      id: 'trigGraph',
      grade: 1,
      name: { zh: '三角函数图像', en: 'Sine graph' },
      formula: { zh: 'y = A sin(ωx + φ) + k　T = 2π/ω　最大值 k + |A|、最小值 k − |A|', en: 'y = A sin(ωx + φ) + k, T = 2π/ω, max k + |A|, min k − |A|' },
      hint: {
        zh: 'A 管“高低”（振幅），ω 管“疏密”（周期 T = 2π/ω），φ 管“左右”（相位零点 x = −φ/ω），k 管“上下”（平衡位置）。五点法就是让相位 ωx + φ 依次取 0、π/2、π、3π/2、2π。',
        en: 'A sets the height (amplitude), ω sets the spacing (T = 2π/ω), φ shifts the graph (zero phase at x = −φ/ω), k moves it up or down. The five-point method runs the phase through 0, π/2, π, 3π/2, 2π.',
      },
      timeline: { zh: '动画：扫描点走完一个周期（相位 0 → 2π）', en: 'Animation: the probe sweeps one period (phase 0 → 2π)' },
      params: [
        { key: 'A', label: { zh: '振幅 A', en: 'Amplitude A' }, min: 0.5, max: 3, step: 0.1, init: 2, unit: '', digits: 1 },
        { key: 'omega', label: { zh: '角频率 ω', en: 'Angular frequency ω' }, min: 0.5, max: 3, step: 0.1, init: 1.5, unit: '', digits: 1 },
        { key: 'phi', label: { zh: '初相 φ', en: 'Phase φ' }, min: -1, max: 1, step: 0.05, init: 0.35, unit: 'π', digits: 2 },
        { key: 'k', label: { zh: '平衡位置 k', en: 'Midline k' }, min: -2, max: 2, step: 0.1, init: 0.5, unit: '', digits: 1 },
      ],
      box(p) {
        const T = trigGraphPeriod(p);
        const xs = trigGraphStart(p);
        const yA = Math.abs(p.A);
        // 横轴：至少含一个完整周期（五点法全部可见），并把 y 轴留在画面里
        return {
          xMin: Math.min(xs - 0.2 * T, -0.3 * T),
          xMax: Math.max(xs + 1.14 * T, 0.3 * T),
          yMin: Math.min(p.k - yA - 0.7, -0.75),
          yMax: Math.max(p.k + yA + 1.66, 0.75),
        };
      },
      duration() {
        return trigGraphDuration();
      },
      state(t, p) {
        const total = trigGraphDuration();
        const T = trigGraphPeriod(p);
        const xs = trigGraphStart(p);
        const u = clamp(t / total, 0, 1);
        const x = xs + T * u;
        const phase = TAU * u; // 由五点法起点起算，正好 0 → 2π
        const y = p.k + p.A * Math.sin(phase);
        const yMax = p.k + Math.abs(p.A);
        const yMin = p.k - Math.abs(p.A);

        return {
          t: Math.min(Math.max(t, 0), total),
          x,
          y,
          phase,
          u,
          T,
          rows: [
            { label: { zh: '周期 T = 2π/ω', en: 'Period T' }, value: fnum(T, 3) },
            { label: { zh: '频率 f = 1/T', en: 'Frequency f' }, value: fnum(1 / T, 3) },
            { label: { zh: '振幅 |A|', en: 'Amplitude |A|' }, value: fnum(Math.abs(p.A), 2) },
            { label: { zh: '最大值 / 最小值', en: 'Max / min' }, value: `${fnum(yMax, 2)} / ${fnum(yMin, 2)}` },
            { label: { zh: '当前相位 ωx + φ', en: 'Phase ωx + φ' }, value: `${piText(phase)} ≈ ${fnum(phase, 2)} rad` },
            { label: { zh: '当前点 P', en: 'Probe P' }, value: `(${fnum(x, 2)}, ${fnum(y, 2)})` },
          ],
          summary: {
            zh: `${trigGraphExpr(p.A, trigGraphOmega(p), trigGraphPhi(p), p.k)}：振幅 ${fnum(Math.abs(p.A), 2)}、周期 ${fnum(T, 2)}、最大值 ${fnum(yMax, 2)}、最小值 ${fnum(yMin, 2)}。`,
            en: `Amplitude ${fnum(Math.abs(p.A), 2)}, period ${fnum(T, 2)}, max ${fnum(yMax, 2)}, min ${fnum(yMin, 2)}.`,
          },
          chartValue: isFinite(y) ? y : 0,
        };
      },
      drawChart(ctx, width, height, st, p, pal) {
        drawChart(ctx, width, height, trigGraphChartSeries(p), pal, st.t, L({ zh: 'y = A sin(ωx + φ) + k', en: 'y = A sin(ωx+φ) + k' }));
      },
      draw(ctx, st, view, pal, opts, p) {
        const A = p.A;
        const w = trigGraphOmega(p);
        const phi = trigGraphPhi(p);
        const k = p.k;
        const T = trigGraphPeriod(p);
        const xs = trigGraphStart(p);
        const yA = Math.abs(A);
        const spanX = view.x1 - view.x0;
        const spanY = view.y1 - view.y0;
        const pxW = 1 / view.scale; // 1 像素 = 多少世界单位，标签偏移统一按像素算，缩放时才不会撞
        const f = (x) => k + A * Math.sin(w * x + phi);

        // 平衡位置 y = k
        segmentWorld(ctx, view, view.x0, k, view.x1, k, pal.muted, 1.2, [5, 5]);
        labelWorld(ctx, view, `y = ${fnum(k, 2)}`, view.x0 + spanX * 0.012, k + 16 * pxW, pal.muted, 'left', 10);

        // 振幅标注：第一个零点左侧的竖双箭头
        const xAmp = xs - 0.075 * T;
        arrowWorld(ctx, view, xAmp, k + A * 0.5, xAmp, k + A, pal.point, 1.3);
        arrowWorld(ctx, view, xAmp, k + A * 0.5, xAmp, k, pal.point, 1.3);
        labelWorld(ctx, view, `A = ${fnum(Math.abs(A), 2)}`, xAmp, k + A + 18 * pxW, pal.point, 'center', 10);

        // 曲线
        plotFunction(ctx, view, pal, f, { color: pal.curve, width: 2.4, samples: 720 });

        // 周期标注：曲线波峰上方（放在曲线后面画，箭头不会盖住线）
        const yT = k + yA + 34 * pxW;
        arrowWorld(ctx, view, xs + T * 0.5, yT, xs, yT, pal.curve2, 1.3);
        arrowWorld(ctx, view, xs + T * 0.5, yT, xs + T, yT, pal.curve2, 1.3);
        labelWorld(ctx, view, `T = ${fnum(T, 2)}`, xs + T * 0.5, yT + 20 * pxW, pal.curve2, 'center', 10);

        // 五点法的五个关键点：相位 0、π/2、π、3π/2、2π 依次对 y = k、k+A、k、k−A、k
        const phases = ['0', 'π/2', 'π', '3π/2', '2π'];
        for (let j = 0; j <= 4; j += 1) {
          const xj = xs + (T * j) / 4;
          const yj = k + A * Math.sin((j * PI) / 2);
          dotWorld(ctx, view, xj, yj, pal.curve3, 3.4);
          // 波峰标签放上方，其余放下方：给扫描点的读数标签让出位置
          labelWorld(ctx, view, phases[j], xj, yj + (j === 1 ? 17 : -16) * pxW, pal.curve3, 'center', 10);
        }

        // 扫描点：竖直虚线表示它离平衡位置多远（就是 A sin(相位)）
        if (opts.aux) {
          segmentWorld(ctx, view, st.x, k, st.x, st.y, pal.tangent, 1.1, [3, 4]);
          dotWorld(ctx, view, st.x, k, pal.tangent, 2.6);
        }
        dotWorld(ctx, view, st.x, st.y, pal.tangent, 4.8);
        setChip(pal.chip);
        const nearRight = view.toX(st.x) > view.width - 116;
        const rel = (st.y - k) / (Math.abs(A) < 1e-6 ? 1 : Math.abs(A)); // = sin(相位)
        const under = rel > 0.12; // 明显在平衡线上方才把读数挂到下面，避开五点标签
        tag(
          ctx,
          `P y = ${fnum(st.y, 2)}`,
          view.toX(st.x) + (nearRight ? -10 : 10),
          view.toY(st.y) + (under ? 14 : -14),
          pal.tangent,
          nearRight ? 'right' : 'left',
          10,
        );
        setChip(null);
        // 解析式角标
        setChip(pal.chip);
        labelWorld(ctx, view, trigGraphExpr(A, w, phi, k), view.x0 + spanX * 0.015, view.y1 - spanY * 0.055, pal.text, 'left', 11);
        setChip(null);
      },
    });

    defineLesson('trigGraph', {
      lesson: {
        zh: 'y = A sin(ωx + φ) + k 有四个旋钮，各管一件事：A 把图像拉高拉低（振幅），ω 把图像横向压缩（周期 T = 2π/ω），φ 让图像左右平移（相位零点 x = −φ/ω），k 把整条曲线上下搬（平衡位置）。五点法不是死记，而是把相位 ωx + φ 依次取 0、π/2、π、3π/2、2π：这五处的正弦值依次是 0、1、0、−1、0。',
        en: 'Four knobs: A stretches the graph vertically (amplitude), ω compresses it horizontally (period T = 2π/ω), φ slides it sideways (zero phase at x = −φ/ω), and k moves it up or down. The five-point method just runs the phase ωx + φ through 0, π/2, π, 3π/2, 2π, where sin takes 0, 1, 0, −1, 0.',
      },
      steps: [
        { at: 0, zh: '相位为 0 时 sin = 0，扫描点落在平衡线 y = k 上，这就是一个周期的起点 x = −φ/ω。', en: 'At phase 0 the graph sits on the midline y = k — the start of a period at x = −φ/ω.' },
        { at: 0.25, zh: '相位到 π/2 时取到最大值 k + |A|：振幅 A 是曲线离平衡线的最大距离，不是最大值本身。', en: 'At phase π/2 the graph peaks at k + |A|: the amplitude is the distance from the midline, not the maximum itself.' },
        { at: 0.5, zh: '相位到 π 时又回到平衡线。前半程上升、后半程下降，正好走完半个波。', en: 'At phase π it is back on the midline — half a wave has passed.' },
        { at: 0.75, zh: '相位到 3π/2 时落到最小值 k − |A|；再走完 2π 就与起点重合，所以 T = 2π/ω。', en: 'At phase 3π/2 it hits the minimum k − |A|; after 2π it repeats, so T = 2π/ω.' },
      ],
    });

    defineQuiz('trigGraph', (rng) => {
      const A = rnum(rng, 1, 3, 0.5);
      const w = rnum(rng, 0.5, 2.5, 0.5);
      const phi = rnum(rng, -1, 1, 0.25);
      const k = rnum(rng, -2, 2, 0.5);
      const T = TAU / w;
      const params = { A, omega: w, phi, k };
      const expr = trigGraphExpr(A, w, phi * PI, k);
      const kind = Math.floor(rng() * 3);

      if (kind === 0) {
        return makeQuiz(
          params,
          { zh: `已知函数 ${expr}，求它的最小正周期 T。`, en: `For ${expr}, find the period T.` },
          '',
          T,
          { zh: `T = 2π/ω = 2π ÷ ${fnum(w, 2)} = ${fnum(T, 3)}`, en: `T = 2π/ω = 2π/${fnum(w, 2)} = ${fnum(T, 3)}` },
          0.01,
        );
      }
      if (kind === 1) {
        const yMax = k + A;
        return makeQuiz(
          params,
          { zh: `已知函数 ${expr}，求它的最大值。`, en: `For ${expr}, find its maximum value.` },
          '',
          yMax,
          { zh: `最大值 = k + |A| = ${fnum(k, 2)} + ${fnum(A, 2)} = ${fnum(yMax, 3)}`, en: `maximum = k + |A| = ${fnum(yMax, 3)}` },
          0.01,
        );
      }
      const x0 = rpick(rng, [PI / 6, PI / 4, PI / 3, PI / 2]);
      const y0 = k + A * Math.sin(w * x0 + phi * PI);
      return makeQuiz(
        params,
        { zh: `已知函数 ${expr}，求 f(${piText(x0)}) 的值。`, en: `For ${expr}, evaluate f(${piText(x0)}).` },
        '',
        y0,
        {
          zh: `ωx + φ = ${fnum(w, 2)} × ${piText(x0)}${trigGraphSignedPi(phi * PI)}，代入 y = k + A sin(ωx + φ) 得 ${fnum(y0, 3)}。`,
          en: `Plug ωx + φ into y = k + A sin(ωx + φ): ${fnum(y0, 3)}.`,
        },
        0.02,
      );
    });

    defineExams([
      {
        id: 'ex-trigGraph-1',
        modelId: 'trigGraph',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '最小正周期', en: 'Period' },
        params: { A: 2, omega: 2, phi: 1 / 3, k: 0 },
        stem: {
          zh: '函数 y = 2sin(2x + π/3) 的最小正周期是多少？',
          en: 'What is the period of y = 2sin(2x + π/3)?',
        },
        unit: '',
        answer: PI,
        tol: 0.01,
        solution: {
          zh: 'T = 2π/ω = 2π/2 = π。周期只看 ω，与 A、φ、k 都无关。',
          en: 'T = 2π/ω = 2π/2 = π. Only ω matters.',
        },
      },
      {
        id: 'ex-trigGraph-2',
        modelId: 'trigGraph',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '最值', en: 'Extremum' },
        params: { A: 2, omega: 2, phi: 1 / 3, k: 1 },
        stem: {
          zh: '函数 y = 2sin(2x + π/3) + 1 的最大值是多少？',
          en: 'What is the maximum of y = 2sin(2x + π/3) + 1?',
        },
        unit: '',
        answer: 3,
        tol: 0.01,
        solution: {
          zh: 'sin 的最大值是 1，所以 y 的最大值 = k + A = 1 + 2 = 3（在 ωx + φ = π/2 处取到）。',
          en: 'sin ≤ 1, so max y = k + A = 1 + 2 = 3.',
        },
      },
    ]);

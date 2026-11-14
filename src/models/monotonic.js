    // ---------------------------------------------------------------------------
    // 模型 10 · 导数与单调性（高二）
    // ---------------------------------------------------------------------------

    /** 把一串 [系数, 变量文字] 拼成 f(x) = … 的右边，省略 1 和 0 */
    function monotonicPolyText(coefs) {
      const parts = [];
      coefs.forEach(([value, symbol]) => {
        if (Math.abs(value) < 1e-9) return;
        const abs = Math.abs(value);
        const num = symbol && Math.abs(abs - 1) < 1e-9 ? '' : fnum(abs, 2);
        parts.push({ sign: value < 0 ? '−' : '+', text: `${num}${symbol}` });
      });
      if (!parts.length) return '0';
      return parts
        .map((part, i) => (i === 0 ? `${part.sign === '−' ? '−' : ''}${part.text}` : ` ${part.sign} ${part.text}`))
        .join('');
    }

    /** f(x) = ax³ + bx² + cx 的结构：导数、临界点、单调区间、极值 */
    function monotonicDerive(p) {
      const a = clamp(Number(p.a) || 0, -2, 2);
      const b = clamp(Number(p.b) || 0, -3, 3);
      const c = clamp(Number(p.c) || 0, -3, 3);
      const f = (x) => a * x * x * x + b * x * x + c * x;
      const df = (x) => 3 * a * x * x + 2 * b * x + c;
      const A = 3 * a;
      const B = 2 * b;
      const C = c;
      const disc = B * B - 4 * A * C;
      let roots = [];
      if (Math.abs(A) > 1e-9) {
        if (disc > 1e-7) {
          const sq = Math.sqrt(disc);
          roots = [(-B - sq) / (2 * A), (-B + sq) / (2 * A)];
        } else if (Math.abs(disc) <= 1e-7) {
          roots = [-B / (2 * A)];
        }
      } else if (Math.abs(B) > 1e-9) {
        roots = [-C / B];
      }
      roots.sort((m, n) => m - n);

      // 每个临界点是不是极值点（左右导数变号）
      const crit = roots.map((r) => {
        const left = df(r - 1e-3);
        const right = df(r + 1e-3);
        let kind = 'flat';
        if (left > 1e-6 && right < -1e-6) kind = 'max';
        else if (left < -1e-6 && right > 1e-6) kind = 'min';
        return { x: r, y: f(r), kind };
      });

      const r1 = roots.length ? fnum(roots[0], 2) : '';
      const r2 = roots.length > 1 ? fnum(roots[1], 2) : '';
      let incText = '—';
      let decText = '—';
      const upTurn = A > 1e-9;
      if (roots.length === 2) {
        const left = `(−∞, ${r1})`;
        const mid = `(${r1}, ${r2})`;
        const right = `(${r2}, +∞)`;
        incText = upTurn ? `${left} ∪ ${right}` : mid;
        decText = upTurn ? mid : `${left} ∪ ${right}`;
      } else if (roots.length === 1) {
        if (Math.abs(A) > 1e-9) {
          if (upTurn) incText = L({ zh: `R（f′ ≥ 0，仅 x = ${r1} 处为 0）`, en: `all ℝ (f′ ≥ 0, zero only at x = ${r1})` });
          else decText = L({ zh: `R（f′ ≤ 0，仅 x = ${r1} 处为 0）`, en: `all ℝ (f′ ≤ 0, zero only at x = ${r1})` });
        } else if (B > 1e-9) {
          incText = `(${r1}, +∞)`;
          decText = `(−∞, ${r1})`;
        } else if (B < -1e-9) {
          incText = `(−∞, ${r1})`;
          decText = `(${r1}, +∞)`;
        }
      } else if (Math.abs(A) <= 1e-9 && Math.abs(B) <= 1e-9) {
        if (C > 1e-9) incText = L({ zh: 'R（f′ = c > 0，严格递增）', en: 'all ℝ (f′ = c > 0)' });
        else if (C < -1e-9) decText = L({ zh: 'R（f′ = c < 0，严格递减）', en: 'all ℝ (f′ = c < 0)' });
        else incText = L({ zh: 'R（f′ = 0，常函数）', en: 'all ℝ (constant)' });
      } else if (A > 1e-9) {
        incText = L({ zh: 'R（f′ ≥ 0，无临界点）', en: 'all ℝ (f′ ≥ 0)' });
      } else if (A < -1e-9) {
        decText = L({ zh: 'R（f′ ≤ 0，无临界点）', en: 'all ℝ (f′ ≤ 0)' });
      }

      const yMid = roots.length ? f((roots[0] + roots[roots.length - 1]) / 2) : f(0);
      return { a, b, c, f, df, A, B, C, disc, roots, crit, incText, decText, yMid };
    }

    /** 副图：导函数 f′(x) 的图像 + 符号着色，和主图共用同一段 x 轴 */
    function monotonicChart(ctx, width, height, st, p, pal) {
      const w = Math.max(80, width);
      const hgt = Math.max(56, height);
      const padL = 20;
      const padR = 14;
      const padT = 18;
      const padB = 18;
      const plotW = Math.max(10, w - padL - padR);
      const plotH = Math.max(10, hgt - padT - padB);
      const d = st.model;
      const xMin = st.viewX0;
      const xMax = st.viewX1;
      // 纵轴以 0 居中：符号图看重的是 f′ 在哪些段为正，而不是它的绝对大小
      let reach = 1.5;
      d.roots.forEach((r) => {
        reach = Math.max(reach, Math.abs(d.df(r)));
      });
      reach = Math.max(reach, Math.abs(d.df(-1.2)), Math.abs(d.df(1.2)));
      if (Math.abs(d.A) > 1e-9) reach = Math.max(reach, Math.abs(d.df(-d.B / (2 * d.A))));
      const K = clamp(1.2 * reach, 2, 60);
      const lo = -K;
      const hi = K;
      const pts = [];
      for (let i = 0; i <= 90; i += 1) {
        const x = xMin + ((xMax - xMin) * i) / 90;
        const y = d.df(x);
        if (!Number.isFinite(y)) continue;
        pts.push({ x, y });
      }
      const toX = (x) => padL + (plotW * (x - xMin)) / Math.max(1e-9, xMax - xMin);
      const toY = (y) => padT + plotH * (1 - (y - lo) / (hi - lo));

      ctx.save();
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, padT, plotW, plotH);
      // 符号底色：把 f′ 曲线与零轴之间的区域按符号填色
      let runStart = 0;
      for (let i = 1; i <= pts.length; i += 1) {
        const sameSign = i < pts.length && (pts[i].y >= 0) === (pts[runStart].y >= 0);
        if (sameSign) continue;
        const run = pts.slice(runStart, i);
        if (run.length > 1) {
          ctx.save();
          ctx.fillStyle = run[0].y >= 0 ? pal.area : pal.area2;
          ctx.beginPath();
          run.forEach((pt, k) => {
            const x = toX(pt.x);
            const y = toY(pt.y);
            if (k === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.lineTo(toX(run[run.length - 1].x), toY(0));
          ctx.lineTo(toX(run[0].x), toY(0));
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        runStart = i;
      }
      // 零轴
      ctx.strokeStyle = pal.axis;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(padL, toY(0));
      ctx.lineTo(padL + plotW, toY(0));
      ctx.stroke();
      // f′ 曲线
      ctx.strokeStyle = pal.curve2;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      pts.forEach((pt, i) => {
        const x = toX(pt.x);
        const y = toY(pt.y);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      // 临界点
      d.roots.forEach((r) => {
        if (r < xMin || r > xMax) return;
        ctx.strokeStyle = pal.muted;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(toX(r), padT);
        ctx.lineTo(toX(r), padT + plotH);
        ctx.stroke();
        ctx.setLineDash([]);
      });
      // 当前扫描位置
      const xNow = toX(st.xScan);
      ctx.strokeStyle = pal.text;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(xNow, padT);
      ctx.lineTo(xNow, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = pal.point;
      ctx.beginPath();
      ctx.arc(xNow, toY(d.df(st.xScan)), 3.4, 0, Math.PI * 2);
      ctx.fill();
      // 文字
      ctx.fillStyle = pal.curve2;
      ctx.font = `500 10px ${FONT_UI}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText("f′(x)", padL + 2, 4);
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'left';
      ctx.fillText(fnum(xMin, 1), padL + 2, padT + plotH + 4);
      ctx.textAlign = 'right';
      ctx.fillText(fnum(xMax, 1), padL + plotW - 2, padT + plotH + 4);
      ctx.restore();
    }

    defineModel({
      id: 'monotonic',
      grade: 2,
      name: { zh: '导数与单调性', en: 'Monotonicity & extrema' },
      formula: {
        zh: 'f(x) = ax³ + bx² + cx，f′(x) = 3ax² + 2bx + c；f′ > 0 ⇒ 递增，f′ < 0 ⇒ 递减',
        en: "f(x) = ax³+bx²+cx, f′(x) = 3ax²+2bx+c; f′ > 0 ⇒ increasing, f′ < 0 ⇒ decreasing",
      },
      hint: {
        zh: '单调性由 f′ 的符号决定，与 f 本身的高低无关：f′ 在哪些区间为正，f 就在哪些区间递增。f′ 变号的位置就是极值点。',
        en: 'The sign of f′ decides monotonicity: where f′ > 0 the function rises, where f′ < 0 it falls, and a sign change marks an extremum.',
      },
      chartLabel: { zh: "f′(x)", en: "f′(x)" },
      timeline: { zh: '动画：扫描点沿 x 轴移动，实时显示 f′ 的符号与切线方向', en: 'Animation: a probe slides along the axis, showing the sign of f′ and the tangent' },
      params: [
        { key: 'a', label: { zh: '三次项系数 a', en: 'Cubic a' }, min: -2, max: 2, step: 0.1, init: 1, unit: '', digits: 1 },
        { key: 'b', label: { zh: '二次项系数 b', en: 'Quadratic b' }, min: -3, max: 3, step: 0.5, init: 0, unit: '', digits: 1 },
        { key: 'c', label: { zh: '一次项系数 c', en: 'Linear c' }, min: -3, max: 3, step: 0.5, init: -3, unit: '', digits: 1 },
      ],
      box(p) {
        const d = monotonicDerive(p);
        const delta = Math.max(0, ...d.crit.map((cr) => Math.abs(cr.y - d.yMid)));
        const half = clamp(1.2 * delta, 2.2, 3.5);
        let lo = d.yMid - half;
        let hi = d.yMid + half;
        if (lo > 0 && lo < 1.6) lo = 0;
        if (hi < 0 && hi > -1.6) hi = 0;
        return { xMin: -3.4, xMax: 3.4, yMin: lo, yMax: hi };
      },
      duration() {
        return 6;
      },
      state(t, p) {
        const d = monotonicDerive(p);
        const total = 6;
        const tt = clamp(t, 0, total);
        const viewBox = this.box(p);
        const boxX0 = viewBox.xMin + 0.35;
        const boxX1 = viewBox.xMax - 0.35;
        const xScan = boxX0 + (boxX1 - boxX0) * (tt / total);
        const slope = d.df(xScan);
        const sign = slope > 1e-7 ? '+' : slope < -1e-7 ? '−' : '0';
        const critText = d.roots.length
          ? d.roots.map((r, i) => `x${i + 1} = ${fnum(r, 2)}`).join('，')
          : L({ zh: '没有（f′ 恒不为 0）', en: 'none (f′ ≠ 0)' });
        const ext = d.crit.filter((cr) => cr.kind !== 'flat');
        const extText = ext.length
          ? ext.map((cr) => `${cr.kind === 'max' ? L({ zh: '极大', en: 'max' }) : L({ zh: '极小', en: 'min' })} ${fnum(cr.y, 2)}`).join('，')
          : L({ zh: '无极值', en: 'none' });
        const signText =
          sign === '0'
            ? L({ zh: 'f′ = 0（切线水平，可能是极值点）', en: 'f′ = 0 (horizontal tangent)' })
            : sign === '+'
              ? L({ zh: 'f′ > 0 → 函数递增', en: 'f′ > 0 → increasing' })
              : L({ zh: 'f′ < 0 → 函数递减', en: 'f′ < 0 → decreasing' });

        return {
          t: tt,
          xScan,
          slope,
          sign,
          model: d,
          viewX0: viewBox.xMin,
          viewX1: viewBox.xMax,
          summary: {
            zh: `x = ${fnum(xScan, 2)} 处 f′(x) = ${fnum(slope, 2)}，${sign === '0' ? '切线水平' : sign === '+' ? '切线向右上，函数在递增' : '切线向右下，函数在递减'}。`,
            en: `At x = ${fnum(xScan, 2)}, f′(x) = ${fnum(slope, 2)} — the tangent runs ${sign === '0' ? 'flat' : sign === '+' ? 'upward' : 'downward'}.`,
          },
          chartValue: Number.isFinite(slope) ? slope : 0,
          rows: [
            { label: { zh: '当前 f′(x)', en: 'f′(x) now' }, value: fnum(slope, 3) },
            { label: { zh: '符号', en: 'Sign' }, value: signText },
            { label: { zh: "f′ 的判别式 Δ", en: "Δ of f′" }, value: Math.abs(d.A) > 1e-9 ? fnum(d.disc, 2) : '—' },
            { label: { zh: '极值点', en: 'Critical points' }, value: critText },
            { label: { zh: '极值', en: 'Extrema' }, value: extText },
            { label: { zh: '递增区间', en: 'Increasing on' }, value: d.incText },
            { label: { zh: '递减区间', en: 'Decreasing on' }, value: d.decText },
          ],
        };
      },
      draw(ctx, st, view, pal, opts, p) {
        const d = st.model;

        // 单调区间底色：f′ > 0 蓝、f′ < 0 橙
        const cuts = [view.x0];
        d.roots.forEach((r) => {
          if (r > view.x0 && r < view.x1) cuts.push(r);
        });
        cuts.push(view.x1);
        const strips = [];
        for (let i = 0; i < cuts.length - 1; i += 1) {
          const l = cuts[i];
          const r = cuts[i + 1];
          if (r - l < 1e-6) continue;
          const up = d.df((l + r) / 2) > 0;
          ctx.save();
          ctx.globalAlpha = 0.55;
          regionWorld(
            ctx,
            view,
            [
              [l, view.y0],
              [r, view.y0],
              [r, view.y1],
              [l, view.y1],
            ],
            up ? pal.area : pal.area2,
          );
          ctx.restore();
          strips.push({ l, r, up });
        }

        // 两条曲线：f 粗、f′ 细虚线
        plotFunction(ctx, view, pal, d.df, { color: pal.curve2, width: 1.8, dash: [6, 4] });
        plotFunction(ctx, view, pal, d.f, { color: pal.curve, width: 2.6 });

        // 区间标签（贴底边，避开上方的公式）
        setChip(pal.chip);
        strips.forEach((s) => {
          const width = (s.r - s.l) * view.scale;
          if (width < 76) return;
          const mid = (s.l + s.r) / 2;
          tag(
            ctx,
            s.up ? L({ zh: '递增 ↗', en: 'rising ↗' }) : L({ zh: '递减 ↘', en: 'falling ↘' }),
            view.toX(mid),
            view.toY(view.y0) - 14,
            s.up ? pal.curve : pal.point,
            'center',
            10,
          );
        });
        setChip(null);

        // 极值点
        d.crit.forEach((cr) => {
          if (cr.x < view.x0 || cr.x > view.x1) return;
          dotWorld(ctx, view, cr.x, cr.y, pal.point, 4.4);
          dotWorld(ctx, view, cr.x, 0, pal.muted, 2.6);
          const above = cr.kind !== 'max';
          setChip(pal.chip);
          tag(
            ctx,
            `${cr.kind === 'max' ? L({ zh: '极大值', en: 'max' }) : cr.kind === 'min' ? L({ zh: '极小值', en: 'min' }) : L({ zh: '拐点', en: 'inflection' })} ${fnum(cr.y, 2)}`,
            view.toX(cr.x) + 8,
            view.toY(cr.y) + (above ? 16 : -16),
            pal.point,
            'left',
            10,
          );
          setChip(null);
        });

        // 扫描点：竖线 + f 上的点 + 切线 + f′ 上的点
        const x = st.xScan;
        const y = d.f(x);
        segmentWorld(ctx, view, x, view.y0, x, view.y1, pal.muted, 1, [3, 5]);
        const m = d.df(x);
        const half = 0.55;
        segmentWorld(ctx, view, x - half, y - m * half, x + half, y + m * half, pal.tangent, 2, [5, 4]);
        dotWorld(ctx, view, x, y, pal.point, 4.6);
        dotWorld(ctx, view, x, m, pal.curve2, 3.8);

        // 公式：x 轴贴近上边时把公式挪到底部，避免压住刻度数字
        const spanY = view.y1 - view.y0;
        const topSide = view.toY(0) > 0.22 * view.height;
        const chipY1 = topSide ? view.y1 - spanY * 0.05 : view.y0 + spanY * 0.145;
        const chipY2 = topSide ? view.y1 - spanY * 0.11 : view.y0 + spanY * 0.08;
        setChip(pal.chip);
        labelWorld(
          ctx,
          view,
          `f(x) = ${monotonicPolyText([[d.a, 'x³'], [d.b, 'x²'], [d.c, 'x']])}`,
          view.x0 + (view.x1 - view.x0) * 0.02,
          chipY1,
          pal.text,
          'left',
          11,
        );
        labelWorld(
          ctx,
          view,
          `f′(x) = ${monotonicPolyText([[3 * d.a, 'x²'], [2 * d.b, 'x'], [d.c, '']])}`,
          view.x0 + (view.x1 - view.x0) * 0.02,
          chipY2,
          pal.curve2,
          'left',
          11,
        );
        setChip(null);

        setChip(pal.chip);
        tag(
          ctx,
          st.sign === '0'
            ? "f′(x) = 0"
            : `${st.sign === '+' ? 'f′ > 0' : 'f′ < 0'} : ${fnum(st.slope, 2)}`,
          view.width - 14,
          22,
          st.sign === '+' ? pal.curve : st.sign === '-' ? pal.point : pal.muted,
          'right',
          11,
        );
        setChip(null);
      },
      drawChart: monotonicChart,
    });

    defineLesson('monotonic', {
      lesson: {
        zh: '导数刻画的是「此刻往哪走」：f′(x) > 0 时曲线向右上升，f′(x) < 0 时向右下降。把 f′ 的零点求出来，用它们把定义域切成几段，每段上 f′ 的符号固定，于是每段上的单调性也就定了。f′ 由正变负的位置是极大值点，由负变正的位置是极小值点。',
        en: 'The derivative says which way the curve moves: f′ > 0 means rising, f′ < 0 means falling. The zeros of f′ cut the domain into pieces of constant sign, which fixes monotonicity; a + → − change is a local maximum, − → + a local minimum.',
      },
      steps: [
        { at: 0, zh: '先看 f′(x) = 3ax² + 2bx + c 这条抛物线：它的正负号就是 f 的增减号。它的判别式 Δ 决定 f′ 有几个零点。', en: "Start from the parabola f′(x) = 3ax²+2bx+c: its sign is the sign of f's slope, and its discriminant decides how many zeros it has." },
        { at: 0.28, zh: '扫描点在 f′ < 0 的区间里，f 的曲线在下降，切线指向右下——这三点是同一件事的三种说法。', en: 'Where f′ < 0 the curve falls and the tangent points down-right — three views of the same fact.' },
        { at: 0.55, zh: '经过 f′ = 0 的位置，符号从 − 变 +，切线由右下转为右上，这里就是极小值点。', en: 'At a zero where the sign goes − to +, the tangent turns from down to up: that is a local minimum.' },
        { at: 0.82, zh: 'f′ > 0 的每一段都是递增区间。注意区间端点不能并起来：x₁ 处 f 由减转增，并不是一路增上去的。', en: 'Each stretch with f′ > 0 is an increasing interval; keep the pieces separate — the function does not increase straight through x₁.' },
      ],
    });

    defineQuiz('monotonic', (rng) => {
      const kind = Math.floor(rng() * 3);
      const a = rpick(rng, [1, 1, 2, -1]);
      const b = rpick(rng, [-3, 0, 3, 1.5]);
      const c = rpick(rng, [-3, -6, 0, 3]);
      const d = monotonicDerive({ a, b, c });
      const expr = `f(x) = ${monotonicPolyText([[a, 'x³'], [b, 'x²'], [c, 'x']])}`;
      const crits = d.crit.filter((cr) => cr.kind !== 'flat');

      if (kind === 0 && crits.length) {
        const target = crits[Math.floor(rng() * crits.length)];
        return makeQuiz(
          { a, b, c },
          {
            zh: `已知 ${expr}，求 f 的${target.kind === 'max' ? '极大' : '极小'}值点横坐标。`,
            en: `For ${expr}, find the x-coordinate of the local ${target.kind === 'max' ? 'maximum' : 'minimum'}.`,
          },
          '',
          target.x,
          {
            zh: `f′(x) = ${monotonicPolyText([[3 * a, 'x²'], [2 * b, 'x'], [c, '']])}，令 f′(x) = 0 得 x = ${d.roots.map((r) => fnum(r, 2)).join('、')}；由左右符号可知 ${target.kind === 'max' ? '极大' : '极小'}值点是 x = ${fnum(target.x, 2)}。`,
            en: `Solve f′(x) = 0 to get x = ${d.roots.map((r) => fnum(r, 2)).join(', ')}; the ${target.kind} is at x = ${fnum(target.x, 2)}.`,
          },
          0.01,
        );
      }
      if (kind === 1 && crits.length) {
        const target = crits[Math.floor(rng() * crits.length)];
        return makeQuiz(
          { a, b, c },
          {
            zh: `已知 ${expr}，求 f 的${target.kind === 'max' ? '极大' : '极小'}值。`,
            en: `For ${expr}, find the local ${target.kind === 'max' ? 'maximum' : 'minimum'} value.`,
          },
          '',
          target.y,
          {
            zh: `f′(x) = 0 得 x = ${d.roots.map((r) => fnum(r, 2)).join('、')}，代入 f 得 ${target.kind === 'max' ? '极大' : '极小'}值 f(${fnum(target.x, 2)}) = ${fnum(target.y, 2)}。`,
            en: `f′ = 0 at x = ${d.roots.map((r) => fnum(r, 2)).join(', ')}; substituting gives ${fnum(target.y, 2)}.`,
          },
          0.01,
        );
      }
      // 递减区间长度：只在有两个极值点时好答
      if (d.roots.length === 2 && a > 0) {
        const len = Math.abs(d.roots[1] - d.roots[0]);
        return makeQuiz(
          { a, b, c },
          {
            zh: `已知 ${expr}，求 f 的单调递减区间的长度。`,
            en: `For ${expr}, find the length of the interval on which f is decreasing.`,
          },
          '',
          len,
          {
            zh: `f′(x) = ${monotonicPolyText([[3 * a, 'x²'], [2 * b, 'x'], [c, '']])} 的两个零点为 ${d.roots.map((r) => fnum(r, 2)).join('、')}；两根之间 f′ < 0，递减区间长度为 ${fnum(len, 2)}。`,
            en: `The zeros of f′ are ${d.roots.map((r) => fnum(r, 2)).join(', ')}; the decreasing interval has length ${fnum(len, 2)}.`,
          },
          0.01,
        );
      }
      const turn = d.roots.length ? d.roots[0] : 0;
      return makeQuiz(
        { a, b, c },
        {
          zh: `已知 ${expr}，求 f′(x) = 0 的解。`,
          en: `For ${expr}, solve f′(x) = 0.`,
        },
        '',
        turn,
        {
          zh: `f′(x) = ${monotonicPolyText([[3 * a, 'x²'], [2 * b, 'x'], [c, '']])}，解得 x = ${fnum(turn, 2)}。`,
          en: `f′(x) = ${monotonicPolyText([[3 * a, 'x²'], [2 * b, 'x'], [c, '']])}; the solution is x = ${fnum(turn, 2)}.`,
        },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-monotonic-1',
        modelId: 'monotonic',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '极值', en: 'Extremum' },
        params: { a: 1, b: 0, c: -3 },
        stem: {
          zh: '已知 f(x) = x³ − 3x，求 f(x) 的极大值。',
          en: 'For f(x) = x³ − 3x, find the local maximum value.',
        },
        unit: '',
        answer: 2,
        tol: 0.01,
        solution: {
          zh: "f′(x) = 3x² − 3 = 3(x − 1)(x + 1)，零点 x = ±1。x < −1 时 f′ > 0、−1 < x < 1 时 f′ < 0，所以 x = −1 处取极大值 f(−1) = 2。",
          en: "f′(x) = 3(x−1)(x+1) gives x = ±1; the sign of f′ goes + to − at −1, so the maximum is f(−1) = 2.",
        },
      },
      {
        id: 'ex-monotonic-2',
        modelId: 'monotonic',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '单调性求参数', en: 'Monotonicity & parameter' },
        params: { a: 1, b: 3, c: 3 },
        stem: {
          zh: '若 f(x) = x³ + 3x² + cx 在 R 上单调递增，求实数 c 的最小值。',
          en: 'If f(x) = x³ + 3x² + cx is increasing on ℝ, find the minimum value of c.',
        },
        unit: '',
        answer: 3,
        tol: 0.01,
        solution: {
          zh: "f′(x) = 3x² + 6x + c ≥ 0 对一切 x 成立，等价于判别式 36 − 12c ≤ 0，即 c ≥ 3，所以 c 的最小值是 3。",
          en: 'f′(x) = 3x²+6x+c ≥ 0 for all x ⟺ 36 − 12c ≤ 0 ⟺ c ≥ 3, so the minimum is 3.',
        },
      },
      {
        id: 'ex-monotonic-3',
        modelId: 'monotonic',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '递减区间', en: 'Decreasing interval' },
        params: { a: 1, b: -3, c: 0 },
        stem: {
          zh: '已知 f(x) = x³ − 3x²，求 f(x) 的单调递减区间长度。',
          en: 'For f(x) = x³ − 3x², find the length of the decreasing interval.',
        },
        unit: '',
        answer: 2,
        tol: 0.01,
        solution: {
          zh: "f′(x) = 3x² − 6x = 3x(x − 2)，f′ < 0 的解集是 (0, 2)，所以递减区间为 (0, 2)，长度为 2。",
          en: 'f′(x) = 3x(x−2) < 0 on (0, 2), so the decreasing interval is (0, 2) with length 2.',
        },
      },
    ]);

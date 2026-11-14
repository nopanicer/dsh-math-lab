    // ---------------------------------------------------------------------------
    // 模型 C1 · 直线与圆（高二：d、弦长、相切条件）
    // ---------------------------------------------------------------------------

    /** 斜截式 y = kx + b 的文字形式：省略系数 1，b = 0 时不写 */
    function lcLineText(k, b) {
      const parts = [];
      if (Math.abs(k) > 1e-9) {
        const coef = Math.abs(Math.abs(k) - 1) < 1e-9 ? '' : fnum(Math.abs(k), 2);
        parts.push(`${k < 0 ? '−' : ''}${coef}x`);
      }
      const absB = Math.abs(b);
      if (absB > 1e-9) {
        parts.push(parts.length ? `${b < 0 ? '−' : '+'} ${fnum(absB, 2)}` : `${b < 0 ? '−' : ''}${fnum(absB, 2)}`);
      } else if (!parts.length) {
        parts.push('0');
      }
      return `y = ${parts.join(' ')}`;
    }

    defineModel({
      id: 'lineCircle',
      grade: 2,
      name: { zh: '直线与圆', en: 'Line and circle' },
      formula: {
        zh: 'd = |b| / √(1 + k²)　　弦长 = 2√(r² − d²)　　相切 ⇔ d = r',
        en: 'd = |b|/√(1+k²)　chord = 2√(r²−d²)　tangent ⇔ d = r',
      },
      hint: {
        zh: '把几何问题化成一串数：圆心到直线的距离 d 与半径 r 一比，位置关系就定了。相交时弦心距 d、半弦长 √(r² − d²)、半径 r 组成直角三角形，所以弦长公式其实是勾股定理。',
        en: 'One comparison settles everything: the distance d from the centre to the line against the radius r. When they cross, d, half the chord √(r²−d²) and r form a right triangle — the chord formula is just Pythagoras.',
      },
      chartLabel: { zh: '弦长', en: 'Chord' },
      timeline: {
        zh: '动画：直线平行移动，d 由 1.3r 连续减到 0（相离 → 相切 → 相交）',
        en: 'Animation: the line slides in, d falls from 1.3r to 0 (apart → tangent → secant)',
      },
      params: [
        { key: 'r', label: { zh: '半径 r', en: 'Radius r' }, min: 1, max: 5, step: 0.1, init: 4, unit: '', digits: 1 },
        { key: 'k', label: { zh: '直线斜率 k', en: 'Slope k' }, min: -3, max: 3, step: 0.1, init: 1, unit: '', digits: 1 },
      ],

      /** 只依赖参数的量：圆、直线的法向/方向、动画起点 */
      derive(p) {
        const r = Math.max(0.2, Number(p.r) || 0.2);
        const k = Number(p.k) || 0;
        const s = Math.hypot(1, k);
        return {
          r,
          k,
          s,
          d0: 1.3 * r,
          // 直线 y = kx + b 的单位法向 n = (k, −1)/s；圆心到直线的垂足 = −(b/s)·n
          nx: k / s,
          ny: -1 / s,
          ux: 1 / s,
          uy: k / s,
        };
      },

      /** 某一时刻的几何：t 是秒 */
      frame(t, p) {
        const g = this.derive(p);
        const total = this.duration(p);
        const u = clamp(t / total, 0, 1);
        const d = g.d0 * (1 - u);
        const b = d * g.s;
        const inside = d < g.r - 1e-9;
        const chord = inside ? 2 * Math.sqrt(Math.max(0, g.r * g.r - d * d)) : 0;
        const near = Math.abs(d - g.r) <= 0.03 * g.r;
        return {
          ...g,
          t,
          u,
          d,
          b,
          inside,
          near,
          chord,
          Hx: -g.nx * (b / g.s),
          Hy: -g.ny * (b / g.s),
        };
      },

      box(p) {
        const g = this.derive(p);
        // 上边留出 1.6 给方程文字（t = 0 时直线恰好在上方 1.3r 处），下边只留贴边余量
        return {
          xMin: -(g.r + 2.4),
          xMax: g.r + 2.4,
          yMin: -(g.r + 1.2),
          yMax: 1.3 * g.r + 1.6,
        };
      },

      duration() {
        return 6;
      },

      state(t, p) {
        const f = this.frame(t, p);
        const relation = f.near
          ? L({ zh: '相切', en: 'tangent' })
          : f.inside
            ? L({ zh: '相交', en: 'secant' })
            : L({ zh: '相离', en: 'disjoint' });

        let summary;
        if (f.near) {
          summary = {
            zh: `d = r = ${fnum(f.r, 2)}：直线与圆相切，公共点只有切点 H，此时弦长退化为 0。`,
            en: `d = r = ${fnum(f.r, 2)}: tangent — the only common point is H, and the chord collapses to 0.`,
          };
        } else if (f.inside) {
          summary = {
            zh: `d = ${fnum(f.d, 2)} < r = ${fnum(f.r, 2)}：相交，弦长 = 2√(r² − d²) = ${fnum(f.chord, 2)}；d、半弦长、r 构成直角三角形。`,
            en: `d = ${fnum(f.d, 2)} < r = ${fnum(f.r, 2)}: secant, chord = 2√(r²−d²) = ${fnum(f.chord, 2)}; d, half-chord and r form a right triangle.`,
          };
        } else {
          summary = {
            zh: `d = ${fnum(f.d, 2)} > r = ${fnum(f.r, 2)}：相离，直线与圆没有公共点，没有弦。`,
            en: `d = ${fnum(f.d, 2)} > r = ${fnum(f.r, 2)}: disjoint — no common point, no chord.`,
          };
        }

        return {
          t: f.t,
          r: f.r,
          k: f.k,
          b: f.b,
          d: f.d,
          chord: f.chord,
          inside: f.inside,
          near: f.near,
          Hx: f.Hx,
          Hy: f.Hy,
          nx: f.nx,
          ny: f.ny,
          ux: f.ux,
          uy: f.uy,
          summary,
          chartValue: f.chord,
          rows: [
            { label: { zh: '圆心到直线 d', en: 'Distance d' }, value: fnum(f.d, 2) },
            { label: { zh: '半径 r', en: 'Radius r' }, value: fnum(f.r, 2) },
            { label: { zh: '位置关系', en: 'Relation' }, value: relation },
            {
              label: { zh: '弦长 2√(r² − d²)', en: 'Chord 2√(r²−d²)' },
              value: f.inside ? fnum(f.chord, 2) : '—',
            },
            { label: { zh: '直线截距 b', en: 'Intercept b' }, value: fnum(f.b, 2) },
            { label: { zh: '直线方程', en: 'Line' }, value: lcLineText(f.k, f.b) },
          ],
        };
      },

      draw(ctx, st, view, pal, opts, p) {
        const r = st.r;
        const H = { x: st.Hx, y: st.Hy };
        const n = { x: st.nx, y: st.ny };
        const u = { x: st.ux, y: st.uy };
        // 半径 r 与 d 共线反向：可以直接用眼比较 d 与 r
        const R = { x: n.x * r, y: n.y * r };

        // 圆
        circleWorld(ctx, view, 0, 0, r, pal.curve, 2.4);

        // 半径（虚线）：只写记号 r，数值放到角落读数里，避免和坐标刻度撞
        segmentWorld(ctx, view, 0, 0, R.x, R.y, pal.curve3, 1.8, [6, 4]);
        labelWorld(ctx, view, 'r', R.x * 0.55 + 12 / view.scale, R.y * 0.55 + 12 / view.scale, pal.curve3, 'left', 11);

        // 直线
        lineThroughWorld(ctx, view, 0, st.b, 1, st.k, pal.curve2, 2.2);

        // 圆心到直线的垂线（弦心距 d）
        if (st.d > 1e-6) {
          segmentWorld(ctx, view, 0, 0, H.x, H.y, pal.point, 2, [4, 4]);
          rightAngle(ctx, view, H.x, H.y, n.x, n.y, u.x, u.y, pal.muted, 9);
          dotWorld(ctx, view, H.x, H.y, pal.point, 3.6);
          labelWorld(ctx, view, 'd', H.x * 0.5 + 12 / view.scale, H.y * 0.5 + 12 / view.scale, pal.point, 'left', 11);
          labelWorld(ctx, view, 'H', H.x - u.x * 0.34, H.y - u.y * 0.34, pal.point, 'right', 10);
        }

        // 弦
        if (st.inside) {
          const half = st.chord / 2;
          const A = { x: H.x - u.x * half, y: H.y - u.y * half };
          const B = { x: H.x + u.x * half, y: H.y + u.y * half };
          segmentWorld(ctx, view, A.x, A.y, B.x, B.y, pal.tangent, 3);
          dotWorld(ctx, view, A.x, A.y, pal.tangent, 3.4);
          dotWorld(ctx, view, B.x, B.y, pal.tangent, 3.4);
        }

        // 相切时把切点圈出来
        if (st.near) {
          circleWorld(ctx, view, H.x, H.y, 0.2, pal.tangent, 1.8);
          labelWorld(ctx, view, L({ zh: '切点', en: 'tangent point' }), H.x - u.x * 0.42, H.y - u.y * 0.42, pal.tangent, 'right', 10);
        }

        // 角落：圆的方程、直线方程、位置关系
        const cornerX = view.x0 + (view.x1 - view.x0) * 0.03;
        const top = view.y1 - 0.45;
        labelWorld(ctx, view, `x² + y² = ${fnum(r * r, 2)}`, cornerX, top, pal.text, 'left', 11);
        labelWorld(ctx, view, lcLineText(st.k, st.b), cornerX, top - 0.65, pal.curve2, 'left', 11);

        const rel = st.near
          ? { zh: `相切 · d = r = ${fnum(r, 2)}`, en: `tangent · d = r = ${fnum(r, 2)}` }
          : st.inside
            ? { zh: `相交 · d = ${fnum(st.d, 2)} · 弦长 ${fnum(st.chord, 2)}`, en: `secant · d = ${fnum(st.d, 2)} · chord ${fnum(st.chord, 2)}` }
            : { zh: `相离 · d = ${fnum(st.d, 2)} > r = ${fnum(r, 2)}`, en: `disjoint · d = ${fnum(st.d, 2)} > r = ${fnum(r, 2)}` };
        labelWorld(
          ctx,
          view,
          L(rel),
          view.x0 + (view.x1 - view.x0) * 0.03,
          view.y0 + (view.y1 - view.y0) * 0.08,
          st.near ? pal.tangent : st.inside ? pal.curve : pal.muted,
          'left',
          11,
        );
      },
    });

    defineLesson('lineCircle', {
      lesson: {
        zh: '判断直线与圆的位置关系，不用解方程组：把圆心到直线的距离 d 与半径 r 比大小即可。直线 l: y = kx + b 写成 kx − y + b = 0，由点到直线距离公式 d = |b| / √(k² + 1)。d > r 相离、d = r 相切、d < r 相交。相交时，圆心到弦的垂线平分弦，半弦长、d、r 组成直角三角形，于是弦长 = 2√(r² − d²)。',
        en: 'You do not need to solve the system: compare the distance d from the centre to the line with the radius r. For l: y = kx + b, i.e. kx − y + b = 0, d = |b|/√(k²+1). d > r no intersection, d = r tangent, d < r secant. When secant, the perpendicular from the centre bisects the chord, and half-chord, d and r form a right triangle, so chord = 2√(r²−d²).',
      },
      steps: [
        {
          at: 0,
          zh: '直线还在圆外：d 比 r 大，整条直线离圆心都超过 r，与圆没有公共点（相离）。',
          en: 'The line is still outside: d exceeds r, every point of the line is farther than r from the centre — no common point (disjoint).',
        },
        {
          at: 0.24,
          zh: 'd 减小到正好等于 r：直线与圆只有一个公共点，这就是相切，垂足 H 就是切点，半径 OH ⊥ 直线。',
          en: 'As d reaches exactly r the line touches the circle at one point — tangent. The foot H is the point of tangency and OH ⊥ l.',
        },
        {
          at: 0.55,
          zh: 'd < r：直线穿过圆，得到一条弦。垂足 H 是弦的中点，半弦长 = √(r² − d²)，这也是弦长公式的来源。',
          en: 'With d < r the line cuts the circle in a chord. H is its midpoint and half-chord = √(r²−d²) — that is where the chord formula comes from.',
        },
        {
          at: 0.9,
          zh: 'd → 0 时直线过圆心，弦变成直径，弦长取到最大值 2r；这也说明弦长随 d 增大而变短。',
          en: 'As d → 0 the line passes through the centre, the chord becomes a diameter of length 2r: the chord shrinks as d grows.',
        },
      ],
    });

    defineQuiz('lineCircle', (rng) => {
      const r = rnum(rng, 2, 5, 0.5);
      const k = rnum(rng, -2, 2, 0.5);
      const s = Math.sqrt(1 + k * k);
      const pick1 = Math.floor(rng() * 4);

      if (pick1 === 0) {
        const b = r * s;
        return makeQuiz(
          { r, k },
          {
            zh: `圆 x² + y² = ${fnum(r * r, 2)} 与直线 y = ${fnum(k, 1)}x + b 相切，求 b 的值（取正值）。`,
            en: `The line y = ${fnum(k, 1)}x + b is tangent to x² + y² = ${fnum(r * r, 2)}. Find b (take the positive value).`,
          },
          '',
          b,
          {
            zh: `相切 ⇔ d = r，而 d = |b| / √(1 + k²)，所以 b = r√(1 + k²) = ${fnum(r, 2)} × ${fnum(s, 4)} = ${fnum(b, 2)}。`,
            en: `Tangent ⇔ d = r with d = |b|/√(1+k²), so b = r√(1+k²) = ${fnum(b, 2)}.`,
          },
          0.02,
        );
      }
      if (pick1 === 1) {
        const b0 = rnum(rng, 0.4 * r, 1.2 * r, 0.5);
        const d = Math.abs(b0) / s;
        return makeQuiz(
          { r, k },
          {
            zh: `圆 x² + y² = ${fnum(r * r, 2)}，直线 y = ${fnum(k, 1)}x + ${fnum(b0, 1)}，求圆心到这条直线的距离 d。`,
            en: `For the circle x² + y² = ${fnum(r * r, 2)} and the line y = ${fnum(k, 1)}x + ${fnum(b0, 1)}, find the distance d from the centre to the line.`,
          },
          '',
          d,
          {
            zh: `d = |b| / √(1 + k²) = ${fnum(Math.abs(b0), 1)} / ${fnum(s, 4)} = ${fnum(d, 3)}。`,
            en: `d = |b|/√(1+k²) = ${fnum(Math.abs(b0), 1)}/${fnum(s, 4)} = ${fnum(d, 3)}.`,
          },
          0.02,
        );
      }
      if (pick1 === 2) {
        const kk = Math.abs(k) < 0.5 ? 0.5 : k;
        const ss = Math.sqrt(1 + kk * kk);
        const b0 = rnum(rng, 0.3 * r, 0.95 * r, 0.5);
        const d = Math.abs(b0) / ss;
        const chord = 2 * Math.sqrt(Math.max(0, r * r - d * d));
        return makeQuiz(
          { r, k: kk },
          {
            zh: `圆 x² + y² = ${fnum(r * r, 2)} 被直线 y = ${fnum(kk, 1)}x + ${fnum(b0, 1)} 截得一条弦，求弦长。`,
            en: `The line y = ${fnum(kk, 1)}x + ${fnum(b0, 1)} cuts x² + y² = ${fnum(r * r, 2)} in a chord. Find its length.`,
          },
          '',
          chord,
          {
            zh: `先求 d = ${fnum(Math.abs(b0), 1)}/√(1 + ${fnum(kk * kk, 2)}) = ${fnum(d, 3)}，再代弦长公式 2√(r² − d²) = 2√(${fnum(
              r * r,
              2,
            )} − ${fnum(d * d, 2)}) = ${fnum(chord, 3)}。`,
            en: `d = ${fnum(d, 3)}, then chord = 2√(r²−d²) = ${fnum(chord, 3)}.`,
          },
          0.02,
        );
      }
      const y0 = r / s;
      return makeQuiz(
        { r, k },
        {
          zh: `圆 x² + y² = ${fnum(r * r, 2)} 的一条切线斜率为 ${fnum(k, 1)}，求切点的纵坐标（取正值）。`,
          en: `A tangent to x² + y² = ${fnum(r * r, 2)} has slope ${fnum(k, 1)}. Find the y-coordinate of the point of tangency (positive).`,
        },
        '',
        y0,
        {
          zh: `切点就是圆心到直线的垂足，且 |OH| = r。切线 y = kx + b 满足 b = r√(1 + k²)，垂足 H = (−kb/(1 + k²), b/(1 + k²))，故 y = b/(1 + k²) = r/√(1 + k²) = ${fnum(y0, 3)}。`,
          en: `The tangent point is the foot from the centre with |OH| = r. With b = r√(1+k²), its y-coordinate is b/(1+k²) = r/√(1+k²) = ${fnum(y0, 3)}.`,
        },
        0.02,
      );
    });

    defineExams([
      {
        id: 'ex-lineCircle-1',
        modelId: 'lineCircle',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '弦长', en: 'Chord length' },
        params: { r: 5, k: -0.75 },
        stem: {
          zh: '已知圆 x² + y² = 25 与直线 3x + 4y − 5 = 0，求这条直线被圆截得的弦长。',
          en: 'The line 3x + 4y − 5 = 0 meets the circle x² + y² = 25 in a chord. Find its length.',
        },
        unit: '',
        answer: 4 * Math.sqrt(6),
        tol: 0.01,
        solution: {
          zh: '圆心到直线的距离 d = |−5| / √(3² + 4²) = 5/5 = 1，半径 r = 5。半弦长 = √(r² − d²) = √(25 − 1) = 2√6，所以弦长 = 4√6 ≈ 9.80。',
          en: 'd = |−5|/√(3²+4²) = 1 and r = 5, so half-chord = √(25−1) = 2√6 and the chord is 4√6 ≈ 9.80.',
        },
      },
      {
        id: 'ex-lineCircle-2',
        modelId: 'lineCircle',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '相切条件', en: 'Tangency' },
        params: { r: 5, k: 2 },
        stem: {
          zh: '求斜率为 2 且与圆 x² + y² = 25 相切的直线在 y 轴上的截距（取正值）。',
          en: 'A line of slope 2 is tangent to x² + y² = 25. Find its y-intercept (positive value).',
        },
        unit: '',
        answer: 5 * Math.sqrt(5),
        tol: 0.01,
        solution: {
          zh: '设直线 y = 2x + b，相切要求 d = |b|/√(1 + 2²) = 5，故 |b| = 5√5，取正值 b = 5√5 ≈ 11.18。',
          en: 'Write the line as y = 2x + b; tangency means |b|/√5 = 5, so b = 5√5 ≈ 11.18.',
        },
      },
    ]);

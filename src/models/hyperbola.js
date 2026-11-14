    // ---------------------------------------------------------------------------
    // 模型 C3 · 双曲线（高二：渐近线、|r₁ − r₂| = 2a）
    // ---------------------------------------------------------------------------

    /** 双曲线的派生量：c 必须大于 a，输入不合法时抬到 a + 0.2 */
    function hyGeom(p) {
      const a = clamp(Math.abs(Number(p.a) || 2), 0.5, 4);
      const cRaw = Math.abs(Number(p.c) || 3);
      const c = Math.max(cRaw, a + 0.2);
      const b = Math.sqrt(Math.max(1e-6, c * c - a * a));
      return { a, c, b, e: c / a, slope: b / a, clamped: cRaw < a + 0.2 - 1e-9 };
    }

    /** 视野：横向要装下两个焦点，纵向按 1.45 的宽高比配平；U 是动点参数范围 */
    function hyFrame(p) {
      const g = hyGeom(p);
      const Xc = 1.15 * (g.c + 0.6);
      const Yc = Xc / 1.45;
      const U = clamp(Math.min(Math.asinh((0.72 * Yc) / g.b), Math.acosh(Math.max(1.0001, (0.86 * Xc) / g.a))), 0.32, 1.5);
      return { ...g, Xc, Yc, U };
    }

    defineModel({
      id: 'hyperbola',
      grade: 2,
      name: { zh: '双曲线', en: 'Hyperbola' },
      formula: {
        zh: '|r₁ − r₂| = 2a　　b² = c² − a²　　e = c/a　　y = ±(b/a)x',
        en: '|r₁ − r₂| = 2a　b² = c² − a²　e = c/a　y = ±(b/a)x',
      },
      hint: {
        zh: '把椭圆定义里的「和」换成「差的绝对值」就得到双曲线：到两焦点距离之差的绝对值恒为 2a。a → c 的那条对角线方向就是渐近线 y = ±(b/a)x，曲线只能沿着它无限延伸，永远碰不到；e = c/a > 1，越大开口越开。',
        en: 'Replace the sum in the ellipse definition by an absolute difference: |r₁ − r₂| = 2a. The diagonals y = ±(b/a)x are the asymptotes the branches approach but never reach; e = c/a > 1, and the larger it is the wider the opening.',
      },
      chartLabel: { zh: 'r₁ − r₂', en: 'r₁ − r₂' },
      timeline: {
        zh: '动画：P 沿右支从下往上走，|r₁ − r₂| 始终等于 2a',
        en: 'Animation: P climbs the right branch while |r₁ − r₂| stays 2a',
      },
      params: [
        { key: 'a', label: { zh: '实半轴 a', en: 'Semi-transverse a' }, min: 1, max: 4, step: 0.1, init: 2, unit: '', digits: 1 },
        {
          key: 'c',
          label: { zh: '半焦距 c（取 c > a）', en: 'Half focal c (c > a)' },
          min: 1.2,
          max: 6,
          step: 0.1,
          init: 3,
          unit: '',
          digits: 1,
        },
      ],

      // 参数依赖：c 必须大于 a（双曲线定义要求 c² = a² + b²）
      sanitizeParams(p) {
        const a = Math.abs(Number(p.a) || 1);
        return { c: Math.max(Math.abs(Number(p.c) || 3), a + 0.2) };
      },
      box(p) {
        const f = hyFrame(p);
        return { xMin: -f.Xc, xMax: f.Xc, yMin: -f.Yc, yMax: f.Yc };
      },

      duration() {
        return 7;
      },

      state(t, p) {
        const f = hyFrame(p);
        const total = this.duration(p);
        const u01 = clamp(t / total, 0, 1);
        // 轻微缓动：顶点不要卡在 t = 0.5，标签也更从容
        const u = -f.U + 2 * f.U * (0.5 * u01 + 0.5 * u01 * u01);
        const px = f.a * Math.cosh(u);
        const py = f.b * Math.sinh(u);
        // 右支上的点离左焦点 F₁(−c,0) 更远：r₁ = a + c·cosh u，r₂ = c·cosh u − a
        const r1 = f.a + f.c * Math.cosh(u);
        const r2 = f.c * Math.cosh(u) - f.a;
        const diff = r1 - r2;

        const asym = Math.abs(f.slope - 1) < 0.005
          ? { zh: 'y = ±x', en: 'y = ±x' }
          : { zh: `y = ±${fnum(f.slope, 2)}x`, en: `y = ±${fnum(f.slope, 2)}x` };

        return {
          t,
          a: f.a,
          b: f.b,
          c: f.c,
          e: f.e,
          slope: f.slope,
          U: f.U,
          u,
          px,
          py,
          r1,
          r2,
          diff,
          clamped: f.clamped,
          summary: {
            zh: `|r₁ − r₂| = ${fnum(r1, 2)} − ${fnum(r2, 2)} = ${fnum(diff, 2)} = 2a，与 P 在右支上的位置无关；渐近线斜率 b/a = ${fnum(f.slope, 3)}。`,
            en: `|r₁ − r₂| = ${fnum(r1, 2)} − ${fnum(r2, 2)} = ${fnum(diff, 2)} = 2a, independent of P on the right branch; asymptote slope b/a = ${fnum(f.slope, 3)}.`,
          },
          chartValue: diff,
          rows: [
            { label: { zh: '实半轴 a', en: 'Semi-transverse a' }, value: fnum(f.a, 2) },
            { label: { zh: '虚半轴 b', en: 'Semi-conjugate b' }, value: fnum(f.b, 2) },
            { label: { zh: '半焦距 c', en: 'Half focal c' }, value: fnum(f.c, 2) },
            { label: { zh: '离心率 e', en: 'Eccentricity e' }, value: fnum(f.e, 3) },
            { label: { zh: '渐近线', en: 'Asymptotes' }, value: L(asym) },
            { label: { zh: '焦半径 r₁', en: 'Focal radius r₁' }, value: fnum(r1, 2) },
            { label: { zh: '焦半径 r₂', en: 'Focal radius r₂' }, value: fnum(r2, 2) },
          ],
        };
      },

      draw(ctx, st, view, pal, opts, p) {
        const a = st.a;
        const b = st.b;
        const c = st.c;

        // 参数方程描点画两支；一直画到出画面为止
        const uDraw = Math.min(
          2.8,
          Math.max(
            st.u + 0.3,
            Math.asinh((Math.max(Math.abs(view.y0), Math.abs(view.y1)) * 1.25) / b),
            Math.acosh(Math.max(1.0001, (Math.max(Math.abs(view.x0), Math.abs(view.x1)) * 1.15) / a)),
          ),
        );
        const steps = 180;
        [-1, 1].forEach((side) => {
          const pts = [];
          for (let i = 0; i <= steps; i += 1) {
            const uu = -uDraw + (2 * uDraw * i) / steps;
            pts.push([side * a * Math.cosh(uu), b * Math.sinh(uu)]);
          }
          polylineWorld(ctx, view, pts, pal.curve, 2.4);
        });

        // 渐近线
        lineThroughWorld(ctx, view, 0, 0, 1, st.slope, pal.muted, 1.3, [7, 5]);
        lineThroughWorld(ctx, view, 0, 0, 1, -st.slope, pal.muted, 1.3, [7, 5]);

        // 特征矩形：由 (±a, ±b) 围成，渐近线正是它的对角线
        if (opts.aux) {
          segmentWorld(ctx, view, a, -b, a, b, pal.grid, 1.2, [4, 5]);
          segmentWorld(ctx, view, -a, -b, -a, b, pal.grid, 1.2, [4, 5]);
          segmentWorld(ctx, view, -a, b, a, b, pal.grid, 1.2, [4, 5]);
          segmentWorld(ctx, view, -a, -b, a, -b, pal.grid, 1.2, [4, 5]);
        }

        // a 与 b 的标注：矩形左下两边，O–A₂–B 的斜边正好是 c 且落在渐近线上
        segmentWorld(ctx, view, 0, 0, a, 0, pal.point, 2.2);
        labelWorld(ctx, view, 'a', a * 0.5, 0.34, pal.point, 'center', 11);
        segmentWorld(ctx, view, a, 0, a, b, pal.curve3, 1.6, [5, 4]);
        rightAngle(ctx, view, a, 0, [0, 1], [-1, 0], pal.muted, 8);
        if (b <= Math.abs(view.y1) * 0.96) {
          labelWorld(ctx, view, 'b', a + 0.22, b * 0.55, pal.curve3, 'left', 11);
        }

        // 顶点
        dotWorld(ctx, view, -a, 0, pal.tangent, 4.2);
        dotWorld(ctx, view, a, 0, pal.tangent, 4.2);
        labelWorld(ctx, view, 'A₁', -a, 0.46, pal.tangent, 'center', 10);
        labelWorld(ctx, view, 'A₂', a, 0.46, pal.tangent, 'center', 10);

        // 焦点：标签放到焦点外侧，给 P / r₂ 让出位置
        dotWorld(ctx, view, -c, 0, pal.point, 4.6);
        dotWorld(ctx, view, c, 0, pal.point, 4.6);
        labelWorld(ctx, view, 'F₁', -c - 0.3, -0.5, pal.point, 'right', 11);
        labelWorld(ctx, view, 'F₂', c + 0.3, -0.5, pal.point, 'left', 11);

        // 动点 P 与两条焦半径
        const P = { x: st.px, y: st.py };
        const F1 = { x: -c, y: 0 };
        const F2 = { x: c, y: 0 };
        segmentWorld(ctx, view, P.x, P.y, F1.x, F1.y, pal.curve3, 1.7);
        segmentWorld(ctx, view, P.x, P.y, F2.x, F2.y, pal.curve2, 1.7);

        dotWorld(ctx, view, P.x, P.y, pal.tangent, 4.8);
        // P 的标签朝双曲线外侧（远离中心），焦半径标签则放到每一段的另一侧
        const ox = P.x / (a * a);
        const oy = -P.y / Math.max(b * b, 1e-9);
        const olen = Math.hypot(ox, oy) || 1;
        const out = { x: ox / olen, y: oy / olen };
        labelWorld(ctx, view, 'P', P.x + out.x * 0.45, P.y + out.y * 0.45, pal.tangent, 'center', 11);

        // 焦半径的标签：在「两个法向 × 三个分段位置」里挑一个离障碍物最远的（刻度、焦点、P 都算障碍）
        const off = 14 / view.scale;
        const obstacles = [
          { x: 0, y: 0, r: 0.5 },
          { x: -c - 0.44, y: -0.5, r: 0.34 },
          { x: c + 0.44, y: -0.5, r: 0.34 },
          { x: -a, y: 0.46, r: 0.3 },
          { x: a, y: 0.46, r: 0.3 },
          { x: P.x + out.x * 0.45, y: P.y + out.y * 0.45, r: 0.3 },
        ];
        for (let k = Math.ceil(view.x0); k <= Math.floor(view.x1); k += 1) {
          if (Math.abs(k) <= 12) obstacles.push({ x: k, y: 0, r: 0.34 });
        }
        const placeRadiusLabel = (to, text, color) => {
          const dx = to.x - P.x;
          const dy = to.y - P.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;
          let best = null;
          [0.5, 0.64, 0.36].forEach((f, fi) => {
            [1, -1].forEach((sg) => {
              const lx = P.x + dx * f + nx * off * sg;
              const ly = P.y + dy * f + ny * off * sg;
              let score = 1e9;
              obstacles.forEach((o) => {
                score = Math.min(score, Math.hypot(lx - o.x, ly - o.y) - o.r);
              });
              if (Math.abs(ly) < 0.42) score -= 0.25;
              if (Math.abs(ly - P.y) < 0.28) score -= 0.1;
              score -= fi * 0.02;
              if (!best || score > best.score) best = { x: lx, y: ly, score };
            });
          });
          labelWorld(ctx, view, text, best.x, best.y, color, 'center', 10);
        };
        placeRadiusLabel(F1, 'r₁', pal.curve3);
        placeRadiusLabel(F2, 'r₂', pal.curve2);

        // 角落：标准方程、渐近线、不变量
        const cornerX = view.x0 + (view.x1 - view.x0) * 0.03;
        labelWorld(ctx, view, `x²/${fnum(a * a, 2)} − y²/${fnum(b * b, 2)} = 1`, cornerX, view.y1 - 0.42, pal.text, 'left', 11);
        labelWorld(
          ctx,
          view,
          Math.abs(st.slope - 1) < 0.005 ? 'y = ±x' : `y = ±${fnum(st.slope, 2)}x`,
          cornerX,
          view.y1 - 1.0,
          pal.muted,
          'left',
          11,
        );
        labelWorld(
          ctx,
          view,
          `|r₁ − r₂| = 2a = ${fnum(2 * a, 2)}`,
          cornerX,
          view.y0 + 0.55,
          pal.tangent,
          'left',
          11,
        );
      },
    });

    defineLesson('hyperbola', {
      lesson: {
        zh: '双曲线是「到两焦点距离之差的绝对值等于 2a」的点集（2a < 2c）。标准方程 x²/a² − y²/b² = 1，其中 b² = c² − a²。把 x²/a² − y²/b² = 0 解出来就是两条渐近线 y = ±(b/a)x：曲线在无穷远处贴着它们走，但永远不会相交。离心率 e = c/a > 1，e 越大，b/a 越大，开口越开阔。',
        en: 'A hyperbola is the set of points whose distances to the two foci differ (in absolute value) by 2a, with 2a < 2c. Its standard form is x²/a² − y²/b² = 1 with b² = c² − a². Solving x²/a² − y²/b² = 0 gives the asymptotes y = ±(b/a)x that the branches approach at infinity. The eccentricity e = c/a > 1 controls the opening: larger e means larger b/a.',
      },
      steps: [
        {
          at: 0,
          zh: 'P 在右支下方：它离左焦点 F₁ 远、离右焦点 F₂ 近，两个距离之差恰为 2a（不是「和」）。',
          en: 'P is low on the right branch: farther from F₁, nearer to F₂, and the difference of the two distances is exactly 2a (not the sum).',
        },
        {
          at: 0.3,
          zh: 'P 往上走，两条焦半径都变长，可差值纹丝不动——副图里这条水平线就是 2a。',
          en: 'As P rises both focal radii grow, yet the difference does not move: the flat line in the side chart is that constant 2a.',
        },
        {
          at: 0.5,
          zh: '经过顶点 A₂(a, 0) 时最紧凑：r₁ = c + a、r₂ = c − a，差还是 2a；渐近线 y = ±(b/a)x 由 (±a, ±b) 决定的矩形对角线给出。',
          en: 'At the vertex A₂(a,0): r₁ = c + a and r₂ = c − a, still differing by 2a. The asymptotes are the diagonals of the rectangle built on (±a, ±b).',
        },
        {
          at: 0.8,
          zh: 'e = c/a 越大，b = √(c² − a²) 越大，渐近线越陡、开口越开；椭圆里是 a² = b² + c²，这里换成了 c² = a² + b²。',
          en: 'Larger e = c/a means larger b = √(c²−a²), steeper asymptotes and a wider opening; note c² = a² + b² here, versus a² = b² + c² for the ellipse.',
        },
      ],
    });

    defineQuiz('hyperbola', (rng) => {
      const a = rnum(rng, 1.5, 4, 0.5);
      const c = rnum(rng, a + 0.5, 6, 0.5);
      const b = Math.sqrt(c * c - a * a);
      const pick1 = Math.floor(rng() * 4);

      if (pick1 === 0) {
        const e = c / a;
        return makeQuiz(
          { a, c },
          {
            zh: `双曲线的实半轴 a = ${fnum(a, 1)}、半焦距 c = ${fnum(c, 1)}，求离心率 e。`,
            en: `A hyperbola has semi-transverse axis a = ${fnum(a, 1)} and half focal distance c = ${fnum(c, 1)}. Find e.`,
          },
          '',
          e,
          {
            zh: `e = c/a = ${fnum(c, 1)} / ${fnum(a, 1)} = ${fnum(e, 4)}（双曲线恒有 e > 1）。`,
            en: `e = c/a = ${fnum(c, 1)}/${fnum(a, 1)} = ${fnum(e, 4)}; a hyperbola always has e > 1.`,
          },
          0.01,
        );
      }
      if (pick1 === 1) {
        return makeQuiz(
          { a, c },
          {
            zh: `双曲线的实半轴 a = ${fnum(a, 1)}、半焦距 c = ${fnum(c, 1)}，求虚半轴 b。`,
            en: `A hyperbola has a = ${fnum(a, 1)} and c = ${fnum(c, 1)}. Find the semi-conjugate axis b.`,
          },
          '',
          b,
          {
            zh: `双曲线里 c² = a² + b²，所以 b = √(c² − a²) = √(${fnum(c * c, 2)} − ${fnum(a * a, 2)}) = ${fnum(b, 3)}。`,
            en: `For a hyperbola c² = a² + b², so b = √(c²−a²) = ${fnum(b, 3)}.`,
          },
          0.01,
        );
      }
      if (pick1 === 2) {
        const k = b / a;
        return makeQuiz(
          { a, c },
          {
            zh: `双曲线 x²/${fnum(a * a, 2)} − y²/${fnum(b * b, 2)} = 1 的一条渐近线斜率为正，求这个斜率。`,
            en: `One asymptote of x²/${fnum(a * a, 2)} − y²/${fnum(b * b, 2)} = 1 has positive slope. Find it.`,
          },
          '',
          k,
          {
            zh: `渐近线斜率 = b/a = ${fnum(b, 3)} / ${fnum(a, 1)} = ${fnum(k, 4)}；它也是特征矩形对角线斜率。`,
            en: `Asymptote slope = b/a = ${fnum(b, 3)}/${fnum(a, 1)} = ${fnum(k, 4)}, the diagonal slope of the feature rectangle.`,
          },
          0.01,
        );
      }
      return makeQuiz(
        { a, c },
        {
          zh: `双曲线的实半轴 a = ${fnum(a, 1)}、半焦距 c = ${fnum(c, 1)}，求顶点 A₂(a, 0) 到较近焦点 F₂ 的距离 |A₂F₂|。`,
          en: `A hyperbola has a = ${fnum(a, 1)} and c = ${fnum(c, 1)}. Find the distance from the vertex A₂(a,0) to the nearer focus F₂.`,
        },
        '',
        c - a,
        {
          zh: `两个焦点在 x 轴上，分别为 (−c, 0) 与 (c, 0)，所以 |A₂F₂| = c − a = ${fnum(c - a, 3)}（另一侧是 c + a = ${fnum(
            c + a,
            2,
          )}，两者之差正好 2a）。`,
          en: `The foci are (−c,0) and (c,0), so |A₂F₂| = c − a = ${fnum(c - a, 3)}; the other side is c + a and their difference is 2a.`,
        },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-hyperbola-1',
        modelId: 'hyperbola',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '离心率', en: 'Eccentricity' },
        params: { a: 3, c: 5 },
        stem: {
          zh: '已知双曲线 x²/9 − y²/16 = 1，求它的离心率 e。',
          en: 'For the hyperbola x²/9 − y²/16 = 1, find its eccentricity e.',
        },
        unit: '',
        answer: 5 / 3,
        tol: 0.01,
        solution: {
          zh: 'a² = 9 得 a = 3，b² = 16 得 b = 4，于是 c = √(a² + b²) = 5，e = c/a = 5/3 ≈ 1.67。',
          en: 'a = 3, b = 4 so c = √(a²+b²) = 5 and e = c/a = 5/3 ≈ 1.67.',
        },
      },
      {
        id: 'ex-hyperbola-2',
        modelId: 'hyperbola',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '渐近线', en: 'Asymptotes' },
        params: { a: 2, c: 4 },
        stem: {
          zh: '双曲线 x²/4 − y²/12 = 1 的两条渐近线中，斜率为正的那条斜率是多少？',
          en: 'For the hyperbola x²/4 − y²/12 = 1, what is the slope of the asymptote with positive slope?',
        },
        unit: '',
        answer: Math.sqrt(3),
        tol: 0.01,
        solution: {
          zh: 'a = 2，b = √12 = 2√3，渐近线为 y = ±(b/a)x = ±√3 x，所以正斜率为 √3 ≈ 1.73。',
          en: 'a = 2, b = 2√3, so the asymptotes are y = ±√3 x and the positive slope is √3 ≈ 1.73.',
        },
      },
    ]);

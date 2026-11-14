    // ---------------------------------------------------------------------------
    // 模型 C2 · 椭圆（高二：r₁ + r₂ = 2a、离心率、焦点）
    // ---------------------------------------------------------------------------

    /** 椭圆的一组派生量：所有公式都从 a、c 出发，c 超过 a 时按退化处理 */
    function elGeom(p) {
      const a = Math.max(1, Math.abs(Number(p.a) || 4));
      const cRaw = Math.abs(Number(p.c) || 0);
      const c = Math.min(cRaw, a); // c > a 的输入视为退化：压成线段
      const b = Math.sqrt(Math.max(0, a * a - c * c));
      return {
        a,
        b,
        c,
        e: a > 1e-9 ? c / a : 0,
        clamped: cRaw > a + 1e-9,
        flat: b < 0.02,
        circle: c < 0.06,
      };
    }

    defineModel({
      id: 'ellipse',
      grade: 2,
      name: { zh: '椭圆', en: 'Ellipse' },
      formula: {
        zh: 'r₁ + r₂ = 2a　　b² = a² − c²　　e = c/a　　x²/a² + y²/b² = 1',
        en: 'r₁ + r₂ = 2a　b² = a² − c²　e = c/a　x²/a² + y²/b² = 1',
      },
      hint: {
        zh: '椭圆就是「到两个定点距离之和为常数」的点集：这个常数是 2a，两个定点是焦点，间距 2c。e = c/a 描述扁的程度：e → 0 越接近圆，e → 1 越扁；通径长 2b²/a 是过焦点垂直于长轴的最短弦。',
        en: 'An ellipse is the set of points whose distances to two fixed foci add up to a constant 2a; the foci are 2c apart. The eccentricity e = c/a measures flatness: e → 0 is a circle, e → 1 is a needle. The latus rectum 2b²/a is the shortest chord through a focus.',
      },
      chartLabel: { zh: '焦半径 r₁', en: 'Focal radius r₁' },
      timeline: {
        zh: '动画：P 沿椭圆走一周，r₁ + r₂ 始终等于 2a',
        en: 'Animation: P travels once around the ellipse while r₁ + r₂ stays 2a',
      },
      params: [
        { key: 'a', label: { zh: '长半轴 a', en: 'Semi-major a' }, min: 2, max: 6, step: 0.1, init: 4, unit: '', digits: 1 },
        {
          key: 'c',
          label: { zh: '半焦距 c（取 c ≤ a）', en: 'Half focal distance c (c ≤ a)' },
          min: 0,
          max: 5.8,
          step: 0.1,
          init: 2.4,
          unit: '',
          digits: 1,
        },
      ],

      // 参数依赖：c 不能超过 a（面板据此把滑块值夹回去）
      sanitizeParams(p) {
        return { c: Math.min(Math.abs(Number(p.c) || 0), Math.abs(Number(p.a) || 2)) };
      },
      box(p) {
        const g = elGeom(p);
        return {
          xMin: -(g.a + 1),
          xMax: g.a + 1,
          yMin: -(Math.max(g.b, 0.9) + 1.3),
          yMax: Math.max(g.b, 0.9) + 1.3,
        };
      },

      duration() {
        return 7;
      },

      state(t, p) {
        const g = elGeom(p);
        const total = this.duration(p);
        const u = clamp(t / total, 0, 1);
        // 从短轴端点出发逆时针走一圈，参数角 θ 均匀推进
        const theta = TAU * u + PI / 2;
        const px = g.a * Math.cos(theta);
        const py = g.b * Math.sin(theta);
        // 焦半径的解析式：椭圆的定义给出 r₁ = a + c·cosθ，r₂ = a − c·cosθ
        const r1 = g.a + g.c * Math.cos(theta);
        const r2 = g.a - g.c * Math.cos(theta);

        let summary;
        if (g.flat) {
          summary = {
            zh: `c = a = ${fnum(g.a, 2)}：b = 0，椭圆退化成一条长为 2a 的线段，e = 1。`,
            en: `c = a = ${fnum(g.a, 2)}: b = 0, the ellipse collapses to a segment of length 2a and e = 1.`,
          };
        } else if (g.circle) {
          summary = {
            zh: 'c = 0：两个焦点重合于圆心，椭圆就是圆，离心率 e = 0。',
            en: 'c = 0: the foci coincide at the centre, the ellipse is a circle and e = 0.',
          };
        } else {
          summary = {
            zh: `r₁ + r₂ = ${fnum(r1, 2)} + ${fnum(r2, 2)} = ${fnum(g.a * 2, 2)} = 2a，与 P 的位置无关；e = c/a = ${fnum(g.e, 3)}。`,
            en: `r₁ + r₂ = ${fnum(r1, 2)} + ${fnum(r2, 2)} = ${fnum(g.a * 2, 2)} = 2a, independent of P; e = c/a = ${fnum(g.e, 3)}.`,
          };
        }

        return {
          t,
          a: g.a,
          b: g.b,
          c: g.c,
          e: g.e,
          theta,
          px,
          py,
          r1,
          r2,
          flat: g.flat,
          circle: g.circle,
          clamped: g.clamped,
          summary,
          chartValue: r1,
          rows: [
            { label: { zh: '长半轴 a', en: 'Semi-major a' }, value: fnum(g.a, 2) },
            { label: { zh: '短半轴 b', en: 'Semi-minor b' }, value: fnum(g.b, 2) },
            { label: { zh: '半焦距 c', en: 'Half focal c' }, value: fnum(g.c, 2) },
            { label: { zh: '离心率 e', en: 'Eccentricity e' }, value: fnum(g.e, 3) },
            { label: { zh: '焦半径 r₁', en: 'Focal radius r₁' }, value: fnum(r1, 2) },
            { label: { zh: '焦半径 r₂', en: 'Focal radius r₂' }, value: fnum(r2, 2) },
            { label: { zh: 'r₁ + r₂', en: 'r₁ + r₂' }, value: fnum(r1 + r2, 2) },
          ],
        };
      },

      draw(ctx, st, view, pal, opts, p) {
        const a = st.a;
        const b = st.b;
        const c = st.c;
        const flat = st.flat;
        const circle = st.circle;

        // 椭圆本体：参数方程描点（不用 ctx.ellipse，避免坐标系变化时被拉伸）
        const pts = [];
        const steps = 320;
        for (let i = 0; i <= steps; i += 1) {
          const th = -PI + (TAU * i) / steps;
          pts.push([a * Math.cos(th), b * Math.sin(th)]);
        }
        polylineWorld(ctx, view, pts, pal.curve, 2.4);

        // 通径：过焦点垂直于长轴的弦，长 2b²/a
        const halfLatus = b > 0.02 ? (b * b) / a : 0;
        if (!flat && c > 0.05) {
          segmentWorld(ctx, view, c, -halfLatus, c, halfLatus, pal.muted, 1.3, [4, 4]);
          labelWorld(
            ctx,
            view,
            L({ zh: '通径', en: 'latus rectum' }),
            c + 0.16,
            halfLatus * 0.45,
            pal.muted,
            'left',
            9,
          );
        }

        // 长半轴 a、短半轴 b、半焦距 c 的直角三角形
        segmentWorld(ctx, view, 0, 0, a, 0, pal.muted, 2);
        if (!flat && !circle) {
          segmentWorld(ctx, view, 0, 0, 0, b, pal.curve3, 1.8, [5, 4]);
          segmentWorld(ctx, view, c, 0, 0, b, pal.curve2, 1.4, [5, 4]);
          rightAngle(ctx, view, 0, 0, [1, 0], [0, 1], pal.muted, 9);
          labelWorld(ctx, view, 'a', c * 0.56 - 0.12, b * 0.58 + 0.3, pal.curve2, 'center', 11);
          labelWorld(ctx, view, 'b', 0.28, b * 0.55, pal.curve3, 'left', 11);
        }
        labelWorld(ctx, view, 'a', a + 0.3, 0.36, pal.muted, 'left', 11);

        if (!circle) {
          segmentWorld(ctx, view, 0, 0, c, 0, pal.point, 2.4);
          labelWorld(ctx, view, 'c', c * 0.5, 0.38, pal.point, 'center', 11);
          dotWorld(ctx, view, -c, 0, pal.tangent, 4.2);
          dotWorld(ctx, view, c, 0, pal.tangent, 4.2);
          labelWorld(ctx, view, 'F₁', -c, -0.62, pal.tangent, 'center', 11);
          labelWorld(ctx, view, 'F₂', c, -0.62, pal.tangent, 'center', 11);
        } else {
          dotWorld(ctx, view, 0, 0, pal.tangent, 4.2);
          labelWorld(ctx, view, L({ zh: 'F₁ ≡ F₂', en: 'F₁ ≡ F₂' }), 0.3, -0.6, pal.tangent, 'left', 10);
        }

        // 两条焦半径：标 r₁/r₂ 记号（数值在读数里），标签沿法向偏出去避免压线
        const P = { x: st.px, y: st.py };
        const F1 = { x: -c, y: 0 };
        const F2 = { x: c, y: 0 };
        if (circle) {
          // 两个焦点重合于圆心：r₁ = r₂ = a，只画一条半径
          segmentWorld(ctx, view, P.x, P.y, 0, 0, pal.curve3, 1.7);
          labelWorld(ctx, view, `r = ${fnum(a, 2)}`, P.x * 0.5 + 0.32, P.y * 0.5, pal.curve3, 'left', 10);
          dotWorld(ctx, view, P.x, P.y, pal.tangent, 4.8);
          labelWorld(ctx, view, 'P', P.x + 0.38, P.y + 0.12, pal.tangent, 'left', 11);
        } else {
          segmentWorld(ctx, view, P.x, P.y, F1.x, F1.y, pal.curve3, 1.7);
          segmentWorld(ctx, view, P.x, P.y, F2.x, F2.y, pal.curve2, 1.7);
          const off = 13 / view.scale;
          const radiusLabel = (from, to, other, text, color, fallback) => {
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.hypot(dx, dy) || 1;
            let nx = -dy / len;
            let ny = dx / len;
            // 法向取「远离另一个焦点」的一侧，保证 r₁、r₂ 的标签不会互相盖住
            const away = nx * (other.x - from.x) + ny * (other.y - from.y);
            if (Math.abs(away) < 1e-6 * Math.max(1, len)) {
              nx = 0;
              ny = fallback;
            } else if (away > 0) {
              nx = -nx;
              ny = -ny;
            }
            // 别让标签压在 x 轴的刻度文字上
            let lx = from.x + dx * 0.5 + nx * off;
            let ly = from.y + dy * 0.5 + ny * off;
            if (Math.abs(ly) < 0.55) ly = ly + (ly >= 0 ? 1 : -1) * (0.55 - Math.abs(ly) + 0.12);
            labelWorld(ctx, view, text, lx, ly, color, 'center', 10);
          };
          radiusLabel(P, F1, F2, 'r₁', pal.curve3, 1);
          radiusLabel(P, F2, F1, 'r₂', pal.curve2, -1);

          // 动点 P
          dotWorld(ctx, view, P.x, P.y, pal.tangent, 4.8);
          if (flat) {
            // 退化时 P 就在长轴上，标签直接往上提
            labelWorld(ctx, view, 'P', P.x, 0.5, pal.tangent, 'center', 11);
          } else {
            const ox = P.x / (a * a);
            const oy = P.y / Math.max(b * b, 1e-9);
            const olen = Math.hypot(ox, oy) || 1;
            labelWorld(ctx, view, 'P', P.x + (ox / olen) * 0.42, P.y + (oy / olen) * 0.42, pal.tangent, 'center', 11);
          }
        }

        // 角落：标准方程 + 定义式
        const cornerX = view.x0 + (view.x1 - view.x0) * 0.03;
        labelWorld(
          ctx,
          view,
          flat
            ? L({ zh: 'c = a：退化成线段', en: 'c = a: degenerate segment' })
            : `x²/${fnum(a * a, 2)} + y²/${fnum(b * b, 2)} = 1`,
          cornerX,
          view.y1 - 0.4,
          pal.text,
          'left',
          11,
        );
        labelWorld(
          ctx,
          view,
          `r₁ + r₂ = 2a = ${fnum(2 * a, 2)}`,
          cornerX,
          view.y1 - 1.0,
          pal.tangent,
          'left',
          11,
        );
        if (!flat) {
          labelWorld(
            ctx,
            view,
            L({
              zh: `通径 2b²/a = ${fnum((2 * b * b) / a, 2)}`,
              en: `latus rectum 2b²/a = ${fnum((2 * b * b) / a, 2)}`,
            }),
            cornerX,
            view.y0 + 0.5,
            pal.muted,
            'left',
            10,
          );
        }
      },
    });

    defineLesson('ellipse', {
      lesson: {
        zh: '把绳子两端钉在两个焦点 F₁、F₂，用笔绷紧绕一圈，画出的就是椭圆：绳长 = r₁ + r₂ = 2a 恒定。由这个定义可以推出标准方程 x²/a² + y²/b² = 1，其中 b² = a² − c²。焦点在长轴上，离心率 e = c/a 越大，椭圆越扁；过焦点且垂直于长轴的弦（通径）长为 2b²/a。',
        en: 'Pin a string at the two foci F₁, F₂ and trace with a taut pencil: the sum r₁ + r₂ = 2a is constant — that is an ellipse, with standard form x²/a² + y²/b² = 1 and b² = a² − c². The foci lie on the major axis; the larger e = c/a, the flatter the ellipse; the chord through a focus perpendicular to the major axis (latus rectum) has length 2b²/a.',
      },
      steps: [
        {
          at: 0,
          zh: 'P 在短轴端点：由对称性 r₁ = r₂ = a，这正好是「和 = 2a」的一半。此时 OP 就是短半轴 b。',
          en: 'At the end of the minor axis symmetry gives r₁ = r₂ = a — exactly half of the constant 2a; OP is the semi-minor axis b.',
        },
        {
          at: 0.25,
          zh: 'P 绕到长轴端点附近：r₁、r₂ 一个变长一个变短，但两者之和始终不变，等于 2a。',
          en: 'As P approaches a vertex one focal radius grows and the other shrinks, yet their sum stays 2a.',
        },
        {
          at: 0.5,
          zh: '继续沿椭圆走：焦点、b、c 组成直角三角形 O–F₂–B，斜边 b 与 c 的平方和正好是 a²，这就是 b² = a² − c²。',
          en: 'The right triangle O–F₂–B has legs b and c and hypotenuse a, hence b² = a² − c².',
        },
        {
          at: 0.78,
          zh: 'e = c/a 越接近 1，c 越接近 a，b 就越小，椭圆越扁；e = 0 时两焦点重合，椭圆变成圆。',
          en: 'The closer e = c/a is to 1, the smaller b and the flatter the ellipse; e = 0 collapses the foci into the centre and the ellipse into a circle.',
        },
      ],
    });

    defineQuiz('ellipse', (rng) => {
      const a = rnum(rng, 3, 6, 0.5);
      const c = rnum(rng, 0.5, a - 0.5, 0.5);
      const b = Math.sqrt(a * a - c * c);
      const e = c / a;
      const latus = (2 * b * b) / a;
      const pick1 = Math.floor(rng() * 4);

      if (pick1 === 0) {
        return makeQuiz(
          { a, c },
          {
            zh: `椭圆的长半轴 a = ${fnum(a, 1)}、半焦距 c = ${fnum(c, 1)}，求离心率 e。`,
            en: `An ellipse has semi-major axis a = ${fnum(a, 1)} and half focal distance c = ${fnum(c, 1)}. Find its eccentricity e.`,
          },
          '',
          e,
          {
            zh: `e = c/a = ${fnum(c, 1)} / ${fnum(a, 1)} = ${fnum(e, 4)}。`,
            en: `e = c/a = ${fnum(c, 1)}/${fnum(a, 1)} = ${fnum(e, 4)}.`,
          },
          0.01,
        );
      }
      if (pick1 === 1) {
        return makeQuiz(
          { a, c },
          {
            zh: `椭圆的长半轴 a = ${fnum(a, 1)}、半焦距 c = ${fnum(c, 1)}，求短半轴 b。`,
            en: `An ellipse has a = ${fnum(a, 1)} and c = ${fnum(c, 1)}. Find the semi-minor axis b.`,
          },
          '',
          b,
          {
            zh: `b² = a² − c² = ${fnum(a * a, 2)} − ${fnum(c * c, 2)} = ${fnum(b * b, 2)}，所以 b = ${fnum(b, 3)}。`,
            en: `b² = a² − c² = ${fnum(b * b, 2)}, so b = ${fnum(b, 3)}.`,
          },
          0.01,
        );
      }
      if (pick1 === 2) {
        return makeQuiz(
          { a, c },
          {
            zh: `椭圆的长半轴 a = ${fnum(a, 1)}、半焦距 c = ${fnum(c, 1)}，求过焦点且垂直于长轴的弦（通径）的长度。`,
            en: `For an ellipse with a = ${fnum(a, 1)} and c = ${fnum(c, 1)}, find the length of the latus rectum (the focal chord perpendicular to the major axis).`,
          },
          '',
          latus,
          {
            zh: `通径长 = 2b²/a，而 b² = a² − c² = ${fnum(b * b, 2)}，所以通径 = 2 × ${fnum(b * b, 2)} / ${fnum(
              a,
              1,
            )} = ${fnum(latus, 3)}。`,
            en: `Latus rectum = 2b²/a with b² = ${fnum(b * b, 2)}, giving ${fnum(latus, 3)}.`,
          },
          0.01,
        );
      }
      return makeQuiz(
        { a, c },
        {
          zh: `椭圆的长半轴 a = ${fnum(a, 1)}、半焦距 c = ${fnum(c, 1)}，P 是椭圆上离 F₂ 最远的点，求 |PF₂|。`,
          en: `An ellipse has a = ${fnum(a, 1)} and c = ${fnum(c, 1)}. Take P at the vertex farthest from F₂ and find |PF₂|.`,
        },
        '',
        a + c,
        {
          zh: `最远的点是另一侧的顶点，此时 |PF₂| = a + c = ${fnum(a, 1)} + ${fnum(c, 1)} = ${fnum(a + c, 3)}（最近时是 a − c）。`,
          en: `The farthest point is the opposite vertex, so |PF₂| = a + c = ${fnum(a + c, 3)} (the nearest is a − c).`,
        },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-ellipse-1',
        modelId: 'ellipse',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '离心率', en: 'Eccentricity' },
        params: { a: 5, c: 3 },
        stem: {
          zh: '已知椭圆的长半轴 a = 5、半焦距 c = 3，求它的离心率 e。',
          en: 'An ellipse has a = 5 and c = 3. Find its eccentricity e.',
        },
        unit: '',
        answer: 0.6,
        tol: 0.01,
        solution: {
          zh: 'e = c/a = 3/5 = 0.6。（顺便：b² = a² − c² = 16，b = 4。）',
          en: 'e = c/a = 3/5 = 0.6. (Also b² = a² − c² = 16, so b = 4.)',
        },
      },
      {
        id: 'ex-ellipse-2',
        modelId: 'ellipse',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '通径', en: 'Latus rectum' },
        params: { a: 5, c: 4 },
        stem: {
          zh: '椭圆 x²/25 + y²/9 = 1 的焦点为 F₁、F₂，求过 F₂ 且垂直于长轴的弦长（通径）。',
          en: 'For the ellipse x²/25 + y²/9 = 1, find the length of the chord through F₂ perpendicular to the major axis.',
        },
        unit: '',
        answer: 3.6,
        tol: 0.01,
        solution: {
          zh: 'a = 5，b = 3，c = 4。通径长 = 2b²/a = 2 × 9/5 = 3.6；也可令 x = 4 代入方程得 y² = 9(1 − 16/25) = 81/25，故 |y| = 9/5，弦长 2|y| = 18/5 = 3.6。',
          en: 'With a = 5, b = 3, c = 4: latus rectum = 2b²/a = 18/5 = 3.6. Substituting x = 4 gives |y| = 9/5 and the full chord 18/5.',
        },
      },
    ]);

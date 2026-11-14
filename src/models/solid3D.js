    // ---------------------------------------------------------------------------
    // 模型 · 立体几何：正棱锥 / 正棱柱的线面角（高三，3D 视角）
    // ---------------------------------------------------------------------------

    /** 空间多边形填充（把 3D 点投影成屏幕路径） */
    function sgeoFill3D(ctx, cam, pts, color) {
      if (!pts || pts.length < 3) return;
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      pts.forEach((pt, i) => {
        const q = cam.project(pt[0], pt[1], pt[2]);
        if (i === 0) ctx.moveTo(q.x, q.y);
        else ctx.lineTo(q.x, q.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    /** 3D 直角标记：以 o 为顶点，沿单位方向 d1、d2 各走 len */
    function sgeoRight3D(ctx, cam, o, d1, d2, len, color) {
      const p1 = [o[0] + d1[0] * len, o[1] + d1[1] * len, o[2] + d1[2] * len];
      const p2 = [o[0] + d2[0] * len, o[1] + d2[1] * len, o[2] + d2[2] * len];
      const p3 = [o[0] + (d1[0] + d2[0]) * len, o[1] + (d1[1] + d2[1]) * len, o[2] + (d1[2] + d2[2]) * len];
      line3D(ctx, cam, [p1, p3, p2], color, 1.3);
    }

    const sgeoNorm = (v) => {
      const m = Math.hypot(v[0], v[1], v[2]) || 1;
      return [v[0] / m, v[1] / m, v[2] / m];
    };

    /** 空间角圆弧：从方向 u 转到方向 v；reveal ∈ [0,1] 控制画多少 */
    function sgeoArc3D(ctx, cam, origin, u, v, radius, color, width, reveal) {
      const r = clamp(reveal, 0, 1);
      if (r <= 0.001 || radius <= 1e-6) return;
      const steps = 26;
      const pts = [];
      for (let i = 0; i <= steps; i += 1) {
        const s = (i / steps) * r;
        const x = u[0] * (1 - s) + v[0] * s;
        const y = u[1] * (1 - s) + v[1] * s;
        const z = u[2] * (1 - s) + v[2] * s;
        const m = Math.hypot(x, y, z) || 1;
        pts.push([origin[0] + (x / m) * radius, origin[1] + (y / m) * radius, origin[2] + (z / m) * radius]);
      }
      line3D(ctx, cam, pts, color, width === undefined ? 1.6 : width);
    }

    /**
     * 顶点标签：在屏幕空间沿「远离图形中心」的方向推出去，保证落在轮廓外。
     * avoidUp：底面后侧顶点如果往上推会落进棱锥体内，改成往左右让开。
     */
    function sgeoTagOut(ctx, cam, text, pt, refPt, pxAmount, color, size, avoidUp) {
      const q = cam.project(pt[0], pt[1], pt[2]);
      const c = cam.project(refPt[0], refPt[1], refPt[2]);
      let dx = q.x - c.x;
      let dy = q.y - c.y;
      const d = Math.hypot(dx, dy);
      if (d < 1e-6) {
        dx = 0;
        dy = -1;
      } else {
        dx /= d;
        dy /= d;
      }
      if (avoidUp && Math.abs(dy) > 0.72 && Math.abs(dx) > 1e-6) {
        dx = dx > 0 ? 1 : -1;
        dy = dy < 0 ? -0.45 : 0.45;
        const m = Math.hypot(dx, dy);
        dx /= m;
        dy /= m;
      }
      tag(ctx, text, q.x + dx * pxAmount, q.y + dy * pxAmount, color, 'center', size || 12);
    }

    /** 棱上的尺寸标注：投影后往一侧平移 */
    function sgeoTagSide(ctx, cam, text, pt, dxPx, dyPx, color, size, align) {
      const q = cam.project(pt[0], pt[1], pt[2]);
      tag(ctx, text, q.x + dxPx, q.y + dyPx, color, align || 'left', size || 10);
    }

    /** 正四棱锥的几何量 */
    function sgeoPyr(a, h) {
      const S = a * a;
      const edge = Math.hypot(h, a / Math.SQRT2);
      // edge：侧棱 PA；slant：线面角用的斜线（也是 PA）；extra：斜高
      return { S, V: (S * h) / 3, edge, slant: edge, ang: Math.atan2(h, a / Math.SQRT2), extra: Math.hypot(h, a / 2) };
    }

    /** 正三棱柱的几何量（用侧面对角线 AB₁ 与底面所成角） */
    function sgeoPrism(a, h) {
      const S = (Math.sqrt(3) / 4) * a * a;
      // edge：侧棱 AA₁ = h；slant：线面角用的斜线 AB₁；extra：同 AB₁
      return { S, V: S * h, edge: h, slant: Math.hypot(a, h), ang: Math.atan2(h, a), extra: Math.hypot(a, h) };
    }

    defineModel({
      id: 'solid3D',
      grade: 3,
      name: { zh: '立体几何：线面角', en: 'Solid geometry: line–plane angle' },
      formula: {
        zh: '正四棱锥：V = a²h/3，tan∠PAO = √2h/a　正三棱柱：V = (√3/4)a²h，tan∠B₁AB = h/a',
        en: 'Square pyramid: V = a²h/3, tan∠PAO = √2h/a. Triangular prism: V = (√3/4)a²h, tan∠B₁AB = h/a',
      },
      hint: {
        zh: '线面角 = 斜线（PA）与它在平面上射影（AO）的夹角。找射影的关键是那条垂线：正棱锥的顶点在底面中心正上方，所以 PO ⊥ 底面、AO 就是 AP 的射影，∠PAO 就是所求的角。直角三角形把三个量绑在一起：tanθ = h/AO，sinθ = h/PA。体积也是同一套底面积×高。',
        en: 'A line–plane angle is the angle between the line and its projection on the plane. The height is perpendicular to the base, so AO is the projection of AP and ∠PAO is the angle; tanθ = h/AO, sinθ = h/PA.',
      },
      chartLabel: { zh: '镜头摆过的角度 (°)', en: 'Camera swing (°)' },
      timeline: { zh: '动画：镜头绕模型缓缓摆动 ±42°，模型始终是立体的', en: 'Animation: the camera swings ±42° around the solid' },
      has3D: true,
      noAxes: true,
      params: [
        { key: 'a', label: { zh: '底面边长 a', en: 'Base edge a' }, min: 2, max: 6, step: 0.2, init: 4, unit: '', digits: 1 },
        { key: 'h', label: { zh: '高 h', en: 'Height h' }, min: 2, max: 8, step: 0.2, init: 5, unit: '', digits: 1 },
        {
          key: 'kind',
          label: { zh: '立体图形', en: 'Solid' },
          kind: 'select',
          init: 'pyr',
          options: [
            { value: 'pyr', label: { zh: '正四棱锥 P-ABCD', en: 'Square pyramid' } },
            { value: 'prism', label: { zh: '正三棱柱 ABC-A₁B₁C₁', en: 'Triangular prism' } },
          ],
        },
      ],
      box() {
        // noAxes：这个框只用来给平面视图定比例，3D 自己按画布算镜头
        return { xMin: -3.2, xMax: 3.2, yMin: -2, yMax: 2 };
      },
      duration() {
        return 8;
      },
      playback: 6,
      loop: true,
      state(t, p) {
        const total = this.duration(p);
        const prog = clamp(total > 0 ? t / total : 1, 0, 1);
        const prism = p.kind === 'prism';
        const g = prism ? sgeoPrism(p.a, p.h) : sgeoPyr(p.a, p.h);
        const theta = (g.ang * 180) / Math.PI;
        const rows = [
          {
            label: { zh: '底面积 S', en: 'Base area S' },
            value: prism ? `(√3/4)·${fnum(p.a, 1)}² = ${fnum(g.S, 2)}` : `${fnum(p.a, 1)}² = ${fnum(g.S, 2)}`,
          },
          { label: { zh: '体积 V', en: 'Volume V' }, value: fnum(g.V, 2) },
          {
            label: prism ? { zh: '侧棱 AA₁', en: 'Lateral edge AA₁' } : { zh: '侧棱 PA', en: 'Lateral edge PA' },
            value: fnum(g.edge, 2),
          },
          {
            label: prism ? { zh: '线面角 ∠B₁AB', en: 'Angle ∠B₁AB' } : { zh: '线面角 ∠PAO', en: 'Angle ∠PAO' },
            value: `${fnum(theta, 1)}°`,
          },
          {
            label: { zh: '正弦值 sinθ', en: 'sin θ' },
            value: `${fnum(p.h / g.slant, 3)} = h / ${prism ? 'AB₁' : 'PA'}`,
          },
          {
            label: prism ? { zh: '面对角线 AB₁', en: 'Face diagonal AB₁' } : { zh: '斜高', en: 'Slant height' },
            value: fnum(g.extra, 2),
          },
        ];
        return {
          t: prog * total,
          prog,
          prism,
          spin: 42 * Math.sin(Math.PI * prog),
          reveal: 1,
          ang: g.ang,
          edge: g.edge,
          S: g.S,
          V: g.V,
          summary: {
            zh: `线面角 θ = arctan(${fnum(p.h, 1)} / ${prism ? fnum(p.a, 1) : `(a/√2) = ${fnum(p.a / Math.SQRT2, 2)}`}) = ${fnum(theta, 1)}°，sinθ = h/${prism ? 'AB₁' : 'PA'} = ${fnum(p.h / g.slant, 3)}；体积与视角无关。`,
            en: `θ = arctan(h / projection) = ${fnum(theta, 1)}°, sinθ = h/length = ${fnum(p.h / g.slant, 3)}. Volume does not depend on the viewpoint.`,
          },
          chartValue: 42 * Math.sin(Math.PI * prog),
          rows,
        };
      },
      draw(ctx, st, view, pal, opts, p) {
        const a = p.a;
        const h = p.h;
        const span = Math.hypot(a * 0.72, h * 0.55) * 2.25;
        // 动画：临时把相机偏航转一点，画完还原（拖动过就以用户视角为准）
        const savedYaw = camera3D.yaw;
        if (!camera3D.touched) camera3D.yaw = savedYaw + st.spin * DEG;
        const cam = makeCamera3D(view.width, view.height, span, [0, h * 0.34, 0], 0.42);
        const s2 = a / 2;
        try {
          if (st.prism) {
            // 三角形摆成「一个顶点正对镜头」：默认视角下能同时看清三个侧面
            const R = a / Math.sqrt(3);
            const at = (deg, y) => [R * Math.cos(deg * DEG), y, R * Math.sin(deg * DEG)];
            const A = at(54.5, 0);
            const B = at(174.5, 0);
            const C = at(294.5, 0);
            const A1 = at(54.5, h);
            const B1 = at(174.5, h);
            const C1 = at(294.5, h);
            const center = [0, 0, 0];

            // 深度：z 越大越靠近镜头。若某个底面顶点严格在另外两个后面，
            // 它那条侧棱就是被挡住的（画虚线）；三个顶点对称时不画虚线。
            const depthOf = (pt) => cam.project(pt[0], pt[1], pt[2]).z;
            const verts = [[A, A1], [B, B1], [C, C1]];
            const eps = a * 1e-3;
            let back = -1;
            for (let i = 0; i < 3; i += 1) {
              const d = depthOf(verts[i][0]);
              const others = [0, 1, 2].filter((j) => j !== i);
              if (d < depthOf(verts[others[0]][0]) - eps && d < depthOf(verts[others[1]][0]) - eps) back = i;
            }

            // 底面 / 顶面
            sgeoFill3D(ctx, cam, [A, B, C], pal.area);
            line3D(ctx, cam, [A, B, C, A], pal.axis, 1.8);
            // 被遮住的侧棱先画（随后被顶面轻轻罩住）
            if (back >= 0) line3D(ctx, cam, [verts[back][0], verts[back][1]], pal.curve, 1.6, [5, 4]);
            sgeoFill3D(ctx, cam, [A1, B1, C1], pal.shade);
            // 顶面棱与其余侧棱
            line3D(ctx, cam, [A1, B1, C1, A1], pal.curve, 2);
            for (let i = 0; i < 3; i += 1) {
              if (i === back) continue;
              line3D(ctx, cam, [verts[i][0], verts[i][1]], pal.curve, 2.2);
            }

            // 线面角的两条边：AB₁（斜线）与 AB（射影）
            const u = sgeoNorm([B[0] - A[0], 0, B[2] - A[2]]);
            const v = sgeoNorm([B1[0] - A[0], B1[1] - A[1], B1[2] - A[2]]);
            line3D(ctx, cam, [A, B], pal.point, 2.6);
            line3D(ctx, cam, [A, B1], pal.point, 2.6);
            const radius = Math.min(a, Math.hypot(a, h)) * 0.34;
            sgeoArc3D(ctx, cam, A, u, v, radius, pal.tangent, 2, st.reveal);
            // 直角：BB₁ ⊥ 底面（沿底边方向与竖直方向）
            if (opts.aux) sgeoRight3D(ctx, cam, B, sgeoNorm([A[0] - B[0], 0, A[2] - B[2]]), [0, 1, 0], a * 0.055, pal.muted);

            // 标注
            sgeoTagOut(ctx, cam, 'A', A, center, 20, pal.text, 12, true);
            sgeoTagOut(ctx, cam, 'B', B, center, 20, pal.text, 12, true);
            sgeoTagOut(ctx, cam, 'C', C, center, 20, pal.text, 12, true);
            sgeoTagOut(ctx, cam, 'A₁', A1, center, 20, pal.text, 12, true);
            sgeoTagOut(ctx, cam, 'B₁', B1, center, 20, pal.text, 12, true);
            sgeoTagOut(ctx, cam, 'C₁', C1, center, 20, pal.text, 12, true);
            sgeoTagSide(ctx, cam, `h = ${fnum(h, 1)}`, [A[0], h * 0.5, A[2]], 12, 0, pal.tangent, 10);
            {
              const mid = sgeoNorm([u[0] + v[0], u[1] + v[1], u[2] + v[2]]);
              tag3D(
                ctx,
                cam,
                `${L({ zh: 'θ', en: 'θ' })} = ${fnum((st.ang * 180) / Math.PI, 1)}°`,
                [A[0] + mid[0] * radius * 1.2, A[1] + mid[1] * radius * 1.2, A[2] + mid[2] * radius * 1.2],
                pal.tangent,
                'center',
                11,
              );
            }
          } else {
            const A = [-s2, 0, s2];
            const B = [s2, 0, s2];
            const C = [s2, 0, -s2];
            const D = [-s2, 0, -s2];
            const O = [0, 0, 0];
            const P = [0, h, 0];
            const center = [0, 0, 0];

            // 底面
            sgeoFill3D(ctx, cam, [A, B, C, D], pal.area);
            line3D(ctx, cam, [A, B, C, D, A], pal.axis, 1.8);
            // 侧棱
            line3D(ctx, cam, [P, A], pal.curve, 2.2);
            line3D(ctx, cam, [P, B], pal.curve, 2.2);
            line3D(ctx, cam, [P, C], pal.curve, 2.2);
            line3D(ctx, cam, [P, D], pal.curve, 2.2);
            // 高 PO（虚线）与射影 AO（虚线）
            line3D(ctx, cam, [P, O], pal.tangent, 1.8, [6, 5]);
            if (opts.aux) {
              line3D(ctx, cam, [A, O], pal.muted, 1.5, [4, 4]);
              sgeoRight3D(ctx, cam, O, sgeoNorm([A[0], 0, A[2]]), [0, 1, 0], a * 0.055, pal.muted);
            }

            // 线面角：∠PAO
            const u = sgeoNorm([O[0] - A[0], 0, O[2] - A[2]]);
            const v = sgeoNorm([P[0] - A[0], P[1] - A[1], P[2] - A[2]]);
            const radius = Math.min(Math.hypot(a / Math.SQRT2, 0), Math.hypot(a / Math.SQRT2, h)) * 0.42;
            sgeoArc3D(ctx, cam, A, u, v, radius, pal.tangent, 2, st.reveal);

            // 标注
            sgeoTagOut(ctx, cam, 'A', A, center, 20, pal.text, 12, true);
            sgeoTagOut(ctx, cam, 'B', B, center, 20, pal.text, 12, true);
            sgeoTagOut(ctx, cam, 'C', C, center, 20, pal.text, 12, true);
            sgeoTagOut(ctx, cam, 'D', D, center, 20, pal.text, 12, true);
            sgeoTagOut(ctx, cam, 'P', P, center, 16, pal.curve, 12, false);
            sgeoTagSide(ctx, cam, 'O', O, 11, 17, pal.muted, 10, 'left');
            sgeoTagSide(ctx, cam, `h = ${fnum(h, 1)}`, [0, h * 0.52, 0], 13, 0, pal.tangent, 10);
            {
              const mid = sgeoNorm([u[0] + v[0], u[1] + v[1], u[2] + v[2]]);
              tag3D(
                ctx,
                cam,
                `${L({ zh: 'θ', en: 'θ' })} = ${fnum((st.ang * 180) / Math.PI, 1)}°`,
                [A[0] + mid[0] * radius * 1.55, A[1] + mid[1] * radius * 1.55, A[2] + mid[2] * radius * 1.55],
                pal.tangent,
                'center',
                11,
              );
            }
          }

          // 左上角文字：说明这是哪个立体
          setChip(pal.chip);
          tag(
            ctx,
            st.prism
              ? L({ zh: '正三棱柱 ABC-A₁B₁C₁', en: 'Right triangular prism' })
              : L({ zh: '正四棱锥 P-ABCD', en: 'Right square pyramid' }),
            16,
            20,
            pal.text,
            'left',
            11,
          );
          tag(
            ctx,
            L({ zh: '拖动画面可旋转视角', en: 'drag to rotate the view' }),
            16,
            38,
            pal.muted,
            'left',
            10,
          );
          setChip(null);
        } finally {
          camera3D.yaw = savedYaw;
        }
      },
    });

    defineLesson('solid3D', {
      lesson: {
        zh: '线面角的定义只有一句：斜线与它在平面上的射影所成的角。所以做题的第一步永远是找射影——先找到那条垂线。正棱锥的顶点在底面中心的正上方（PO ⊥ 底面），正棱柱的侧棱垂直于底面，于是 OA（或 AB）就是 PA（或 AB₁）的射影，∠PAO（或 ∠B₁AB）就是所求的角。把射影、垂线、斜线三边放进同一个直角三角形，tan 和 sin 就直接是两条边的比。',
        en: 'The line–plane angle is the angle between an oblique line and its projection on the plane. Find the perpendicular first: in a right pyramid the apex sits above the base centre, so OA is the projection of PA and ∠PAO is the angle. Projection, perpendicular and oblique line form a right triangle, so tan and sin are just ratios of two edges.',
      },
      steps: [
        {
          at: 0,
          zh: '先看清图形：底面是正多边形，顶点（或另一底面）在底面中心的正上方，所以侧棱一样长、高都垂直于底面。拖动画面转一圈，棱长和角度都不会变——这正是立体几何“与视角无关”的部分。',
          en: 'The base is regular and the apex (or the top face) sits above its centre, so all lateral edges are equal and the height is perpendicular to the base. Drag to rotate: lengths and angles never change.',
        },
        {
          at: 0.24,
          zh: '红线是模型的高 h，它垂直于底面；因为 O 是底面中心，所以 O 也是 A 在底面上的射影，虚线 AO 就是斜线 AP 的射影。',
          en: 'The red line is the height, perpendicular to the base. Since O is the centre, O is also the foot of the perpendicular from the apex, so AO is the projection of AP.',
        },
        {
          at: 0.5,
          zh: '把角标出来：∠PAO 就是 PA 与底面所成的角。在直角三角形 AOP 里，tan∠PAO = PO/AO，而 AO 是底面中心到顶点的距离（正四棱锥 = a/√2，正三棱柱里用 AB = a）。',
          en: 'Mark the angle: ∠PAO is the angle between PA and the base. In the right triangle AOP, tan∠PAO = PO/AO, where AO is the centre-to-vertex distance (a/√2 for the square pyramid, a for the prism).',
        },
        {
          at: 0.78,
          zh: '读数：正四棱锥 a=4、h=5 时 ∠PAO = arctan(5/2.83) ≈ 60.5°，sinθ = h/PA = 5/5.74 ≈ 0.871，体积 = a²h/3。换成立柱时体积不再除以 3，但线面角的算法完全一样。',
          en: 'Readings: for a=4, h=5 the pyramid gives ∠PAO = arctan(5/2.83) ≈ 60.5°, sinθ = h/PA ≈ 0.871, V = a²h/3. A prism multiplies by h without the ÷3, but the angle works the same way.',
        },
      ],
    });

    defineQuiz('solid3D', (rng) => {
      const kind = rng() < 0.4 ? 'prism' : 'pyr';
      const a = rpick(rng, [2, 2.5, 3, 4, 5, 6]);
      const h = rpick(rng, [2, 3, 4, 5, 6, 8]);
      const g = kind === 'prism' ? sgeoPrism(a, h) : sgeoPyr(a, h);
      const params = { a, h, kind };
      const which = Math.floor(rng() * 3);
      const isPrism = kind === 'prism';
      if (which === 0) {
        const vexpr = isPrism
          ? `(√3/4)·${fnum(a, 1)}²·${fnum(h, 1)}`
          : `${fnum(a, 1)}²·${fnum(h, 1)}/3`;
        return makeQuiz(
          params,
          isPrism
            ? { zh: `正三棱柱的底面边长为 ${fnum(a, 1)}，侧棱长为 ${fnum(h, 1)}，求它的体积。`, en: `A right triangular prism has base edge ${fnum(a, 1)} and lateral edge ${fnum(h, 1)}. Find its volume.` }
            : { zh: `正四棱锥的底面边长为 ${fnum(a, 1)}，高为 ${fnum(h, 1)}，求它的体积。`, en: `A right square pyramid has base edge ${fnum(a, 1)} and height ${fnum(h, 1)}. Find its volume.` },
          '',
          g.V,
          {
            zh: `底面积 = ${isPrism ? '√3/4·a²' : 'a²'} = ${fnum(g.S, 2)}，体积 = ${vexpr} = ${fnum(g.V, 2)}。`,
            en: `Base area = ${fnum(g.S, 2)}; volume = ${fnum(g.V, 2)}.`,
          },
          0.01,
        );
      }
      if (which === 1) {
        return makeQuiz(
          params,
          isPrism
            ? { zh: `正三棱柱的底面边长为 ${fnum(a, 1)}，侧棱长为 ${fnum(h, 1)}，求侧面对角线 AB₁ 的长。`, en: `A right triangular prism has base edge ${fnum(a, 1)} and lateral edge ${fnum(h, 1)}. Find the face diagonal AB₁.` }
            : { zh: `正四棱锥的底面边长为 ${fnum(a, 1)}，高为 ${fnum(h, 1)}，求侧棱 PA 的长。`, en: `A right square pyramid has base edge ${fnum(a, 1)} and height ${fnum(h, 1)}. Find the lateral edge PA.` },
          '',
          g.slant,
          {
            zh: isPrism
              ? `AB₁ 是矩形 ABB₁A₁ 的对角线：√(a² + h²) = √(${fnum(a * a, 2)} + ${fnum(h * h, 2)}) = ${fnum(g.slant, 2)}。`
              : `底面中心到 A 的距离 AO = a/√2 = ${fnum(a / Math.SQRT2, 2)}，PA = √(h² + AO²) = √(${fnum(h * h, 2)} + ${fnum((a * a) / 2, 2)}) = ${fnum(g.slant, 2)}。`,
            en: isPrism
              ? `AB₁ = √(a² + h²) = ${fnum(g.slant, 2)}.`
              : `AO = a/√2, so PA = √(h² + AO²) = ${fnum(g.slant, 2)}.`,
          },
          0.01,
        );
      }
      return makeQuiz(
        params,
        isPrism
          ? { zh: `正三棱柱的底面边长为 ${fnum(a, 1)}，侧棱长为 ${fnum(h, 1)}，求 AB₁ 与底面所成角的正弦值。`, en: `A right triangular prism has base edge ${fnum(a, 1)} and lateral edge ${fnum(h, 1)}. Find sin of the angle between AB₁ and the base.` }
          : { zh: `正四棱锥的底面边长为 ${fnum(a, 1)}，高为 ${fnum(h, 1)}，求侧棱 PA 与底面所成角的正弦值。`, en: `A right square pyramid has base edge ${fnum(a, 1)} and height ${fnum(h, 1)}. Find sin of the angle between PA and the base.` },
        '',
        h / g.slant,
        {
          zh: isPrism
            ? `射影是 AB = ${fnum(a, 1)}，sinθ = h/AB₁ = ${fnum(h, 1)}/${fnum(g.slant, 2)} = ${fnum(h / g.slant, 3)}。`
            : `射影 AO = a/√2 = ${fnum(a / Math.SQRT2, 2)}，sinθ = h/PA = ${fnum(h, 1)}/${fnum(g.slant, 2)} = ${fnum(h / g.slant, 3)}。`,
          en: isPrism
            ? `sinθ = h/AB₁ = ${fnum(h / g.slant, 3)}.`
            : `sinθ = h/PA = ${fnum(h / g.slant, 3)}.`,
        },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-solid3D-1',
        modelId: 'solid3D',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '线面角', en: 'Line–plane angle' },
        params: { a: 2, h: 2, kind: 'pyr' },
        stem: {
          zh: '正四棱锥 P-ABCD 的底面边长为 2，高为 2。求侧棱 PA 与底面所成角的正弦值。',
          en: 'A right square pyramid P-ABCD has base edge 2 and height 2. Find sin of the angle between PA and the base.',
        },
        unit: '',
        answer: 2 / Math.sqrt(6),
        tol: 0.005,
        solution: {
          zh: '设底面中心为 O，则 PO ⊥ 底面，AO 是 PA 的射影，∠PAO 就是所求角。AO = √2（正方形对角线的一半），PO = 2，所以 PA = √(2 + 4) = √6，sin∠PAO = PO/PA = 2/√6 = √6/3 ≈ 0.816。',
          en: 'With O the base centre, AO = √2 and PA = √6, so sin∠PAO = PO/PA = 2/√6 ≈ 0.816.',
        },
      },
      {
        id: 'ex-solid3D-2',
        modelId: 'solid3D',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '棱柱体积', en: 'Prism volume' },
        params: { a: 2, h: 3, kind: 'prism' },
        stem: {
          zh: '正三棱柱的底面边长为 2，侧棱长为 3，求它的体积。',
          en: 'A right triangular prism has base edge 2 and lateral edge 3. Find its volume.',
        },
        unit: '',
        answer: 3 * Math.sqrt(3),
        tol: 0.005,
        solution: {
          zh: '底面是边长为 2 的正三角形，面积 = (√3/4)·2² = √3；棱柱体积 = 底面积 × 高 = √3 × 3 = 3√3 ≈ 5.196。',
          en: 'Base area = (√3/4)·2² = √3, so V = √3 · 3 = 3√3 ≈ 5.196.',
        },
      },
    ]);

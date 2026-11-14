    // ---------------------------------------------------------------------------
    // 模型 · 线性规划（高三）
    // ---------------------------------------------------------------------------

    /** 约束固定：x ≥ 0、y ≥ 0、x + y ≤ 6、2x + y ≤ 8 → 可行域是四边形 OABC */
    function linearVertices() {
      return [
        { name: 'O', x: 0, y: 0 },
        { name: 'A', x: 0, y: 6 },
        { name: 'B', x: 2, y: 4 },
        { name: 'C', x: 4, y: 0 },
      ];
    }

    /** 可行域（逆时针）：O → C → B → A */
    function linearRegion() {
      return [[0, 0], [4, 0], [2, 4], [0, 6]];
    }

    /** 目标函数 z = c1·x + c2·y */
    function linearObjective(c1, c2, x, y) {
      return c1 * x + c2 * y;
    }

    /** 目标函数表达式：z = 2x + 3y（省略 1、0，负号用 −） */
    function linearExpr(c1, c2) {
      const parts = [];
      const coef = (v) => (Math.abs(Math.abs(v) - 1) < 1e-9 ? '' : fnum(Math.abs(v), 1));
      const sign = (v) => (parts.length === 0 ? (v < 0 ? '−' : '') : v < 0 ? ' − ' : ' + ');
      if (Math.abs(c1) > 1e-9) parts.push(`${sign(c1)}${coef(c1)}x`);
      if (Math.abs(c2) > 1e-9) parts.push(`${sign(c2)}${coef(c2)}y`);
      if (!parts.length) return 'z = 0';
      return `z = ${parts.join('')}`;
    }

    defineModel({
      id: 'linearProgramming',
      grade: 3,
      name: { zh: '线性规划', en: 'Linear programming' },
      formula: {
        zh: 'z = c₁x + c₂y　约束：x ≥ 0，y ≥ 0，x + y ≤ 6，2x + y ≤ 8',
        en: 'z = c₁x + c₂y s.t. x ≥ 0, y ≥ 0, x + y ≤ 6, 2x + y ≤ 8',
      },
      hint: {
        zh: '先画出可行域（四个不等式交出的凸四边形），再把目标函数看作一族平行等值线 c₁x + c₂y = z。等值线平移时 z 在变，最后与可行域只剩一个公共点的位置就是最优解——它一定落在某个顶点上，所以只要比较四个顶点的 z 值。',
        en: 'Draw the feasible region first (the convex quadrilateral cut out by the four inequalities), then read z = c₁x + c₂y as a family of parallel level lines. Sliding the line changes z; the last line that still touches the region gives the optimum, and it always happens at a vertex — so just compare the four vertex values.',
      },
      chartLabel: { zh: '等值线 z', en: 'level z' },
      timeline: {
        zh: '动画：等值线扫过可行域，最后停在最优顶点',
        en: 'Animation: the level line sweeps the region and stops on the optimal vertex',
      },
      params: [
        { key: 'c1', label: { zh: '目标函数 x 的系数 c₁', en: 'Coefficient c₁ of x' }, min: -3, max: 3, step: 0.1, init: 2, unit: '', digits: 1 },
        { key: 'c2', label: { zh: '目标函数 y 的系数 c₂', en: 'Coefficient c₂ of y' }, min: -3, max: 3, step: 0.1, init: 3, unit: '', digits: 1 },
        {
          key: 'goal',
          label: { zh: '求', en: 'Goal' },
          kind: 'select',
          init: 'max',
          options: [
            { value: 'max', label: { zh: '最大值', en: 'Maximum' } },
            { value: 'min', label: { zh: '最小值', en: 'Minimum' } },
          ],
        },
      ],
      box() {
        return { xMin: -3, xMax: 7, yMin: -0.4, yMax: 6.4 };
      },
      duration() {
        return 5;
      },
      state(t, p) {
        const c1 = Number(p.c1) || 0;
        const c2 = Number(p.c2) || 0;
        const goal = p.goal === 'min' ? 'min' : 'max';
        const isMax = goal === 'max';
        const verts = linearVertices().map((v) => ({
          name: v.name,
          x: v.x,
          y: v.y,
          z: linearObjective(c1, c2, v.x, v.y),
        }));
        const zs = verts.map((v) => v.z);
        const zMin = Math.min.apply(null, zs);
        const zMax = Math.max.apply(null, zs);
        const degenerate = Math.abs(c1) < 1e-9 && Math.abs(c2) < 1e-9;
        const tol = 1e-9;
        const best = verts.filter((v) => Math.abs(v.z - (isMax ? zMax : zMin)) <= tol);
        const other = verts.filter((v) => Math.abs(v.z - (isMax ? zMin : zMax)) <= tol);
        const total = this.duration(p);
        const tt = clamp(t, 0, total);
        const progress = total > 0 ? tt / total : 1;
        const level = isMax ? zMin + (zMax - zMin) * progress : zMax - (zMax - zMin) * progress;
        const bestText = degenerate
          ? L({ zh: '任一点', en: 'any point' })
          : best.map((v) => `${v.name}(${v.x}, ${v.y})`).join(L({ zh: ' 与 ', en: ' & ' }));
        const bestValue = isMax ? zMax : zMin;
        const otherValue = isMax ? zMin : zMax;
        const bestName = isMax ? 'z_max' : 'z_min';

        let summary;
        if (degenerate) {
          summary = {
            zh: 'c₁ = c₂ = 0 时目标函数恒等于 0：可行域里每个点的 z 都一样，没有唯一最优解。',
            en: 'With c₁ = c₂ = 0 the objective is identically 0: every point of the region has the same z, so there is no unique optimum.',
          };
        } else if (best.length > 1) {
          summary = {
            zh: `等值线与可行域的一条边平行，${bestText} 并列取到 ${bestName} = ${fnum(bestValue, 2)}，整条边上的点都是最优解。`,
            en: `The level lines are parallel to an edge, so ${bestText} tie for ${bestName} = ${fnum(bestValue, 2)}: every point on that edge is optimal.`,
          };
        } else {
          const tail = progress > 0.995
            ? { zh: `等值线 z = ${fnum(level, 2)} 已经停在最优顶点上。`, en: `The level line z = ${fnum(level, 2)} now rests on the optimal vertex.` }
            : { zh: `等值线 z = ${fnum(level, 2)} 正在平移。`, en: `The level line z = ${fnum(level, 2)} is sliding across.` };
          summary = {
            zh: `比较四个顶点：${bestName} = ${fnum(bestValue, 2)}（顶点 ${bestText}），另一头是 ${fnum(otherValue, 2)}（${other.map((v) => v.name).join('/')}）。${tail.zh}`,
            en: `Compare the vertices: ${bestName} = ${fnum(bestValue, 2)} at ${bestText}, while the other extreme is ${fnum(otherValue, 2)} at ${other.map((v) => v.name).join('/')}. ${tail.en}`,
          };
        }

        const rows = [
          {
            label: { zh: '目标函数', en: 'Objective' },
            value: `${linearExpr(c1, c2)} → ${isMax ? 'max' : 'min'}`,
          },
        ];
        verts.forEach((v) => {
          rows.push({
            label: { zh: `顶点 ${v.name}(${v.x}, ${v.y})`, en: `Vertex ${v.name}(${v.x}, ${v.y})` },
            value: `z = ${fnum(v.z, 2)}`,
          });
        });
        rows.push({
          label: isMax
            ? { zh: '最优解（使 z 最大）', en: 'Optimal vertex (max z)' }
            : { zh: '最优解（使 z 最小）', en: 'Optimal vertex (min z)' },
          value: bestText,
        });
        rows.push({
          label: isMax ? { zh: '最优值 z_max', en: 'Optimal value z_max' } : { zh: '最优值 z_min', en: 'Optimal value z_min' },
          value: fnum(bestValue, 2),
        });

        return {
          t: tt,
          c1,
          c2,
          goal,
          isMax,
          expr: linearExpr(c1, c2),
          verts,
          zMin,
          zMax,
          level,
          progress,
          best,
          degenerate,
          bestValue,
          bestText,
          chartValue: isFinite(level) ? level : 0,
          summary,
          rows,
        };
      },
      draw(ctx, st, view, pal, opts, p) {
        const c1 = st.c1;
        const c2 = st.c2;

        // ---- 可行域 ----
        const region = linearRegion();
        regionWorld(ctx, view, region, pal.area);
        polylineWorld(ctx, view, region.concat([region[0]]), pal.curve, 2.2);
        tag(
          ctx,
          L({ zh: '可行域', en: 'feasible region' }),
          view.toX(1.05),
          view.toY(2.2),
          pal.muted,
          'center',
          10,
        );

        // ---- 约束边界（延长到画面外） ----
        lineThroughWorld(ctx, view, 0, 6, 1, -1, pal.curve2, 1.6, [6, 4]);
        lineThroughWorld(ctx, view, 4, 0, 1, -2, pal.curve3, 1.6, [6, 4]);
        tag(ctx, 'x + y = 6', view.toX(4.75) + 6, view.toY(1.25) - 6, pal.curve2, 'left', 10);
        tag(ctx, '2x + y = 8', view.toX(3.3) + 6, view.toY(1.4) - 8, pal.curve3, 'left', 10);

        // ---- 等值线：先画 z_min / z_max 的参考线，再画当前线 ----
        if (!st.degenerate) {
          const dirX = c2;
          const dirY = -c1;
          const anchor = (m) => (Math.abs(c2) > Math.abs(c1) ? [0, m / c2] : [m / c1, 0]);
          [st.zMin, st.zMax].forEach((m) => {
            const a = anchor(m);
            lineThroughWorld(ctx, view, a[0], a[1], dirX, dirY, pal.muted, 1, [3, 5]);
          });
          const cur = anchor(st.level);
          lineThroughWorld(ctx, view, cur[0], cur[1], dirX, dirY, pal.tangent, 2.3, [7, 4]);
          // 等值线读数挂在右上角：贴在线上放容易和 y 轴名、约束式标签打架
          tag(
            ctx,
            `${L({ zh: '等值线', en: 'level' })} z = ${fnum(st.level, 2)}`,
            view.width - 14,
            14,
            pal.tangent,
            'right',
            10,
          );
        }

        // ---- 顶点 ----
        const offsets = {
          O: { dx: -10, dy: 17, align: 'right' },
          A: { dx: -10, dy: -15, align: 'right' },
          B: { dx: 11, dy: -15, align: 'left' },
          C: { dx: 11, dy: 17, align: 'left' },
        };
        st.verts.forEach((v) => {
          const isBest = !st.degenerate && Math.abs(v.z - st.bestValue) <= 1e-9;
          const px = view.toX(v.x);
          const py = view.toY(v.y);
          if (isBest) circleWorld(ctx, view, v.x, v.y, 9 / view.scale, pal.point, 1.8);
          dotWorld(ctx, view, v.x, v.y, isBest ? pal.point : pal.text, isBest ? 5 : 3.4);
          const off = offsets[v.name] || { dx: 8, dy: -12, align: 'left' };
          tag(
            ctx,
            `${v.name}(${v.x}, ${v.y})  z=${fnum(v.z, 2)}`,
            px + off.dx,
            py + off.dy,
            isBest ? pal.point : pal.muted,
            off.align,
            10,
          );
        });

        // ---- 最优解角标 ----
        const bestOne = st.best && st.best.length ? st.best[0] : null;
        if (bestOne && !st.degenerate) {
          const px = view.toX(bestOne.x);
          const py = view.toY(bestOne.y);
          // 角标往可行域外侧放：A/B 在上方，O 在右下，C 在下方（避开坐标标签）
          const ly = bestOne.name === 'A' || bestOne.name === 'B' ? Math.max(22, py - 34) : bestOne.name === 'C' ? py + 34 : py + 18;
          tag(
            ctx,
            st.best.length > 1 ? L({ zh: '整条边都最优', en: 'whole edge optimal' }) : L({ zh: '最优解', en: 'optimal point' }),
            px + 16,
            ly,
            pal.point,
            'left',
            10,
          );
        }
      },
    });

    defineLesson('linearProgramming', {
      lesson: {
        zh: '线性规划的标准解法是“图解法”：把每个不等式画成半平面，交集就是可行域（这里是四边形 OABC）。目标函数 z = c₁x + c₂y 的等值线是一族平行直线，z 越大，直线越往 z 增大的方向平移。让等值线从一头滑到另一头，最后碰到可行域的位置就是最优解——由于可行域是凸多边形，这个位置一定是某个顶点。',
        en: 'Solve linear programs graphically: each inequality is a half-plane and their intersection is the feasible region (here the quadrilateral OABC). The level lines of z = c₁x + c₂y are a family of parallel lines; sliding them in the direction where z grows, the last line that still touches the region gives the optimum. Because the region is a convex polygon, that touch point is always a vertex.',
      },
      steps: [
        { at: 0, zh: '可行域由 x ≥ 0、y ≥ 0、x + y ≤ 6、2x + y ≤ 8 围成，四个顶点是 O(0,0)、A(0,6)、B(2,4)、C(4,0)。', en: 'The region is bounded by x ≥ 0, y ≥ 0, x + y ≤ 6 and 2x + y ≤ 8; its vertices are O(0,0), A(0,6), B(2,4), C(4,0).' },
        { at: 0.3, zh: '等值线 z = c₁x + c₂y 是一族平行线，斜率由 c₁、c₂ 决定；和可行域的边比较斜率，就能看出它从哪条边“离开”。', en: 'The level lines z = c₁x + c₂y are parallel; their slope comes from c₁ and c₂. Comparing with the edges shows which edge the sliding line leaves through.' },
        { at: 0.6, zh: '等值线平移时 z 在变。它扫过可行域的内部，但只有在顶点处才停得住——内部点总还能再往“更优”的方向挪一点。', en: 'As the line slides, z changes. It sweeps the interior but can only stop at a vertex: an interior point can always be shifted a little further in the improving direction.' },
        { at: 0.88, zh: '最后等值线与可行域只剩一个公共点（最优顶点），此时 z 取到最值；把四个顶点的 z 都算出来比较，答案一定在其中。', en: 'At the end the line shares a single point with the region — the optimal vertex — where z is extremal. Compute z at all four vertices and compare; the answer is always one of them.' },
      ],
    });

    defineQuiz('linearProgramming', (rng) => {
      const c1 = rnum(rng, -3, 3, 1);
      let c2 = rnum(rng, -3, 3, 1);
      if (c1 === 0 && c2 === 0) c2 = 2;
      const goal = rpick(rng, ['max', 'min']);
      const isMax = goal === 'max';
      const verts = linearVertices().map((v) => Object.assign({}, v, { z: linearObjective(c1, c2, v.x, v.y) }));
      const zs = verts.map((v) => v.z);
      const zMax = Math.max.apply(null, zs);
      const zMin = Math.min.apply(null, zs);
      const bestZ = isMax ? zMax : zMin;
      const best = verts.filter((v) => Math.abs(v.z - bestZ) < 1e-9);
      const params = { c1, c2, goal };
      const expr = linearExpr(c1, c2).replace('z = ', '');
      const label = isMax ? '最大' : '最小';
      const labelEn = isMax ? 'maximum' : 'minimum';
      const values = verts.map((v) => `${v.name}=${fnum(v.z, 2)}`).join('，');

      return makeQuiz(
        params,
        {
          zh: `已知 x、y 满足 x ≥ 0，y ≥ 0，x + y ≤ 6，2x + y ≤ 8，求 z = ${expr} 的${label}值。`,
          en: `Given x ≥ 0, y ≥ 0, x + y ≤ 6, 2x + y ≤ 8, find the ${labelEn} of z = ${expr}.`,
        },
        '',
        bestZ,
        {
          zh: `四个顶点的 z 值：${values}。其中${label}值为 ${fnum(bestZ, 2)}，在顶点 ${best.map((v) => `${v.name}(${v.x}, ${v.y})`).join('、')} 处取得。`,
          en: `Vertex values: ${values}. The ${labelEn} is ${fnum(bestZ, 2)} at ${best.map((v) => `${v.name}(${v.x}, ${v.y})`).join(', ')}.`,
        },
        0.005,
      );
    });

    defineExams([
      {
        id: 'ex-lp-1',
        modelId: 'linearProgramming',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '线性规划最大值', en: 'Linear programming' },
        params: { c1: 2, c2: 3, goal: 'max' },
        stem: {
          zh: '已知 x、y 满足约束条件 x ≥ 0，y ≥ 0，x + y ≤ 6，2x + y ≤ 8，求 z = 2x + 3y 的最大值。',
          en: 'Given x ≥ 0, y ≥ 0, x + y ≤ 6, 2x + y ≤ 8, find the maximum of z = 2x + 3y.',
        },
        unit: '',
        answer: 18,
        tol: 0.005,
        solution: {
          zh: '画出可行域，顶点为 O(0,0)、A(0,6)、B(2,4)、C(4,0)。分别代入：z_O = 0，z_A = 18，z_B = 16，z_C = 8。所以 z_max = 18，在顶点 A(0,6) 处取得。',
          en: 'The region has vertices O(0,0), A(0,6), B(2,4), C(4,0). The values are 0, 18, 16 and 8, so z_max = 18 at A(0,6).',
        },
      },
      {
        id: 'ex-lp-2',
        modelId: 'linearProgramming',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '最优解位置', en: 'Optimal vertex' },
        params: { c1: 3, c2: 2, goal: 'max' },
        stem: {
          zh: '已知 x、y 满足约束条件 x ≥ 0，y ≥ 0，x + y ≤ 6，2x + y ≤ 8，求 z = 3x + 2y 的最大值。',
          en: 'Given x ≥ 0, y ≥ 0, x + y ≤ 6, 2x + y ≤ 8, find the maximum of z = 3x + 2y.',
        },
        unit: '',
        answer: 14,
        tol: 0.005,
        solution: {
          zh: '四个顶点的 z 值：O(0,0) → 0，A(0,6) → 12，B(2,4) → 14，C(4,0) → 12。最大值 14 在 B(2,4) 处取得——此时等值线 3x + 2y = 14 只与可行域在 B 一点接触。',
          en: 'Vertex values: O(0,0) → 0, A(0,6) → 12, B(2,4) → 14, C(4,0) → 12. The maximum is 14 at B(2,4): the level line 3x + 2y = 14 only touches B.',
        },
      },
      {
        id: 'ex-lp-3',
        modelId: 'linearProgramming',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '线性规划最小值', en: 'Minimum' },
        params: { c1: 2, c2: 3, goal: 'min' },
        stem: {
          zh: '已知 x、y 满足约束条件 x ≥ 0，y ≥ 0，x + y ≤ 6，2x + y ≤ 8，求 z = 2x + 3y 的最小值。',
          en: 'Given x ≥ 0, y ≥ 0, x + y ≤ 6, 2x + y ≤ 8, find the minimum of z = 2x + 3y.',
        },
        unit: '',
        answer: 0,
        tol: 0.005,
        solution: {
          zh: '四个顶点的 z 值：0、18、16、8，最小值 0 在原点 O(0,0) 处取得（此时等值线 2x + 3y = 0 恰好过原点）。',
          en: 'The vertex values are 0, 18, 16 and 8; the minimum is 0 at O(0,0), where the level line 2x + 3y = 0 passes through the origin.',
        },
      },
    ]);

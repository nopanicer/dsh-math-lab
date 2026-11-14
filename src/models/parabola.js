    // ---------------------------------------------------------------------------
    // 模型 C4 · 抛物线（高二：焦点、准线、|PF| = 到准线的距离）
    // ---------------------------------------------------------------------------

    /** 四个开口方向对应的单位向量：u 沿对称轴指出去，v 与之垂直 */
    function pbAxes(dir) {
      if (dir === 'left') return { u: [-1, 0], v: [0, -1] };
      if (dir === 'up') return { u: [0, 1], v: [-1, 0] };
      if (dir === 'down') return { u: [0, -1], v: [1, 0] };
      return { u: [1, 0], v: [0, 1] };
    }

    /** 系数 2p 的文字形式：等于 1 时省略，写「y² = x」而不是「y² = 1x」 */
    function pbCoefText(v) {
      return Math.abs(v - 1) < 1e-9 ? '' : fnum(v, 2);
    }

    /** 抛物线的派生量：p 是焦准距，方程形如 y² = 2px（开口向右） */
    function pbGeom(p) {
      const pp = clamp(Number(p.p) || 2, 0.5, 6);
      const dir = ['right', 'left', 'up', 'down'].includes(p.dir) ? p.dir : 'right';
      // 画面：横向（沿轴）留出准线一侧，纵向取 2 倍半高
      const yHalf = clamp(0.8 * pp + 1.4, 1.5, 5.2);
      const xBack = pp / 2 + 1.3;
      const xExit = Math.min((yHalf * yHalf) / (2 * pp), 8.5);
      const xFwd = Math.max(pp / 2 + 1.2, xExit + 0.8);
      // 动点参数 s（沿 v 方向的坐标）控制在画面内
      const S = Math.min(0.82 * yHalf, Math.sqrt(Math.max(0.01, 2 * pp * 0.84 * xFwd)));
      return { p: pp, dir, yHalf, xBack, xFwd, S, xExit };
    }

    defineModel({
      id: 'parabola',
      grade: 2,
      name: { zh: '抛物线', en: 'Parabola' },
      formula: {
        zh: 'y² = 2px　焦点 (p/2, 0)　准线 x = −p/2　|PF| = x + p/2　通径 2p',
        en: 'y² = 2px　focus (p/2, 0)　directrix x = −p/2　|PF| = x + p/2　latus rectum 2p',
      },
      hint: {
        zh: '抛物线上任意一点到焦点的距离，等于它到准线的距离——这就是定义，也是「|PF| = x + p/2」的来历。参数 p 是焦点到准线的距离，焦点在 (p/2, 0)，准线是 x = −p/2，过焦点垂直于对称轴的弦（通径）长 2p。',
        en: 'On a parabola the distance to the focus equals the distance to the directrix — that is the definition, and it is why |PF| = x + p/2. The parameter p is the focus-to-directrix distance: focus (p/2, 0), directrix x = −p/2, and the latus rectum (focal chord perpendicular to the axis) has length 2p.',
      },
      chartLabel: { zh: '|PF|', en: '|PF|' },
      timeline: {
        zh: '动画：P 沿抛物线从一支到另一支，|PF| 始终等于到准线的距离',
        en: 'Animation: P runs along the parabola while |PF| stays equal to the distance to the directrix',
      },
      params: [
        { key: 'p', label: { zh: '焦准距 p', en: 'Focus–directrix p' }, min: 0.5, max: 6, step: 0.1, init: 2, unit: '', digits: 1 },
        {
          key: 'dir',
          label: { zh: '开口方向', en: 'Opening' },
          kind: 'select',
          init: 'right',
          options: [
            { value: 'right', label: { zh: '向右', en: 'right' } },
            { value: 'left', label: { zh: '向左', en: 'left' } },
            { value: 'up', label: { zh: '向上', en: 'up' } },
            { value: 'down', label: { zh: '向下', en: 'down' } },
          ],
        },
      ],

      box(p) {
        const g = pbGeom(p);
        // 统一在「开口向右」的坐标系里算，再按方向翻转
        if (g.dir === 'right') {
          return { xMin: -g.xBack, xMax: g.xFwd, yMin: -g.yHalf, yMax: g.yHalf };
        }
        if (g.dir === 'left') {
          return { xMin: -g.xFwd, xMax: g.xBack, yMin: -g.yHalf, yMax: g.yHalf };
        }
        if (g.dir === 'up') {
          return { xMin: -g.yHalf, xMax: g.yHalf, yMin: -g.xBack, yMax: g.xFwd };
        }
        return { xMin: -g.yHalf, xMax: g.yHalf, yMin: -g.xFwd, yMax: g.xBack };
      },

      duration() {
        return 7;
      },

      state(t, p) {
        const g = pbGeom(p);
        const total = this.duration(p);
        const u01 = clamp(t / total, 0, 1);
        const s = -g.S + 2 * g.S * u01;
        const [ux, uy] = pbAxes(g.dir).u;
        const [vx, vy] = pbAxes(g.dir).v;
        const along = (s * s) / (2 * g.p);
        const px = ux * along + vx * s;
        const py = uy * along + vy * s;
        const fx = ux * (g.p / 2);
        const fy = uy * (g.p / 2);
        // 到准线与到焦点的距离是同一个数：沿轴的坐标 + p/2
        const dist = along + g.p / 2;
        const qx = px - ux * dist;
        const qy = py - uy * dist;

        // 准线的位置：沿对称轴 −u 方向 p/2 处，向左/向下开口时翻到正半轴
        const dirX = -ux * (g.p / 2);
        const dirY = -uy * (g.p / 2);
        const sign = g.dir === 'left' || g.dir === 'down' ? '−' : '';
        const coef = pbCoefText(2 * g.p);
        const eq = g.dir === 'up' || g.dir === 'down' ? `x² = ${sign}${coef}y` : `y² = ${sign}${coef}x`;
        const dirText = {
          right: { zh: '向右', en: 'right' },
          left: { zh: '向左', en: 'left' },
          up: { zh: '向上', en: 'up' },
          down: { zh: '向下', en: 'down' },
        }[g.dir];

        return {
          t,
          p: g.p,
          dir: g.dir,
          s,
          px,
          py,
          fx,
          fy,
          qx,
          qy,
          dirX,
          dirY,
          dist,
          S: g.S,
          eq,
          dirText,
          summary: {
            zh: `${L(dirText)}开口的抛物线 ${eq}：焦点到准线的距离 p = ${fnum(g.p, 2)}，|PF| = ${fnum(dist, 2)} 恰好等于 P 到准线的距离。`,
            en: `For ${eq} opening ${L(dirText).toLowerCase()}: p = ${fnum(g.p, 2)}, and |PF| = ${fnum(dist, 2)} equals the distance from P to the directrix.`,
          },
          chartValue: dist,
          rows: [
            { label: { zh: '方程', en: 'Equation' }, value: eq },
            { label: { zh: '焦点 F', en: 'Focus F' }, value: `(${fnum(fx, 2)}, ${fnum(fy, 2)})` },
            {
              label: { zh: '准线', en: 'Directrix' },
              value:
                g.dir === 'up' || g.dir === 'down'
                  ? `y = ${fnum(dirY, 2)}`
                  : `x = ${fnum(dirX, 2)}`,
            },
            { label: { zh: '|PF|', en: '|PF|' }, value: fnum(dist, 2) },
            { label: { zh: 'P 到准线的距离', en: 'Distance to directrix' }, value: fnum(dist, 2) },
            { label: { zh: '通径 2p', en: 'Latus rectum 2p' }, value: fnum(2 * g.p, 2) },
          ],
        };
      },

      draw(ctx, st, view, pal, opts, p) {
        const g = pbGeom(p);
        const [ux, uy] = pbAxes(g.dir).u;
        const [vx, vy] = pbAxes(g.dir).v;
        const P = { x: st.px, y: st.py };
        const F = { x: st.fx, y: st.fy };
        const Q = { x: st.qx, y: st.qy };

        // 抛物线：参数方程 (s²/2p)·u + s·v 描点，一直画到出画面
        const reach = Math.max(
          Math.abs(view.x1 - view.x0),
          Math.abs(view.y1 - view.y0),
        );
        const sDraw = Math.min(4 * reach, Math.max(g.S * 1.35, Math.sqrt(Math.max(0.01, 2 * g.p * reach))));
        const pts = [];
        const steps = 260;
        for (let i = 0; i <= steps; i += 1) {
          const ss = -sDraw + (2 * sDraw * i) / steps;
          const along = (ss * ss) / (2 * g.p);
          pts.push([ux * along + vx * ss, uy * along + vy * ss]);
        }
        polylineWorld(ctx, view, pts, pal.curve, 2.4);

        // 准线（垂直于对称轴的整条直线）
        const dl = Math.max(reach, 12);
        segmentWorld(
          ctx,
          view,
          -ux * (g.p / 2) - vx * dl,
          -uy * (g.p / 2) - vy * dl,
          -ux * (g.p / 2) + vx * dl,
          -uy * (g.p / 2) + vy * dl,
          pal.tangent,
          1.8,
          [7, 5],
        );
        labelWorld(
          ctx,
          view,
          g.dir === 'up' || g.dir === 'down' ? `y = ${fnum(st.dirY, 2)}` : `x = ${fnum(st.dirX, 2)}`,
          st.dirX + vx * (g.yHalf * 0.86),
          st.dirY + vy * (g.yHalf * 0.86),
          pal.tangent,
          g.dir === 'right' ? 'left' : g.dir === 'left' ? 'right' : 'center',
          10,
        );

        // 通径：过焦点垂直于对称轴的弦，长 2p
        const vLimit = Math.abs(vx) > 0.5 ? Math.abs(view.x1) : Math.abs(view.y1);
        const lat = Math.min(g.p, vLimit * 0.78);
        segmentWorld(ctx, view, F.x - vx * lat, F.y - vy * lat, F.x + vx * lat, F.y + vy * lat, pal.curve3, 1.5, [5, 4]);
        const labT = Math.min(lat + 0.32, vLimit * 0.9);
        labelWorld(
          ctx,
          view,
          `2p = ${fnum(2 * g.p, 2)}`,
          F.x + vx * labT + ux * 0.18,
          F.y + vy * labT + uy * 0.18,
          pal.curve3,
          'center',
          9,
        );

        // P 到准线的垂线（垂足 Q）与到焦点的连线
        segmentWorld(ctx, view, P.x, P.y, Q.x, Q.y, pal.curve2, 1.8, [6, 4]);
        segmentWorld(ctx, view, P.x, P.y, F.x, F.y, pal.curve3, 2);
        rightAngle(ctx, view, Q.x, Q.y, ux, uy, vx, vy, pal.muted, 8);

        // 两条相等的线段只标记号（数值统一放在角落，避免和坐标刻度打架）
        // |PF| 固定在 +v 一侧，|PQ| 固定在 −v 一侧，两条标签永远分得开
        const offN = 0.55;
        const tagOnSegment = (A, B, text, color, side) => {
          const dx = B.x - A.x;
          const dy = B.y - A.y;
          const len = Math.hypot(dx, dy) || 1;
          let nx = -dy / len;
          let ny = dx / len;
          if ((nx * vx + ny * vy) * side < 0) {
            nx = -nx;
            ny = -ny;
          }
          const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
          labelWorld(ctx, view, text, mid.x + nx * offN, mid.y + ny * offN, color, 'center', 10);
        };
        tagOnSegment(P, F, '|PF|', pal.curve3, 1);
        tagOnSegment(P, Q, '|PQ|', pal.curve2, -1);

        // 焦点、动点、垂足
        dotWorld(ctx, view, F.x, F.y, pal.point, 4.4);
        labelWorld(ctx, view, 'F', F.x - vx * 0.32, F.y - vy * 0.32, pal.point, 'center', 11);
        dotWorld(ctx, view, Q.x, Q.y, pal.point, 3.6);
        labelWorld(ctx, view, 'Q', Q.x - ux * 0.3, Q.y - uy * 0.3, pal.point, 'center', 10);
        dotWorld(ctx, view, P.x, P.y, pal.tangent, 4.8);
        const sgn = st.s >= 0 ? 1 : -1;
        // 顶点附近往开口外侧挪一点，别压在对称轴上
        const shiftU = Math.abs(st.s) < 0.4 ? -0.38 : 0;
        labelWorld(
          ctx,
          view,
          'P',
          P.x + vx * 0.44 * sgn + ux * shiftU,
          P.y + vy * 0.44 * sgn + uy * shiftU,
          pal.tangent,
          'center',
          11,
        );

        // 角落：方程 + 两个相等的距离（放在准线一侧的空白处）
        const corner = {
          right: { x: view.x0 + (view.x1 - view.x0) * 0.03, y: view.y1 - 0.45, align: 'left', step: -0.62 },
          left: { x: view.x1 - (view.x1 - view.x0) * 0.03, y: view.y1 - 0.45, align: 'right', step: -0.62 },
          up: { x: view.x0 + (view.x1 - view.x0) * 0.03, y: view.y0 + 1.15, align: 'left', step: -0.62 },
          down: { x: view.x0 + (view.x1 - view.x0) * 0.03, y: view.y1 - 0.45, align: 'left', step: -0.62 },
        }[g.dir];
        labelWorld(ctx, view, st.eq, corner.x, corner.y, pal.text, corner.align, 11);
        labelWorld(
          ctx,
          view,
          L({ zh: `|PF| = |PQ| = ${fnum(st.dist, 2)}`, en: `|PF| = |PQ| = ${fnum(st.dist, 2)}` }),
          corner.x,
          corner.y + corner.step,
          pal.curve3,
          corner.align,
          10,
        );
      },
    });

    defineLesson('parabola', {
      lesson: {
        zh: '抛物线是「到定点 F 和到定直线 l 距离相等」的点的轨迹：定点是焦点，定直线是准线。以开口向右为例，焦点 F(p/2, 0)、准线 x = −p/2，标准方程 y² = 2px。于是焦半径 |PF| = x + p/2，与到准线的距离完全一样；过焦点垂直于对称轴的弦（通径）长为 2p，是过焦点的最短弦。',
        en: 'A parabola is the locus of points equidistant from a fixed point F (the focus) and a fixed line (the directrix). Opening right: F(p/2, 0), directrix x = −p/2, standard form y² = 2px. Hence |PF| = x + p/2, exactly the distance to the directrix; the focal chord perpendicular to the axis (latus rectum) has length 2p and is the shortest chord through the focus.',
      },
      steps: [
        { at: 0, zh: 'P 在抛物线的一支上：先量 |PF|，再量它到准线的垂线长度，两者相等——这就是抛物线的定义。', en: 'P sits on one arm: measure |PF| and the perpendicular distance to the directrix — they are equal, which is the definition.' },
        { at: 0.3, zh: 'P 靠近顶点时两个距离都变短，仍然相等；顶点到焦点和到准线的距离都是 p/2。', en: 'Near the vertex both distances shrink together and stay equal; the vertex is p/2 from the focus and from the directrix.' },
        { at: 0.5, zh: 'P 到达顶点：这是曲线上离准线（和焦点）最近的点，距离为 p/2。', en: 'At the vertex P is closest to the directrix (and to the focus): the distance is p/2.' },
        { at: 0.75, zh: 'P 走向另一支：|PF| 越来越大，p 只决定开口的宽窄——p 越大开口越开阔，通径 2p 也越长。', en: 'P heads up the other arm: |PF| grows. Only p sets the width — larger p opens wider and lengthens the latus rectum 2p.' },
      ],
    });

    defineQuiz('parabola', (rng) => {
      const p = rnum(rng, 1, 6, 0.5);
      const dir = rpick(rng, ['right', 'left', 'up', 'down']);
      const along = p / 2;
      const kind = Math.floor(rng() * 3);
      const dirName = {
        right: { zh: '向右', en: 'right' },
        left: { zh: '向左', en: 'left' },
        up: { zh: '向上', en: 'up' },
        down: { zh: '向下', en: 'down' },
      }[dir];
      const qcoef = pbCoefText(2 * p);
      const qsign = dir === 'left' || dir === 'down' ? '−' : '';
      const eq = dir === 'up' || dir === 'down' ? `x² = ${qsign}${qcoef}y` : `y² = ${qsign}${qcoef}x`;

      if (kind === 0) {
        return makeQuiz(
          { p, dir },
          {
            zh: `抛物线 ${eq} 的通径（过焦点垂直于对称轴的弦）长是多少？`,
            en: `What is the length of the latus rectum of the parabola ${eq}?`,
          },
          '',
          2 * p,
          {
            zh: `对 y² = 2px，通径长 = 2p = 2 × ${fnum(p, 1)} = ${fnum(2 * p, 2)}（通径的两个端点横坐标都是 p/2，纵坐标是 ±p）。`,
            en: `For y² = 2px the latus rectum is 2p = ${fnum(2 * p, 2)}: its endpoints are (p/2, ±p).`,
          },
          0.01,
        );
      }
      if (kind === 1) {
        // 开口向左/向下时焦点在负半轴，准线翻到正半轴
        const ans = dir === 'left' || dir === 'down' ? p / 2 : -p / 2;
        const lineText = dir === 'up' || dir === 'down' ? `y = ${fnum(ans, 2)}` : `x = ${fnum(ans, 2)}`;
        const lineAxis = dir === 'up' || dir === 'down' ? 'y' : 'x';
        return makeQuiz(
          { p, dir },
          {
            zh: `抛物线 ${eq} 的焦点到准线的距离为 ${fnum(p, 1)}，求它的准线方程。答案填写准线对应的坐标值（例如 x = −1 就填 −1）。`,
            en: `The parabola ${eq} has focus–directrix distance ${fnum(p, 1)}. Give the directrix as a number (for x = −1 enter −1).`,
          },
          '',
          ans,
          {
            zh: `开口${dirName.zh}时，焦点在开口一侧、距顶点 p/2 = ${fnum(p / 2, 2)}；准线在顶点的另一侧、与焦点关于顶点对称，所以准线是 ${lineText}。`,
            en: `Opening ${dirName.en} puts the focus p/2 = ${fnum(p / 2, 2)} from the vertex along the axis; the directrix is symmetric about the vertex, so it is ${lineAxis} = ${fnum(ans, 2)}.`,
          },
          0.01,
        );
      }
      const s = rnum(rng, 1, 3, 0.5);
      const px = (s * s) / (2 * p);
      const py = s;
      const dist = px + p / 2;
      // 3 位小数：这些点正好落在抛物线上，写 2 位会让学生验算时对不上
      const xText = dir === 'right' ? fnum(px, 3) : dir === 'left' ? fnum(-px, 3) : fnum(dir === 'up' ? -s : s, 3);
      const yText =
        dir === 'right' ? fnum(py, 3) : dir === 'left' ? fnum(-py, 3) : dir === 'up' ? fnum(px, 3) : fnum(-px, 3);
      return makeQuiz(
        { p, dir },
        {
          zh: `抛物线 ${eq} 上一点 P 的坐标为 (${xText}, ${yText})，求 |PF|。`,
          en: `A point P(${xText}, ${yText}) lies on ${eq}. Find |PF|.`,
        },
        '',
        dist,
        {
          zh: `用抛物线定义：|PF| = P 到准线的距离 = 沿对称轴方向的坐标 + p/2 = ${fnum(px, 3)} + ${fnum(
            p / 2,
            2,
          )} = ${fnum(dist, 3)}。`,
          en: `By definition |PF| equals the distance to the directrix: ${fnum(px, 3)} + p/2 = ${fnum(dist, 3)}.`,
        },
        0.02,
      );
    });

    defineExams([
      {
        id: 'ex-parabola-1',
        modelId: 'parabola',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '通径', en: 'Latus rectum' },
        params: { p: 4, dir: 'right' },
        stem: {
          zh: '已知抛物线 y² = 8x，求它的焦点坐标与通径长。答案填写通径长。',
          en: 'For the parabola y² = 8x, find the focus and the length of the latus rectum. Enter the latus rectum length.',
        },
        unit: '',
        answer: 8,
        tol: 0.01,
        solution: {
          zh: '2p = 8 得 p = 4，焦点为 (p/2, 0) = (2, 0)，准线 x = −2；通径长 = 2p = 8。',
          en: '2p = 8 gives p = 4, so the focus is (2,0), the directrix is x = −2 and the latus rectum is 2p = 8.',
        },
      },
      {
        id: 'ex-parabola-2',
        modelId: 'parabola',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '焦半径', en: 'Focal radius' },
        params: { p: 6, dir: 'right' },
        stem: {
          zh: '抛物线 y² = 12x 上一点 P 到焦点的距离为 5，求 P 的横坐标。',
          en: 'A point P on y² = 12x is 5 units from the focus. Find the x-coordinate of P.',
        },
        unit: '',
        answer: 2,
        tol: 0.01,
        solution: {
          zh: '2p = 12 得 p = 6，焦点 (3, 0)，准线 x = −3。由定义 |PF| = x + 3 = 5，所以 x = 2（此时 y² = 24，y = ±2√6）。',
          en: '2p = 12 gives p = 6: focus (3,0), directrix x = −3. By definition |PF| = x + 3 = 5, so x = 2 (then y = ±2√6).',
        },
      },
    ]);

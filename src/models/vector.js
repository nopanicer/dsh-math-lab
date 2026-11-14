    // ---------------------------------------------------------------------------
    // 模型 2 · 平面向量与数量积（高一）
    // ---------------------------------------------------------------------------

    /** a 的固定倾角（弧度）。只影响取景，不参与任何读数 */
    const vectorTilt = 0.47;
    /** 动画时长（秒）：夹角 θ 从 0° 匀速扫到 180° */
    const vectorSpan = 6;

    /** 参数兜底：滑块之外（例题 params）也要能跑，且不许除零/负长度 */
    function vectorNum(value, fallback, lo, hi) {
      const v = Number(value);
      if (!Number.isFinite(v) || v <= 0) return fallback;
      return clamp(v, lo, hi);
    }

    /** t 时刻的全部几何量：state 与 draw 共用，公式和画面不会打架 */
    function vectorGeom(t, p) {
      const la = vectorNum(p && p.la, 3, 0.3, 9);
      const lb = vectorNum(p && p.lb, 2, 0.3, 9);
      const raw = Number(t);
      const u = clamp(Number.isFinite(raw) ? raw / vectorSpan : 0, 0, 1);
      const th = Math.PI * u;                    // 夹角：0 → π
      const ca = Math.cos(vectorTilt);
      const sa = Math.sin(vectorTilt);
      const beta = vectorTilt + th;              // b 的方向角
      const ax = la * ca;
      const ay = la * sa;
      const bx = lb * Math.cos(beta);
      const by = lb * Math.sin(beta);
      const cos = Math.cos(th);
      const proj = lb * cos;                     // b 在 a 方向上的有符号投影
      return {
        la,
        lb,
        u,
        th,
        ca,
        sa,
        beta,
        ax,
        ay,
        bx,
        by,
        cx: ax + bx,
        cy: ay + by,
        cos,
        dot: la * lb * cos,
        sumLen: Math.hypot(ax + bx, ay + by),
        difLen: Math.hypot(ax - bx, ay - by),
        proj,
        fx: proj * ca,
        fy: proj * sa,
      };
    }

    defineModel({
      id: 'vector',
      grade: 1,
      name: { zh: '平面向量', en: 'Plane vectors' },
      formula: { zh: 'a·b = |a||b|cos θ　|a + b|² = |a|² + |b|² + 2a·b', en: 'a·b = |a||b|cos θ　|a + b|² = |a|² + |b|² + 2a·b' },
      hint: {
        zh: '数量积把长度和夹角装进一个数：a·b = |a||b|cosθ，几何上就是 |a| 乘上 b 在 a 上的投影。夹角从 0° 扫到 180°，a·b 由正变零再变负，|a + b| 先减小再增大。',
        en: 'The dot product folds lengths and angle into one scalar: a·b = |a||b|cos θ = |a| × (projection of b on a). Sweeping θ from 0° to 180° takes a·b from positive through zero to negative.',
      },
      chartLabel: { zh: 'a·b', en: 'a·b' },
      timeline: { zh: '动画：夹角 θ 从 0° 匀速扫到 180°', en: 'Animation: θ sweeps from 0° to 180°' },
      params: [
        { key: 'la', label: { zh: '模 |a|', en: 'Length |a|' }, min: 1, max: 5, step: 0.1, init: 3, unit: '', digits: 1 },
        { key: 'lb', label: { zh: '模 |b|', en: 'Length |b|' }, min: 1, max: 5, step: 0.1, init: 2, unit: '', digits: 1 },
      ],
      box(p) {
        const la = vectorNum(p && p.la, 3, 0.3, 9);
        const lb = vectorNum(p && p.lb, 2, 0.3, 9);
        const ca = Math.cos(vectorTilt);
        const sa = Math.sin(vectorTilt);
        const left = -lb * ca;
        const right = (la + lb) * ca;
        const bottom = -lb * sa;
        const top = la * sa + lb;
        const mx = Math.max(0.5, 0.1 * (right - left));
        const my = Math.max(0.45, 0.1 * (top - bottom));
        return { xMin: left - mx, xMax: right + mx, yMin: bottom - my, yMax: top + my };
      },
      duration() {
        return vectorSpan;
      },
      state(t, p) {
        const g = vectorGeom(t, p);
        const deg = (g.th * 180) / Math.PI;
        let summary;
        if (deg < 2) {
          summary = {
            zh: `θ ≈ 0°：a 与 b 同向，a·b = |a||b| = ${fnum(g.la * g.lb, 3)} 取到最大值，|a + b| = |a| + |b| = ${fnum(g.la + g.lb, 3)}。`,
            en: 'θ ≈ 0°: a and b point the same way — a·b = |a||b| is maximal and |a + b| = |a| + |b|.',
          };
        } else if (deg > 178) {
          summary = {
            zh: `θ ≈ 180°：a 与 b 反向，a·b = −|a||b| = ${fnum(-g.la * g.lb, 3)} 取到最小值，|a + b| = ||a| − |b|| = ${fnum(Math.abs(g.la - g.lb), 3)}。`,
            en: 'θ ≈ 180°: a and b point opposite — a·b = −|a||b| is minimal and |a + b| = ||a| − |b||.',
          };
        } else if (Math.abs(g.cos) < 0.012) {
          summary = {
            zh: `θ ≈ 90°：a·b = 0，两向量垂直，此时 |a + b|² = |a|² + |b|² = ${fnum(g.la * g.la + g.lb * g.lb, 3)}，b 在 a 上的投影为 0。`,
            en: 'θ ≈ 90°: a·b = 0, the vectors are perpendicular, |a + b|² = |a|² + |b|², and the projection of b on a vanishes.',
          };
        } else if (g.cos > 0) {
          summary = {
            zh: '锐角：cos θ > 0，故 a·b > 0，投影为正。由 |a + b|² = |a|² + |b|² + 2a·b 可知 |a + b| 比垂直时更长。',
            en: 'Acute θ: cos θ > 0, so a·b > 0 and the projection is positive; |a + b|² = |a|² + |b|² + 2a·b exceeds its perpendicular value.',
          };
        } else {
          summary = {
            zh: '钝角：cos θ < 0，故 a·b < 0，b 的投影落在 a 的反向延长线上（投影为负）。此时 |a + b|² < |a|² + |b|²。',
            en: 'Obtuse θ: cos θ < 0, so a·b < 0 and the projection lands on the backward extension of a; now |a + b|² < |a|² + |b|².',
          };
        }
        return {
          t: g.u * vectorSpan,
          ...g,
          summary,
          chartValue: g.dot,
          rows: [
            { label: { zh: '夹角 θ', en: 'Angle θ' }, value: degText(g.th, 1) },
            { label: { zh: 'cos θ', en: 'cos θ' }, value: fnum(g.cos, 3) },
            { label: { zh: '数量积 a·b', en: 'Dot product a·b' }, value: fnum(g.dot, 3) },
            { label: { zh: '|a + b|', en: '|a + b|' }, value: fnum(g.sumLen, 3) },
            { label: { zh: '|a − b|', en: '|a − b|' }, value: fnum(g.difLen, 3) },
            { label: { zh: 'b 在 a 上的投影', en: 'Projection of b on a' }, value: fnum(g.proj, 3) },
          ],
        };
      },
      draw(ctx, st, view, pal, opts) {
        const aux = !opts || opts.aux !== false;
        const g = st;
        const X = (v) => view.toX(v);
        const Y = (v) => view.toY(v);

        // 平行四边形：a + b 是它的一条对角线，a − b 是另一条
        regionWorld(ctx, view, [[0, 0], [g.ax, g.ay], [g.cx, g.cy], [g.bx, g.by]], pal.area);
        if (aux) {
          segmentWorld(ctx, view, g.ax, g.ay, g.cx, g.cy, pal.muted, 1.1, [4, 4]);
          segmentWorld(ctx, view, g.bx, g.by, g.cx, g.cy, pal.muted, 1.1, [4, 4]);
        }

        // 投影：O → F 的有向线段（青色）+ B → F 的垂线
        if (Math.abs(g.proj) > 0.02) {
          segmentWorld(ctx, view, 0, 0, g.fx, g.fy, pal.curve3, 3.4);
          dotWorld(ctx, view, g.fx, g.fy, pal.curve3, 3);
        }
        const bx0 = X(g.bx);
        const by0 = Y(g.by);
        const fx0 = X(g.fx);
        const fy0 = Y(g.fy);
        if (Math.hypot(bx0 - fx0, by0 - fy0) > 4) {
          segmentWorld(ctx, view, g.bx, g.by, g.fx, g.fy, pal.muted, 1.1, [3, 4]);
          if (aux) {
            const dx = g.bx - g.fx;
            const dy = g.by - g.fy;
            const len = Math.hypot(dx, dy);
            if (len > 0.12) {
              const towardO = g.proj >= 0 ? -1 : 1;
              rightAngle(ctx, view, g.fx, g.fy, [towardO * g.ca, towardO * g.sa], [dx / len, dy / len], pal.muted, 9);
            }
          }
        }

        // 三个向量 + 差向量
        arrowWorld(ctx, view, 0, 0, g.ax, g.ay, pal.curve, 2.4);
        arrowWorld(ctx, view, 0, 0, g.bx, g.by, pal.curve2, 2.4);
        arrowWorld(ctx, view, 0, 0, g.cx, g.cy, pal.point, 2.8);
        if (g.difLen > 0.05) {
          const ax0 = X(g.ax);
          const ay0 = Y(g.ay);
          const dx = ax0 - bx0;
          const dy = ay0 - by0;
          const len = Math.hypot(dx, dy);
          if (len > 8) {
            segmentWorld(ctx, view, g.bx, g.by, g.ax, g.ay, pal.tangent, 1.8, [7, 5]);
            const back = Math.min(14, len * 0.4);
            arrow(ctx, ax0 - (dx / len) * back, ay0 - (dy / len) * back, ax0, ay0, pal.tangent, 1.8);
          }
        }

        // 夹角弧
        const rpx = Math.max(15, Math.min(62, Math.min(g.la, g.lb) * 0.34 * view.scale));
        if (g.th > 0.02) {
          arcWorld(ctx, view, 0, 0, rpx / view.scale, vectorTilt, vectorTilt + g.th, pal.muted, 1.2);
        }

        // 文字标签（全部走屏幕像素偏移，换参数也不会压线）
        const mid = vectorTilt + g.th / 2;
        const ox = X(0);
        const oy = Y(0);
        // 两向量快要共线时，所有线段挤成一条，细节标签就收起来（左上角仍有精确读数）
        const spread = Math.abs(Math.sin(g.th)) > 0.25;
        // 角度符号放在角平分线上（数值放左上角，避免和 a + b 的对角线打架）
        if (spread) tag(ctx, 'θ', ox + Math.cos(mid) * (rpx + 17), oy - Math.sin(mid) * (rpx + 17), pal.text, 'center', 11);
        // a、b 标在向量中段（下方 / 外侧），把箭头的端点留给 a − b 和 a + b
        tag(ctx, 'a', X(g.ax * 0.55) + g.sa * 15, Y(g.ay * 0.55) + g.ca * 15, pal.curve, 'center', 12);
        tag(ctx, 'b', X(g.bx * 0.55) - Math.sin(g.beta) * 16, Y(g.by * 0.55) - Math.cos(g.beta) * 16, pal.curve2, 'center', 12);
        tag(ctx, 'a + b', X(g.cx) + 12, Y(g.cy) - 15, pal.point, 'left', 11);
        if (spread && g.difLen > 0.15) {
          // a − b 写在 A 端箭头之外：AB 的中点恰好是 a + b 的中点，写在中间必然压线
          const uabx = (g.ax - g.bx) / g.difLen;
          const uaby = (g.ay - g.by) / g.difLen;
          tag(ctx, 'a − b', X(g.ax) + uabx * 18, Y(g.ay) - uaby * 18, pal.tangent, 'center', 11);
        }
        if (aux && spread && Math.abs(g.proj) * view.scale > 78) {
          tag(ctx, `${L({ zh: '投影', en: 'proj' })} ${fnum(g.proj, 2)}`, X(g.fx / 2) + g.sa * 15, Y(g.fy / 2) + g.ca * 15, pal.curve3, 'center', 10);
        }

        // 左上角实时读数：角度与数量积
        setChip(pal.chip);
        tag(ctx, `θ = ${degText(g.th, 1)}　a·b = ${fnum(g.dot, 2)}`, 14, 16, pal.text, 'left', 11);
        setChip(null);
      },
    });

    defineLesson('vector', {
      lesson: {
        zh: '两个向量的数量积 a·b = |a||b|cos θ 是一个数，不是向量。它同时记住三件事：两条边的长度、夹角、以及“b 在 a 方向上有多少”。当 θ = 90° 时 cos θ = 0，数量积为 0，这正是“垂直”的代数写法；平方展开式 |a + b|² = |a|² + |b|² + 2a·b 则是余弦定理的向量版本。',
        en: 'The dot product a·b = |a||b|cos θ is a scalar, not a vector. It records three things at once: the two lengths, the angle, and “how much of b points along a”. At θ = 90° the cosine vanishes, which is the algebraic way of saying perpendicular; and |a + b|² = |a|² + |b|² + 2a·b is the vector form of the cosine rule.',
      },
      steps: [
        { at: 0, zh: 'θ = 0°：b 与 a 同向，a·b = |a||b| 最大；平行四边形退化成一条线，a + b 最长。', en: 'θ = 0°: b points along a, a·b = |a||b| is maximal, and a + b is longest.' },
        { at: 0.32, zh: 'b 逆时针转开，θ 变大，cos θ 变小，a·b = |a||b|cos θ 随之变小；对角线 a + b 在缩短。', en: 'As b swings away, θ grows and cos θ shrinks, so a·b = |a||b|cos θ falls; the diagonal a + b gets shorter.' },
        { at: 0.5, zh: 'θ = 90°：cos θ = 0，a·b = 0，两向量垂直；此时 |a + b|² = |a|² + |b|²，b 在 a 上的投影长度为 0。', en: 'θ = 90°: cos θ = 0, so a·b = 0 — perpendicular; now |a + b|² = |a|² + |b|² and the projection of b on a is zero.' },
        { at: 0.72, zh: '越过 90°，cos θ < 0，a·b 变负；投影落到 a 的反向延长线上，青色段跑到原点的左边。', en: 'Past 90° the cosine is negative: a·b < 0 and the projection falls on the backward extension of a.' },
        { at: 0.92, zh: 'θ → 180°：a·b = −|a||b| 最小，a + b 缩到 ||a| − |b||，两向量反向。', en: 'θ → 180°: a·b = −|a||b| is minimal, a + b shrinks to ||a| − |b||, and the vectors are opposite.' },
      ],
    });

    defineQuiz('vector', (rng) => {
      const la = rnum(rng, 1, 5, 1);
      const lb = rnum(rng, 1, 5, 1);
      const deg = rpick(rng, [30, 45, 60, 90, 120, 135, 150]);
      const rad = (deg * Math.PI) / 180;
      const cos = Math.cos(rad);
      const params = { la, lb };
      const kind = Math.floor(rng() * 3);

      if (kind === 0) {
        const dot = la * lb * cos;
        return makeQuiz(
          params,
          {
            zh: `已知平面向量 a、b 满足 |a| = ${fnum(la, 1)}，|b| = ${fnum(lb, 1)}，夹角为 ${deg}°，求 a·b。`,
            en: `Given |a| = ${fnum(la, 1)}, |b| = ${fnum(lb, 1)} and the angle between them is ${deg}°, find a·b.`,
          },
          '',
          dot,
          {
            zh: `a·b = |a||b|cos ${deg}° = ${fnum(la, 1)} × ${fnum(lb, 1)} × cos ${deg}° = ${fnum(dot, 3)}。`,
            en: `a·b = |a||b|cos ${deg}° = ${fnum(dot, 3)}.`,
          },
          0.01,
        );
      }
      if (kind === 1) {
        const sumLen = Math.sqrt(la * la + lb * lb + 2 * la * lb * cos);
        return makeQuiz(
          params,
          {
            zh: `已知 |a| = ${fnum(la, 1)}，|b| = ${fnum(lb, 1)}，a 与 b 的夹角为 ${deg}°，求 |a + b|。`,
            en: `Given |a| = ${fnum(la, 1)}, |b| = ${fnum(lb, 1)} and the angle ${deg}°, find |a + b|.`,
          },
          '',
          sumLen,
          {
            zh: `|a + b|² = |a|² + |b|² + 2|a||b|cos ${deg}° = ${fnum(la * la, 2)} + ${fnum(lb * lb, 2)} + (2 × ${fnum(la, 1)} × ${fnum(lb, 1)} × cos ${deg}°) = ${fnum(sumLen * sumLen, 3)}，所以 |a + b| = ${fnum(sumLen, 3)}。`,
            en: `|a + b|² = |a|² + |b|² + 2|a||b|cos ${deg}° = ${fnum(sumLen * sumLen, 3)}, so |a + b| = ${fnum(sumLen, 3)}.`,
          },
          0.01,
        );
      }
      const difLen = Math.sqrt(la * la + lb * lb - 2 * la * lb * cos);
      return makeQuiz(
        params,
        {
          zh: `已知 |a| = ${fnum(la, 1)}，|b| = ${fnum(lb, 1)}，夹角为 ${deg}°，求 |a − b|。`,
          en: `Given |a| = ${fnum(la, 1)}, |b| = ${fnum(lb, 1)} and the angle ${deg}°, find |a − b|.`,
        },
        '',
        difLen,
        {
          zh: `|a − b|² = |a|² + |b|² − 2|a||b|cos ${deg}° = ${fnum(la * la, 2)} + ${fnum(lb * lb, 2)} − (2 × ${fnum(la, 1)} × ${fnum(lb, 1)} × cos ${deg}°) = ${fnum(difLen * difLen, 3)}，所以 |a − b| = ${fnum(difLen, 3)}。`,
          en: `|a − b|² = |a|² + |b|² − 2|a||b|cos ${deg}° = ${fnum(difLen * difLen, 3)}, so |a − b| = ${fnum(difLen, 3)}.`,
        },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-vector-1',
        modelId: 'vector',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '数量积', en: 'Dot product' },
        params: { la: 2, lb: 3 },
        stem: {
          zh: '已知 |a| = 2，|b| = 3，a 与 b 的夹角为 60°，求 a·b。',
          en: 'Given |a| = 2, |b| = 3 and the angle between a and b is 60°, find a·b.',
        },
        unit: '',
        answer: 3,
        tol: 0.01,
        solution: {
          zh: 'a·b = |a||b|cos 60° = 2 × 3 × 1/2 = 3。',
          en: 'a·b = |a||b|cos 60° = 2 × 3 × 1/2 = 3.',
        },
      },
      {
        id: 'ex-vector-2',
        modelId: 'vector',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '模长公式', en: 'Length formula' },
        params: { la: 3, lb: 4 },
        stem: {
          zh: '已知 |a| = 3，|b| = 4，a 与 b 的夹角为 120°，求 |a + b|。',
          en: 'Given |a| = 3, |b| = 4 and the angle 120°, find |a + b|.',
        },
        unit: '',
        answer: Math.sqrt(13),
        tol: 0.01,
        solution: {
          zh: '|a + b|² = 9 + 16 + 2 × 3 × 4 × (−1/2) = 25 − 12 = 13，所以 |a + b| = √13。',
          en: '|a + b|² = 9 + 16 + 24 × (−1/2) = 13, so |a + b| = √13.',
        },
      },
      {
        id: 'ex-vector-3',
        modelId: 'vector',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '由数量积求夹角', en: 'Angle from dot product' },
        params: { la: 2, lb: 5 },
        stem: {
          zh: '已知 |a| = 2，|b| = 5，a·b = −5，求 a 与 b 的夹角（单位：度）。',
          en: 'Given |a| = 2, |b| = 5 and a·b = −5, find the angle between a and b in degrees.',
        },
        unit: '°',
        answer: 120,
        tol: 0.01,
        solution: {
          zh: 'cos θ = a·b / (|a||b|) = −5 / 10 = −1/2，所以 θ = 120°。',
          en: 'cos θ = a·b/(|a||b|) = −1/2, so θ = 120°.',
        },
      },
    ]);

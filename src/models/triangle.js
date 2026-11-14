    // ---------------------------------------------------------------------------
    // 模型 3 · 解三角形：正弦定理与 a / sin A = 2R（高一）
    // ---------------------------------------------------------------------------

    /** 动画时长（秒）：顶点 A 沿圆弧滑动 */
    const triangleSpan = 5.4;

    /** 参数兜底：外部传入的 params 可能越界，这里统一夹紧 */
    function triangleNum(value, fallback, lo, hi) {
      const v = Number(value);
      if (!Number.isFinite(v) || v <= 0) return fallback;
      return clamp(v, lo, hi);
    }

    /**
     * 外接圆圆心放在原点（坐标轴交点正好是外心 O），半径 R = a / (2 sin A)。
     * 弦 BC 水平，位于 y = −k（k = R cos A）；顶点 A 在上方那段弧上滑动，∠A 恒为 A。
     */
    function triangleGeom(t, p) {
      const a = triangleNum(p && p.a, 4, 1, 12);
      const Adeg = triangleNum(p && p.A, 60, 20, 160);
      const A = Adeg * DEG;
      const sinA = Math.max(1e-4, Math.sin(A));
      const R = a / (2 * sinA);
      const k = R * Math.cos(A);
      const chordY = -k;
      // 弦的两个端点在外接圆上的中心角；它们之间、不含 A 的那段弧就是“A 可走的轨道”
      const phiC = A - Math.PI / 2;
      const arcSpan = TAU - 2 * A;
      const raw = Number(t);
      const u = clamp(Number.isFinite(raw) ? raw / triangleSpan : 0, 0, 1);
      // 两端各留 18%：避免 A 恰好落在 B 或 C 上（退化三角形）
      const pad = 0.26;
      const phi = phiC + arcSpan * (pad + (1 - 2 * pad) * u);
      const ax = R * Math.cos(phi);
      const ay = R * Math.sin(phi);
      const bx = -a / 2;
      const cx = a / 2;
      const b = Math.hypot(ax - cx, ay - chordY);   // CA，∠B 的对边
      const c = Math.hypot(ax - bx, ay - chordY);   // AB，∠C 的对边
      const alt = ay - chordY;                      // 以 BC 为底的高
      const area = (a * alt) / 2;
      const cosB = clamp((c * c + a * a - b * b) / Math.max(1e-9, 2 * c * a), -1, 1);
      const cosC = clamp((b * b + a * a - c * c) / Math.max(1e-9, 2 * b * a), -1, 1);
      return {
        a,
        Adeg,
        A,
        R,
        k,
        phiC,
        arcSpan,
        phi,
        u,
        ax,
        ay,
        bx,
        by: chordY,
        cx,
        cy: chordY,
        b,
        c,
        alt,
        area,
        Bdeg: (Math.acos(cosB) * 180) / Math.PI,
        Cdeg: (Math.acos(cosC) * 180) / Math.PI,
      };
    }

    defineModel({
      id: 'triangle',
      grade: 1,
      name: { zh: '解三角形', en: 'Solving triangles' },
      formula: {
        zh: 'a / sin A = b / sin B = c / sin C = 2R',
        en: 'a / sin A = b / sin B = c / sin C = 2R',
      },
      hint: {
        zh: '弦 BC 固定，顶点 A 在同一段弧上滑动：同弦同角，∠A 不变，外接圆半径 R 也就不变，所以 a / sin A = 2R 是这条弦的“身份证”。变的只是 b、c 和面积。',
        en: 'Fix chord BC and let A slide along the same arc: equal chords subtend equal angles, so ∠A and the circumradius R never change — a / sin A = 2R is the chord’s fingerprint. Only b, c and the area move.',
      },
      chartLabel: { zh: '面积 S', en: 'Area S' },
      timeline: { zh: '动画：顶点 A 沿圆弧滑动，∠A 保持不变', en: 'Animation: A slides along the arc while ∠A stays fixed' },
      params: [
        { key: 'a', label: { zh: '弦 BC 长 a', en: 'Chord a = BC' }, min: 2, max: 6, step: 0.5, init: 4, unit: '', digits: 1 },
        { key: 'A', label: { zh: '顶角 A', en: 'Angle A' }, min: 30, max: 110, step: 1, init: 60, unit: '°', digits: 0 },
      ],
      box(p) {
        const a = triangleNum(p && p.a, 4, 1, 12);
        const A = triangleNum(p && p.A, 60, 20, 160) * DEG;
        const R = a / (2 * Math.max(1e-4, Math.sin(A)));
        const m = Math.max(0.5, 0.32 * R);
        return { xMin: -R - m, xMax: R + m, yMin: -R - m, yMax: R + m };
      },
      duration() {
        return triangleSpan;
      },
      state(t, p) {
        const g = triangleGeom(t, p);
        const twoR = 2 * g.R;
        const isosceles = Math.abs(g.b - g.c) < 0.02 * Math.max(g.b, g.c);
        const summary = isosceles
          ? {
              zh: `此刻 b = c，A 正处在弧的最高点，面积取到最大值 ${fnum(g.area, 3)}；但 a / sin A = 2R = ${fnum(twoR, 3)} 始终没变。`,
              en: `Here b = c: A sits at the top of the arc and the area peaks at ${fnum(g.area, 3)} — yet a / sin A = 2R = ${fnum(twoR, 3)} never changes.`,
            }
          : {
              zh: `A 沿弧移动：∠A 恒为 ${fnum(g.Adeg, 1)}°，a / sin A = 2R = ${fnum(twoR, 3)} 也不变；b、c 与面积在变，b = c 时面积最大。`,
              en: `As A slides, ∠A stays ${fnum(g.Adeg, 1)}° and a / sin A = 2R = ${fnum(twoR, 3)} stays put; b, c and the area change, peaking when b = c.`,
            };
        return {
          t: g.u * triangleSpan,
          ...g,
          summary,
          chartValue: g.area,
          rows: [
            { label: { zh: '顶角 ∠A', en: 'Angle A' }, value: degText(g.A, 1) },
            { label: { zh: '边 b = CA', en: 'Side b = CA' }, value: fnum(g.b, 3) },
            { label: { zh: '边 c = AB', en: 'Side c = AB' }, value: fnum(g.c, 3) },
            { label: { zh: '外接圆半径 R', en: 'Circumradius R' }, value: fnum(g.R, 3) },
            { label: { zh: 'a / sin A', en: 'a / sin A' }, value: fnum(twoR, 3) },
            { label: { zh: '底边上的高 h', en: 'Altitude h' }, value: fnum(g.alt, 3) },
            { label: { zh: '面积 S', en: 'Area S' }, value: fnum(g.area, 3) },
          ],
        };
      },
      draw(ctx, st, view, pal, opts) {
        const aux = !opts || opts.aux !== false;
        const g = st;
        const X = (v) => view.toX(v);
        const Y = (v) => view.toY(v);
        const R = g.R;
        const chordY = g.by;
        const phiB = g.phiC + g.arcSpan;

        // 外接圆（虚线）+ A 可走的轨道（橙色实线）
        arcWorld(ctx, view, 0, 0, R, 0, TAU, pal.muted, 1.1, [4, 5]);
        arcWorld(ctx, view, 0, 0, R, g.phiC, phiB, pal.point, 2, null);

        // 三边：a = BC（蓝）、b = CA（紫）、c = AB（青）
        segmentWorld(ctx, view, g.bx, chordY, g.cx, chordY, pal.curve, 3.2);
        segmentWorld(ctx, view, g.cx, chordY, g.ax, g.ay, pal.curve2, 2.2);
        segmentWorld(ctx, view, g.ax, g.ay, g.bx, chordY, pal.curve3, 2.2);

        // 底边上的高（先画，等腰时会被半径盖住上半段）与半径 OA（红色实线）
        segmentWorld(ctx, view, g.ax, g.ay, g.ax, chordY, pal.muted, 1.2, [3, 4]);
        segmentWorld(ctx, view, 0, 0, g.ax, g.ay, pal.tangent, 1.6);
        if (aux && g.alt > 1e-6) {
          rightAngle(ctx, view, g.ax, chordY, [0, 1], [g.ax > g.cx ? -1 : 1, 0], pal.muted, 9);
        }

        // 点：外心（原点）、B、C、A
        if (aux) dotWorld(ctx, view, 0, 0, pal.muted, 3.2);
        dotWorld(ctx, view, g.bx, chordY, pal.curve, 4);
        dotWorld(ctx, view, g.cx, chordY, pal.curve, 4);
        dotWorld(ctx, view, g.ax, g.ay, pal.point, 4.8);

        // ∠A 的圆弧：取两条边之间的那一段
        const a0 = Math.atan2(chordY - g.ay, g.bx - g.ax);
        const a1 = Math.atan2(chordY - g.ay, g.cx - g.ax);
        let d = a1 - a0;
        while (d > Math.PI) d -= TAU;
        while (d < -Math.PI) d += TAU;
        const rpx = clamp(0.24 * Math.min(g.b, g.c) * view.scale, 14, 46);
        const rw = rpx / view.scale;
        if (d >= 0) arcWorld(ctx, view, g.ax, g.ay, rw, a0, a1, pal.muted, 1.2);
        else arcWorld(ctx, view, g.ax, g.ay, rw, a1, a0, pal.muted, 1.2);

        // —— 标签 ——
        // “背离重心”的方向：边名与半径名都落在三角形外侧
        const gx = (g.ax + g.bx + g.cx) / 3;
        const gy = (g.ay + chordY + chordY) / 3;
        const away = (wx, wy) => {
          const vx = wx - gx;
          const vy = wy - gy;
          const len = Math.hypot(vx, vy) || 1;
          return [vx / len, vy / len];
        };
        // A、B、C 沿半径向外，天然落在圆外，不会压住弦或高
        tag(ctx, 'A', X(g.ax) + (g.ax / R) * 19, Y(g.ay) - (g.ay / R) * 19, pal.point, 'center', 12);
        tag(ctx, 'B', X(g.bx) + (g.bx / R) * 17, Y(chordY) - (chordY / R) * 17, pal.curve, 'center', 12);
        tag(ctx, 'C', X(g.cx) + (g.cx / R) * 17, Y(chordY) - (chordY / R) * 17, pal.curve, 'center', 12);
        // 边名
        tag(ctx, 'a', X(g.bx + 0.35 * g.a), Y(chordY) + 16, pal.curve, 'center', 11);
        // 边名放在 0.6 处而不是中点：A 滑到靠近端点时中点会撞上坐标原点的 O
        const tb = 0.6;
        const mbx = g.cx + (g.ax - g.cx) * tb;
        const mby = chordY + (g.ay - chordY) * tb;
        const nb = away(mbx, mby);
        const bpx = X(mbx) + nb[0] * 15;
        const bpy = Y(mby) - nb[1] * 15;
        tag(ctx, 'b', bpx, bpy, pal.curve2, 'center', 11);
        const mcx = g.bx + (g.ax - g.bx) * tb;
        const mcy = chordY + (g.ay - chordY) * tb;
        const nc = away(mcx, mcy);
        const cpx = X(mcx) + nc[0] * 15;
        const cpy = Y(mcy) - nc[1] * 15;
        tag(ctx, 'c', cpx, cpy, pal.curve3, 'center', 11);
        // 半径 R：在两个垂直方向里挑离 b、c 更远的那个
        const uax = g.ax / R;
        const uay = g.ay / R;
        const rmx = X(g.ax * 0.3);
        const rmy = Y(g.ay * 0.3);
        const rx1 = rmx - uay * 15;
        const ry1 = rmy - uax * 15;
        const rx2 = rmx + uay * 15;
        const ry2 = rmy + uax * 15;
        const rd1 = Math.min(Math.hypot(rx1 - bpx, ry1 - bpy), Math.hypot(rx1 - cpx, ry1 - cpy));
        const rd2 = Math.min(Math.hypot(rx2 - bpx, ry2 - bpy), Math.hypot(rx2 - cpx, ry2 - cpy));
        if (rd1 >= rd2) tag(ctx, 'R', rx1, ry1, pal.tangent, 'center', 11);
        else tag(ctx, 'R', rx2, ry2, pal.tangent, 'center', 11);
        // 高只用虚线和直角标记表示：等腰时它与半径重合，再挂文字必然和 R、∠A 挤在一起
        // ∠A 的度数放在角平分线上
        const ubx = (g.bx - g.ax) / Math.max(1e-9, g.c);
        const uby = (chordY - g.ay) / Math.max(1e-9, g.c);
        const ucx = (g.cx - g.ax) / Math.max(1e-9, g.b);
        const ucy = (chordY - g.ay) / Math.max(1e-9, g.b);
        let bisx = ubx + ucx;
        let bisy = uby + ucy;
        const bisl = Math.hypot(bisx, bisy) || 1;
        bisx /= bisl;
        bisy /= bisl;
        tag(ctx, `${fnum(g.Adeg, 1)}°`, X(g.ax) + bisx * (rpx + 22), Y(g.ay) - bisy * (rpx + 22), pal.text, 'center', 11);

        // 恒等式角标
        setChip(pal.chip);
        tag(ctx, `a / sin A = 2R = ${fnum(2 * R, 3)}`, 14, 16, pal.text, 'left', 11);
        setChip(null);
      },
    });

    defineLesson('triangle', {
      lesson: {
        zh: '正弦定理说：同一个三角形里，a / sin A = b / sin B = c / sin C，而这个公共值恰好是外接圆直径 2R。反过来看更清楚——弦 BC 的长度 a 和外接圆半径 R 一固定，∠A 就固定了（同弦同角）；A 在弧上怎么滑，这个比值都不动。',
        en: 'The law of sines says a / sin A = b / sin B = c / sin C, and that common value is exactly the circumdiameter 2R. Read it backwards: once chord BC and the circumcircle are fixed, the angle ∠A is fixed too (equal chords, equal angles) — so the ratio cannot move no matter where A slides.',
      },
      steps: [
        { at: 0, zh: '先把弦 BC 固定，画它的外接圆。半径 R = a / (2 sin A)，圆心落在 BC 的中垂线上。', en: 'Start with chord BC and its circumcircle. The radius is R = a / (2 sin A) and the centre sits on the perpendicular bisector of BC.' },
        { at: 0.3, zh: '顶点 A 落在橙色弧上。橙色弧就是“同弦同角”的轨迹：A 走到哪儿，张角都是同一个 ∠A。', en: 'A moves on the orange arc — the locus of points that see chord BC under the same angle.' },
        { at: 0.55, zh: 'A 接近弧的最高点时 b = c，三角形变成等腰，此时面积取到最大值；但 a / sin A = 2R 一点没变。', en: 'Near the top of the arc b = c, the triangle becomes isosceles and the area peaks — while a / sin A = 2R stays exactly the same.' },
        { at: 0.82, zh: '红色半径始终是 R，红色虚线 OA 随 A 转动，长度不变；a / sin A 就是 2R，所以它是这条弦的常数。', en: 'The red radius is always R: it rotates with A but never changes length, and a / sin A — which equals 2R — is constant for this chord.' },
      ],
    });

    defineQuiz('triangle', (rng) => {
      const Adeg = rpick(rng, [30, 45, 60, 90, 120, 135]);
      const rad = (Adeg * Math.PI) / 180;
      const sinA = Math.sin(rad);
      const cosA = Math.cos(rad);
      const kind = Math.floor(rng() * 3);

      if (kind === 0) {
        const a = rnum(rng, 2, 6, 1);
        const R = a / (2 * sinA);
        return makeQuiz(
          { a, A: Adeg },
          {
            zh: `在 △ABC 中，边 a = ${fnum(a, 1)}，∠A = ${Adeg}°，求外接圆半径 R。`,
            en: `In △ABC, a = ${fnum(a, 1)} and ∠A = ${Adeg}°. Find the circumradius R.`,
          },
          '',
          R,
          {
            zh: `由 a / sin A = 2R 得 R = a / (2 sin A) = ${fnum(a, 1)} / (2 × sin ${Adeg}°) = ${fnum(R, 3)}。`,
            en: `From a / sin A = 2R, R = a / (2 sin A) = ${fnum(R, 3)}.`,
          },
          0.01,
        );
      }
      if (kind === 1) {
        const b = rnum(rng, 2, 5, 1);
        const c = rnum(rng, 2, 5, 1);
        const a = Math.sqrt(b * b + c * c - 2 * b * c * cosA);
        return makeQuiz(
          { a: Number(clamp(a, 1, 12).toFixed(3)), A: Adeg },
          {
            zh: `在 △ABC 中，b = ${fnum(b, 1)}，c = ${fnum(c, 1)}，∠A = ${Adeg}°，求边 a。`,
            en: `In △ABC, b = ${fnum(b, 1)}, c = ${fnum(c, 1)} and ∠A = ${Adeg}°. Find side a.`,
          },
          '',
          a,
          {
            zh: `余弦定理：a² = b² + c² − 2bc·cos A = ${fnum(b * b, 2)} + ${fnum(c * c, 2)} − 2 × ${fnum(b, 1)} × ${fnum(c, 1)} × cos ${Adeg}° = ${fnum(a * a, 3)}，所以 a = ${fnum(a, 3)}。`,
            en: `Cosine rule: a² = b² + c² − 2bc·cos A = ${fnum(a * a, 3)}, so a = ${fnum(a, 3)}.`,
          },
          0.01,
        );
      }
      const Bdeg = rpick(rng, [45, 60, 105, 120]);
      const a = rnum(rng, 2, 6, 1);
      const b = (a * Math.sin((Bdeg * Math.PI) / 180)) / sinA;
      return makeQuiz(
        { a, A: Adeg },
        {
          zh: `在 △ABC 中，a = ${fnum(a, 1)}，∠A = ${Adeg}°，∠B = ${Bdeg}°，求边 b。`,
          en: `In △ABC, a = ${fnum(a, 1)}, ∠A = ${Adeg}° and ∠B = ${Bdeg}°. Find side b.`,
        },
        '',
        b,
        {
          zh: `由 a / sin A = b / sin B 得 b = a·sin B / sin A = ${fnum(a, 1)} × sin ${Bdeg}° / sin ${Adeg}° = ${fnum(b, 3)}。`,
          en: `From a / sin A = b / sin B, b = a·sin B / sin A = ${fnum(b, 3)}.`,
        },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-triangle-1',
        modelId: 'triangle',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '正弦定理求半径', en: 'Circumradius' },
        params: { a: 4, A: 30 },
        stem: {
          zh: '在 △ABC 中，a = 4，∠A = 30°，求 △ABC 外接圆的半径 R。',
          en: 'In △ABC, a = 4 and ∠A = 30°. Find the circumradius R.',
        },
        unit: '',
        answer: 4,
        tol: 0.01,
        solution: {
          zh: '由正弦定理 a / sin A = 2R，得 4 / sin 30° = 4 / (1/2) = 8 = 2R，所以 R = 4。',
          en: 'By the law of sines a / sin A = 2R: 4 / (1/2) = 8 = 2R, so R = 4.',
        },
      },
      {
        id: 'ex-triangle-2',
        modelId: 'triangle',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '余弦定理', en: 'Cosine rule' },
        params: { a: 5, A: 90 },
        stem: {
          zh: '在 △ABC 中，b = 3，c = 4，∠A = 90°，求边 a。',
          en: 'In △ABC, b = 3, c = 4 and ∠A = 90°. Find side a.',
        },
        unit: '',
        answer: 5,
        tol: 0.01,
        solution: {
          zh: '余弦定理：a² = b² + c² − 2bc·cos 90° = 9 + 16 − 0 = 25，所以 a = 5（也就是勾股定理）。',
          en: 'Cosine rule: a² = 9 + 16 − 0 = 25, so a = 5 — this is just Pythagoras.',
        },
      },
      {
        id: 'ex-triangle-3',
        modelId: 'triangle',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '正弦定理求边', en: 'Law of sines' },
        params: { a: 4, A: 30 },
        stem: {
          zh: '在 △ABC 中，a = 4，∠A = 30°，∠B = 60°，求边 b。',
          en: 'In △ABC, a = 4, ∠A = 30° and ∠B = 60°. Find side b.',
        },
        unit: '',
        answer: 4 * Math.sqrt(3),
        tol: 0.01,
        solution: {
          zh: '由 a / sin A = b / sin B 得 b = a·sin B / sin A = 4 × (√3/2) / (1/2) = 4√3。',
          en: 'From a / sin A = b / sin B: b = 4 × (√3/2) / (1/2) = 4√3.',
        },
      },
    ]);

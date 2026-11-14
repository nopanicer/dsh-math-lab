    // ---------------------------------------------------------------------------
    // 模型 4 · 基本不等式与半圆（高一）
    // ---------------------------------------------------------------------------

    /** 动画时长（秒）：保持 a + b 不变，让 a 滑向 b */
    const ineqSpan = 5.6;

    /** 参数兜底：正数，避免开根号负数或除零 */
    function ineqNum(value, fallback, lo, hi) {
      const v = Number(value);
      if (!Number.isFinite(v) || v <= 0) return fallback;
      return clamp(v, lo, hi);
    }

    /**
     * 半圆直径 AB = a + b，圆心 O 在原点，半径 R = (a+b)/2。
     * H 把直径分成 AH = a、HB = b，过 H 作垂线交半圆于 P，则 PH = √(ab)。
     * 动画让 a(t) 从 a 线性滑到 b（和 s 固定），H 扫过圆心时 h 达到 R。
     */
    function ineqGeom(t, p) {
      const a0 = ineqNum(p && p.a, 1.5, 0.2, 12);
      const b0 = ineqNum(p && p.b, 4, 0.2, 12);
      const s = a0 + b0;
      const raw = Number(t);
      const u = clamp(Number.isFinite(raw) ? raw / ineqSpan : 0, 0, 1);
      const a = a0 + (b0 - a0) * u;
      const b = s - a;
      const R = s / 2;
      const h = Math.sqrt(Math.max(0, a * b));
      const oh = (a - b) / 2;            // H 相对圆心的横坐标
      const gap = R - h;                 // 恒 ≥ 0，等号当且仅当 a = b
      return { a0, b0, a, b, s, u, R, h, oh, gap };
    }

    defineModel({
      id: 'inequality',
      grade: 1,
      name: { zh: '基本不等式', en: 'AM–GM inequality' },
      formula: {
        zh: '(a + b) / 2 ≥ √(ab)，当且仅当 a = b 时取等号',
        en: '(a + b)/2 ≥ √(ab), with equality iff a = b',
      },
      hint: {
        zh: '半圆里藏着基本不等式：直径 a + b，半径 (a+b)/2 就是半弦 √(ab) 的天花板。垂足 H 走到圆心 O 时半弦变成半径，两边相等——这就是“和定、积最大”的几何解释。',
        en: 'The semicircle proves AM–GM: the diameter is a + b, and the radius (a+b)/2 is a ceiling for the half-chord √(ab). When the foot H reaches the centre O the half-chord becomes the radius — equality, and the geometric reason “fixed sum, largest product”.',
      },
      chartLabel: { zh: 'R − h', en: 'R − h' },
      timeline: { zh: '动画：保持 a + b 不变，让 a 滑向 b', en: 'Animation: a slides toward b while a + b stays fixed' },
      params: [
        { key: 'a', label: { zh: '正数 a', en: 'Positive a' }, min: 0.5, max: 6, step: 0.1, init: 1.5, unit: '', digits: 1 },
        { key: 'b', label: { zh: '正数 b', en: 'Positive b' }, min: 0.5, max: 6, step: 0.1, init: 4, unit: '', digits: 1 },
      ],
      box(p) {
        const a0 = ineqNum(p && p.a, 1.5, 0.2, 12);
        const b0 = ineqNum(p && p.b, 4, 0.2, 12);
        const s = a0 + b0;
        const R = s / 2;
        const m = Math.max(0.45, 0.12 * s);
        return { xMin: -R - m, xMax: R + m, yMin: -m, yMax: R + m };
      },
      duration() {
        return ineqSpan;
      },
      state(t, p) {
        const g = ineqGeom(t, p);
        const equal = Math.abs(g.a - g.b) < 1e-3;
        const summary = equal
          ? {
              zh: `a = b = ${fnum(g.a, 2)}：H 与圆心 O 重合，半弦 h 长到半径 R，${fnum(g.R, 3)} = ${fnum(g.h, 3)}，等号成立。`,
              en: `a = b = ${fnum(g.a, 2)}: H meets the centre O, the half-chord reaches the radius — ${fnum(g.R, 3)} = ${fnum(g.h, 3)}, equality.`,
            }
          : {
              zh: `R − h = (√a − √b)² / 2 = ${fnum(g.gap, 3)}：a 与 b 越接近，差越小；a = b 时差为 0。`,
              en: `R − h = (√a − √b)² / 2 = ${fnum(g.gap, 3)}: the closer a and b, the smaller the gap; it vanishes exactly when a = b.`,
            };
        return {
          t: g.u * ineqSpan,
          ...g,
          summary,
          chartValue: g.gap,
          rows: [
            { label: { zh: 'a', en: 'a' }, value: fnum(g.a, 3) },
            { label: { zh: 'b', en: 'b' }, value: fnum(g.b, 3) },
            { label: { zh: 'a + b（不变）', en: 'a + b (fixed)' }, value: fnum(g.s, 3) },
            { label: { zh: '2√(ab)', en: '2√(ab)' }, value: fnum(2 * g.h, 3) },
            { label: { zh: '半径 R = (a+b)/2', en: 'Radius R = (a+b)/2' }, value: fnum(g.R, 3) },
            { label: { zh: '半弦 h = √(ab)', en: 'Half-chord h = √(ab)' }, value: fnum(g.h, 3) },
            { label: { zh: 'R − h（≥ 0）', en: 'R − h (≥ 0)' }, value: fnum(g.gap, 3) },
          ],
        };
      },
      draw(ctx, st, view, pal, opts) {
        const aux = !opts || opts.aux !== false;
        const g = st;
        const X = (v) => view.toX(v);
        const Y = (v) => view.toY(v);
        const R = g.R;
        const oh = g.oh;
        const h = g.h;

        // 半圆 + 直径（a 段青色、b 段蓝色，合起来就是 a + b）
        arcWorld(ctx, view, 0, 0, R, 0, Math.PI, pal.curve, 2.4);
        segmentWorld(ctx, view, -R, 0, oh, 0, pal.curve3, 4);
        segmentWorld(ctx, view, oh, 0, R, 0, pal.curve, 4);

        // 直角三角形 APB 的两腰
        segmentWorld(ctx, view, -R, 0, oh, h, pal.muted, 1.2);
        segmentWorld(ctx, view, oh, h, R, 0, pal.muted, 1.2);

        // 高 h（橙）与半径 R（紫）
        segmentWorld(ctx, view, oh, 0, oh, h, pal.point, 3.2);
        segmentWorld(ctx, view, 0, 0, oh, h, pal.curve2, 2.6);

        // ∠APB = 90°（直径所对的圆周角）
        if (aux) {
          const l1 = Math.hypot(R + oh, h);
          const l2 = Math.hypot(R - oh, h);
          rightAngle(ctx, view, oh, h, [(-R - oh) / l1, -h / l1], [(R - oh) / l2, -h / l2], pal.muted, 9);
        }

        // 点
        dotWorld(ctx, view, -R, 0, pal.curve, 4);
        dotWorld(ctx, view, R, 0, pal.curve, 4);
        dotWorld(ctx, view, oh, 0, pal.curve3, 3.6);
        dotWorld(ctx, view, oh, h, pal.point, 4.6);

        // 标签：A、B 在直径两端的外侧
        tag(ctx, 'A', X(-R) - 12, Y(0) - 2, pal.curve, 'right', 12);
        tag(ctx, 'B', X(R) + 12, Y(0) - 2, pal.curve, 'left', 12);
        // H 写在轴的上方：轴下方的刻度数字太密，容易和 H 连成一片
        tag(ctx, 'H', X(oh) + 11, Y(0) - 12, pal.curve3, 'left', 11);
        tag(ctx, 'P', X(oh) + 11, Y(h) - 13, pal.point, 'left', 12);
        // 长度名：a、b 写在直径上方；h、R 沿各自线段错开
        tag(ctx, 'a', X((-R + oh) / 2), Y(0) - 14, pal.curve3, 'center', 11);
        tag(ctx, 'b', X((R + oh) / 2), Y(0) - 14, pal.curve, 'center', 11);
        // h 挂在较长那半边的外侧；h 与 R 的高低固定错开（a = b 时两条线重合也能各归各位）
        const hSide = g.b >= g.a ? 1 : -1;
        const hFrac = 0.64;
        const rFrac = 0.36;
        // 面板的 y 轴刻度数字占着轴线左侧一条窄带，名字落到那里会连成一片
        const ax0 = X(0);
        const inBand = (x) => x > ax0 - 32 && x < ax0 - 4;

        let hRight = hSide > 0;
        let hx = X(oh) + (hRight ? 15 : -15);
        const hxAlt = X(oh) + (hRight ? -15 : 15);
        if (inBand(hx) && !inBand(hxAlt)) {
          hRight = !hRight;
          hx = hxAlt;
        }
        let hAlign = hRight ? 'left' : 'right';
        if (inBand(hx)) {
          hx = ax0 + 16;
          hAlign = 'left';
        }
        const hy = Y(h * hFrac);
        if (h > 0.15) tag(ctx, 'h', hx, hy, pal.point, hAlign, 11);

        const rbase = X(oh * rFrac);
        const rx1 = rbase + (h / R) * 17;
        const ry1 = Y(h * rFrac) + (oh / R) * 17;
        const rx2 = rbase - (h / R) * 17;
        const ry2 = Y(h * rFrac) - (oh / R) * 17;
        const in1 = inBand(rx1);
        const in2 = inBand(rx2);
        let useFirst;
        if (in1 !== in2) useFirst = !in1;
        else useFirst = Math.hypot(rx1 - hx, ry1 - hy) >= Math.hypot(rx2 - hx, ry2 - hy);
        let rrx = useFirst ? rx1 : rx2;
        const rry = useFirst ? ry1 : ry2;
        if (inBand(rrx)) rrx = ax0 + 16;
        tag(ctx, 'R', rrx, rry, pal.curve2, 'center', 11);

        // 结论角标
        setChip(pal.chip);
        tag(ctx, L({ zh: '(a + b) / 2 ≥ √(ab)', en: '(a + b)/2 ≥ √(ab)' }), 14, 16, pal.text, 'left', 11);
        if (Math.abs(g.a - g.b) < 1e-3) {
          tag(ctx, L({ zh: 'a = b，取等号', en: 'a = b, equality' }), view.width - 14, 16, pal.point, 'right', 11);
        }
        setChip(null);
      },
    });

    defineLesson('inequality', {
      lesson: {
        zh: '基本不等式 (a + b)/2 ≥ √(ab)（a, b > 0）有两个常见证法：代数上用 (√a − √b)² ≥ 0 展开；几何上就是这个半圆——直径 a + b 的一半是半径，垂直半弦永远不超过半径。等号成立的条件 a = b，对应垂足与圆心重合。',
        en: 'The AM–GM inequality (a + b)/2 ≥ √(ab) for a, b > 0 has two classic proofs: algebraically from (√a − √b)² ≥ 0, and geometrically from this semicircle — half the diameter is the radius, and a perpendicular half-chord can never exceed it. Equality a = b is exactly when the foot meets the centre.',
      },
      steps: [
        { at: 0, zh: '直径 AB = a + b，圆心 O 在正中，半径 R = (a + b)/2。H 把直径分成 AH = a、HB = b。', en: 'Diameter AB = a + b, centre O in the middle, radius R = (a + b)/2. Point H splits the diameter into AH = a and HB = b.' },
        { at: 0.28, zh: '过 H 作直径的垂线交半圆于 P。由射影定理 PH² = AH·HB，即 h = √(ab)；而 ∠APB = 90°，这是一对相似三角形。', en: 'The perpendicular at H meets the semicircle at P, and the altitude theorem gives PH² = AH·HB, i.e. h = √(ab). Also ∠APB = 90°.' },
        { at: 0.5, zh: 'a = b 时 H 正好落在圆心 O，h 长成半径 R，两个数相等——等号成立。', en: 'When a = b, H lands on O, h grows into the radius R, and the two numbers coincide: equality.' },
        { at: 0.78, zh: '滑过中点后 a、b 又拉开距离，h 变小；R 纹丝不动，所以 h ≤ R 恒成立。遇到 x + 1/x 这类题，就是令 a = x、b = 1/x。', en: 'Past the midpoint a and b separate again and h shrinks while R stays put, so h ≤ R always. For x + 1/x type problems, set a = x and b = 1/x.' },
      ],
    });

    defineQuiz('inequality', (rng) => {
      const kind = Math.floor(rng() * 4);
      if (kind === 0) {
        const s = rnum(rng, 4, 12, 2);
        const ans = (s * s) / 4;
        return makeQuiz(
          { a: s / 2, b: s / 2 },
          {
            zh: `已知 x > 0，y > 0，且 x + y = ${fnum(s, 0)}，求 xy 的最大值。`,
            en: `For x > 0, y > 0 with x + y = ${fnum(s, 0)}, find the maximum of xy.`,
          },
          '',
          ans,
          {
            zh: `由基本不等式 xy ≤ ((x + y)/2)² = (${fnum(s, 0)}/2)² = ${fnum(ans, 2)}，当 x = y = ${fnum(s / 2, 1)} 时取到。`,
            en: `xy ≤ ((x + y)/2)² = ${fnum(ans, 2)}, attained at x = y = ${fnum(s / 2, 1)}.`,
          },
          0.01,
        );
      }
      if (kind === 1) {
        const k = rpick(rng, [4, 9, 16, 25, 36]);
        const ans = 2 * Math.sqrt(k);
        return makeQuiz(
          { a: Math.sqrt(k), b: Math.sqrt(k) },
          {
            zh: `已知 x > 0，y > 0，且 xy = ${fnum(k, 0)}，求 x + y 的最小值。`,
            en: `For x > 0, y > 0 with xy = ${fnum(k, 0)}, find the minimum of x + y.`,
          },
          '',
          ans,
          {
            zh: `由 x + y ≥ 2√(xy) = 2√${fnum(k, 0)} = ${fnum(ans, 2)}，当 x = y = ${fnum(Math.sqrt(k), 2)} 时取到。`,
            en: `x + y ≥ 2√(xy) = ${fnum(ans, 2)}, attained at x = y = ${fnum(Math.sqrt(k), 2)}.`,
          },
          0.01,
        );
      }
      if (kind === 2) {
        const c = rpick(rng, [1, 4, 9, 16, 25]);
        const ans = 2 * Math.sqrt(c);
        return makeQuiz(
          { a: Math.sqrt(c), b: Math.sqrt(c) },
          {
            zh: `已知 x > 0，求 x + ${fnum(c, 0)}/x 的最小值。`,
            en: `For x > 0, find the minimum of x + ${fnum(c, 0)}/x.`,
          },
          '',
          ans,
          {
            zh: `x + ${fnum(c, 0)}/x ≥ 2√(x · ${fnum(c, 0)}/x) = 2√${fnum(c, 0)} = ${fnum(ans, 2)}，当 x = ${fnum(Math.sqrt(c), 2)} 时取到。`,
            en: `x + ${fnum(c, 0)}/x ≥ 2√${fnum(c, 0)} = ${fnum(ans, 2)}, attained at x = ${fnum(Math.sqrt(c), 2)}.`,
          },
          0.01,
        );
      }
      const s = rpick(rng, [2, 4, 5, 8, 10]);
      const ans = 4 / s;
      return makeQuiz(
        { a: s / 2, b: s / 2 },
        {
          zh: `已知 a > 0，b > 0，且 a + b = ${fnum(s, 0)}，求 1/a + 1/b 的最小值。`,
          en: `For a > 0, b > 0 with a + b = ${fnum(s, 0)}, find the minimum of 1/a + 1/b.`,
        },
        '',
        ans,
        {
          zh: `1/a + 1/b = (a + b)/(ab) = ${fnum(s, 0)}/(ab)，而 ab ≤ (${fnum(s, 0)}/2)² = ${fnum((s * s) / 4, 3)}，所以原式 ≥ ${fnum(s, 0)}/${fnum((s * s) / 4, 3)} = ${fnum(ans, 3)}，当 a = b = ${fnum(s / 2, 1)} 时取到。`,
          en: `1/a + 1/b = ${fnum(s, 0)}/(ab) ≥ ${fnum(s, 0)}/(${fnum((s * s) / 4, 3)}) = ${fnum(ans, 3)}, attained at a = b = ${fnum(s / 2, 1)}.`,
        },
        0.01,
      );
    });

    defineExams([
      {
        id: 'ex-inequality-1',
        modelId: 'inequality',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '求最小值', en: 'Minimum' },
        params: { a: 1, b: 1 },
        stem: {
          zh: '已知 x > 0，求 x + 1/x 的最小值。',
          en: 'For x > 0, find the minimum of x + 1/x.',
        },
        unit: '',
        answer: 2,
        tol: 0.01,
        solution: {
          zh: '把 x 和 1/x 看成基本不等式里的 a、b：x + 1/x ≥ 2√(x · 1/x) = 2，当 x = 1 时取到等号，所以最小值是 2。',
          en: 'Take a = x and b = 1/x: x + 1/x ≥ 2√(x · 1/x) = 2, with equality at x = 1. The minimum is 2.',
        },
      },
      {
        id: 'ex-inequality-2',
        modelId: 'inequality',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '和定求积最大', en: 'Fixed sum, max product' },
        params: { a: 5, b: 5 },
        stem: {
          zh: '用长 20 的篱笆围一个矩形，求这个矩形面积的最大值。',
          en: 'A fence of length 20 encloses a rectangle. Find the largest possible area.',
        },
        unit: '',
        answer: 25,
        tol: 0.01,
        solution: {
          zh: '设长、宽为 a、b，则 a + b = 10。由 ab ≤ ((a + b)/2)² = 25，当 a = b = 5（正方形）时取到，最大面积是 25。',
          en: 'Let the sides be a, b with a + b = 10. Then ab ≤ ((a + b)/2)² = 25, attained at a = b = 5 — the maximum area is 25.',
        },
      },
      {
        id: 'ex-inequality-3',
        modelId: 'inequality',
        source: { zh: '高考题型 · 改编', en: 'Exam-style · adapted' },
        tag: { zh: '配凑后用不等式', en: 'Rearranging for AM–GM' },
        params: { a: 1.5, b: 3 },
        stem: {
          zh: '已知 a > 0，b > 0，且 2a + b = 6，求 ab 的最大值。',
          en: 'For a > 0, b > 0 with 2a + b = 6, find the maximum of ab.',
        },
        unit: '',
        answer: 4.5,
        tol: 0.01,
        solution: {
          zh: '把 ab 看成 (2a)·b 的一半：2a + b ≥ 2√(2ab) ⇒ 6 ≥ 2√(2ab) ⇒ ab ≤ 36/8 = 4.5，当 2a = b = 3（即 a = 1.5，b = 3）时取等号。',
          en: 'Write ab = (2a)·b / 2. From 2a + b ≥ 2√(2ab): 6 ≥ 2√(2ab), so ab ≤ 36/8 = 4.5, attained at 2a = b = 3, i.e. a = 1.5, b = 3.',
        },
      },
    ]);

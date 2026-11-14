    // ---------------------------------------------------------------------------
    // 常量、格式化与通用小工具
    // ---------------------------------------------------------------------------

    const TAU = Math.PI * 2;
    const PI = Math.PI;
    const DEG = Math.PI / 180;

    /** 去掉 -0.000 这种噪声 */
    const nz = (v) => (Math.abs(v) < 5e-9 ? 0 : v);
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const lerp = (a, b, k) => a + (b - a) * k;
    const signOf = (v) => (v > 1e-12 ? 1 : v < -1e-12 ? -1 : 0);

    /** 定点小数，digits 位 */
    const fx = (v, digits) => {
      const d = digits === undefined ? 1 : digits;
      const text = nz(Number(v) || 0).toFixed(d);
      return text === '-0' || /^-0\.0*$/.test(text) ? text.slice(1) : text;
    };

    /** 数学读数：最多 3 位小数，去掉末尾的 0 */
    const fnum = (v, digits) => {
      const d = digits === undefined ? 2 : digits;
      let text = nz(Number(v) || 0).toFixed(d);
      if (text.indexOf('.') >= 0) text = text.replace(/0+$/, '').replace(/\.$/, '');
      return text === '-0' ? '0' : text;
    };

    /** 中英文取词：字符串原样返回，{zh,en} 取当前语言 */
    const pick = (value, lang) => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'number') return String(value);
      return (lang === 'en' ? value.en : value.zh) || value.zh || value.en || '';
    };

    const FONT_UI = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    const FONT_MONO = 'ui-monospace, SFMono-Regular, Consolas, "Cascadia Mono", monospace';

    /** 把弧度写成 π 的倍数：π/6、2π/3、π、3π/2 */
    function piText(v) {
      if (Math.abs(v) < 1e-9) return '0';
      const ratio = v / PI;
      const denoms = [1, 2, 3, 4, 6, 8, 12];
      for (let i = 0; i < denoms.length; i += 1) {
        const den = denoms[i];
        const num = ratio * den;
        if (Math.abs(num - Math.round(num)) < 1e-6 && Math.abs(num) <= 24) {
          const n = Math.round(num);
          if (n === 0) return '0';
          const head = n === 1 ? 'π' : n === -1 ? '-π' : `${n}π`;
          return den === 1 ? head : `${head}/${den}`;
        }
      }
      return fnum(ratio, 2) + 'π';
    }

    // ---------------------------------------------------------------------------
    // 本机记忆：模型选择、每个模型上次的参数、练习得分
    // ---------------------------------------------------------------------------

    const STORE_KEY = 'math-lab/v1';

    function readStore() {
      try {
        const raw = window.localStorage.getItem(STORE_KEY);
        if (!raw) return {};
        const data = JSON.parse(raw);
        return data && typeof data === 'object' ? data : {};
      } catch (_error) {
        return {};
      }
    }

    function writeStore(patch) {
      try {
        const next = Object.assign({}, readStore(), patch);
        window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch (_error) {
        /* 隐私模式 / 配额不足时静默忽略 */
      }
    }

    // ---------------------------------------------------------------------------
    // 主题色：优先读取 DSH 的 CSS 变量，读不到就按深浅色兜底
    // ---------------------------------------------------------------------------

    function isDarkTheme() {
      const el = document.documentElement;
      const marks = [
        el.getAttribute('data-theme'),
        el.getAttribute('data-dsw-theme'),
        el.getAttribute('class'),
        document.body ? document.body.getAttribute('class') : null,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (marks.includes('dark')) return true;
      if (marks.includes('light')) return false;
      try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      } catch (_error) {
        return false;
      }
    }

    function readPalette() {
      const dark = isDarkTheme();
      let cs = null;
      try {
        cs = getComputedStyle(document.body);
      } catch (_error) {
        cs = null;
      }
      const css = (name, fallback) => {
        if (!cs) return fallback;
        const value = cs.getPropertyValue(name);
        return value && value.trim() ? value.trim() : fallback;
      };
      return {
        dark,
        text: css('--dsw-alias-label-primary', dark ? '#e7e9ee' : '#1f2328'),
        muted: css('--dsw-alias-label-secondary', dark ? '#98a1b0' : '#5a6472'),
        border: css('--dsw-alias-border-l1', dark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.10)'),
        surface: css('--dsw-alias-bg-layer-1', dark ? '#161a22' : '#f6f7f9'),
        grid: dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.085)',
        axis: dark ? 'rgba(255,255,255,0.40)' : 'rgba(15,23,42,0.42)',
        dot: dark ? '#0e1218' : '#ffffff',
        accent: '#4c8dff',
        curve: '#4c8dff',
        curve2: '#a06bff',
        curve3: '#22b8a6',
        point: '#f5a524',
        tangent: '#ef4865',
        area: dark ? 'rgba(76,141,255,0.20)' : 'rgba(76,141,255,0.16)',
        area2: dark ? 'rgba(245,165,36,0.20)' : 'rgba(245,165,36,0.18)',
        shade: dark ? 'rgba(160,107,255,0.18)' : 'rgba(160,107,255,0.14)',
        track: dark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.16)',
        chip: dark ? 'rgba(12,15,20,0.86)' : 'rgba(255,255,255,0.92)',
      };
    }

    // ---------------------------------------------------------------------------
    // 平面直角坐标系视图：等比缩放，原点落在世界坐标原点
    // ---------------------------------------------------------------------------

    /**
     * @param xMin/xMax/yMin/yMax 希望看到的世界范围（等比缩放下可能略有富余）
     */
    /**
     * @param free true 时 x/y 独立缩放（函数值域和自变量范围差很多时用；
     *             圆、椭圆、抛物线这类要求等比图形只能用它之外的默认等比模式）
     */
    function createPlaneView(width, height, xMin, xMax, yMin, yMax, pad, free) {
      const p = pad === undefined ? 36 : pad;
      const w = Math.max(80, width);
      const h = Math.max(80, height);
      const usableW = Math.max(40, w - p * 2);
      const usableH = Math.max(40, h - p * 2);
      const spanX = Math.max(Math.abs(xMax - xMin), 1e-6);
      const spanY = Math.max(Math.abs(yMax - yMin), 1e-6);
      const sx = free ? usableW / spanX : Math.min(usableW / spanX, usableH / spanY);
      const sy = free ? usableH / spanY : sx;
      const cx = (xMin + xMax) / 2;
      const cy = (yMin + yMax) / 2;
      const view = {
        width: w,
        height: h,
        scale: sx,
        scaleY: sy,
        free: Boolean(free),
        cx,
        cy,
        x0: cx - usableW / 2 / sx,
        x1: cx + usableW / 2 / sx,
        y0: cy - usableH / 2 / sy,
        y1: cy + usableH / 2 / sy,
        toX: (x) => w / 2 + (x - cx) * sx,
        toY: (y) => h / 2 - (y - cy) * sy,
        worldX: (px) => cx + (px - w / 2) / sx,
        worldY: (py) => cy - (py - h / 2) / sy,
        px: (len) => len * sx,
        pxY: (len) => len * sy,
        unitsPerPx: 1 / sx,
      };
      return view;
    }

    /** 画布上的小标签；chipFill 非空时在文字下垫一层底色，避免线条穿过文字 */
    let chipFill = null;
    function setChip(color) {
      chipFill = color || null;
    }

    /** 画布内的文字语言（跟着面板语言走，避免英文界面里夹中文） */
    let drawLang = 'zh';
    function setDrawLang(lang) {
      drawLang = lang === 'en' ? 'en' : 'zh';
    }
    /** 画布文案：{zh,en} → 当前语言；字符串原样返回 */
    const L = (pair) => pick(pair, drawLang);

    function roundRect(ctx, x, y, w, hgt, r) {
      const rad = Math.min(r, Math.abs(w) / 2, Math.abs(hgt) / 2);
      ctx.beginPath();
      ctx.moveTo(x + rad, y);
      ctx.lineTo(x + w - rad, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
      ctx.lineTo(x + w, y + hgt - rad);
      ctx.quadraticCurveTo(x + w, y + hgt, x + w - rad, y + hgt);
      ctx.lineTo(x + rad, y + hgt);
      ctx.quadraticCurveTo(x, y + hgt, x, y + hgt - rad);
      ctx.lineTo(x, y + rad);
      ctx.quadraticCurveTo(x, y, x + rad, y);
      ctx.closePath();
    }

    function tag(ctx, text, x, y, color, align, size) {
      const fontSize = size || 12;
      ctx.save();
      ctx.font = `600 ${fontSize}px ${FONT_UI}`;
      ctx.textAlign = align || 'center';
      ctx.textBaseline = 'middle';
      if (chipFill) {
        const width = ctx.measureText(text).width + 8;
        const height = fontSize + 6;
        let left = x - width / 2;
        if (align === 'left') left = x - 4;
        else if (align === 'right') left = x - width + 4;
        ctx.fillStyle = chipFill;
        roundRect(ctx, left, y - height / 2, width, height, 4);
        ctx.fill();
      }
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    function dash(ctx, x1, y1, x2, y2, color, pattern) {
      ctx.save();
      ctx.setLineDash(pattern || [5, 5]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }

    /** 带箭头的矢量（屏幕坐标） */
    function arrow(ctx, x1, y1, x2, y2, color, width) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      if (!isFinite(len) || len < 4) return;
      const ux = dx / len;
      const uy = dy / len;
      const head = Math.min(12, Math.max(7, len * 0.3));
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = width === undefined ? 2 : width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2 - ux * head * 0.86, y2 - uy * head * 0.86);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - ux * head - uy * head * 0.46, y2 - uy * head + ux * head * 0.46);
      ctx.lineTo(x2 - ux * head + uy * head * 0.46, y2 - uy * head - ux * head * 0.46);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // ---------------------------------------------------------------------------
    // 坐标系绘制：网格、坐标轴、刻度
    // ---------------------------------------------------------------------------

    /** 刻度步长：保证相邻刻度至少 gap 像素 */
    function tickStep(scale, gap) {
      const min = (gap === undefined ? 44 : gap) / Math.max(scale, 1e-6);
      const bases = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 500];
      for (let i = 0; i < bases.length; i += 1) {
        if (bases[i] >= min) return bases[i];
      }
      return 1000;
    }

    /** 网格（整数刻度处） */
    function drawGrid(ctx, view, pal, step) {
      // freeAspect 下 x/y 刻度步长可以不同（值域 20、自变量 3 时尤其重要）
      const stepX = step || tickStep(view.scale);
      const stepY = step || tickStep(view.scaleY || view.scale);
      ctx.save();
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      const startX = Math.ceil(view.x0 / stepX) * stepX;
      const startY = Math.ceil(view.y0 / stepY) * stepY;
      ctx.beginPath();
      for (let x = startX; x <= view.x1 + 1e-9; x += stepX) {
        const px = view.toX(nz(x));
        ctx.moveTo(px, view.toY(view.y0));
        ctx.lineTo(px, view.toY(view.y1));
      }
      for (let y = startY; y <= view.y1 + 1e-9; y += stepY) {
        const py = view.toY(nz(y));
        ctx.moveTo(view.toX(view.x0), py);
        ctx.lineTo(view.toX(view.x1), py);
      }
      ctx.stroke();
      ctx.restore();
    }

    /** 坐标轴 + 箭头 + 刻度数字 + 原点 O */
    function drawAxes(ctx, view, pal, opts) {
      const o = opts || {};
      const stepX = o.step || tickStep(view.scale);
      const stepY = o.step || tickStep(view.scaleY || view.scale);
      const showTicks = o.ticks !== false;
      const axisY = clamp(view.toY(0), 0, view.height);
      const axisX = clamp(view.toX(0), 0, view.width);

      ctx.save();
      ctx.strokeStyle = pal.axis;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, axisY);
      ctx.lineTo(view.width, axisY);
      ctx.moveTo(axisX, view.height);
      ctx.lineTo(axisX, 0);
      ctx.stroke();
      ctx.restore();

      // 轴箭头
      ctx.save();
      ctx.fillStyle = pal.axis;
      ctx.beginPath();
      ctx.moveTo(view.width - 1, axisY);
      ctx.lineTo(view.width - 9, axisY - 4);
      ctx.lineTo(view.width - 9, axisY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(axisX, 1);
      ctx.lineTo(axisX - 3.5, 8);
      ctx.lineTo(axisX + 3.5, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 轴名：轴跑出画布时不画，位置也夹在画布内，避免被裁掉半截
      if (view.toY(0) >= 0 && view.toY(0) <= view.height) {
        tag(ctx, o.xLabel || 'x', view.width - 14, clamp(axisY - 12, 8, view.height - 8), pal.muted, 'center', 11);
      }
      if (view.toX(0) >= 0 && view.toX(0) <= view.width) {
        tag(ctx, o.yLabel || 'y', clamp(axisX + 13, 8, view.width - 8), 12, pal.muted, 'center', 11);
      }

      if (!showTicks) return;

      ctx.save();
      ctx.font = `500 10px ${FONT_UI}`;
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const startX = Math.ceil(view.x0 / stepX) * stepX;
      for (let x = startX; x <= view.x1 + 1e-9; x += stepX) {
        if (Math.abs(x) < stepX * 0.25) continue;
        ctx.fillText(fnum(nz(x), 2), view.toX(nz(x)), axisY + 5);
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const startY = Math.ceil(view.y0 / stepY) * stepY;
      for (let y = startY; y <= view.y1 + 1e-9; y += stepY) {
        if (Math.abs(y) < stepY * 0.25) continue;
        ctx.fillText(fnum(nz(y), 2), axisX - 6, view.toY(nz(y)));
      }
      ctx.restore();

      if (axisY > 0 && axisX > 0) tag(ctx, 'O', axisX - 10, axisY + 10, pal.muted, 'center', 10);
    }

    // ---------------------------------------------------------------------------
    // 世界坐标绘图工具
    // ---------------------------------------------------------------------------

    function dotWorld(ctx, view, x, y, color, r) {
      if (!isFinite(x) || !isFinite(y)) return;
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(view.toX(x), view.toY(y), r === undefined ? 4 : r, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    function labelWorld(ctx, view, text, x, y, color, align, size) {
      if (!isFinite(x) || !isFinite(y)) return;
      tag(ctx, text, view.toX(x), view.toY(y), color, align || 'center', size || 11);
    }

    function segmentWorld(ctx, view, x1, y1, x2, y2, color, width, pattern) {
      ctx.save();
      if (pattern) ctx.setLineDash(pattern);
      ctx.strokeStyle = color;
      ctx.lineWidth = width === undefined ? 1.6 : width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(view.toX(x1), view.toY(y1));
      ctx.lineTo(view.toX(x2), view.toY(y2));
      ctx.stroke();
      ctx.restore();
    }

    function arrowWorld(ctx, view, x1, y1, x2, y2, color, width) {
      arrow(ctx, view.toX(x1), view.toY(y1), view.toX(x2), view.toY(y2), color, width === undefined ? 2 : width);
    }

    /** 世界坐标折线；pts = [[x,y], ...] */
    function polylineWorld(ctx, view, pts, color, width, pattern) {
      if (!pts || pts.length < 2) return;
      ctx.save();
      if (pattern) ctx.setLineDash(pattern);
      ctx.strokeStyle = color;
      ctx.lineWidth = width === undefined ? 1.8 : width;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      pts.forEach((pt, i) => {
        const px = view.toX(pt[0]);
        const py = view.toY(pt[1]);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
    }

    /** 世界坐标多边形填充 */
    function regionWorld(ctx, view, pts, color) {
      if (!pts || pts.length < 2) return;
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      pts.forEach((pt, i) => {
        const px = view.toX(pt[0]);
        const py = view.toY(pt[1]);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    /** 世界坐标圆 */
    function circleWorld(ctx, view, cx, cy, r, color, width, fill) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(view.toX(cx), view.toY(cy), Math.max(0.5, view.px(r)), 0, TAU);
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width === undefined ? 1.8 : width;
        ctx.stroke();
      }
      ctx.restore();
    }

    /** 圆弧（世界坐标角度，弧度，逆时针为正的世界方向） */
    function arcWorld(ctx, view, cx, cy, r, a0, a1, color, width, pattern) {
      ctx.save();
      if (pattern) ctx.setLineDash(pattern);
      ctx.strokeStyle = color;
      ctx.lineWidth = width === undefined ? 1.2 : width;
      ctx.beginPath();
      // canvas 的 y 轴向下，角度取反
      ctx.arc(view.toX(cx), view.toY(cy), Math.max(0.5, view.px(r)), -a1, -a0);
      ctx.stroke();
      ctx.restore();
    }

    /** 直角标记：在 (x,y) 处，沿 dir1/dir2 两个单位方向画小方块 */
    function rightAngle(ctx, view, x, y, dir1, dir2, color, size) {
      const s = (size === undefined ? 12 : size) / view.scale;
      const ax = x + dir1[0] * s;
      const ay = y + dir1[1] * s;
      const bx = x + dir2[0] * s;
      const by = y + dir2[1] * s;
      const cxp = x + (dir1[0] + dir2[0]) * s;
      const cyp = y + (dir1[1] + dir2[1]) * s;
      polylineWorld(ctx, view, [[ax, ay], [cxp, cyp], [bx, by]], color, 1.2);
    }

    // ---------------------------------------------------------------------------
    // 函数作图：解析式 → 采样曲线
    // ---------------------------------------------------------------------------

    /**
     * 在 view 的可见范围内采样函数并描边。
     * @param fn   (x) => y，返回 NaN / Infinity 表示该点不在图像上
     * @param opts { color, width, dash, step, lo, hi, samples, clipY }
     */
    function plotFunction(ctx, view, pal, fn, opts) {
      const o = opts || {};
      const lo = o.lo === undefined ? view.x0 : o.lo;
      const hi = o.hi === undefined ? view.x1 : o.hi;
      const samples = o.samples || 480;
      const guard = (o.clipY === undefined ? 4 : o.clipY) * Math.max(view.y1 - view.y0, 1);
      const color = o.color || pal.curve;
      ctx.save();
      if (o.dash) ctx.setLineDash(o.dash);
      ctx.strokeStyle = color;
      ctx.lineWidth = o.width === undefined ? 2.1 : o.width;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      let drawing = false;
      let prev = null;
      for (let i = 0; i <= samples; i += 1) {
        const x = lo + ((hi - lo) * i) / samples;
        const y = fn(x);
        if (!isFinite(y)) {
          drawing = false;
          prev = null;
          continue;
        }
        // 跨过渐近线时断开，不要画一条竖直的假线
        const jump = prev === null ? 0 : Math.abs(y - prev);
        if (!drawing || jump > guard) {
          ctx.moveTo(view.toX(x), view.toY(y));
          drawing = true;
        } else {
          ctx.lineTo(view.toX(x), view.toY(y));
        }
        prev = y;
      }
      ctx.stroke();
      ctx.restore();
    }

    /** 给函数曲线上的点画小圆点（用于关键点标注） */
    function markPoint(ctx, view, x, y, color, label, side, size) {
      dotWorld(ctx, view, x, y, color, 3.6);
      if (label) {
        const dx = side === 'left' ? -8 : side === 'right' ? 8 : 0;
        const dy = side === 'below' ? 12 : -12;
        labelWorld(
          ctx,
          view,
          label,
          x + dx / view.scale,
          y + dy / view.scale,
          color,
          side === 'left' ? 'right' : side === 'right' ? 'left' : 'center',
          size || 10,
        );
      }
    }

    // ---------------------------------------------------------------------------
    // 柱状图 / 直方图：世界坐标下画柱体
    // ---------------------------------------------------------------------------

    /**
     * @param bars [{ x, w, y, color?, label?, value? }]，x 为柱心，y 为高度（基线 0）
     */
    function drawBars(ctx, view, pal, bars, opts) {
      const o = opts || {};
      const base = o.base === undefined ? 0 : o.base;
      const baseY = view.toY(base);
      bars.forEach((bar) => {
        const left = view.toX(bar.x - bar.w / 2);
        const right = view.toX(bar.x + bar.w / 2);
        const top = view.toY(bar.y);
        ctx.save();
        ctx.fillStyle = bar.color || o.color || pal.accent;
        if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
        ctx.fillRect(left, Math.min(top, baseY), Math.max(1, right - left), Math.abs(baseY - top));
        ctx.globalAlpha = 1;
        if (bar.label) tag(ctx, bar.label, (left + right) / 2, baseY + 12, pal.muted, 'center', 10);
        if (bar.value) tag(ctx, bar.value, (left + right) / 2, top - 9, pal.text, 'center', 10);
        ctx.restore();
      });
    }

    /** 角度读数：0.5236 → 30° */
    function degText(rad, digits) {
      return `${fnum((rad * 180) / PI, digits === undefined ? 1 : digits)}°`;
    }

    /** 数值导数（非解析函数用），h 自适应步长 */
    function numericDiff(f, x) {
      const h = 1e-5 * Math.max(1, Math.abs(x));
      return (f(x + h) - f(x - h)) / (2 * h);
    }

    /** 把无限直线裁剪到画布可见范围，返回 [[x1,y1],[x2,y2]] 或 null */
    function clipLineToView(view, x0, y0, dx, dy) {
      const len = Math.hypot(dx, dy);
      if (len < 1e-12) return null;
      const ux = dx / len;
      const uy = dy / len;
      const ts = [];
      if (Math.abs(ux) > 1e-12) {
        ts.push((view.x0 - x0) / ux, (view.x1 - x0) / ux);
      }
      if (Math.abs(uy) > 1e-12) {
        ts.push((view.y0 - y0) / uy, (view.y1 - y0) / uy);
      }
      const hits = [];
      ts.forEach((t) => {
        const x = x0 + ux * t;
        const y = y0 + uy * t;
        if (x >= view.x0 - 1e-6 && x <= view.x1 + 1e-6 && y >= view.y0 - 1e-6 && y <= view.y1 + 1e-6) hits.push([x, y]);
      });
      if (hits.length < 2) return null;
      return [hits[0], hits[hits.length - 1]];
    }

    /** 过点 (x0,y0)、方向 (dx,dy) 的无限直线（自动裁到视口） */
    function lineThroughWorld(ctx, view, x0, y0, dx, dy, color, width, pattern) {
      const seg = clipLineToView(view, x0, y0, dx, dy);
      if (!seg) return;
      segmentWorld(ctx, view, seg[0][0], seg[0][1], seg[1][0], seg[1][1], color, width, pattern);
    }

    /** 最大公约数 */
    function gcd(a, b) {
      let x = Math.abs(Math.round(a));
      let y = Math.abs(Math.round(b));
      while (y) {
        const t = x % y;
        x = y;
        y = t;
      }
      return x || 1;
    }

    /** 约分后的分数文本：3/8、1/2、2 */
    function fracText(num, den) {
      if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return '—';
      const g = gcd(num, den);
      const n = Math.round(num / g);
      const d = Math.round(den / g);
      if (d === 1) return String(n);
      return `${n}/${d}`;
    }

    /** 组合数文本 C(n,k) */
    function combText(n, k) {
      return `C(${n},${k})`;
    }

    /** 世界坐标下的箭头（原点 + 分量） */
    function vectorWorld(ctx, view, ox, oy, vx, vy, color, label, width) {
      arrowWorld(ctx, view, ox, oy, ox + vx, oy + vy, color, width === undefined ? 2.2 : width);
      if (label) {
        labelWorld(ctx, view, label, ox + vx * 0.55 + (view.x1 - view.x0) * 0.03, oy + vy * 0.55 + (view.y1 - view.y0) * 0.04, color, 'left', 11);
      }
    }

    // ---------------------------------------------------------------------------
    // 极简 3D：正交投影 + 绕 Y 偏航 / 绕 X 俯仰（立体几何用，零依赖）
    // ---------------------------------------------------------------------------

    const camera3D = { yaw: -0.62, pitch: 0.34, touched: false };

    function makeCamera3D(width, height, span, center, pitchOverride) {
      const cosY = Math.cos(camera3D.yaw);
      const sinY = Math.sin(camera3D.yaw);
      const pitch = camera3D.touched || pitchOverride === undefined ? camera3D.pitch : pitchOverride;
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const scale = Math.min(width, height) / Math.max(span, 1e-6);
      const cx = width / 2;
      const cy = height * 0.54;
      const ox = center ? center[0] : 0;
      const oy = center ? center[1] : 0;
      const oz = center ? center[2] : 0;
      return {
        scale,
        project(x, y, z) {
          const x0 = x - ox;
          const y0 = y - oy;
          const z0 = z - oz;
          const x1 = x0 * cosY + z0 * sinY;
          const z1 = -x0 * sinY + z0 * cosY;
          const y1 = y0 * cosP - z1 * sinP;
          const z2 = y0 * sinP + z1 * cosP;
          return { x: cx + x1 * scale, y: cy - y1 * scale, z: z2 };
        },
      };
    }

    function arrow3D(ctx, cam, from, to, color, width) {
      const a = cam.project(from[0], from[1], from[2]);
      const b = cam.project(to[0], to[1], to[2]);
      arrow(ctx, a.x, a.y, b.x, b.y, color, width);
      return (a.z + b.z) / 2;
    }

    function line3D(ctx, cam, pts, color, width, dashPattern) {
      if (!pts || pts.length < 2) return 0;
      let depth = 0;
      ctx.save();
      if (dashPattern) ctx.setLineDash(dashPattern);
      ctx.strokeStyle = color;
      ctx.lineWidth = width === undefined ? 2 : width;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      pts.forEach((pt, index) => {
        const q = cam.project(pt[0], pt[1], pt[2]);
        depth += q.z;
        if (index === 0) ctx.moveTo(q.x, q.y);
        else ctx.lineTo(q.x, q.y);
      });
      ctx.stroke();
      ctx.restore();
      return depth / pts.length;
    }

    function tag3D(ctx, cam, text, pt, color, align, size) {
      const q = cam.project(pt[0], pt[1], pt[2]);
      tag(ctx, text, q.x, q.y, color, align || 'center', size || 10);
    }

    function grid3D(ctx, cam, y, x0, x1, z0, z1, pal, step) {
      const gap = step || 0.5;
      ctx.save();
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      for (let x = x0; x <= x1 + 1e-6; x += gap) {
        const a = cam.project(x, y, z0);
        const b = cam.project(x, y, z1);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (let z = z0; z <= z1 + 1e-6; z += gap) {
        const a = cam.project(x0, y, z);
        const b = cam.project(x1, y, z);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // ---------------------------------------------------------------------------
    // 数值工具：二分求根、梯形积分、连乘
    // ---------------------------------------------------------------------------

    function bisect(f, a, b, iterations) {
      let lo = a;
      let hi = b;
      let flo = f(lo);
      const fhi = f(hi);
      if (!isFinite(flo) || !isFinite(fhi) || flo * fhi > 0) return null;
      const n = iterations || 80;
      for (let i = 0; i < n; i += 1) {
        const mid = (lo + hi) / 2;
        const fmid = f(mid);
        if (!isFinite(fmid)) return mid;
        if (flo * fmid <= 0) {
          hi = mid;
        } else {
          lo = mid;
          flo = fmid;
        }
      }
      return (lo + hi) / 2;
    }

    function integrate(f, a, b, n) {
      const steps = Math.max(2, n || 200);
      const h = (b - a) / steps;
      let sum = 0;
      for (let i = 0; i < steps; i += 1) {
        const x0 = a + i * h;
        const x1 = x0 + h;
        const f0 = f(x0);
        const f1 = f(x1);
        if (isFinite(f0) && isFinite(f1)) sum += ((f0 + f1) / 2) * h;
      }
      return sum;
    }

    function factorial(n) {
      let out = 1;
      for (let i = 2; i <= n; i += 1) out *= i;
      return out;
    }

    function binom(n, k) {
      if (k < 0 || k > n) return 0;
      let out = 1;
      for (let i = 1; i <= k; i += 1) out = (out * (n - k + i)) / i;
      return Math.round(out);
    }

    // ---------------------------------------------------------------------------
    // 答案解析：支持 3/4、√3/2、2π/3、1.2e-3 这类写法
    // ---------------------------------------------------------------------------

    /** 安全表达式求值（不用 eval，避免 CSP 与注入问题） */
    function evalMathExpr(text) {
      let i = 0;
      const src = text;
      const peek = () => src[i];
      const skip = () => {
        while (i < src.length && /\s/.test(src[i])) i += 1;
      };
      function parseExpr() {
        let value = parseTerm();
        for (;;) {
          skip();
          const ch = peek();
          if (ch === '+' || ch === '-') {
            i += 1;
            const rhs = parseTerm();
            value = ch === '+' ? value + rhs : value - rhs;
          } else break;
        }
        return value;
      }
      function parseTerm() {
        let value = parseUnary();
        for (;;) {
          skip();
          const ch = peek();
          if (ch === '*' || ch === '×' || ch === '·' || ch === '/') {
            i += 1;
            const rhs = parseUnary();
            value = ch === '/' ? value / rhs : value * rhs;
          } else if (ch === '(' || /[a-zA-Zπ]/.test(ch || '')) {
            // 隐式乘法：2π、3(4)、2√3
            const rhs = parseUnary();
            value *= rhs;
          } else break;
        }
        return value;
      }
      function parseUnary() {
        skip();
        const ch = peek();
        if (ch === '-') {
          i += 1;
          return -parseUnary();
        }
        if (ch === '+') {
          i += 1;
          return parseUnary();
        }
        return parsePower();
      }
      function parsePower() {
        const base = parseAtom();
        skip();
        if (peek() === '^') {
          i += 1;
          const exp = parseUnary();
          return Math.pow(base, exp);
        }
        return base;
      }
      function parseAtom() {
        skip();
        const ch = peek();
        if (ch === '(') {
          i += 1;
          const value = parseExpr();
          skip();
          if (peek() === ')') i += 1;
          return value;
        }
        if (ch === '√') {
          i += 1;
          return Math.sqrt(Math.abs(parseUnary()));
        }
        if (ch === 'π') {
          i += 1;
          return PI;
        }
        if (ch === 'e' || ch === 'E') {
          i += 1;
          return Math.E;
        }
        const start = i;
        if (ch === '.' || /[0-9]/.test(ch || '')) {
          i += 1;
          while (i < src.length && /[0-9.]/.test(src[i])) i += 1;
          if (src[i] === 'e' || src[i] === 'E') {
            const save = i;
            i += 1;
            if (src[i] === '+' || src[i] === '-') i += 1;
            if (/[0-9]/.test(src[i] || '')) {
              while (i < src.length && /[0-9]/.test(src[i])) i += 1;
            } else {
              i = save;
            }
          }
          return Number(src.slice(start, i));
        }
        // 无法识别的字符：整段失败
        i = src.length;
        return NaN;
      }
      const value = parseExpr();
      skip();
      if (i < src.length) return NaN;
      return value;
    }

    function parseAnswer(input) {
      if (typeof input === 'number') return input;
      let text = String(input === undefined || input === null ? '' : input).trim();
      if (!text) return NaN;
      text = text
        .replace(/[，,]/g, '.')
        .replace(/[−–—－]/g, '-')
        .replace(/[×✕xX]/g, (m) => (m === '×' || m === '✕' ? '*' : m))
        .replace(/π/g, 'π')
        .replace(/√/g, '√')
        .replace(/%/g, '');
      let value = evalMathExpr(text);
      if (!isFinite(value)) {
        const match = text.replace(/,/g, '.').match(/[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/);
        value = match ? Number(match[0]) : NaN;
      }
      return value;
    }

    /**
     * 判定：相对容差 + 绝对兜底。
     * 兜底不能一律 0.02 —— 概率题答案 0.05 时会把 0.03 也判对；
     * 答案 < 1 的用 1e-3 兜底，答案 ≥ 1 的（整数/根式结果）保留 0.02，容忍四舍五入。
     */
    function toleranceOf(answer, rel) {
      const magnitude = Math.abs(answer);
      const floor = magnitude >= 1 ? 0.02 : 1e-3;
      return Math.max(magnitude * (rel === undefined ? 0.02 : rel), floor);
    }

    function judge(quiz, input) {
      if (!quiz) return false;
      const value = parseAnswer(input);
      if (!isFinite(value)) return false;
      if (Array.isArray(quiz.answers)) {
        return quiz.answers.some((ans) => Math.abs(value - ans) <= toleranceOf(ans, quiz.tol));
      }
      return Math.abs(value - quiz.answer) <= toleranceOf(quiz.answer, quiz.tol);
    }

    // ---------------------------------------------------------------------------
    // 注册表：模型 / 讲解 / 出题 / 例题
    // ---------------------------------------------------------------------------

    const MODELS = [];
    const GRADE_ORDER = [1, 2, 3];

    /**
     * 标签栏里的备课顺序。build.mjs 按文件名拼装，注册顺序是字母序，
     * 这里把每个年级内部恢复成“教材推进/由浅入深”的顺序。
     */
    const MODEL_ORDER = [
      'quadratic', 'graphTransform', 'expLog', 'trigGraph', 'trigIdentity', 'vector', 'triangle', 'inequality',
      'lineCircle', 'ellipse', 'hyperbola', 'parabola', 'derivative', 'monotonic', 'integral', 'series',
      'binomial', 'probability', 'normal', 'linearProgramming', 'complex', 'solid3D', 'zeros', 'regression',
    ];
    const LESSONS = {};
    const QUIZZES = {};
    const EXAM_BANK = [];

    function defineModel(model) {
      MODELS.push(model);
      return model;
    }

    function defineLesson(id, lesson) {
      LESSONS[id] = lesson;
    }

    function defineQuiz(id, generator) {
      QUIZZES[id] = generator;
    }

    function defineExams(list) {
      list.forEach((item) => EXAM_BANK.push(item));
    }

    /** 出题结果的标准结构 */
    function makeQuiz(params, question, unit, answer, solution, tol) {
      return { params, question, unit, answer, solution, tol: tol === undefined ? 0.02 : tol };
    }

    function rpick(rng, list) {
      const i = Math.floor(rng() * list.length);
      return list[Math.min(list.length - 1, Math.max(0, i))];
    }

    function rnum(rng, min, max, step) {
      const n = Math.round((max - min) / step);
      const i = Math.min(n, Math.max(0, Math.floor(rng() * (n + 1))));
      return Number((min + i * step).toFixed(4));
    }

    const modelById = (id) => MODELS.find((m) => m.id === id) || MODELS[0];

    function initialParams(model) {
      const out = {};
      model.params.forEach((p) => {
        out[p.key] = p.init;
      });
      return out;
    }

    /** 该模型的上次参数（缺失或非法就用默认值补齐） */
    function paramsFor(id, store) {
      const model = modelById(id);
      const base = initialParams(model);
      const saved = store && store.params && store.params[id];
      if (!saved) return base;
      Object.keys(base).forEach((key) => {
        const value = saved[key];
        if (value === undefined || value === null) return;
        if (typeof base[key] === 'number' && !Number.isFinite(Number(value))) return;
        base[key] = typeof base[key] === 'number' ? Number(value) : value;
      });
      return base;
    }

    function examsFor(modelId) {
      return EXAM_BANK.filter((item) => item.modelId === modelId);
    }

    /** 取一道样例题：cursor 是每模型自增的序号 */
    function pickExam(modelId, cursor) {
      const list = examsFor(modelId);
      if (!list.length) return null;
      const item = list[((cursor % list.length) + list.length) % list.length];
      return {
        params: item.params,
        question: item.stem,
        unit: item.unit,
        answer: item.answer,
        answers: item.answers,
        solution: item.solution,
        tol: item.tol === undefined ? 0.02 : item.tol,
        source: item.source,
        tag: item.tag,
      };
    }

    function pickQuiz(modelId, rng) {
      const gen = QUIZZES[modelId];
      if (typeof gen !== 'function') return null;
      const random = rng || Math.random;
      for (let i = 0; i < 16; i += 1) {
        const quiz = gen(random);
        if (quiz) return quiz;
      }
      return null;
    }

    // ---------------------------------------------------------------------------
    // 主图之外的副图：按时间轴采样某个量，画成折线
    // ---------------------------------------------------------------------------

    function seriesOf(model, params) {
      const total = Math.max(0.2, model.duration(params));
      const steps = 160;
      const pts = [];
      for (let i = 0; i <= steps; i += 1) {
        const t = (total * i) / steps;
        let value = 0;
        try {
          const st = model.state(t, params);
          value = typeof st.chartValue === 'number' ? st.chartValue : 0;
        } catch (_error) {
          value = 0;
        }
        pts.push({ t, v: isFinite(value) ? value : 0 });
      }
      return { total, pts };
    }

    function drawChart(ctx, width, height, series, pal, markerT, axisLabel) {
      ctx.clearRect(0, 0, width, height);
      const padL = 44;
      const padR = 12;
      const padT = 14;
      const padB = 22;
      const plotW = Math.max(10, width - padL - padR);
      const plotH = Math.max(10, height - padT - padB);

      let rawMax = 0;
      let rawMin = 0;
      series.pts.forEach((p) => {
        rawMax = Math.max(rawMax, p.v);
        rawMin = Math.min(rawMin, p.v);
      });
      let vMax;
      let vMin;
      if (rawMin >= 0) {
        vMin = 0;
        vMax = rawMax > 1e-6 ? rawMax * 1.15 : 1;
      } else if (rawMax <= 0) {
        vMax = 0;
        vMin = rawMin * 1.15;
      } else {
        const gap = (rawMax - rawMin) * 0.12;
        vMax = rawMax + gap;
        vMin = rawMin - gap;
      }

      const toX = (t) => padL + (plotW * t) / series.total;
      const toY = (v) => padT + plotH * (1 - (v - vMin) / (vMax - vMin));

      ctx.save();
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i += 1) {
        const y = padT + (plotH * i) / 4;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + plotW, y);
        ctx.stroke();
      }
      for (let i = 0; i <= 4; i += 1) {
        const x = padL + (plotW * i) / 4;
        ctx.beginPath();
        ctx.moveTo(x, padT);
        ctx.lineTo(x, padT + plotH);
        ctx.stroke();
      }
      ctx.strokeStyle = pal.axis;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, padT + plotH);
      ctx.moveTo(padL, toY(0));
      ctx.lineTo(padL + plotW, toY(0));
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.font = `500 10px ${FONT_UI}`;
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(fnum(vMax, 2), padL - 6, padT + 4);
      if (vMin < -1e-6 && vMax > 1e-6) ctx.fillText('0', padL - 6, toY(0));
      ctx.fillText(fnum(vMin, 2), padL - 6, padT + plotH - 4);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('0', padL, padT + plotH + 5);
      ctx.fillText(`${fnum(series.total, 1)}`, padL + plotW, padT + plotH + 5);
      ctx.fillText('t', padL + plotW + 7, padT + plotH + 5);
      ctx.textAlign = 'left';
      ctx.fillText(axisLabel || '', padL + 2, padT - 12 > 0 ? padT - 12 : 0);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = pal.curve2;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      series.pts.forEach((p, i) => {
        const x = toX(p.t);
        const y = toY(p.v);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();

      const mx = toX(Math.min(markerT, series.total));
      ctx.save();
      ctx.strokeStyle = pal.dark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.28)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(mx, padT);
      ctx.lineTo(mx, padT + plotH);
      ctx.stroke();
      ctx.restore();

      const current = series.pts.reduce((best, p) => (Math.abs(p.t - markerT) < Math.abs(best.t - markerT) ? p : best), series.pts[0]);
      ctx.save();
      ctx.fillStyle = pal.curve2;
      ctx.beginPath();
      ctx.arc(toX(current.t), toY(current.v), 3.6, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

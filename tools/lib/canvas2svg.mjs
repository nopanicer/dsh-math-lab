/**
 * Canvas2D → SVG recorder.
 *
 * The plugin draws into a real <canvas> in the browser. For headless checks we
 * replay `model.draw()` against this recorder instead: every call is flattened
 * into absolute screen coordinates and written as an SVG element. That lets us
 * rasterise a model with sharp and actually LOOK at the figure while iterating,
 * without a browser.
 */

const SERIF_STACK = 'PingFang SC, Helvetica Neue, Helvetica, Arial, sans-serif';

function xmlEscape(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function number(value) {
  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
}

function colorOf(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    if (typeof value.css === 'string') return value.css;
    return '#888888';
  }
  return '#000000';
}

/** 把 canvas 的路径命令压成绝对坐标点列 */
class PathBuilder {
  constructor(transform, stats) {
    this.transform = transform;
    this.stats = stats || null;
    this.subpaths = [];
    this.current = null;
  }

  apply(x, y) {
    const m = this.transform();
    const px = m[0] * x + m[2] * y + m[4];
    const py = m[1] * x + m[3] * y + m[5];
    if (this.stats && Number.isFinite(px) && Number.isFinite(py)) {
      this.stats.minX = Math.min(this.stats.minX, px);
      this.stats.maxX = Math.max(this.stats.maxX, px);
      this.stats.minY = Math.min(this.stats.minY, py);
      this.stats.maxY = Math.max(this.stats.maxY, py);
      this.stats.points += 1;
    }
    return [px, py];
  }

  moveTo(x, y) {
    this.current = { points: [this.apply(x, y)], closed: false };
    this.subpaths.push(this.current);
  }

  lineTo(x, y) {
    if (!this.current) this.moveTo(x, y);
    else this.current.points.push(this.apply(x, y));
  }

  quadTo(cx, cy, x, y) {
    if (!this.current) this.moveTo(cx, cy);
    const start = this.current.points[this.current.points.length - 1];
    const p0 = this.unapply(start);
    const steps = 10;
    for (let i = 1; i <= steps; i += 1) {
      const k = i / steps;
      const bx = (1 - k) * (1 - k) * p0[0] + 2 * (1 - k) * k * cx + k * k * x;
      const by = (1 - k) * (1 - k) * p0[1] + 2 * (1 - k) * k * cy + k * k * y;
      this.current.points.push(this.apply(bx, by));
    }
  }

  unapply(point) {
    const m = this.transform();
    const det = m[0] * m[3] - m[1] * m[2] || 1e-9;
    const px = point[0] - m[4];
    const py = point[1] - m[5];
    return [(m[3] * px - m[2] * py) / det, (-m[1] * px + m[0] * py) / det];
  }

  bezierTo(c1x, c1y, c2x, c2y, x, y) {
    if (!this.current) this.moveTo(c1x, c1y);
    const start = this.current.points[this.current.points.length - 1];
    const p0 = this.unapply(start);
    const steps = 14;
    for (let i = 1; i <= steps; i += 1) {
      const k = i / steps;
      const mk = 1 - k;
      const bx = mk * mk * mk * p0[0] + 3 * mk * mk * k * c1x + 3 * mk * k * k * c2x + k * k * k * x;
      const by = mk * mk * mk * p0[1] + 3 * mk * mk * k * c1y + 3 * mk * k * k * c2y + k * k * k * y;
      this.current.points.push(this.apply(bx, by));
    }
  }

  arc(cx, cy, r, a0, a1, ccw) {
    if (r <= 0) return;
    let sweep = a1 - a0;
    if (ccw) {
      while (sweep > 0) sweep -= Math.PI * 2;
      while (sweep < -Math.PI * 2) sweep += Math.PI * 2;
    } else {
      while (sweep < 0) sweep += Math.PI * 2;
      while (sweep > Math.PI * 2) sweep -= Math.PI * 2;
    }
    const steps = Math.max(8, Math.min(96, Math.ceil(Math.abs(sweep) / 0.09)));
    for (let i = 0; i <= steps; i += 1) {
      const a = a0 + (sweep * i) / steps;
      const px = cx + r * Math.cos(a);
      const py = cy + r * Math.sin(a);
      if (i === 0 && !this.current) this.moveTo(px, py);
      else this.lineTo(px, py);
    }
  }

  ellipse(cx, cy, rx, ry, rotation, a0, a1, ccw) {
    let sweep = a1 - a0;
    if (ccw) {
      while (sweep > 0) sweep -= Math.PI * 2;
      while (sweep < -Math.PI * 2) sweep += Math.PI * 2;
    } else {
      while (sweep < 0) sweep += Math.PI * 2;
      while (sweep > Math.PI * 2) sweep -= Math.PI * 2;
    }
    const steps = Math.max(12, Math.min(120, Math.ceil(Math.abs(sweep) / 0.09)));
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    for (let i = 0; i <= steps; i += 1) {
      const a = a0 + (sweep * i) / steps;
      const ex = rx * Math.cos(a);
      const ey = ry * Math.sin(a);
      const px = cx + ex * cosR - ey * sinR;
      const py = cy + ex * sinR + ey * cosR;
      if (i === 0 && !this.current) this.moveTo(px, py);
      else this.lineTo(px, py);
    }
  }

  rect(x, y, w, h) {
    this.moveTo(x, y);
    this.lineTo(x + w, y);
    this.lineTo(x + w, y + h);
    this.lineTo(x, y + h);
    if (this.current) this.current.closed = true;
  }

  close() {
    if (this.current) this.current.closed = true;
  }

  toD() {
    return this.subpaths
      .map((sub) => {
        if (!sub.points.length) return '';
        const [first, ...rest] = sub.points;
        let d = `M${number(first[0])} ${number(first[1])}`;
        rest.forEach((pt) => {
          d += `L${number(pt[0])} ${number(pt[1])}`;
        });
        if (sub.closed) d += 'Z';
        return d;
      })
      .filter(Boolean)
      .join(' ');
  }

  isEmpty() {
    return this.subpaths.every((sub) => !sub.points.length);
  }
}

export function createRecorder(width, height) {
  const elements = [];
  const stats = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, points: 0, texts: 0 };
  let matrix = [1, 0, 0, 1, 0, 0];
  let path = new PathBuilder(() => matrix, stats);
  const state = [];
  let clipId = 0;

  const ctx = {
    canvas: { width, height },
    // 状态
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    font: `12px ${SERIF_STACK}`,
    textAlign: 'start',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    shadowBlur: 0,
    shadowColor: 'transparent',

    save() {
      state.push({
        matrix: matrix.slice(),
        fillStyle: ctx.fillStyle,
        strokeStyle: ctx.strokeStyle,
        lineWidth: ctx.lineWidth,
        font: ctx.font,
        textAlign: ctx.textAlign,
        textBaseline: ctx.textBaseline,
        globalAlpha: ctx.globalAlpha,
        lineCap: ctx.lineCap,
        lineJoin: ctx.lineJoin,
        dash: ctx._dash ? ctx._dash.slice() : [],
      });
    },
    restore() {
      const prev = state.pop();
      if (!prev) return;
      matrix = prev.matrix;
      ctx.fillStyle = prev.fillStyle;
      ctx.strokeStyle = prev.strokeStyle;
      ctx.lineWidth = prev.lineWidth;
      ctx.font = prev.font;
      ctx.textAlign = prev.textAlign;
      ctx.textBaseline = prev.textBaseline;
      ctx.globalAlpha = prev.globalAlpha;
      ctx.lineCap = prev.lineCap;
      ctx.lineJoin = prev.lineJoin;
      ctx._dash = prev.dash;
    },
    translate(tx, ty) {
      matrix = [matrix[0], matrix[1], matrix[2], matrix[3], matrix[4] + matrix[0] * tx + matrix[2] * ty, matrix[5] + matrix[1] * tx + matrix[3] * ty];
    },
    rotate(angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      matrix = [
        matrix[0] * cos + matrix[2] * sin,
        matrix[1] * cos + matrix[3] * sin,
        -matrix[0] * sin + matrix[2] * cos,
        -matrix[1] * sin + matrix[3] * cos,
        matrix[4],
        matrix[5],
      ];
    },
    scale(sx, sy) {
      matrix = [matrix[0] * sx, matrix[1] * sx, matrix[2] * sy, matrix[3] * sy, matrix[4], matrix[5]];
    },
    setTransform(a, b, c, d, e, f) {
      matrix = [a, b, c, d, e, f];
    },
    resetTransform() {
      matrix = [1, 0, 0, 1, 0, 0];
    },
    transform(a, b, c, d, e, f) {
      matrix = [
        matrix[0] * a + matrix[2] * b,
        matrix[1] * a + matrix[3] * b,
        matrix[0] * c + matrix[2] * d,
        matrix[1] * c + matrix[3] * d,
        matrix[0] * e + matrix[2] * f + matrix[4],
        matrix[1] * e + matrix[3] * f + matrix[5],
      ];
    },

    // 路径
    beginPath() {
      path = new PathBuilder(() => matrix, stats);
    },
    moveTo(x, y) {
      path.moveTo(x, y);
    },
    lineTo(x, y) {
      path.lineTo(x, y);
    },
    quadraticCurveTo(cx, cy, x, y) {
      path.quadTo(cx, cy, x, y);
    },
    bezierCurveTo(c1x, c1y, c2x, c2y, x, y) {
      path.bezierTo(c1x, c1y, c2x, c2y, x, y);
    },
    arc(cx, cy, r, a0, a1, ccw) {
      path.arc(cx, cy, r, a0, a1, ccw);
    },
    arcTo() {},
    ellipse(cx, cy, rx, ry, rotation, a0, a1, ccw) {
      path.ellipse(cx, cy, rx, ry, rotation || 0, a0 === undefined ? 0 : a0, a1 === undefined ? Math.PI * 2 : a1, ccw);
    },
    rect(x, y, w, h) {
      path.rect(x, y, w, h);
    },
    closePath() {
      path.close();
    },
    clip() {
      // 不做真正裁剪：只保证不抛错
      clipId += 1;
    },
    setLineDash(pattern) {
      ctx._dash = Array.isArray(pattern) ? pattern.slice() : [];
    },
    getLineDash() {
      return ctx._dash ? ctx._dash.slice() : [];
    },

    // 填充 / 描边
    fill() {
      const d = path.toD();
      if (!d) return;
      elements.push(
        `<path d="${d}" fill="${colorOf(ctx.fillStyle)}" stroke="none" fill-rule="nonzero"${
          ctx.globalAlpha < 1 ? ` opacity="${number(ctx.globalAlpha)}"` : ''
        }/>`,
      );
    },
    stroke() {
      const d = path.toD();
      if (!d) return;
      const dash = ctx._dash && ctx._dash.length ? ` stroke-dasharray="${ctx._dash.map(number).join(' ')}"` : '';
      elements.push(
        `<path d="${d}" fill="none" stroke="${colorOf(ctx.strokeStyle)}" stroke-width="${number(ctx.lineWidth)}" stroke-linecap="${
          ctx.lineCap || 'butt'
        }" stroke-linejoin="${ctx.lineJoin || 'miter'}"${dash}${
          ctx.globalAlpha < 1 ? ` opacity="${number(ctx.globalAlpha)}"` : ''
        }/>`,
      );
    },
    fillRect(x, y, w, h) {
      const savePath = path;
      path = new PathBuilder(() => matrix, stats);
      path.rect(x, y, w, h);
      ctx.fill();
      path = savePath;
    },
    strokeRect(x, y, w, h) {
      const savePath = path;
      path = new PathBuilder(() => matrix, stats);
      path.rect(x, y, w, h);
      ctx.stroke();
      path = savePath;
    },
    clearRect() {
      /* SVG 背景由调用方垫底 */
    },
    fillText(text, x, y, maxWidth) {
      if (text === undefined || text === null || text === '') return;
      const m = matrix;
      const px = m[0] * x + m[2] * y + m[4];
      const py = m[1] * x + m[3] * y + m[5];
      const sizeMatch = /(\d+(?:\.\d+)?)px/.exec(ctx.font || '');
      const size = sizeMatch ? Number(sizeMatch[1]) : 12;
      const weightMatch = /(bold|[1-9]00)/.exec(ctx.font || '');
      const weight = weightMatch ? (weightMatch[1] === 'bold' ? 700 : Number(weightMatch[1])) : 400;
      const anchor = ctx.textAlign === 'center' ? 'middle' : ctx.textAlign === 'right' || ctx.textAlign === 'end' ? 'end' : 'start';
      const baseline = ctx.textBaseline === 'middle' ? 'central' : ctx.textBaseline === 'top' ? 'hanging' : 'alphabetic';
      const rotate = Math.abs(m[1]) > 1e-6 || Math.abs(m[2]) > 1e-6 ? (Math.atan2(m[1], m[0]) * 180) / Math.PI : 0;
      const transform = rotate ? ` transform="rotate(${number(rotate)} ${number(px)} ${number(py)})"` : '';
      if (Number.isFinite(px) && Number.isFinite(py)) {
        stats.minX = Math.min(stats.minX, px);
        stats.maxX = Math.max(stats.maxX, px);
        stats.minY = Math.min(stats.minY, py);
        stats.maxY = Math.max(stats.maxY, py);
        stats.texts += 1;
      }
      elements.push(
        `<text x="${number(px)}" y="${number(py)}" font-family="${SERIF_STACK}" font-size="${number(size)}" font-weight="${number(
          weight,
        )}" fill="${colorOf(ctx.fillStyle)}" text-anchor="${anchor}" dominant-baseline="${baseline}"${transform}${
          ctx.globalAlpha < 1 ? ` opacity="${number(ctx.globalAlpha)}"` : ''
        }>${xmlEscape(text)}</text>`,
      );
    },
    strokeText(text, x, y) {
      ctx.fillText(text, x, y);
    },
    measureText(text) {
      const sizeMatch = /(\d+(?:\.\d+)?)px/.exec(ctx.font || '');
      const size = sizeMatch ? Number(sizeMatch[1]) : 12;
      let width = 0;
      String(text).split('').forEach((ch) => {
        width += /[\u2e80-\u9fff\uff00-\uffef]/.test(ch) ? size : size * 0.56;
      });
      return { width };
    },
    createLinearGradient() {
      return { addColorStop() {}, css: '#888888' };
    },
    createRadialGradient() {
      return { addColorStop() {}, css: '#888888' };
    },
    createPattern() {
      return { css: '#888888' };
    },
    drawImage() {},
    getImageData() {
      return { data: [] };
    },
    putImageData() {},
  };

  return {
    ctx,
    toSvg(body) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${body && body.background ? body.background : '#ffffff'}"/>${elements.join(
        '',
      )}</svg>`;
    },
    get elements() {
      return elements;
    },
    get stats() {
      return stats;
    },
  };
}

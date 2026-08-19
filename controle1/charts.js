// ============================================================
// Safe math-formula compiler: turns a string like "10 - 0.8*x"
// into a function of x, WITHOUT using eval()/Function() on
// untrusted text. Supports + - * / ^, unary minus, parentheses,
// numbers, the variable x, and sqrt/abs/min/max/ln/exp.
// ============================================================
function compileFormula(source) {
  const tokens = tokenizeFormula(source);
  let pos = 0;

  function peek() { return tokens[pos]; }
  function next() { return tokens[pos++]; }

  function parseExpr() {
    let node = parseTerm();
    while (peek() && (peek().v === "+" || peek().v === "-")) {
      const op = next().v;
      const rhs = parseTerm();
      const prev = node;
      node = (x) => (op === "+" ? prev(x) + rhs(x) : prev(x) - rhs(x));
    }
    return node;
  }

  function parseTerm() {
    let node = parsePow();
    while (peek() && (peek().v === "*" || peek().v === "/")) {
      const op = next().v;
      const rhs = parsePow();
      const prev = node;
      node = (x) => (op === "*" ? prev(x) * rhs(x) : prev(x) / rhs(x));
    }
    return node;
  }

  function parsePow() {
    let node = parseUnary();
    if (peek() && peek().v === "^") {
      next();
      const rhs = parsePow();
      const prev = node;
      node = (x) => Math.pow(prev(x), rhs(x));
    }
    return node;
  }

  function parseUnary() {
    if (peek() && peek().v === "-") {
      next();
      const inner = parseUnary();
      return (x) => -inner(x);
    }
    if (peek() && peek().v === "+") {
      next();
      return parseUnary();
    }
    return parsePrimary();
  }

  const FUNCS = {
    sqrt: Math.sqrt, abs: Math.abs, min: Math.min, max: Math.max,
    ln: Math.log, exp: Math.exp,
  };

  function parsePrimary() {
    const t = next();
    if (!t) throw new Error("Formula inesperadamente vazia");
    if (t.t === "num") return () => t.v;
    if (t.t === "id") {
      if (t.v === "x") return (x) => x;
      if (FUNCS[t.v]) {
        if (!peek() || peek().v !== "(") throw new Error(`Esperado '(' apos ${t.v}`);
        next();
        const args = [parseExpr()];
        while (peek() && peek().v === ",") {
          next();
          args.push(parseExpr());
        }
        if (!peek() || peek().v !== ")") throw new Error("Esperado ')'");
        next();
        const fn = FUNCS[t.v];
        return (x) => fn(...args.map((a) => a(x)));
      }
      throw new Error(`Identificador desconhecido: ${t.v}`);
    }
    if (t.v === "(") {
      const inner = parseExpr();
      if (!peek() || peek().v !== ")") throw new Error("Esperado ')'");
      next();
      return inner;
    }
    throw new Error(`Token inesperado: ${t.v}`);
  }

  const fn = parseExpr();
  if (pos !== tokens.length) throw new Error("Formula mal formada (sobrou texto)");
  return fn;
}

function tokenizeFormula(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      tokens.push({ t: "num", v: parseFloat(src.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < src.length && /[a-zA-Z0-9_]/.test(src[j])) j++;
      tokens.push({ t: "id", v: src.slice(i, j) });
      i = j;
      continue;
    }
    if ("+-*/^(),".includes(c)) {
      tokens.push({ t: "op", v: c });
      i++;
      continue;
    }
    throw new Error(`Caractere invalido na formula: "${c}"`);
  }
  return tokens;
}

// ============================================================
// Generic economics-chart renderer (canvas 2D)
// ============================================================
const CHART_COLORS = {
  acc: "#2563eb", good: "#10b981", bad: "#ef4444",
  warn: "#f59e0b", muted: "#64748b", ink: "#1e293b",
};

const CHART_MARGIN = { left: 46, right: 18, top: 18, bottom: 34 };

function chartMap(cfg, w, h) {
  const pw = w - CHART_MARGIN.left - CHART_MARGIN.right;
  const ph = h - CHART_MARGIN.top - CHART_MARGIN.bottom;
  return {
    x: (x) => CHART_MARGIN.left + ((x - cfg.xmin) / (cfg.xmax - cfg.xmin)) * pw,
    y: (y) => CHART_MARGIN.top + (1 - (y - cfg.ymin) / (cfg.ymax - cfg.ymin)) * ph,
  };
}

function renderChart(ctx, cfg, w, h) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const m = chartMap(cfg, w, h);

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(m.x(cfg.xmin), m.y(cfg.ymin));
  ctx.lineTo(m.x(cfg.xmin), m.y(cfg.ymax));
  ctx.moveTo(m.x(cfg.xmin), m.y(cfg.ymin));
  ctx.lineTo(m.x(cfg.xmax), m.y(cfg.ymin));
  ctx.stroke();

  ctx.fillStyle = CHART_COLORS.muted;
  ctx.font = "12px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(cfg.xlabel || "", w - CHART_MARGIN.right, m.y(cfg.ymin) + 20);
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(cfg.ylabel || "", 2, CHART_MARGIN.top - 4);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  (cfg.guides || []).forEach((g) => {
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = CHART_COLORS.muted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(m.x(g.x1), m.y(g.y1));
    ctx.lineTo(m.x(g.x2), m.y(g.y2));
    ctx.stroke();
    ctx.restore();
  });

  (cfg.hlines || []).forEach((hl) => {
    ctx.save();
    if (hl.dashed) ctx.setLineDash([5, 4]);
    ctx.strokeStyle = CHART_COLORS[hl.color] || hl.color || CHART_COLORS.ink;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(m.x(cfg.xmin), m.y(hl.y));
    ctx.lineTo(m.x(cfg.xmax), m.y(hl.y));
    ctx.stroke();
    if (hl.label) {
      ctx.fillStyle = ctx.strokeStyle;
      ctx.font = "11px sans-serif";
      ctx.fillText(hl.label, m.x(cfg.xmax) - 60, m.y(hl.y) - 4);
    }
    ctx.restore();
  });

  (cfg.curves || []).forEach((c) => {
    let fn;
    try {
      fn = typeof c.formula === "string" ? compileFormula(c.formula) : c.fn;
    } catch (e) {
      console.error("[inteco] formula invalida:", c.formula, e);
      return;
    }
    ctx.save();
    if (c.dashed) ctx.setLineDash([6, 4]);
    ctx.strokeStyle = CHART_COLORS[c.color] || c.color || CHART_COLORS.ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    const [a, b] = c.domain;
    const steps = c.samples || 120;
    let started = false;
    for (let i = 0; i <= steps; i++) {
      const x = a + ((b - a) * i) / steps;
      let y;
      try { y = fn(x); } catch (e) { y = null; }
      if (y == null || isNaN(y) || y < cfg.ymin - (cfg.ymax - cfg.ymin) * 0.3) {
        started = false;
        continue;
      }
      const px = m.x(x);
      const py = m.y(Math.min(Math.max(y, cfg.ymin), cfg.ymax * 1.3));
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    if (c.label) {
      const lx = a + (b - a) * (c.labelT ?? 0.82);
      let ly;
      try { ly = fn(lx); } catch (e) { ly = cfg.ymin; }
      ctx.fillStyle = CHART_COLORS[c.color] || c.color || CHART_COLORS.ink;
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(c.label, m.x(lx) + 4, m.y(ly) + (c.labelDy || -6));
    }
  });

  (cfg.points || []).forEach((p) => {
    ctx.save();
    ctx.fillStyle = CHART_COLORS[p.color] || p.color || CHART_COLORS.ink;
    ctx.beginPath();
    ctx.arc(m.x(p.x), m.y(p.y), 3.3, 0, Math.PI * 2);
    ctx.fill();
    if (p.label) {
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(p.label, m.x(p.x) + 6, m.y(p.y) - 6);
    }
    ctx.restore();
  });

  ctx.restore();
}

function mountStaticChart(holderId, cfg, opts) {
  const holder = document.getElementById(holderId);
  const w = (opts && opts.w) || 640;
  const h = (opts && opts.h) || 300;
  holder.innerHTML = `<div class="canvas-tool"><canvas width="${w}" height="${h}"></canvas></div>`;
  const canvas = holder.querySelector("canvas");
  canvas.style.cursor = "default";
  const ctx = canvas.getContext("2d");
  renderChart(ctx, cfg, w, h);
}

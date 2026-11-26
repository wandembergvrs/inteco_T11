// ============================================================
// Safe math-formula compiler: turns a string like "10 - 0.8*x"
// into a function of x, WITHOUT using eval()/Function() on
// untrusted text. Supports + - * / ^, unary minus, parentheses,
// numbers, the variable x, and sqrt/abs/min/max/ln/exp.
//
// Shared with the avaliacao remota project's chart engine.
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
  warn: "#f59e0b", muted: "#94a3b8", ink: "#e5e7eb",
};

const CHART_MARGIN = { left: 50, right: 18, top: 18, bottom: 42 };

function niceTickStep(range) {
  if (!(range > 0)) return 1;
  const rough = range / 6;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  let step;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  return step * mag;
}

function formatTickNum(v) {
  const rounded = Math.round(v * 100) / 100;
  return Math.abs(rounded - Math.round(rounded)) < 1e-9 ? String(Math.round(rounded)) : String(rounded);
}

function drawAxisTicks(ctx, cfg, m) {
  const xStep = niceTickStep(cfg.xmax - cfg.xmin);
  const yStep = niceTickStep(cfg.ymax - cfg.ymin);

  ctx.save();
  ctx.strokeStyle = "#334155";
  ctx.fillStyle = CHART_COLORS.muted;
  ctx.font = "10px sans-serif";
  ctx.lineWidth = 1;

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let x = Math.ceil(cfg.xmin / xStep) * xStep; x <= cfg.xmax + 1e-9; x += xStep) {
    const px = m.x(x);
    ctx.beginPath();
    ctx.moveTo(px, m.y(cfg.ymin));
    ctx.lineTo(px, m.y(cfg.ymin) + 4);
    ctx.stroke();
    ctx.fillText(formatTickNum(x), px, m.y(cfg.ymin) + 6);
  }

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let y = Math.ceil(cfg.ymin / yStep) * yStep; y <= cfg.ymax + 1e-9; y += yStep) {
    const py = m.y(y);
    ctx.beginPath();
    ctx.moveTo(m.x(cfg.xmin) - 4, py);
    ctx.lineTo(m.x(cfg.xmin), py);
    ctx.stroke();
    ctx.fillText(formatTickNum(y), m.x(cfg.xmin) - 6, py);
  }
  ctx.restore();
}

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
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, w, h);

  const m = chartMap(cfg, w, h);

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(m.x(cfg.xmin), m.y(cfg.ymin));
  ctx.lineTo(m.x(cfg.xmin), m.y(cfg.ymax));
  ctx.moveTo(m.x(cfg.xmin), m.y(cfg.ymin));
  ctx.lineTo(m.x(cfg.xmax), m.y(cfg.ymin));
  ctx.stroke();

  drawAxisTicks(ctx, cfg, m);

  ctx.fillStyle = CHART_COLORS.muted;
  ctx.font = "12px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(cfg.xlabel || "", w - CHART_MARGIN.right, m.y(cfg.ymin) + 34);
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
      ctx.fillText(hl.label, m.x(cfg.xmax) - 66, m.y(hl.y) - 4);
    }
    ctx.restore();
  });

  (cfg.curves || []).forEach((c) => {
    let fn;
    try {
      fn = typeof c.formula === "string" ? compileFormula(c.formula) : c.fn;
    } catch (e) {
      console.error("[mini-charts] formula invalida:", c.formula, e);
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
  if (!holder) return;
  const w = (opts && opts.w) || 480;
  const h = (opts && opts.h) || 240;
  holder.innerHTML = `<canvas width="${w}" height="${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto;border-radius:10px;border:1px solid #1f2937"></canvas>`;
  const canvas = holder.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  renderChart(ctx, cfg, w, h);
}

// ---- Diagrama do fluxo circular (SVG), montado por etapas ----
// cfg: { topo, base: "rotulo" | "?"            (caixas dos mercados)
//        real, moeda: "oculto" | "?" | "rotulos" (setas de dentro = coisas; setas de fora = dinheiro)
//        valores: { gastos, receita, salarios, renda }  texto extra sob o rótulo das setas de dinheiro }
function mountFluxoCircular(holder, cfg, largura) {
  if (typeof holder === 'string') holder = document.getElementById(holder);
  if (!holder) return;
  cfg = cfg || {};
  const NS = 'http://www.w3.org/2000/svg';
  const W = 600, H = 380;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.cssText = `width:100%;max-width:${largura || 520}px;display:block;margin:0 auto 14px;background:#0b1220;border:1px solid #1f2937;border-radius:10px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif`;
  const COR_REAL = '#f87171', COR_MOEDA = '#34d399', COR_TXT = '#e5e7eb', COR_SUB = '#94a3b8';
  const el = (tag, attrs, txt) => {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
    if (txt != null) e.textContent = txt;
    svg.appendChild(e);
    return e;
  };
  const defs = el('defs');
  [['real', COR_REAL], ['moeda', COR_MOEDA]].forEach(([id, cor]) => {
    const m = document.createElementNS(NS, 'marker');
    m.setAttribute('id', 'fc-' + id); m.setAttribute('viewBox', '0 0 10 10');
    m.setAttribute('refX', '9'); m.setAttribute('refY', '5');
    m.setAttribute('markerWidth', '7'); m.setAttribute('markerHeight', '7'); m.setAttribute('orient', 'auto');
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M0,0 L10,5 L0,10 z'); p.setAttribute('fill', cor);
    m.appendChild(p); defs.appendChild(m);
  });
  const linhas = (x, y, textos, attrs) => {
    [].concat(textos).forEach((t, i) => el('text', Object.assign({ x, y: y + i * 13 }, attrs), t));
  };
  const caixa = (x, y, w, h, titulo, subs) => {
    const incognita = titulo === '?';
    el('rect', { x, y, width: w, height: h, rx: 8, fill: '#111c33', stroke: incognita ? '#fbbf24' : '#475569',
      'stroke-width': incognita ? 2 : 1.5, 'stroke-dasharray': incognita ? '6 4' : '' });
    const tit = [].concat(titulo);
    const cx = x + w / 2;
    if (incognita) { el('text', { x: cx, y: y + h / 2 + 10, 'text-anchor': 'middle', fill: '#fbbf24', 'font-size': 30, 'font-weight': 700 }, '?'); return; }
    const y0 = y + (subs ? 20 : h / 2 - (tit.length - 1) * 8 + 5);
    tit.forEach((t, i) => el('text', { x: cx, y: y0 + i * 16, 'text-anchor': 'middle', fill: COR_TXT, 'font-size': 14, 'font-weight': 700 }, t));
    [].concat(subs || []).forEach((t, i) => el('text', { x: cx, y: y0 + tit.length * 16 + 1 + i * 13, 'text-anchor': 'middle', fill: COR_SUB, 'font-size': 10.5 }, t));
  };
  // caixas: mercados em cima e embaixo, empresas à esquerda, famílias à direita (como no slide da aula)
  caixa(215, 12, 170, 70, cfg.topo === '?' ? '?' : ['MERCADOS DE', 'BENS E SERVIÇOS'], ['Empresas vendem · Famílias compram']);
  caixa(215, 298, 170, 70, cfg.base === '?' ? '?' : ['MERCADOS', 'DE FATORES'], ['Famílias vendem · Empresas compram']);
  caixa(12, 155, 150, 70, 'EMPRESAS', ['Produzem bens e serviços', 'Contratam fatores']);
  caixa(438, 155, 150, 70, 'FAMÍLIAS', ['Compram e consomem', 'Vendem fatores']);

  const v = cfg.valores || {};
  const rot = (modo, texto) => (modo === '?' ? ['?'] : [].concat(texto));
  const estilo = (modo, cor, extra) => Object.assign(
    { fill: modo === '?' ? '#fbbf24' : cor, 'font-size': modo === '?' ? 20 : 11, 'font-weight': modo === '?' ? 700 : 600 }, extra);

  // setas de FORA: dinheiro (sentido anti-horário)
  if (cfg.moeda && cfg.moeda !== 'oculto') {
    const m = cfg.moeda, a = { fill: 'none', stroke: COR_MOEDA, 'stroke-width': 2.2, 'marker-end': 'url(#fc-moeda)' };
    el('path', Object.assign({ d: 'M513,155 L513,47 L387,47' }, a));     // famílias -> mercado de bens
    el('path', Object.assign({ d: 'M215,47 L87,47 L87,153' }, a));       // mercado de bens -> empresas
    el('path', Object.assign({ d: 'M87,225 L87,333 L213,333' }, a));     // empresas -> mercado de fatores
    el('path', Object.assign({ d: 'M385,333 L513,333 L513,227' }, a));   // mercado de fatores -> famílias
    linhas(522, 96, rot(m, ['Gastos'].concat(v.gastos ? [v.gastos] : [])), estilo(m, COR_MOEDA, { 'text-anchor': 'start' }));
    linhas(78, 96, rot(m, ['Receita'].concat(v.receita ? [v.receita] : [])), estilo(m, COR_MOEDA, { 'text-anchor': 'end' }));
    linhas(78, 268, rot(m, ['Salários,', 'aluguéis', 'e lucro'].concat(v.salarios ? [v.salarios] : [])), estilo(m, COR_MOEDA, { 'text-anchor': 'end' }));
    linhas(522, 276, rot(m, ['Renda'].concat(v.renda ? [v.renda] : [])), estilo(m, COR_MOEDA, { 'text-anchor': 'start' }));
  }
  // setas de DENTRO: coisas (sentido horário)
  if (cfg.real && cfg.real !== 'oculto') {
    const r = cfg.real, a = { fill: 'none', stroke: COR_REAL, 'stroke-width': 2.2, 'marker-end': 'url(#fc-real)' };
    el('path', Object.assign({ d: 'M150,155 Q190,105 232,84' }, a));     // empresas -> mercado de bens
    el('path', Object.assign({ d: 'M368,84 Q410,105 450,153' }, a));     // mercado de bens -> famílias
    el('path', Object.assign({ d: 'M450,225 Q410,275 368,296' }, a));    // famílias -> mercado de fatores
    el('path', Object.assign({ d: 'M232,296 Q190,275 150,227' }, a));    // mercado de fatores -> empresas
    linhas(206, 128, rot(r, ['Bens e serviços', 'vendidos']), estilo(r, COR_REAL, { 'text-anchor': 'start' }));
    linhas(394, 128, rot(r, ['Bens e serviços', 'comprados']), estilo(r, COR_REAL, { 'text-anchor': 'end' }));
    linhas(394, 246, rot(r, ['Trabalho, terra', 'e capital']), estilo(r, COR_REAL, { 'text-anchor': 'end' }));
    linhas(206, 246, rot(r, ['Fatores de', 'produção']), estilo(r, COR_REAL, { 'text-anchor': 'start' }));
  }
  // legenda no centro
  let ly = 184;
  if (cfg.real && cfg.real !== 'oculto') { el('text', { x: 300, y: ly, 'text-anchor': 'middle', fill: COR_REAL, 'font-size': 10.5 }, '→ por dentro: coisas (fluxo real)'); ly += 14; }
  if (cfg.moeda && cfg.moeda !== 'oculto') el('text', { x: 300, y: ly, 'text-anchor': 'middle', fill: COR_MOEDA, 'font-size': 10.5 }, '→ por fora: dinheiro (fluxo monetário)');
  holder.appendChild(svg);
}

// ---- Helpers da enquete (compartilhados por enquete.html e apresentador.html) ----

// Tabela de dados de uma pergunta: { cabecalho: [...], linhas: [[...], ...] }
function montarTabela(holder, tabela, fontPx) {
  if (!holder || !tabela) return;
  const t = document.createElement('table');
  t.style.cssText = 'border-collapse:collapse;margin:0 auto 14px;font-size:' + (fontPx || 14) + 'px;font-weight:600';
  const celula = (tag, txt, i) => {
    const c = document.createElement(tag);
    c.textContent = txt;
    c.style.cssText = 'border:1px solid #1f2937;padding:8px 12px;text-align:' + (i === 0 ? 'left' : 'center') +
      (tag === 'th' ? ';background:#0b1425;color:#94a3b8' : '');
    return c;
  };
  if (tabela.cabecalho) {
    const tr = document.createElement('tr');
    tabela.cabecalho.forEach((h, i) => tr.appendChild(celula('th', h, i)));
    t.appendChild(tr);
  }
  (tabela.linhas || []).forEach(l => {
    const tr = document.createElement('tr');
    l.forEach((v, i) => tr.appendChild(celula('td', v, i)));
    t.appendChild(tr);
  });
  holder.appendChild(t);
}

// Resposta numerica confere com o gabarito? (null se a pergunta nao tem gabarito)
function respostaNumericaCerta(pergunta, valor) {
  if (pergunta.gabarito == null) return null;
  const tol = pergunta.tolerancia != null ? pergunta.tolerancia : Math.max(0.005, Math.abs(pergunta.gabarito) * 0.005);
  return Math.abs(Number(valor) - pergunta.gabarito) <= tol;
}

// Numero formatado com a unidade da pergunta: "R$ 66", "R$ 1.000 bi", "20%", "5 R$ por US$"
function comUnidade(pergunta, valor) {
  const n = Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  const u = pergunta.unidade || '';
  if (!u) return n;
  if (u === '%') return n + '%';
  if (u === 'R$') return 'R$ ' + n;
  if (u.startsWith('R$ ') && !u.includes('por')) return 'R$ ' + n + u.slice(2);
  return n + ' ' + u;
}

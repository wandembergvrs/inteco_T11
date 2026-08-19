// ============================================================
// Generic economics-chart renderer (canvas 2D)
// ============================================================
const CHART_COLORS = {
  acc: "#2563eb",
  good: "#10b981",
  bad: "#ef4444",
  warn: "#f59e0b",
  muted: "#64748b",
  ink: "#1e293b",
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

  // axes
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

  // guide (dotted) lines
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

  // horizontal reference lines
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

  // curves
  (cfg.curves || []).forEach((c) => {
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
      const y = c.fn(x);
      if (y == null || isNaN(y) || y < cfg.ymin - (cfg.ymax - cfg.ymin) * 0.3) {
        started = false;
        continue;
      }
      const px = m.x(x);
      const py = m.y(Math.min(Math.max(y, cfg.ymin), cfg.ymax * 1.3));
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
    ctx.restore();

    if (c.label) {
      const lx = a + (b - a) * (c.labelT ?? 0.82);
      const ly = c.fn(lx);
      ctx.fillStyle = CHART_COLORS[c.color] || c.color || CHART_COLORS.ink;
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(c.label, m.x(lx) + 4, m.y(ly) + (c.labelDy || -6));
    }
  });

  // points
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

// ============================================================
// Chart definitions matching the original exam figures
// ============================================================
function chartQ2() {
  return {
    xmin: 0, xmax: 10, ymin: 0, ymax: 10,
    xlabel: "Bens A", ylabel: "Bens B",
    curves: [
      { fn: (x) => 10 - 0.35 * x - 0.03 * x * x, domain: [0, 10], color: "acc", samples: 150 },
    ],
    points: [
      { x: 5, y: 7.5, label: "X", color: "acc" },
      { x: 3, y: 3, label: "Y", color: "muted" },
      { x: 8, y: 7.6, label: "Z", color: "bad" },
    ],
  };
}

function chartQ4a() {
  return {
    xmin: 0, xmax: 10, ymin: 0, ymax: 10, xlabel: "Q", ylabel: "P",
    curves: [
      { fn: (x) => 10 - 0.8 * x, domain: [0, 10], color: "acc", label: "D", labelT: 0.85, labelDy: -6 },
      { fn: (x) => 1 + 0.5 * x, domain: [0, 10], color: "good", label: "S", labelT: 0.9, labelDy: 14 },
    ],
  };
}

function chartQ4c() {
  return {
    xmin: 0, xmax: 10, ymin: 0, ymax: 10, xlabel: "Q", ylabel: "P",
    curves: [
      { fn: (x) => 1 + 0.5 * x, domain: [0, 10], color: "good", label: "S₀", labelT: 0.9, labelDy: 14 },
      { fn: (x) => 4.5 + 0.5 * x, domain: [0, 5.5], color: "bad", label: "S₁", labelT: 0.85, labelDy: 14 },
      { fn: (x) => 10 - 0.8 * x, domain: [0, 10], color: "acc", label: "D", labelT: 0.85, labelDy: -6 },
    ],
  };
}

function chartQ5() {
  return {
    xmin: 0, xmax: 12, ymin: 0, ymax: 12, xlabel: "Q", ylabel: "P",
    curves: [
      { fn: (x) => 12 - x, domain: [0, 12], color: "acc" },
    ],
    points: [
      { x: 3, y: 9, label: "A", color: "ink" },
      { x: 2, y: 10, label: "B", color: "ink" },
    ],
  };
}

function chartQ6() {
  const qStar = 5.7142857, pStar = 5.4285714;
  return {
    xmin: 0, xmax: 10, ymin: 0, ymax: 10, xlabel: "Q", ylabel: "P",
    curves: [
      { fn: (x) => 10 - 0.8 * x, domain: [0, 10], color: "acc", label: "D", labelT: 0.9, labelDy: -6 },
      { fn: (x) => 2 + 0.6 * x, domain: [0, 10], color: "good", label: "S", labelT: 0.88, labelDy: 14 },
    ],
    guides: [
      { x1: qStar, y1: 0, x2: qStar, y2: pStar },
      { x1: 0, y1: pStar, x2: qStar, y2: pStar },
    ],
    points: [{ x: qStar, y: pStar, label: "", color: "ink" }],
  };
}

function chartQ8() {
  const a = 2.0, b = 0.15, D = 1.5, F = 6.0;
  return {
    xmin: 0, xmax: 15, ymin: 0, ymax: 12, xlabel: "Q (firma)", ylabel: "Custo/Preço",
    curves: [
      { fn: (x) => D / x + a + b * x, domain: [0.6, 15], color: "muted", dashed: true, label: "CVM", samples: 200, labelT: 0.62, labelDy: 12 },
      { fn: (x) => (F + D) / x + a + b * x, domain: [0.6, 15], color: "ink", dashed: true, label: "CTM", samples: 200, labelT: 0.78, labelDy: -8 },
      { fn: (x) => a + 2 * b * x, domain: [0.6, 15], color: "acc", label: "CMg", samples: 200, labelT: 0.5, labelDy: -8 },
    ],
    hlines: [
      { y: 6, color: "good", label: "Lucro" },
      { y: 3.5, color: "warn", dashed: true, label: "Prejuízo" },
      { y: 2.5, color: "bad", dashed: true, label: "Shutdown" },
    ],
  };
}

function chartQ9() {
  return {
    xmin: 0, xmax: 10, ymin: 0, ymax: 10, xlabel: "Q", ylabel: "P",
    curves: [
      { fn: (x) => 10 - x, domain: [0, 10], color: "acc", label: "D=RMe", labelT: 0.72, labelDy: -6 },
      { fn: (x) => 10 - 2 * x, domain: [0, 5], color: "acc", dashed: true, label: "RMg", labelT: 0.55, labelDy: -8 },
      { fn: (x) => 2 + 0.2 * x, domain: [0, 10], color: "good", label: "CMg", labelT: 0.82, labelDy: 12 },
      { fn: (x) => 3 + 0.4 * x, domain: [0, 10], color: "muted", label: "CTM", labelT: 0.75, labelDy: -8 },
    ],
  };
}

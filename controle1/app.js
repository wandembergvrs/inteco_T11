// ============================================================
// CONFIG
// ============================================================
const API_BASE = "https://inteco-t13.duckdns.org";

// ============================================================
// STATE
// ============================================================
let SESSION = null; // { session_id, matricula, nome, curso }
let SUBMITTED = false;
let SAVE_QUEUE = new Map(); // qid -> value pending save
let SAVE_TIMER = null;
let FOCUS_LOSSES = 0;

// ============================================================
// LOGIN
// ============================================================
const loginScreen = document.getElementById("login-screen");
const appHeader = document.getElementById("app-header");
const examWrap = document.getElementById("exam-wrap");
const submittedBanner = document.getElementById("submitted-banner");
const loginError = document.getElementById("login-error");
const btnLogin = document.getElementById("btn-login");
const inMatricula = document.getElementById("in-matricula");

function showLoginError(msg) {
  loginError.textContent = msg;
  loginError.style.display = "block";
}

async function doLogin() {
  const matricula = inMatricula.value.trim();
  if (!matricula) {
    showLoginError("Digite sua matrícula.");
    return;
  }
  btnLogin.disabled = true;
  btnLogin.textContent = "Entrando...";
  loginError.style.display = "none";

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricula }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || "Erro ao entrar.");
    }
    SESSION = {
      session_id: data.session_id,
      matricula: matricula.replace(/\D/g, ""),
      nome: data.nome,
      curso: data.curso,
    };
    localStorage.setItem("inteco_matricula", SESSION.matricula);
    startExam(data.answers || {});
  } catch (err) {
    showLoginError(err.message || "Não foi possível entrar. Tente novamente.");
  } finally {
    btnLogin.disabled = false;
    btnLogin.textContent = "Entrar";
  }
}

btnLogin.addEventListener("click", doLogin);
inMatricula.addEventListener("keydown", (e) => {
  if (e.key === "Enter") doLogin();
});

// ============================================================
// EXAM START
// ============================================================
function startExam(savedAnswers) {
  loginScreen.classList.add("hidden");
  appHeader.classList.remove("hidden");
  examWrap.classList.remove("hidden");

  document.getElementById("who-nome").textContent = SESSION.nome;
  document.getElementById("who-curso").textContent =
    `${SESSION.curso || ""} · matrícula ${SESSION.matricula}`;

  buildQ1();
  buildCanvasTool("q6-canvas-holder", "q6_canvas");
  buildCanvasTool("q7-canvas-holder", "q7_canvas");
  buildCanvasTool("q9-canvas-holder", "q9_canvas");

  wireInputs();
  applySavedAnswers(savedAnswers);
  startFocusTracking();

  document.getElementById("submit-btn").addEventListener("click", onSubmitClick);
}

// ============================================================
// Q1 - fill-in-the-blank builder
// ============================================================
const Q1_WORDS = [
  "trade-offs", "abre mão", "margem", "incentivos", "comércio",
  "mercados", "governo", "produtividade", "moeda", "inflação", "desemprego",
];

const Q1_ITEMS = [
  "As pessoas enfrentam ___.",
  "O custo de alguma coisa é aquilo de que você ___ para obtê-la.",
  "Pessoas racionais pensam na ___.",
  "Pessoas reagem a ___.",
  "O ___ pode ser bom para todos.",
  "Os ___ são geralmente uma boa forma de organizar a atividade econômica.",
  "O ___ pode, às vezes, melhorar os resultados do mercado.",
  "O padrão de vida de um país depende de sua ___ em produzir bens e serviços.",
  "Os preços sobem quando o governo imprime ___ demais.",
  "A sociedade enfrenta um trade-off de curto prazo entre ___ e ___ (duas lacunas).",
];

function q1OptionsHtml() {
  return (
    `<option value="">Selecione...</option>` +
    Q1_WORDS.map((w) => `<option value="${w}">${w}</option>`).join("")
  );
}

function buildQ1() {
  const holder = document.getElementById("q1-blanks");
  let html = "";
  Q1_ITEMS.forEach((text, idx) => {
    const n = idx + 1;
    if (n === 10) {
      html += `
        <div class="blank-row">
          <span class="n">${n}.</span>
          <span style="flex:2">${text}</span>
          <select data-qid="q1_10a" data-q1group="1">${q1OptionsHtml()}</select>
          <select data-qid="q1_10b" data-q1group="1">${q1OptionsHtml()}</select>
        </div>`;
    } else {
      html += `
        <div class="blank-row">
          <span class="n">${n}.</span>
          <span style="flex:2">${text}</span>
          <select data-qid="q1_${n}" data-q1group="1">${q1OptionsHtml()}</select>
        </div>`;
    }
  });
  holder.innerHTML = html;

  holder.querySelectorAll("select[data-q1group]").forEach((sel) => {
    sel.addEventListener("change", checkQ1Duplicates);
  });
}

function checkQ1Duplicates() {
  const selects = Array.from(
    document.querySelectorAll("select[data-q1group]")
  );
  const counts = {};
  selects.forEach((s) => {
    if (s.value) counts[s.value] = (counts[s.value] || 0) + 1;
  });
  selects.forEach((s) => {
    s.classList.toggle("dup", s.value && counts[s.value] > 1);
  });
}

// ============================================================
// CANVAS DRAW TOOL (Q6, Q7, Q9)
// ============================================================
function buildCanvasTool(holderId, qid) {
  const holder = document.getElementById(holderId);
  holder.innerHTML = `
    <div class="canvas-tool">
      <canvas data-canvas-for="${qid}" width="800" height="360"></canvas>
      <div class="canvas-toolbar">
        <button type="button" data-tool="pen" class="active">Caneta</button>
        <button type="button" data-tool="eraser">Borracha</button>
        <button type="button" data-tool="clear">Limpar</button>
      </div>
    </div>
  `;

  const canvas = holder.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  let tool = "pen";
  let drawing = false;
  let last = null;

  function drawAxes() {
    ctx.save();
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, 320);
    ctx.lineTo(770, 320);
    ctx.stroke();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.fillText("Q", 775, 324);
    ctx.fillText("P", 30, 15);
    ctx.restore();
  }

  function resetCanvas() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawAxes();
  }
  resetCanvas();

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  function start(e) {
    e.preventDefault();
    drawing = true;
    last = pos(e);
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = pos(e);
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : "#1e293b";
    ctx.lineWidth = tool === "eraser" ? 18 : 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
  }
  function end() {
    if (!drawing) return;
    drawing = false;
    queueSave(qid, canvas.toDataURL("image/png"));
  }

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);

  holder.querySelectorAll("button[data-tool]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.tool === "clear") {
        resetCanvas();
        queueSave(qid, canvas.toDataURL("image/png"));
        return;
      }
      tool = btn.dataset.tool;
      holder.querySelectorAll("button[data-tool]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  canvas._restoreFromDataUrl = (dataUrl) => {
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => {
      resetCanvas();
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  };
}

// ============================================================
// WIRE TEXT/SELECT/NUMBER INPUTS
// ============================================================
function wireInputs() {
  document.querySelectorAll("[data-qid]").forEach((el) => {
    if (el.tagName === "CANVAS") return;
    const evt = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, () => {
      queueSave(el.dataset.qid, el.value);
    });
    el.addEventListener("paste", (e) => {
      logEvent("paste_attempt", `qid=${el.dataset.qid}`);
    });
  });
}

function applySavedAnswers(saved) {
  Object.entries(saved).forEach(([qid, value]) => {
    const el = document.querySelector(`[data-qid="${qid}"]`);
    if (!el) return;
    if (el.tagName === "CANVAS") return;
    el.value = value;
  });
  document.querySelectorAll("canvas[data-canvas-for]").forEach((canvas) => {
    const qid = canvas.dataset.canvasFor;
    if (saved[qid] && canvas._restoreFromDataUrl) {
      canvas._restoreFromDataUrl(saved[qid]);
    }
  });
  checkQ1Duplicates();
}

// ============================================================
// AUTOSAVE (debounced queue -> POST /api/answer)
// ============================================================
const saveDot = document.getElementById("save-dot");
const saveBadge = document.getElementById("save-badge");

function queueSave(qid, value) {
  if (SUBMITTED) return;
  SAVE_QUEUE.set(qid, value);
  saveDot.classList.add("pending");
  saveBadge.lastChild.textContent = "Salvando...";
  if (SAVE_TIMER) clearTimeout(SAVE_TIMER);
  SAVE_TIMER = setTimeout(flushSaveQueue, 700);
}

async function flushSaveQueue() {
  if (SAVE_QUEUE.size === 0 || !SESSION) return;
  const entries = Array.from(SAVE_QUEUE.entries());
  SAVE_QUEUE.clear();

  for (const [qid, value] of entries) {
    try {
      await fetch(`${API_BASE}/api/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: SESSION.session_id,
          matricula: SESSION.matricula,
          question_id: qid,
          value: value,
        }),
      });
    } catch (err) {
      // will retry on next change; queue silently
    }
  }
  saveDot.classList.remove("pending");
  saveBadge.lastChild.textContent = "Salvo";
}

// ============================================================
// FOCUS / TAB-SWITCH TRACKING
// ============================================================
const focusBadge = document.getElementById("focus-badge");

function updateFocusBadge() {
  focusBadge.textContent = `${FOCUS_LOSSES} troca${FOCUS_LOSSES === 1 ? "" : "s"} de aba`;
  focusBadge.classList.toggle("alert", FOCUS_LOSSES > 0);
}

async function logEvent(type, detail) {
  if (!SESSION) return;
  try {
    await fetch(`${API_BASE}/api/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: SESSION.session_id,
        matricula: SESSION.matricula,
        type,
        detail: detail || "",
        client_ts: Date.now() / 1000,
      }),
    });
  } catch (err) {
    // best-effort logging
  }
}

function startFocusTracking() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      FOCUS_LOSSES += 1;
      updateFocusBadge();
      logEvent("tab_hidden");
    } else {
      logEvent("tab_visible");
    }
  });

  window.addEventListener("blur", () => logEvent("window_blur"));
  window.addEventListener("focus", () => logEvent("window_focus"));

  window.addEventListener("beforeunload", (e) => {
    if (!SUBMITTED) {
      logEvent("page_unload_before_submit");
      e.preventDefault();
      e.returnValue = "";
    }
  });
}

// ============================================================
// SUBMIT
// ============================================================
async function onSubmitClick() {
  if (SUBMITTED) return;
  const ok = confirm(
    "Tem certeza que deseja enviar a avaliação? Depois de enviada, não será possível editar as respostas."
  );
  if (!ok) return;

  if (SAVE_TIMER) clearTimeout(SAVE_TIMER);
  await flushSaveQueue();

  const btn = document.getElementById("submit-btn");
  btn.disabled = true;
  btn.textContent = "Enviando...";

  try {
    const res = await fetch(`${API_BASE}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: SESSION.session_id,
        matricula: SESSION.matricula,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || "Erro ao enviar.");
    }
    SUBMITTED = true;
    lockForm();
    submittedBanner.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    alert(err.message || "Não foi possível enviar. Tente novamente.");
    btn.disabled = false;
    btn.textContent = "Enviar avaliação";
  }
}

function lockForm() {
  document.querySelectorAll("[data-qid], select, textarea, input").forEach((el) => {
    el.disabled = true;
  });
  document.querySelectorAll("canvas").forEach((c) => {
    c.style.pointerEvents = "none";
  });
  document.getElementById("submit-btn").classList.add("hidden");
}

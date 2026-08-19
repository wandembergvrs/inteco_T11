// ============================================================
// CONFIG
// ============================================================
const API_BASE = "https://inteco-t13.duckdns.org";
const HEARTBEAT_MS = 8000;

// ============================================================
// STATE
// ============================================================
let SESSION = null; // { session_id, matricula, nome, curso, tab_token }
let SUBMITTED = false;
let LOCKED_OUT = false;
let SAVE_QUEUE = new Map();
let SAVE_TIMER = null;
let FOCUS_LOSSES = 0;
let TAB_HIDDEN_PENDING = false;
let REMAINING_SECONDS = null;
let TIMER_INTERVAL = null;
let HEARTBEAT_INTERVAL = null;

function getTabToken() {
  let t = sessionStorage.getItem("inteco_tab_token");
  if (!t) {
    t = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()) + Date.now());
    sessionStorage.setItem("inteco_tab_token", t);
  }
  return t;
}

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
const lockoutOverlay = document.getElementById("lockout-overlay");

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
      body: JSON.stringify({ matricula, tab_token: getTabToken() }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error((data.detail && data.detail.message) || data.detail || "Erro ao entrar.");
    }
    SESSION = {
      session_id: data.session_id,
      matricula: matricula.replace(/\D/g, ""),
      nome: data.nome,
      curso: data.curso,
      tab_token: data.tab_token,
    };
    REMAINING_SECONDS = data.remaining_seconds;
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

  buildWordCloud();
  buildQ1();

  mountStaticChart("q2-chart-holder", chartQ2());
  mountStaticChart("q4a-chart-holder", chartQ4a());
  mountStaticChart("q4c-chart-holder", chartQ4c());
  mountStaticChart("q5-chart-holder", chartQ5());
  mountStaticChart("q8-chart-holder", chartQ8(), { h: 320 });

  buildCanvasTool("q6-canvas-holder", "q6_canvas", chartQ6());
  buildCanvasTool("q7-canvas-holder", "q7_canvas", null);
  buildCanvasTool("q9-canvas-holder", "q9_canvas", chartQ9());

  wireInputs();
  applySavedAnswers(savedAnswers);
  startFocusTracking();
  startTimer();
  startHeartbeat();

  document.getElementById("submit-btn").addEventListener("click", () => onSubmitClick(true));
}

// ============================================================
// WORD CLOUD (Q1 decorative + word bank)
// ============================================================
const Q1_CLOUD_WORDS = [
  { w: "trade-offs", size: 1.75, color: "warn", top: "10%", left: "6%", rot: -3 },
  { w: "abre mão", size: 1.15, color: "acc", top: "62%", left: "20%", rot: 2 },
  { w: "margem", size: 1.3, color: "good", top: "8%", left: "26%", rot: -1 },
  { w: "incentivos", size: 1.4, color: "acc", top: "40%", left: "44%", rot: 3 },
  { w: "comércio", size: 1.25, color: "bad", top: "8%", left: "44%", rot: -2 },
  { w: "mercados", size: 1.15, color: "muted", top: "64%", left: "58%", rot: 1 },
  { w: "governo", size: 1.15, color: "good", top: "10%", left: "68%", rot: -2 },
  { w: "produtividade", size: 1.25, color: "warn", top: "58%", left: "76%", rot: 2 },
  { w: "moeda", size: 1.1, color: "bad", top: "12%", left: "84%", rot: -3 },
  { w: "inflação", size: 1.15, color: "acc", top: "70%", left: "88%", rot: 1 },
  { w: "desemprego", size: 1.05, color: "muted", top: "40%", left: "2%", rot: 2 },
];

function buildWordCloud() {
  const holder = document.getElementById("q1-wordcloud");
  holder.innerHTML = Q1_CLOUD_WORDS.map(
    (item) => `<span style="font-size:${item.size}rem;color:var(--${item.color});top:${item.top};left:${item.left};transform:rotate(${item.rot}deg)">${item.w}</span>`
  ).join("");
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
  const selects = Array.from(document.querySelectorAll("select[data-q1group]"));
  const counts = {};
  selects.forEach((s) => {
    if (s.value) counts[s.value] = (counts[s.value] || 0) + 1;
  });
  selects.forEach((s) => {
    s.classList.toggle("dup", s.value && counts[s.value] > 1);
  });
}

// ============================================================
// CANVAS DRAW TOOL (Q6, Q7, Q9) - optional reference chart background
// ============================================================
function buildCanvasTool(holderId, qid, backgroundCfg) {
  const holder = document.getElementById(holderId);
  holder.innerHTML = `
    <div class="canvas-tool">
      <canvas data-canvas-for="${qid}" width="800" height="360"></canvas>
      <div class="canvas-toolbar">
        <button type="button" data-tool="pen" class="active">Caneta</button>
        <button type="button" data-tool="eraser">Borracha</button>
        <button type="button" data-tool="clear">Limpar desenho</button>
      </div>
    </div>
  `;

  const canvas = holder.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  let tool = "pen";
  let drawing = false;
  let last = null;

  function resetCanvas() {
    if (backgroundCfg) {
      renderChart(ctx, backgroundCfg, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    }
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

  canvas._resetCanvas = resetCanvas;
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
    el.addEventListener("paste", () => {
      logEvent("paste_attempt", `qid=${el.dataset.qid}`);
    });
  });
}

function applySavedAnswers(saved) {
  Object.entries(saved).forEach(([qid, value]) => {
    const el = document.querySelector(`[data-qid="${qid}"]`);
    if (!el || el.tagName === "CANVAS") return;
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

function clearAllInputsLocally() {
  document.querySelectorAll("[data-qid]").forEach((el) => {
    if (el.tagName === "CANVAS") return;
    el.value = "";
  });
  document.querySelectorAll("canvas[data-canvas-for]").forEach((canvas) => {
    if (canvas._resetCanvas) canvas._resetCanvas();
  });
  checkQ1Duplicates();
}

// ============================================================
// AUTOSAVE (debounced queue -> POST /api/answer)
// ============================================================
const saveDot = document.getElementById("save-dot");
const saveBadge = document.getElementById("save-badge");

function queueSave(qid, value) {
  if (SUBMITTED || LOCKED_OUT) return;
  SAVE_QUEUE.set(qid, value);
  saveDot.classList.add("pending");
  saveBadge.lastChild.textContent = "Salvando...";
  if (SAVE_TIMER) clearTimeout(SAVE_TIMER);
  SAVE_TIMER = setTimeout(flushSaveQueue, 700);
}

async function flushSaveQueue() {
  if (SAVE_QUEUE.size === 0 || !SESSION || LOCKED_OUT) return;
  const entries = Array.from(SAVE_QUEUE.entries());
  SAVE_QUEUE.clear();

  for (const [qid, value] of entries) {
    try {
      const res = await fetch(`${API_BASE}/api/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: SESSION.session_id,
          matricula: SESSION.matricula,
          tab_token: SESSION.tab_token,
          question_id: qid,
          value: value,
        }),
      });
      if (res.status === 409) {
        const data = await res.json();
        handleSessionConflict(data);
        return;
      }
    } catch (err) {
      // best-effort; will retry on next change
    }
  }
  saveDot.classList.remove("pending");
  saveBadge.lastChild.textContent = "Salvo";
}

// ============================================================
// TIMER (1h50 = 110 min), server-authoritative via heartbeat
// ============================================================
const timerBadge = document.getElementById("timer-badge");

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function renderTimer() {
  timerBadge.textContent = formatTime(REMAINING_SECONDS);
  timerBadge.classList.toggle("warn", REMAINING_SECONDS <= 600 && REMAINING_SECONDS > 120);
  timerBadge.classList.toggle("danger", REMAINING_SECONDS <= 120);
}

function startTimer() {
  renderTimer();
  TIMER_INTERVAL = setInterval(() => {
    if (SUBMITTED || LOCKED_OUT) return;
    REMAINING_SECONDS = Math.max(0, REMAINING_SECONDS - 1);
    renderTimer();
    if (REMAINING_SECONDS <= 0) {
      onSubmitClick(false, "Tempo esgotado (1h50min). Sua avaliação foi enviada automaticamente.");
    }
  }, 1000);
}

// ============================================================
// HEARTBEAT (keeps single-active-tab enforcement + resyncs timer)
// ============================================================
function startHeartbeat() {
  HEARTBEAT_INTERVAL = setInterval(async () => {
    if (SUBMITTED || LOCKED_OUT || !SESSION) return;
    try {
      const res = await fetch(`${API_BASE}/api/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: SESSION.session_id,
          matricula: SESSION.matricula,
          tab_token: SESSION.tab_token,
        }),
      });
      if (res.status === 409) {
        const data = await res.json();
        handleSessionConflict(data);
        return;
      }
      const data = await res.json();
      if (typeof data.remaining_seconds === "number") {
        REMAINING_SECONDS = data.remaining_seconds;
        renderTimer();
      }
    } catch (err) {
      // network hiccup - ignore, will retry next tick
    }
  }, HEARTBEAT_MS);
}

function handleSessionConflict(data) {
  const code = data && data.detail && data.detail.code;
  const message = (data && data.detail && data.detail.message) || "Sessão encerrada.";
  if (code === "superseded") {
    lockOut(
      "Sessão encerrada",
      "Esta avaliação foi aberta em outra aba, janela ou dispositivo. Esta aba foi desconectada e não pode mais editar respostas."
    );
  } else {
    // expired or already submitted
    SUBMITTED = true;
    lockForm();
    submittedBanner.classList.remove("hidden");
    submittedBanner.textContent = message;
  }
}

function lockOut(title, msg) {
  LOCKED_OUT = true;
  clearInterval(TIMER_INTERVAL);
  clearInterval(HEARTBEAT_INTERVAL);
  document.getElementById("lockout-title").textContent = title;
  document.getElementById("lockout-msg").textContent = msg;
  lockoutOverlay.classList.remove("hidden");
  lockForm();
}

// ============================================================
// FOCUS / TAB-SWITCH TRACKING -> alert + reset answers
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

async function resetAnswersAfterViolation() {
  if (SUBMITTED || LOCKED_OUT || !SESSION) return;
  clearAllInputsLocally();
  SAVE_QUEUE.clear();
  try {
    const res = await fetch(`${API_BASE}/api/reset_answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: SESSION.session_id,
        matricula: SESSION.matricula,
        tab_token: SESSION.tab_token,
      }),
    });
    if (res.status === 409) {
      const data = await res.json();
      handleSessionConflict(data);
    }
  } catch (err) {
    // best-effort
  }
}

function startFocusTracking() {
  document.addEventListener("visibilitychange", () => {
    if (SUBMITTED || LOCKED_OUT) return;
    if (document.hidden) {
      FOCUS_LOSSES += 1;
      updateFocusBadge();
      TAB_HIDDEN_PENDING = true;
      logEvent("tab_hidden");
    } else if (TAB_HIDDEN_PENDING) {
      TAB_HIDDEN_PENDING = false;
      logEvent("tab_visible_reset");
      alert(
        "Você trocou de aba/janela durante a avaliação. Por segurança, todas as respostas preenchidas foram apagadas e você precisa preenchê-las novamente. O tempo continua correndo."
      );
      resetAnswersAfterViolation();
    }
  });

  window.addEventListener("blur", () => {
    if (!SUBMITTED && !LOCKED_OUT) logEvent("window_blur");
  });
  window.addEventListener("focus", () => {
    if (!SUBMITTED && !LOCKED_OUT) logEvent("window_focus");
  });

  window.addEventListener("beforeunload", (e) => {
    if (!SUBMITTED && !LOCKED_OUT && SESSION) {
      logEvent("page_unload_before_submit");
      e.preventDefault();
      e.returnValue = "";
    }
  });
}

// ============================================================
// SUBMIT
// ============================================================
async function onSubmitClick(needsConfirm, autoMessage) {
  if (SUBMITTED || LOCKED_OUT) return;

  if (needsConfirm) {
    const ok = confirm(
      "Tem certeza que deseja enviar a avaliação? Depois de enviada, não será possível editar as respostas."
    );
    if (!ok) return;
  }

  if (SAVE_TIMER) clearTimeout(SAVE_TIMER);
  await flushSaveQueue();
  if (SUBMITTED || LOCKED_OUT) return;

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
        tab_token: SESSION.tab_token,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      const code = data.detail && data.detail.code;
      if (code === "superseded") {
        handleSessionConflict(data);
        return;
      }
      // expired/already_submitted -> treat as success (already locked server-side)
    }
    SUBMITTED = true;
    clearInterval(TIMER_INTERVAL);
    clearInterval(HEARTBEAT_INTERVAL);
    lockForm();
    submittedBanner.classList.remove("hidden");
    submittedBanner.textContent = autoMessage || "Avaliação enviada com sucesso. Você já pode fechar esta página.";
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    alert("Não foi possível enviar. Verifique sua conexão e tente novamente.");
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

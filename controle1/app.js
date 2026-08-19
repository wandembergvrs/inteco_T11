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

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

// Runs one init step in isolation: a failure here (e.g. a stale cached
// asset mismatched with a fresh one) must not take the rest of the exam down.
function safe(label, fn) {
  try {
    fn();
  } catch (e) {
    console.error(`[inteco] falha em "${label}":`, e);
    logEvent("init_error", `${label}: ${e && e.message}`);
  }
}
async function safeAsync(label, fn) {
  try {
    return await fn();
  } catch (e) {
    console.error(`[inteco] falha em "${label}":`, e);
    logEvent("init_error", `${label}: ${e && e.message}`);
    return null;
  }
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
    await startExam(data.answers || {});
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
async function startExam(savedAnswers) {
  loginScreen.classList.add("hidden");
  appHeader.classList.remove("hidden");
  examWrap.classList.remove("hidden");

  document.getElementById("who-nome").textContent = SESSION.nome;
  document.getElementById("who-curso").textContent =
    `${SESSION.curso || ""} · matrícula ${SESSION.matricula}`;

  const questions = (await safeAsync("loadQuestions", async () => {
    const res = await fetch(`${API_BASE}/api/questions`);
    const data = await res.json();
    return data.questions || [];
  })) || [];

  safe("renderQuestions", () => renderQuestions(questions));
  safe("wireInputs", wireInputs);
  safe("applySavedAnswers", () => applySavedAnswers(savedAnswers));
  safe("startFocusTracking", startFocusTracking);
  safe("startTimer", startTimer);
  safe("startHeartbeat", startHeartbeat);

  document.getElementById("submit-btn").addEventListener("click", () => onSubmitClick(true));
}

// ============================================================
// DYNAMIC QUESTION RENDERING (data-driven from /api/questions)
// ============================================================
function chartHolderId(qkey, part) { return `chart-${qkey}-${part.id}`; }
function canvasHolderId(qkey, part) { return `canvas-${qkey}-${part.id}`; }

function partPointsBadge(part) {
  if (part.points == null) return "";
  return ` <span class="pts">(${part.points} ${part.points === 1 ? "ponto" : "pontos"})</span>`;
}

function wordOptionsHtml(words) {
  return `<option value="">Selecione...</option>` +
    words.map((w) => `<option value="${escapeHtml(w)}">${escapeHtml(w)}</option>`).join("");
}

function renderFillBlanks(qkey, part) {
  const cfg = part.config || {};
  const words = cfg.word_bank || [];
  let html = "";
  if (cfg.show_wordcloud) {
    html += `<div class="wordcloud" data-wordcloud-words='${escapeHtml(JSON.stringify(words))}'></div>`;
  } else if (words.length) {
    html += `<div class="wordbank">${words.map((w) => `<span>${escapeHtml(w)}</span>`).join("")}</div>`;
  }
  html += `<div>`;
  (cfg.items || []).forEach((text, itemIdx) => {
    const blankCount = (text.match(/___/g) || []).length || 1;
    let selectsHtml = "";
    for (let b = 0; b < blankCount; b++) {
      const qid = `${qkey}_${part.id}_i${itemIdx}_b${b}`;
      selectsHtml += `<select data-qid="${qid}" data-fillgroup="${qkey}_${part.id}">${wordOptionsHtml(words)}</select>`;
    }
    html += `<div class="blank-row"><span class="n">${itemIdx + 1}.</span><span style="flex:2">${escapeHtml(text)}</span>${selectsHtml}</div>`;
  });
  html += `</div>`;
  return html;
}

function renderEssay(qkey, part) {
  const qid = `${qkey}_${part.id}`;
  const cfg = part.config || {};
  const label = part.label
    ? `<label class="part-label">${escapeHtml(part.label)}${partPointsBadge(part)}</label>`
    : "";
  return `<div class="q-part">${label}<textarea data-qid="${qid}" rows="${cfg.rows || 3}" placeholder="${escapeHtml(cfg.placeholder || "")}"></textarea></div>`;
}

function renderNumberGroup(qkey, part) {
  const label = part.label
    ? `<label class="part-label">${escapeHtml(part.label)}${partPointsBadge(part)}</label>`
    : "";
  const fields = (part.config && part.config.fields) || [];
  const cols = fields.length <= 2 ? "grid-2" : "grid-3";
  const inputs = fields.map((f) => {
    const qid = `${qkey}_${part.id}_${f.key}`;
    return `<div><label style="font-size:0.8rem;color:var(--muted)">${escapeHtml(f.label)}</label><input type="number" data-qid="${qid}"></div>`;
  }).join("");
  return `<div class="q-part">${label}<div class="${cols}">${inputs}</div></div>`;
}

function renderSelect(qkey, part) {
  const qid = `${qkey}_${part.id}`;
  const options = (part.config && part.config.options) || [];
  const label = part.label ? `<span style="flex:2">${escapeHtml(part.label)}</span>` : "<span></span>";
  const pts = part.points != null
    ? `<div style="text-align:right;margin-top:2px"><span class="pts">(${part.points} ${part.points === 1 ? "ponto" : "pontos"})</span></div>` : "";
  return `<div class="q-part"><div class="blank-row">${label}<select data-qid="${qid}" style="flex:1"><option value="">Selecione...</option>${options.map((o) => `<option>${escapeHtml(o)}</option>`).join("")}</select></div>${pts}</div>`;
}

function renderMatrixSelect(qkey, part) {
  const label = part.label
    ? `<label class="part-label">${escapeHtml(part.label)}${partPointsBadge(part)}</label>`
    : "";
  const cfg = part.config || {};
  const rows = cfg.rows || [];
  const options = cfg.options || [];
  const optHtml = `<option value="">Selecione...</option>` + options.map((o) => `<option>${escapeHtml(o)}</option>`).join("");
  const rowsHtml = rows.map((r, i) => {
    const qid = `${qkey}_${part.id}_r${i}`;
    return `<tr><td>${escapeHtml(r)}</td><td><select data-qid="${qid}">${optHtml}</select></td></tr>`;
  }).join("");
  return `<div class="q-part">${label}<table class="matrix-table"><thead><tr><th>Bem</th><th>Classificação</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>`;
}

function renderNote(part) {
  const text = escapeHtml((part.config && part.config.text) || "").replace(/\n/g, "<br>");
  return `<div class="note-box">${text}</div>`;
}

function renderQuestions(questions) {
  let html = "";
  questions.forEach((q) => {
    html += `<div class="q-card"><h2>${escapeHtml(q.title)} <span class="pts">(${q.points} pontos)</span></h2>`;
    if (q.intro) html += `<div class="intro">${escapeHtml(q.intro)}</div>`;
    (q.parts || []).forEach((part) => {
      if (part.type === "chart") {
        html += `<div id="${chartHolderId(q.qkey, part)}"></div>`;
      } else if (part.type === "canvas_draw") {
        html += `<div class="q-part" id="${canvasHolderId(q.qkey, part)}"></div>`;
      } else if (part.type === "fill_blanks") {
        html += renderFillBlanks(q.qkey, part);
      } else if (part.type === "essay") {
        html += renderEssay(q.qkey, part);
      } else if (part.type === "number_group") {
        html += renderNumberGroup(q.qkey, part);
      } else if (part.type === "select") {
        html += renderSelect(q.qkey, part);
      } else if (part.type === "matrix_select") {
        html += renderMatrixSelect(q.qkey, part);
      } else if (part.type === "note") {
        html += renderNote(part);
      }
    });
    html += `</div>`;
  });
  html += `<footer class="note">Todas as respostas são salvas automaticamente. Ao terminar, clique em "Enviar avaliação" no topo da página.</footer>`;
  examWrap.innerHTML = html;

  questions.forEach((q) => {
    (q.parts || []).forEach((part) => {
      if (part.type === "chart") {
        safe(`chart:${q.qkey}.${part.id}`, () => mountStaticChart(chartHolderId(q.qkey, part), part.config));
      } else if (part.type === "canvas_draw") {
        safe(`canvas:${q.qkey}.${part.id}`, () =>
          buildCanvasTool(canvasHolderId(q.qkey, part), `${q.qkey}_${part.id}`, (part.config && part.config.background_chart) || null)
        );
      }
    });
  });

  document.querySelectorAll(".wordcloud[data-wordcloud-words]").forEach((el) => {
    safe("wordcloud", () => {
      const words = JSON.parse(el.dataset.wordcloudWords);
      buildWordCloudGeneric(el, words);
    });
  });

  wireFillBlankDuplicateChecks();
}

// ============================================================
// WORD CLOUD (generic, deterministic pseudo-random layout)
// ============================================================
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function buildWordCloudGeneric(container, words) {
  const palette = ["acc", "good", "bad", "warn", "muted"];
  container.innerHTML = words.map((w, i) => {
    const seed = hashStr(w + "|" + i);
    const size = (1.0 + (seed % 100) / 130).toFixed(2);
    const top = 8 + (seed % 68);
    const left = 2 + ((seed >> 3) % 86);
    const rot = -4 + (seed % 9);
    const color = palette[seed % palette.length];
    return `<span style="font-size:${size}rem;color:var(--${color});top:${top}%;left:${left}%;transform:rotate(${rot}deg)">${escapeHtml(w)}</span>`;
  }).join("");
}

function refreshFillBlankDuplicates() {
  const groups = {};
  document.querySelectorAll("select[data-fillgroup]").forEach((sel) => {
    const g = sel.dataset.fillgroup;
    (groups[g] = groups[g] || []).push(sel);
  });
  Object.values(groups).forEach((selects) => {
    const counts = {};
    selects.forEach((s) => { if (s.value) counts[s.value] = (counts[s.value] || 0) + 1; });
    selects.forEach((s) => s.classList.toggle("dup", s.value && counts[s.value] > 1));
  });
}

function wireFillBlankDuplicateChecks() {
  document.querySelectorAll("select[data-fillgroup]").forEach((sel) => {
    sel.addEventListener("change", refreshFillBlankDuplicates);
  });
}

// ============================================================
// CANVAS DRAW TOOL - optional reference chart background
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

  function start(e) { e.preventDefault(); drawing = true; last = pos(e); }
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
    img.onload = () => { resetCanvas(); ctx.drawImage(img, 0, 0); };
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
    el.addEventListener(evt, () => queueSave(el.dataset.qid, el.value));
    el.addEventListener("paste", () => logEvent("paste_attempt", `qid=${el.dataset.qid}`));
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
    if (saved[qid] && canvas._restoreFromDataUrl) canvas._restoreFromDataUrl(saved[qid]);
  });
  refreshFillBlankDuplicates();
}

function clearAllInputsLocally() {
  document.querySelectorAll("[data-qid]").forEach((el) => {
    if (el.tagName === "CANVAS") return;
    el.value = "";
  });
  document.querySelectorAll("canvas[data-canvas-for]").forEach((canvas) => {
    if (canvas._resetCanvas) canvas._resetCanvas();
  });
  refreshFillBlankDuplicates();
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
// TIMER (server-authoritative via heartbeat)
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
// FOCUS / TAB-SWITCH TRACKING -> in-page modal + reset answers
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

// A "violation" is any loss of OS-level focus or tab visibility: switching
// tabs, alt-tabbing to another app, or clicking into a window on a second
// monitor all count. visibilitychange and blur/focus often fire together for
// the same episode, so TAB_HIDDEN_PENDING dedupes them into a single
// notice+reset per episode instead of double-firing.
//
// We deliberately do NOT use window.alert()/confirm() here: native dialogs
// themselves trigger window blur (when they open) and focus (when
// dismissed), which used to re-enter this same handler and open another
// dialog forever. VIOLATION_MODAL_OPEN suppresses focus tracking while our
// own in-page modal is up, and the modal itself is a plain DOM element so
// interacting with it never fires window blur/focus in the first place.
let VIOLATION_MODAL_OPEN = false;
const violationOverlay = document.getElementById("violation-overlay");

function markFocusLost(eventType) {
  if (SUBMITTED || LOCKED_OUT || VIOLATION_MODAL_OPEN) return;
  if (!TAB_HIDDEN_PENDING) {
    FOCUS_LOSSES += 1;
    updateFocusBadge();
    logEvent(eventType);
  }
  TAB_HIDDEN_PENDING = true;
}

function markFocusRegained(eventType) {
  if (SUBMITTED || LOCKED_OUT || VIOLATION_MODAL_OPEN) return;
  if (!TAB_HIDDEN_PENDING) return;
  TAB_HIDDEN_PENDING = false;
  logEvent(eventType);
  showViolationModal();
}

function showViolationModal() {
  VIOLATION_MODAL_OPEN = true;
  violationOverlay.classList.remove("hidden");
}

function startFocusTracking() {
  document.getElementById("violation-ack-btn").addEventListener("click", () => {
    violationOverlay.classList.add("hidden");
    resetAnswersAfterViolation();
    setTimeout(() => { VIOLATION_MODAL_OPEN = false; }, 300);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) markFocusLost("tab_hidden");
    else markFocusRegained("tab_visible_reset");
  });

  window.addEventListener("blur", () => markFocusLost("window_blur"));
  window.addEventListener("focus", () => markFocusRegained("window_focus_reset"));

  window.addEventListener("beforeunload", (e) => {
    if (!SUBMITTED && !LOCKED_OUT && SESSION) {
      logEvent("page_unload_before_submit");
      e.preventDefault();
      e.returnValue = "";
    }
  });

  startScreenshotDeterrents();
}

// ============================================================
// SCREENSHOT / DEVTOOLS DETERRENTS
//
// IMPORTANT LIMITATION: a webpage cannot actually block the OS-level
// Print Screen capture (Windows/macOS/Linux all intercept it before the
// browser sees it in most configurations) or any external camera/phone
// photo of the screen. What follows is best-effort logging for the cases
// the browser *can* see, plus friction (disabling right-click, text
// selection, and common devtools shortcuts) - a deterrent, not a real block.
// ============================================================
function startScreenshotDeterrents() {
  document.addEventListener("keyup", (e) => {
    if (e.key === "PrintScreen") logEvent("printscreen_key");
  });
  document.addEventListener("keydown", (e) => {
    const k = e.key;
    const blocked =
      k === "PrintScreen" ||
      (e.ctrlKey && e.shiftKey && (k === "I" || k === "J" || k === "C")) ||
      (e.metaKey && e.shiftKey && (k === "3" || k === "4" || k === "5")) ||
      k === "F12";
    if (blocked) {
      logEvent("blocked_shortcut", k);
      e.preventDefault();
    }
  });
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.body.style.userSelect = "none";
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
  document.querySelectorAll("canvas").forEach((c) => { c.style.pointerEvents = "none"; });
  document.getElementById("submit-btn").classList.add("hidden");
}

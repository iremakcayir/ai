// Tam saat ve yarım saat öğretimi uygulaması
(() => {
  const STORAGE_KEY = "clockTeachingData_v1";
  const allStimuli = createStimuli();

  const state = {
    students: [],
    selectedStudentId: null,
    currentSession: null,
    trialIndex: 0,
    trialsQueue: [],
    selectedHour: null,
    selectedMinute: null,
    instructionAt: null,
    timers: [],
    waitingNext: false,
    voices: [],
  };

  const els = {
    studentSelect: document.getElementById("studentSelect"),
    addStudentBtn: document.getElementById("addStudentBtn"),
    deleteStudentDataBtn: document.getElementById("deleteStudentDataBtn"),
    sessionSelect: document.getElementById("sessionSelect"),
    startBtn: document.getElementById("startBtn"),
    stopBtn: document.getElementById("stopBtn"),
    resetSessionBtn: document.getElementById("resetSessionBtn"),
    trialCounter: document.getElementById("trialCounter"),
    sessionStatus: document.getElementById("sessionStatus"),
    instructionText: document.getElementById("instructionText"),
    digitalAnswer: document.getElementById("digitalAnswer"),
    feedbackText: document.getElementById("feedbackText"),
    summaryCard: document.getElementById("summaryCard"),
    responsePanel: document.getElementById("responsePanel"),
    hourButtons: document.getElementById("hourButtons"),
    selectedResponse: document.getElementById("selectedResponse"),
    submitBtn: document.getElementById("submitBtn"),
    nextBtn: document.getElementById("nextBtn"),
    filterSession: document.getElementById("filterSession"),
    exportSelectedCsv: document.getElementById("exportSelectedCsv"),
    exportAllCsv: document.getElementById("exportAllCsv"),
    metricsBox: document.getElementById("metricsBox"),
    trialsTableBody: document.querySelector("#trialsTable tbody"),
    countdownBarWrapper: document.getElementById("countdownBarWrapper"),
    countdownBar: document.getElementById("countdownBar"),
  };

  function init() {
    loadData();
    initVoices();
    createHourButtons();
    bindEvents();
    drawClock({ hour: 12, minute: 0 });
    refreshStudentSelect();
    refreshTableAndMetrics();
  }

  function createStimuli() {
    const list = [];
    for (let h = 1; h <= 12; h += 1) {
      list.push({ hour: h, minute: 0, label: `${h}:00`, type: "tam" });
      list.push({ hour: h, minute: 30, label: `${h}:30`, type: "yarım" });
    }
    return list;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    state.students = raw ? JSON.parse(raw).students || [] : [];
    if (state.students.length === 0) {
      const first = { id: crypto.randomUUID(), name: "Öğrenci-1", createdAt: Date.now(), trials: [] };
      state.students.push(first);
      saveData();
    }
    state.selectedStudentId = state.students[0].id;
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ students: state.students }));
  }

  function getSelectedStudent() {
    return state.students.find((s) => s.id === state.selectedStudentId);
  }

  function refreshStudentSelect() {
    els.studentSelect.innerHTML = "";
    state.students.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.name;
      els.studentSelect.appendChild(opt);
    });
    els.studentSelect.value = state.selectedStudentId;
  }

  function bindEvents() {
    els.addStudentBtn.addEventListener("click", addStudent);
    els.studentSelect.addEventListener("change", () => {
      state.selectedStudentId = els.studentSelect.value;
      refreshTableAndMetrics();
    });
    els.deleteStudentDataBtn.addEventListener("click", deleteSelectedStudentData);
    els.startBtn.addEventListener("click", startSession);
    els.stopBtn.addEventListener("click", stopSession);
    els.resetSessionBtn.addEventListener("click", resetSession);
    els.submitBtn.addEventListener("click", submitResponse);
    els.nextBtn.addEventListener("click", goNextTrial);
    els.filterSession.addEventListener("change", refreshTableAndMetrics);
    els.exportSelectedCsv.addEventListener("click", () => exportCsv(false));
    els.exportAllCsv.addEventListener("click", () => exportCsv(true));
    document.querySelectorAll(".minute-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedMinute = btn.dataset.minute;
        document.querySelectorAll(".minute-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        updateSelectedResponseText();
      });
    });
  }

  function addStudent() {
    const name = prompt("Öğrenci adı-soyadı veya kodu girin:");
    if (!name || !name.trim()) return;
    const s = { id: crypto.randomUUID(), name: name.trim(), createdAt: Date.now(), trials: [] };
    state.students.push(s);
    state.selectedStudentId = s.id;
    saveData();
    refreshStudentSelect();
    refreshTableAndMetrics();
  }

  function deleteSelectedStudentData() {
    const student = getSelectedStudent();
    if (!student) return;
    const ok = confirm(`${student.name} için tüm deneme verileri silinsin mi?`);
    if (!ok) return;
    student.trials = [];
    saveData();
    refreshTableAndMetrics();
    alert("Seçili öğrencinin verileri silindi.");
  }

  function createHourButtons() {
    for (let h = 1; h <= 12; h += 1) {
      const btn = document.createElement("button");
      btn.textContent = `${h}`;
      btn.addEventListener("click", () => {
        state.selectedHour = h;
        [...els.hourButtons.children].forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        updateSelectedResponseText();
      });
      els.hourButtons.appendChild(btn);
    }
  }

  function updateSelectedResponseText() {
    if (!state.selectedHour || !state.selectedMinute) {
      els.selectedResponse.textContent = "-";
      return;
    }
    els.selectedResponse.textContent = `${state.selectedHour}:${state.selectedMinute}`;
  }

  function startSession() {
    if (!getSelectedStudent()) {
      alert("Önce öğrenci seçin.");
      return;
    }
    clearTimers();
    const sessionId = Number(els.sessionSelect.value);
    state.currentSession = sessionId;
    state.sessionRunId = crypto.randomUUID();
    state.trialIndex = 0;
    state.summaryCard.classList.add("hidden");
    state.feedbackText.textContent = "";
    state.digitalAnswer.classList.add("hidden");

    state.trialsQueue = buildSessionQueue(sessionId);
    updateControlsForRunning(true);
    runCurrentTrial();
  }

  function stopSession() {
    clearTimers();
    state.currentSession = null;
    state.sessionRunId = null;
    state.trialsQueue = [];
    state.trialIndex = 0;
    els.instructionText.textContent = "Oturum durduruldu.";
    els.sessionStatus.textContent = "Durum: Durduruldu";
    els.trialCounter.textContent = "Deneme: -";
    els.digitalAnswer.classList.add("hidden");
    els.feedbackText.textContent = "";
    updateControlsForRunning(false);
  }

  function resetSession() {
    if (!state.currentSession) return;
    const ok = confirm("Aktif oturum sıfırlansın mı? Deneme sırası yeniden oluşturulacak.");
    if (!ok) return;
    startSession();
  }

  function updateControlsForRunning(isRunning) {
    els.startBtn.disabled = isRunning;
    els.stopBtn.disabled = !isRunning;
    els.resetSessionBtn.disabled = !isRunning;
    els.sessionSelect.disabled = isRunning;
  }

  function buildSessionQueue(sessionId) {
    if (sessionId === 1) {
      const full = shuffle(allStimuli.filter((s) => s.minute === 0)).slice(0, 3);
      const half = shuffle(allStimuli.filter((s) => s.minute === 30)).slice(0, 3);
      return shuffle([...full, ...half]);
    }
    return shuffle(allStimuli);
  }

  function runCurrentTrial() {
    clearTimers();
    clearResponseSelection();
    els.nextBtn.disabled = true;
    state.waitingNext = false;
    if (!state.currentSession) return;

    const total = state.trialsQueue.length;
    if (state.trialIndex >= total) {
      endSession();
      return;
    }

    const target = state.trialsQueue[state.trialIndex];
    drawClock(target);
    els.trialCounter.textContent = `Deneme: ${state.trialIndex + 1}/${total}`;
    els.sessionStatus.textContent = `Durum: Oturum ${state.currentSession} çalışıyor`;
    els.feedbackText.className = "feedback";
    els.feedbackText.textContent = "";
    els.digitalAnswer.classList.add("hidden");

    if (state.currentSession === 2) {
      handleSession2(target);
    } else if (state.currentSession === 3) {
      handleSession3(target);
    } else {
      handleSession1Or4(target);
    }
  }

  function handleSession1Or4(target) {
    const text = "Saat kaç?";
    els.instructionText.textContent = text;
    speak(text);
    state.instructionAt = performance.now();
    setResponseEnabled(true);
  }

  function handleSession2(target) {
    const text = `Saat kaç? Bu saat ${target.label}.`;
    els.instructionText.textContent = text;
    els.digitalAnswer.textContent = target.label;
    els.digitalAnswer.classList.remove("hidden");
    speak(text);
    setResponseEnabled(false);
    const enableNextTimer = setTimeout(() => {
      els.nextBtn.disabled = false;
      state.waitingNext = true;
    }, 1200);
    state.timers.push(enableNextTimer);

    recordTrial({
      session: 2,
      trialNo: state.trialIndex + 1,
      target: target.label,
      stimulusType: target.type,
      presentationType: "modeling",
      instructionTime: Date.now(),
      studentResponse: "NA",
      isCorrect: "NA",
      latencyMs: "NA",
      feedback: `Model: ${target.label}`,
      notes: "0 sn bekleme",
    });
  }

  function handleSession3(target) {
    setResponseEnabled(false);
    els.instructionText.textContent = "Saati inceleyin...";
    startCountdown(4000);
    const timer = setTimeout(() => {
      stopCountdown();
      const text = "Saat kaç?";
      els.instructionText.textContent = text;
      speak(text);
      state.instructionAt = performance.now();
      setResponseEnabled(true);
    }, 4000);
    state.timers.push(timer);
  }

  function setResponseEnabled(enabled) {
    els.submitBtn.disabled = !enabled;
    const disableAll = !enabled;
    [...els.hourButtons.children].forEach((btn) => {
      btn.disabled = disableAll;
    });
    document.querySelectorAll(".minute-btn").forEach((btn) => {
      btn.disabled = disableAll;
    });
  }

  function clearResponseSelection() {
    state.selectedHour = null;
    state.selectedMinute = null;
    updateSelectedResponseText();
    [...els.hourButtons.children].forEach((b) => b.classList.remove("selected"));
    document.querySelectorAll(".minute-btn").forEach((b) => b.classList.remove("selected"));
  }

  function submitResponse() {
    if (!state.currentSession || state.currentSession === 2) return;
    if (!state.selectedHour || !state.selectedMinute) {
      alert("Lütfen saat ve dakika seçimi yapın.");
      return;
    }

    const target = state.trialsQueue[state.trialIndex];
    const response = `${state.selectedHour}:${state.selectedMinute}`;
    const isCorrect = response === target.label;
    const latency = Math.max(0, Math.round(performance.now() - (state.instructionAt || performance.now())));

    if (state.currentSession === 3) {
      if (isCorrect) {
        const fb = "Aferin, doğru!";
        els.feedbackText.textContent = fb;
        els.feedbackText.className = "feedback success";
        speak(fb);
      } else {
        const fb = `Bu sefer olmadı, doğru cevap ${target.label}.`;
        els.feedbackText.textContent = fb;
        els.feedbackText.className = "feedback error";
        els.digitalAnswer.textContent = target.label;
        els.digitalAnswer.classList.remove("hidden");
        speak(fb);
      }
      setResponseEnabled(false);
      const timer = setTimeout(() => {
        els.nextBtn.disabled = false;
        state.waitingNext = true;
      }, 1500);
      state.timers.push(timer);
    } else {
      els.feedbackText.textContent = "";
      els.nextBtn.disabled = false;
      state.waitingNext = true;
      setResponseEnabled(false);
    }

    recordTrial({
      session: state.currentSession,
      trialNo: state.trialIndex + 1,
      target: target.label,
      stimulusType: target.type,
      presentationType: state.currentSession === 3 ? "delayed_prompt" : "assessment",
      instructionTime: Date.now(),
      studentResponse: response,
      isCorrect,
      latencyMs: latency,
      feedback: state.currentSession === 3 ? (isCorrect ? "Aferin, doğru!" : `Düzeltme: ${target.label}`) : "yok",
      notes: "",
    });
  }

  function goNextTrial() {
    if (!state.currentSession) return;
    if (state.currentSession !== 2 && !state.waitingNext) return;
    state.trialIndex += 1;
    runCurrentTrial();
  }

  function endSession() {
    clearTimers();
    const student = getSelectedStudent();
    const sessionTrials = (student?.trials || []).filter(
      (t) => t.session === state.currentSession && t.sessionRunId === state.sessionRunId,
    );
    const summary = computeSummary(sessionTrials, state.currentSession);
    renderSessionSummary(summary, state.currentSession);
    els.instructionText.textContent = "Oturum tamamlandı.";
    els.sessionStatus.textContent = `Durum: Oturum ${state.currentSession} bitti`;
    els.trialCounter.textContent = `Deneme: ${state.trialsQueue.length}/${state.trialsQueue.length}`;
    state.currentSession = null;
    state.sessionRunId = null;
    state.trialsQueue = [];
    state.trialIndex = 0;
    updateControlsForRunning(false);
    refreshTableAndMetrics();
  }

  function computeSummary(trials, sessionId) {
    const valid = trials.filter((t) => t.isCorrect === true || t.isCorrect === false);
    const total = valid.length;
    const correct = valid.filter((t) => t.isCorrect).length;
    const latencyVals = valid.map((t) => Number(t.latencyMs)).filter((x) => Number.isFinite(x));
    const avgLatency = latencyVals.length
      ? Math.round(latencyVals.reduce((a, b) => a + b, 0) / latencyVals.length)
      : "NA";

    const fullTrials = valid.filter((t) => t.target.endsWith(":00"));
    const halfTrials = valid.filter((t) => t.target.endsWith(":30"));
    const fullAcc = fullTrials.length
      ? Math.round((fullTrials.filter((t) => t.isCorrect).length / fullTrials.length) * 100)
      : 0;
    const halfAcc = halfTrials.length
      ? Math.round((halfTrials.filter((t) => t.isCorrect).length / halfTrials.length) * 100)
      : 0;

    const byTarget = {};
    valid.forEach((t) => {
      if (!byTarget[t.target]) byTarget[t.target] = { total: 0, correct: 0 };
      byTarget[t.target].total += 1;
      if (t.isCorrect) byTarget[t.target].correct += 1;
    });

    const hardest = Object.entries(byTarget)
      .map(([target, v]) => ({ target, acc: (v.correct / v.total) * 100 }))
      .sort((a, b) => a.acc - b.acc)
      .slice(0, 5);

    return {
      sessionId,
      total,
      correct,
      accuracy: total ? Math.round((correct / total) * 100) : "NA",
      avgLatency,
      fullAcc,
      halfAcc,
      hardest,
      byTarget,
    };
  }

  function renderSessionSummary(summary, sessionId) {
    els.summaryCard.classList.remove("hidden");
    let html = `<h3>Oturum ${sessionId} Özeti</h3>`;
    html += `<p>Toplam deneme: ${summary.total}</p>`;
    html += `<p>Doğruluk: ${summary.accuracy}%</p>`;
    html += `<p>Ortalama latency: ${summary.avgLatency} ms</p>`;
    if (sessionId === 4) {
      const hardest = summary.hardest.map((h) => `${h.target} (%${Math.round(h.acc)})`).join(", ") || "Yok";
      html += `<p>Tam saat doğruluk: %${summary.fullAcc}</p>`;
      html += `<p>Yarım saat doğruluk: %${summary.halfAcc}</p>`;
      html += `<p>En çok hata yapılan saatler: ${hardest}</p>`;
    }
    const byTargetText = Object.entries(summary.byTarget)
      .map(([k, v]) => `${k}: ${v.correct}/${v.total}`)
      .join(" | ");
    if (byTargetText) html += `<p>Hedefe göre performans: ${byTargetText}</p>`;
    els.summaryCard.innerHTML = html;
  }

  function recordTrial(entry) {
    const student = getSelectedStudent();
    if (!student) return;
    student.trials.push({
      id: crypto.randomUUID(),
      studentId: student.id,
      studentName: student.name,
      createdAt: Date.now(),
      sessionRunId: state.sessionRunId,
      ...entry,
    });
    saveData();
    refreshTableAndMetrics();
  }

  function refreshTableAndMetrics() {
    const selected = getSelectedStudent();
    const rows = selected ? [...selected.trials] : [];
    const filterSession = els.filterSession.value;
    const filtered =
      filterSession === "all" ? rows : rows.filter((r) => String(r.session) === String(filterSession));

    els.trialsTableBody.innerHTML = "";
    filtered
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach((r) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${formatDate(r.createdAt)}</td>
          <td>${r.studentName}</td>
          <td>${r.session}</td>
          <td>${r.trialNo}</td>
          <td>${r.target}</td>
          <td>${r.presentationType}</td>
          <td>${formatDate(r.instructionTime)}</td>
          <td>${r.studentResponse}</td>
          <td>${r.isCorrect}</td>
          <td>${r.latencyMs}</td>
          <td>${r.feedback}</td>
          <td>${r.notes || ""}</td>
        `;
        els.trialsTableBody.appendChild(tr);
      });

    const overallSummary = computeSummary(rows, "all");
    els.metricsBox.innerHTML = `
      <strong>Seçili öğrenci genel metrikler</strong><br>
      Toplam deneme: ${rows.length} | Doğruluk: ${overallSummary.accuracy}% | Ortalama latency: ${overallSummary.avgLatency} ms
    `;
  }

  function exportCsv(allStudents) {
    const targets = allStudents ? state.students : [getSelectedStudent()].filter(Boolean);
    const lines = [
      [
        "TarihSaat",
        "Ogrenci",
        "Oturum",
        "DenemeNo",
        "HedefZaman",
        "SunumTuru",
        "YonergeZamani",
        "OgrenciYaniti",
        "Dogru",
        "LatencyMs",
        "Donut",
        "Not",
      ].join(","),
    ];

    targets.forEach((s) => {
      s.trials.forEach((t) => {
        lines.push(
          [
            csvEscape(formatDate(t.createdAt)),
            csvEscape(s.name),
            t.session,
            t.trialNo,
            t.target,
            csvEscape(t.presentationType),
            csvEscape(formatDate(t.instructionTime)),
            csvEscape(String(t.studentResponse)),
            csvEscape(String(t.isCorrect)),
            csvEscape(String(t.latencyMs)),
            csvEscape(t.feedback),
            csvEscape(t.notes || ""),
          ].join(","),
        );
      });
    });

    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = allStudents ? "tum_ogrenciler.csv" : "secili_ogrenci.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function csvEscape(val) {
    const s = String(val ?? "");
    return `"${s.replaceAll('"', '""')}"`;
  }

  function formatDate(ts) {
    if (!ts) return "";
    return new Date(ts).toLocaleString("tr-TR");
  }

  function clearTimers() {
    state.timers.forEach((t) => clearTimeout(t));
    state.timers = [];
    stopCountdown();
  }

  function startCountdown(durationMs) {
    els.countdownBarWrapper.classList.remove("hidden");
    els.countdownBar.style.width = "0%";
    const start = performance.now();

    const tick = () => {
      const elapsed = performance.now() - start;
      const ratio = Math.min(elapsed / durationMs, 1);
      els.countdownBar.style.width = `${Math.round(ratio * 100)}%`;
      if (ratio < 1 && state.currentSession === 3) {
        const raf = setTimeout(tick, 100);
        state.timers.push(raf);
      }
    };
    tick();
  }

  function stopCountdown() {
    els.countdownBarWrapper.classList.add("hidden");
    els.countdownBar.style.width = "0%";
  }

  function initVoices() {
    const load = () => {
      state.voices = speechSynthesis.getVoices();
    };
    load();
    speechSynthesis.onvoiceschanged = load;
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    const trVoice = state.voices.find((v) => v.lang?.toLowerCase().startsWith("tr"));
    if (trVoice) utter.voice = trVoice;
    utter.lang = trVoice?.lang || "tr-TR";
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }

  function drawClock({ hour, minute }) {
    const canvas = document.getElementById("clockCanvas");
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const r = Math.min(w, h) / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);

    // Saat dış çemberi
    ctx.beginPath();
    ctx.arc(0, 0, r - 8, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#1f2937";
    ctx.stroke();

    // Saat numaraları
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let n = 1; n <= 12; n += 1) {
      const ang = (n * Math.PI) / 6 - Math.PI / 2;
      const nx = Math.cos(ang) * (r - 36);
      const ny = Math.sin(ang) * (r - 36);
      ctx.fillText(String(n), nx, ny);
    }

    // Yelkovan
    const minuteAngle = ((minute / 60) * Math.PI * 2) - Math.PI / 2;
    drawHand(ctx, minuteAngle, r - 45, 6, "#2563eb");

    // Akrep (yarım saatlerde bir sonraki saate kayar)
    const hourValue = (hour % 12) + minute / 60;
    const hourAngle = ((hourValue / 12) * Math.PI * 2) - Math.PI / 2;
    drawHand(ctx, hourAngle, r - 80, 8, "#111827");

    // Merkez noktası
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#111827";
    ctx.fill();
    ctx.restore();
  }

  function drawHand(ctx, angle, length, width, color) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
    ctx.stroke();
  }

  init();
})();

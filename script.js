const schoolSchedules = {
  normal: [
    { name: "朝活動・学活", start: "08:15", end: "08:35" },
    { name: "1時間目", start: "08:40", end: "09:30" },
    { name: "休み時間", start: "09:30", end: "09:40", isBreak: true },
    { name: "2時間目", start: "09:40", end: "10:30" },
    { name: "休み時間", start: "10:30", end: "10:40", isBreak: true },
    { name: "3時間目", start: "10:40", end: "11:30" },
    { name: "休み時間", start: "11:30", end: "11:40", isBreak: true },
    { name: "4時間目", start: "11:40", end: "12:30" },
    { name: "給食準備・給食", start: "12:30", end: "13:05" },
    { name: "清掃", start: "13:10", end: "13:25" },
    { name: "昼休み", start: "13:25", end: "13:40", isBreak: true },
    { name: "5時間目", start: "13:45", end: "14:35" },
    { name: "休み時間", start: "14:35", end: "14:45", isBreak: true },
    { name: "6時間目", start: "14:45", end: "15:35" },
    { name: "学活", start: "15:40", end: "15:50" }
  ],
  short: [
    { name: "朝活動・学活", start: "08:15", end: "08:35" },
    { name: "1時間目", start: "08:40", end: "09:25" },
    { name: "休み時間", start: "09:25", end: "09:35", isBreak: true },
    { name: "2時間目", start: "09:35", end: "10:20" },
    { name: "休み時間", start: "10:20", end: "10:30", isBreak: true },
    { name: "3時間目", start: "10:30", end: "11:15" },
    { name: "休み時間", start: "11:15", end: "11:25", isBreak: true },
    { name: "4時間目", start: "11:25", end: "12:10" },
    { name: "給食準備・給食", start: "12:10", end: "12:45" },
    { name: "清掃", start: "12:50", end: "13:05" },
    { name: "昼休み", start: "13:05", end: "13:20", isBreak: true },
    { name: "5時間目", start: "13:25", end: "14:10" },
    { name: "休み時間", start: "14:10", end: "14:20", isBreak: true },
    { name: "6時間目", start: "14:20", end: "15:05" },
    { name: "学活", start: "15:10", end: "15:20" }
  ],
  test: [
    { name: "学活", start: "08:15", end: "08:25" },
    { name: "1時間目（テスト）", start: "08:30", end: "09:20" },
    { name: "休み時間", start: "09:20", end: "09:35", isBreak: true },
    { name: "2時間目（テスト）", start: "09:35", end: "10:25" },
    { name: "休み時間", start: "10:25", end: "10:40", isBreak: true },
    { name: "3時間目（テスト）", start: "10:40", end: "11:30" },
    { name: "休み時間", start: "11:30", end: "11:45", isBreak: true },
    { name: "4時間目（テスト）", start: "11:45", end: "12:35" },
    { name: "給食準備・給食", start: "12:35", end: "13:10" },
    { name: "清掃", start: "13:15", end: "13:30" },
    { name: "昼休み", start: "13:30", end: "13:40", isBreak: true },
    { name: "5時間目", start: "13:45", end: "14:35" },
    { name: "休み時間", start: "14:35", end: "14:50", isBreak: true },
    { name: "6時間目", start: "14:50", end: "15:40" },
    { name: "学活", start: "15:45", end: "15:55" }
  ]
};

const modeLabels = { normal: "通常校時", short: "短縮校時", test: "テスト校時" };
const scheduleStorageKey = "ju-count-schedules";
const groupStorageKey = "ju-count-schedule-groups";
const scheduleModes = ["normal", "short", "test"];

function cloneSchedules(schedules) {
  return JSON.parse(JSON.stringify(schedules));
}

function normalizeSchedules(schedules) {
  scheduleModes.forEach((mode) => {
    if (!Array.isArray(schedules[mode])) return;
    schedules[mode].forEach((period) => {
      period.bellSeconds = Number.isFinite(Number(period.bellSeconds)) ? Math.max(0, Number(period.bellSeconds)) : 37;
    });
  });
  return schedules;
}

const storedSchedules = localStorage.getItem(scheduleStorageKey);
if (storedSchedules) {
  try {
    normalizeSchedules(Object.assign(schoolSchedules, JSON.parse(storedSchedules)));
  } catch (error) {
    console.warn("保存済み時間割を読み込めませんでした。", error);
  }
}
normalizeSchedules(schoolSchedules);
const savedMode = localStorage.getItem("ju-count-mode");
let currentMode = savedMode && schoolSchedules[savedMode] ? savedMode : "normal";
const savedColor = localStorage.getItem("ju-count-color") || "#007bff";
const savedDarkMode = localStorage.getItem("ju-count-dark-mode") === "true";
const GOOGLE_CLIENT_ID = "";

const elements = {
  date: document.querySelector("#current-date"),
  statusCard: document.querySelector(".status-card"),
  statusLabel: document.querySelector("#status-label"),
  periodTime: document.querySelector("#period-time"),
  periodName: document.querySelector("#period-name"),
  countdown: document.querySelector("#countdown"),
  caption: document.querySelector("#countdown-caption"),
  bellCountdown: document.querySelector("#bell-countdown"),
  progressTrack: document.querySelector(".progress-track"),
  progressBar: document.querySelector("#progress-bar"),
  next: document.querySelector("#next-period"),
  list: document.querySelector("#schedule-list"),
  modeLabel: document.querySelector("#schedule-mode-label")
};

const appUi = {
  menuButton: document.querySelector("#menu-button"),
  menuDrawer: document.querySelector("#menu-drawer"),
  menuClose: document.querySelector("#menu-close"),
  memoOpen: document.querySelector("#memo-open"),
  memoOverlay: document.querySelector("#memo-overlay"),
  memoClose: document.querySelector("#memo-close"),
  memoText: document.querySelector("#memo-text"),
  memoSaved: document.querySelector("#memo-saved"),
  calendarConnect: document.querySelector("#calendar-connect"),
  calendarStatus: document.querySelector("#calendar-status"),
  calendarHelp: document.querySelector("#calendar-help"),
  tasksList: document.querySelector("#tasks-list"),
  tasksEmpty: document.querySelector("#tasks-empty")
};

const settings = {
  overlay: document.querySelector("#settings-overlay"),
  button: document.querySelector("#settings-button"),
  close: document.querySelector("#settings-close"),
  darkMode: document.querySelector("#dark-mode-toggle"),
  scheduleButton: document.querySelector("#show-schedule-button"),
  schedulePanel: document.querySelector("#schedule-panel"),
  modeOnboarding: document.querySelector("#mode-onboarding"),
  scheduleEditorOpen: document.querySelector("#schedule-editor-open"),
  scheduleEditorOverlay: document.querySelector("#schedule-editor-overlay"),
  scheduleEditorClose: document.querySelector("#schedule-editor-close"),
  scheduleEditMode: document.querySelector("#schedule-edit-mode"),
  scheduleEditor: document.querySelector("#schedule-editor"),
  addPeriod: document.querySelector("#add-period-button"),
  groupName: document.querySelector("#group-name"),
  saveGroup: document.querySelector("#save-group-button"),
  savedGroupsSection: document.querySelector("#saved-groups-section"),
  groupSelect: document.querySelector("#schedule-group-select"),
  loadGroup: document.querySelector("#load-group-button"),
  editorMessage: document.querySelector("#schedule-editor-message")
};

function setThemeColor(color) {
  document.documentElement.style.setProperty("--accent", color);
  const colorMap = {
    "#007bff": "#005fc7",
    "#6f42c1": "#59359c",
    "#e8590c": "#bd4708",
    "#d63384": "#a61e63",
    "#00897b": "#00695c",
    "#198754": "#146c43",
    "#795548": "#5d4037",
    "#607d8b": "#455a64",
    "#c2185b": "#880e4f",
    "#5c6bc0": "#3949ab",
    "#495057": "#343a40"
  };
  document.documentElement.style.setProperty("--accent-dark", colorMap[color] || color);
  document.querySelectorAll(".color-option").forEach((option) => option.classList.toggle("is-selected", option.dataset.color === color));
  localStorage.setItem("ju-count-color", color);
}

function setDarkMode(enabled) {
  document.body.classList.toggle("dark-mode", enabled);
  settings.darkMode.checked = enabled;
  localStorage.setItem("ju-count-dark-mode", String(enabled));
}

function toggleSettings(open) {
  settings.overlay.hidden = !open;
  settings.button.setAttribute("aria-expanded", String(open));
  if (open) settings.close.focus();
}

function toggleMenu(open) {
  appUi.menuDrawer.classList.toggle("is-open", open);
  appUi.menuDrawer.setAttribute("aria-hidden", String(!open));
  appUi.menuButton.setAttribute("aria-expanded", String(open));
  if (open) appUi.menuClose.focus();
}

function toggleMemo(open) {
  appUi.memoOverlay.hidden = !open;
  if (open) appUi.memoText.focus();
}

function renderTasks(events) {
  appUi.tasksList.innerHTML = events.map((event) => `
    <li class="task-item">
      <span>${escapeHtml(event.summary)}</span>
      <time datetime="${event.date.toISOString()}">${event.date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}</time>
    </li>
  `).join("");
  appUi.tasksEmpty.hidden = events.length > 0;
}

function connectGoogleCalendar() {
  if (!GOOGLE_CLIENT_ID) {
    appUi.calendarHelp.textContent = "Google CloudのOAuthクライアントIDをscript.jsのGOOGLE_CLIENT_IDに設定してください。";
    return;
  }
  if (!window.google || !window.google.accounts) {
    appUi.calendarHelp.textContent = "Googleログイン機能を読み込み中です。少し待ってから再試行してください。";
    return;
  }
  const tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    callback: async (response) => {
      if (response.error) {
        appUi.calendarHelp.textContent = "Googleカレンダーへの接続に失敗しました。";
        return;
      }
      await loadCalendarEvents(response.access_token);
    }
  });
  tokenClient.requestAccessToken();
}

async function loadCalendarEvents(accessToken) {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 30);
  const params = new URLSearchParams({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "10"
  });
  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error(`Calendar API returned ${response.status}`);
    const data = await response.json();
    const events = (data.items || []).filter((event) => event.summary && event.start?.dateTime).map((event) => ({
      summary: event.summary,
      date: new Date(event.start.dateTime)
    }));
    renderTasks(events);
    appUi.calendarStatus.textContent = "接続中";
    appUi.calendarHelp.textContent = "今後30日間の予定を表示しています。";
  } catch (error) {
    console.error(error);
    appUi.calendarHelp.textContent = "予定を取得できませんでした。Googleカレンダーの権限を確認してください。";
  }
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function dateAtTime(date, time) {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function formatRemaining(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function renderSchedule(schedule, activeIndex) {
  elements.list.innerHTML = schedule.map((period, index) => `
    <li class="schedule-item${period.isBreak ? " is-break" : ""}${index === activeIndex ? " is-current" : ""}">
      <span class="schedule-item__number">${period.isBreak ? "休み時間" : `${index + 1}コマ`}</span>
      <span class="schedule-item__name">${period.name}</span>
      <span class="schedule-item__time">${period.start}〜${period.end}</span>
    </li>
  `).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));
}

function renderScheduleEditor() {
  const mode = settings.scheduleEditMode.value;
  const schedule = schoolSchedules[mode];
  settings.scheduleEditor.innerHTML = schedule.map((period, index) => `
    <div class="schedule-editor-row" data-index="${index}" data-break="${Boolean(period.isBreak)}">
      <input data-field="name" type="text" value="${escapeHtml(period.name)}" aria-label="名称">
      <input data-field="start" type="time" value="${period.start}" aria-label="開始時刻">
      <input data-field="end" type="time" value="${period.end}" aria-label="終了時刻">
      <input data-field="bellSeconds" type="number" min="0" max="600" value="${period.bellSeconds}" aria-label="チャイム秒数">
      <button class="remove-period-button" type="button" aria-label="${escapeHtml(period.name)}を削除">×</button>
    </div>
  `).join("");
}

function persistSchedules() {
  localStorage.setItem(scheduleStorageKey, JSON.stringify(schoolSchedules));
}

function updateEditorSchedule() {
  const mode = settings.scheduleEditMode.value;
  schoolSchedules[mode] = Array.from(settings.scheduleEditor.querySelectorAll(".schedule-editor-row")).map((row) => ({
    name: row.querySelector('[data-field="name"]').value.trim() || "無題",
    start: row.querySelector('[data-field="start"]').value,
    end: row.querySelector('[data-field="end"]').value,
    bellSeconds: Math.max(0, Number(row.querySelector('[data-field="bellSeconds"]').value) || 0),
    isBreak: row.dataset.break === "true"
  })).filter((period) => period.start && period.end);
  normalizeSchedules(schoolSchedules);
  persistSchedules();
}

function loadGroups() {
  const groups = JSON.parse(localStorage.getItem(groupStorageKey) || "{}");
  const names = Object.keys(groups);
  settings.savedGroupsSection.hidden = names.length === 0;
  settings.groupSelect.innerHTML = '<option value="">選択してください</option>';
  names.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    settings.groupSelect.appendChild(option);
  });
}

function saveGroup() {
  const name = settings.groupName.value.trim();
  if (!name) {
    settings.editorMessage.textContent = "グループ名を入力してください。";
    return;
  }
  updateEditorSchedule();
  const groups = JSON.parse(localStorage.getItem(groupStorageKey) || "{}");
  groups[name] = cloneSchedules(schoolSchedules);
  localStorage.setItem(groupStorageKey, JSON.stringify(groups));
  settings.groupName.value = "";
  loadGroups();
  settings.groupSelect.value = name;
  settings.editorMessage.textContent = `「${name}」を保存しました。`;
}

function loadGroup() {
  const name = settings.groupSelect.value;
  const groups = JSON.parse(localStorage.getItem(groupStorageKey) || "{}");
  if (!name || !groups[name]) return;
  Object.assign(schoolSchedules, normalizeSchedules(cloneSchedules(groups[name])));
  persistSchedules();
  renderScheduleEditor();
  settings.editorMessage.textContent = `「${name}」を読み込みました。次回起動時から反映されます。`;
}

function toggleScheduleEditor(open) {
  settings.scheduleEditorOverlay.hidden = !open;
  if (open) {
    settings.scheduleEditMode.value = currentMode;
    renderScheduleEditor();
    loadGroups();
    settings.scheduleEditMode.focus();
  } else {
    settings.scheduleEditorOpen.focus();
  }
}

function setMode(mode, updateDisplay = true) {
  if (!schoolSchedules[mode]) return;
  localStorage.setItem("ju-count-mode", mode);
  document.querySelectorAll(".mode-option").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.mode === mode);
  });
  if (updateDisplay) {
    currentMode = mode;
    elements.modeLabel.textContent = modeLabels[mode];
    update();
  }
}

function closeModeOnboarding() {
  settings.modeOnboarding.hidden = true;
}

function update() {
  const now = new Date();
  const schedule = schoolSchedules[currentMode];
  const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const activeIndex = schedule.findIndex((period) => nowMinutes >= timeToMinutes(period.start) && nowMinutes < timeToMinutes(period.end));
  const nextIndex = schedule.findIndex((period) => timeToMinutes(period.start) > nowMinutes);
  const active = activeIndex >= 0 ? schedule[activeIndex] : null;
  const next = nextIndex >= 0 ? schedule[nextIndex] : null;
  let remaining = 0;
  let progress = 0;

  elements.date.textContent = now.toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" });
  elements.date.dateTime = now.toISOString();
  elements.statusCard.classList.remove("is-break");
  renderSchedule(schedule, activeIndex);

  if (active) {
    const end = dateAtTime(now, active.end);
    const start = dateAtTime(now, active.start);
    remaining = (end - now) / 1000;
    progress = ((now - start) / (end - start)) * 100;
    elements.statusLabel.textContent = active.isBreak ? "休み時間中" : "現在の時限";
    elements.periodName.textContent = active.name;
    elements.periodTime.textContent = `${active.start}〜${active.end}`;
    elements.caption.textContent = active.isBreak ? "終了まで" : "授業終了まで";
    const bellRemaining = remaining - active.bellSeconds;
    elements.bellCountdown.hidden = false;
    elements.bellCountdown.textContent = bellRemaining >= 0 ? `チャイムまで: ${Math.ceil(bellRemaining)}秒` : "チャイム済み";
    if (active.isBreak) elements.statusCard.classList.add("is-break");
    document.title = `[${formatRemaining(remaining)}] ${active.name} - ju!count`;
  } else if (next) {
    const start = dateAtTime(now, next.start);
    remaining = (start - now) / 1000;
    elements.statusLabel.textContent = "授業前 / 休憩中";
    elements.periodName.textContent = "次の授業まで";
    elements.periodTime.textContent = `${next.start}〜${next.end}`;
    elements.caption.textContent = "開始まで";
    elements.bellCountdown.hidden = true;
    document.title = `[${formatRemaining(remaining)}] 授業前 - ju!count`;
  } else {
    elements.statusLabel.textContent = "本日の校時";
    elements.periodName.textContent = "すべての校時が終了";
    elements.periodTime.textContent = "";
    elements.caption.textContent = "お疲れ様でした！";
    elements.bellCountdown.hidden = true;
    document.title = "放課後 - ju!count";
  }

  elements.countdown.textContent = formatRemaining(remaining);
  elements.progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  elements.progressTrack.setAttribute("aria-valuenow", String(Math.round(progress)));
  elements.next.textContent = next && active ? `次: ${next.name} (${next.start}〜)` : next ? `次: ${next.name} (${next.start}〜)` : "次の予定はありません";
}

document.querySelectorAll(".mode-option").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode, false));
});
document.querySelectorAll(".onboarding-option").forEach((button) => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode);
    closeModeOnboarding();
  });
});

settings.button.addEventListener("click", () => toggleSettings(true));
settings.close.addEventListener("click", () => toggleSettings(false));
settings.overlay.addEventListener("click", (event) => {
  if (event.target === settings.overlay) toggleSettings(false);
});
settings.darkMode.addEventListener("change", (event) => setDarkMode(event.target.checked));
document.querySelectorAll(".color-option").forEach((option) => {
  option.addEventListener("click", () => setThemeColor(option.dataset.color));
});
settings.scheduleButton.addEventListener("click", () => {
  const isHidden = settings.schedulePanel.hidden;
  settings.schedulePanel.hidden = !isHidden;
  settings.scheduleButton.textContent = isHidden ? "本日の校時を閉じる" : "本日の校時を表示";
});
settings.button.addEventListener("click", () => {
  settings.scheduleEditMode.value = currentMode;
});
settings.scheduleEditorOpen.addEventListener("click", () => toggleScheduleEditor(true));
settings.scheduleEditorClose.addEventListener("click", () => toggleScheduleEditor(false));
settings.scheduleEditorOverlay.addEventListener("click", (event) => {
  if (event.target === settings.scheduleEditorOverlay) toggleScheduleEditor(false);
});
settings.scheduleEditMode.addEventListener("change", renderScheduleEditor);
settings.scheduleEditor.addEventListener("change", updateEditorSchedule);
settings.scheduleEditor.addEventListener("click", (event) => {
  if (!event.target.classList.contains("remove-period-button")) return;
  event.target.closest(".schedule-editor-row").remove();
  updateEditorSchedule();
});
settings.addPeriod.addEventListener("click", () => {
  updateEditorSchedule();
  schoolSchedules[settings.scheduleEditMode.value].push({
    name: "新しい予定", start: "00:00", end: "00:30", bellSeconds: 37, isBreak: false
  });
  renderScheduleEditor();
});
settings.saveGroup.addEventListener("click", saveGroup);
settings.loadGroup.addEventListener("click", loadGroup);
appUi.menuButton.addEventListener("click", () => toggleMenu(true));
appUi.menuClose.addEventListener("click", () => toggleMenu(false));
appUi.memoOpen.addEventListener("click", () => {
  toggleMenu(false);
  toggleMemo(true);
});
appUi.memoClose.addEventListener("click", () => toggleMemo(false));
appUi.memoOverlay.addEventListener("click", (event) => {
  if (event.target === appUi.memoOverlay) toggleMemo(false);
});
appUi.memoText.value = localStorage.getItem("ju-countool-memo") || "";
appUi.memoText.addEventListener("input", () => {
  localStorage.setItem("ju-countool-memo", appUi.memoText.value);
  appUi.memoSaved.textContent = "保存しました";
  window.clearTimeout(appUi.memoSaveTimer);
  appUi.memoSaveTimer = window.setTimeout(() => {
    appUi.memoSaved.textContent = "";
  }, 1200);
});
appUi.calendarConnect.addEventListener("click", connectGoogleCalendar);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !settings.overlay.hidden) toggleSettings(false);
  if (event.key === "Escape" && !settings.scheduleEditorOverlay.hidden) toggleScheduleEditor(false);
  if (event.key === "Escape" && !appUi.memoOverlay.hidden) toggleMemo(false);
  if (event.key === "Escape" && appUi.menuDrawer.classList.contains("is-open")) toggleMenu(false);
});

setThemeColor(savedColor);
setDarkMode(savedDarkMode);
setMode(currentMode);
if (!savedMode) settings.modeOnboarding.hidden = false;
setInterval(update, 1000);
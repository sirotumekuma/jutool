const schoolSchedules = {
  normal: [
    { name: "朝活動・学活", start: "08:15", end: "08:25" },
    { name: "1時間目", start: "08:40", end: "09:30" },
    { name: "2時間目", start: "09:40", end: "10:30" },
    { name: "3時間目", start: "10:40", end: "11:30" },
    { name: "4時間目", start: "11:40", end: "12:30" },
    { name: "給食準備・給食", start: "12:30", end: "13:05" },
    { name: "清掃", start: "13:10", end: "13:25" },
    { name: "昼休み", start: "13:25", end: "13:40", isBreak: true },
    { name: "5時間目", start: "13:45", end: "14:35" },
    { name: "6時間目", start: "14:45", end: "15:35" },
    { name: "学活", start: "15:40", end: "15:50" }
  ],
  short: [
    { name: "朝活動・学活", start: "08:15", end: "08:25" },
    { name: "1時間目", start: "08:40", end: "09:25" },
    { name: "2時間目", start: "09:35", end: "10:20" },
    { name: "3時間目", start: "10:30", end: "11:15" },
    { name: "4時間目", start: "11:25", end: "12:10" },
    { name: "給食準備・給食", start: "12:10", end: "12:45" },
    { name: "清掃", start: "12:50", end: "13:05" },
    { name: "昼休み", start: "13:05", end: "13:20", isBreak: true },
    { name: "5時間目", start: "13:25", end: "14:10" },
    { name: "6時間目", start: "14:20", end: "15:05" },
    { name: "学活", start: "15:10", end: "15:20" }
  ],
  test: [
    { name: "学活", start: "08:15", end: "08:25" },
    { name: "1時間目（テスト）", start: "08:30", end: "09:20" },
    { name: "2時間目（テスト）", start: "09:35", end: "10:25" },
    { name: "3時間目（テスト）", start: "10:40", end: "11:30" },
    { name: "4時間目（テスト）", start: "11:45", end: "12:35" },
    { name: "給食準備・給食", start: "12:35", end: "13:10" },
    { name: "清掃", start: "13:15", end: "13:30" },
    { name: "昼休み", start: "13:30", end: "13:40", isBreak: true },
    { name: "5時間目", start: "13:45", end: "14:35" },
    { name: "6時間目", start: "14:45", end: "15:35" },
    { name: "学活", start: "15:40", end: "15:50" }
  ]
};

const modeLabels = { normal: "通常校時", short: "短縮校時", test: "テスト校時" };
const scheduleStorageKey = "ju-count-schedules";
const groupStorageKey = "ju-count-schedule-groups";
const taskStorageKey = "ju-count-tasks";
const reminderStorageKey = "ju-remoinder-events";
const scheduleModes = ["normal", "short", "test"];
const BELL_COUNTDOWN_SECONDS = 41;
const RAINBOW_SPEED_STORAGE_KEY = "ju-count-rainbow-speed";
const RAINBOW_DIRECTION_STORAGE_KEY = "ju-count-rainbow-direction";
const RAINBOW_COLORS_STORAGE_KEY = "ju-count-rainbow-colors";
const DEFAULT_RAINBOW_SPEED = 14;
const MIN_RAINBOW_SPEED = 3;
const MAX_RAINBOW_SPEED = 30;
const DEFAULT_RAINBOW_COLORS = ["#9d174d", "#c2410c", "#a16207", "#047857", "#1d4ed8", "#6b21a8"];
const RAINBOW_DIRECTIONS = ["left-to-right", "right-to-left"];
const CRACKER_LEVEL_STORAGE_KEY = "ju-count-cracker-level";
const CRACKER_LEVEL_COUNTS = { none: 0, few: 12, normal: 32, more: 60, many: 100 };
let previousLesson = null;
let confettiTimeout;

function cloneSchedules(schedules) {
  return JSON.parse(JSON.stringify(schedules));
}

function normalizeSchedules(schedules) {
  scheduleModes.forEach((mode) => {
    if (!Array.isArray(schedules[mode])) return;
    schedules[mode] = schedules[mode].filter((period) => !period.isBreak || period.name === "昼休み");
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
const storedRainbowSpeed = Number(localStorage.getItem(RAINBOW_SPEED_STORAGE_KEY));
const savedRainbowSpeed = Number.isFinite(storedRainbowSpeed)
  ? Math.min(MAX_RAINBOW_SPEED, Math.max(MIN_RAINBOW_SPEED, storedRainbowSpeed))
  : DEFAULT_RAINBOW_SPEED;
const storedRainbowDirection = localStorage.getItem(RAINBOW_DIRECTION_STORAGE_KEY);
const savedRainbowDirection = RAINBOW_DIRECTIONS.includes(storedRainbowDirection) ? storedRainbowDirection : "left-to-right";
const storedRainbowColors = localStorage.getItem(RAINBOW_COLORS_STORAGE_KEY);
let savedRainbowColors = DEFAULT_RAINBOW_COLORS;
if (storedRainbowColors) {
  try {
    const parsedColors = JSON.parse(storedRainbowColors);
    if (Array.isArray(parsedColors) && parsedColors.length === DEFAULT_RAINBOW_COLORS.length && parsedColors.every((color) => /^#[\da-f]{6}$/i.test(color))) {
      savedRainbowColors = parsedColors;
    } else {
      console.warn("保存済み虹色配色の形式が不正です。既定の配色を使用します。");
    }
  } catch (error) {
    console.warn("保存済み虹色配色を読み込めませんでした。", error);
  }
}
const storedCrackerLevel = localStorage.getItem(CRACKER_LEVEL_STORAGE_KEY);
const savedCrackerLevel = Object.hasOwn(CRACKER_LEVEL_COUNTS, storedCrackerLevel) ? storedCrackerLevel : "normal";
const savedDarkMode = localStorage.getItem("ju-count-dark-mode") === "true";

const elements = {
  date: document.querySelector("#current-date"),
  statusCard: document.querySelector(".status-card"),
  statusLabel: document.querySelector("#status-label"),
  periodTime: document.querySelector("#period-time"),
  periodName: document.querySelector("#period-name"),
  countdown: document.querySelector("#countdown"),
  caption: document.querySelector("#countdown-caption"),
  bellCountdown: document.querySelector("#bell-countdown"),
  lessonStartCountdown: document.querySelector("#lesson-start-countdown"),
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
  calendarConnect: document.querySelector("#calendar-connect"),
  taskOverlay: document.querySelector("#task-overlay"),
  taskClose: document.querySelector("#task-close"),
  taskForm: document.querySelector("#task-form"),
  taskName: document.querySelector("#task-name"),
  taskDate: document.querySelector("#task-date"),
  taskDetails: document.querySelector("#task-details"),
  taskReflect: document.querySelector("#task-reflect"),
  taskMessage: document.querySelector("#task-message"),
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
  editorMessage: document.querySelector("#schedule-editor-message"),
  rainbowOverlay: document.querySelector("#rainbow-settings-overlay"),
  rainbowSettingsOpen: document.querySelector("#rainbow-settings-open"),
  rainbowSettingsClose: document.querySelector("#rainbow-settings-close"),
  rainbowSpeed: document.querySelector("#rainbow-speed"),
  rainbowSpeedValue: document.querySelector("#rainbow-speed-value"),
  rainbowDirection: document.querySelector("#rainbow-direction"),
  rainbowColors: document.querySelectorAll(".rainbow-color"),
  rainbowColorsReset: document.querySelector("#rainbow-colors-reset"),
  crackerOverlay: document.querySelector("#cracker-settings-overlay"),
  crackerSettingsOpen: document.querySelector("#cracker-settings-open"),
  crackerSettingsClose: document.querySelector("#cracker-settings-close"),
  crackerLevel: document.querySelector("#cracker-level"),
  crackerPreview: document.querySelector("#cracker-preview")
};

function setThemeColor(color) {
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
  const isRainbow = color === "rainbow";
  const accent = isRainbow ? "#6f42c1" : color;
  document.documentElement.style.setProperty("--accent", accent);
  document.documentElement.style.setProperty("--accent-dark", colorMap[accent] || accent);
  elements.statusCard.classList.toggle("is-rainbow", isRainbow);
  document.querySelectorAll(".color-option").forEach((option) => option.classList.toggle("is-selected", option.dataset.color === color));
  localStorage.setItem("ju-count-color", color);
}

function setRainbowSpeed(speed) {
  const numericSpeed = Number(speed);
  if (!Number.isFinite(numericSpeed)) throw new Error("虹色アニメーションの速度が不正です。");
  const normalizedSpeed = Math.min(MAX_RAINBOW_SPEED, Math.max(MIN_RAINBOW_SPEED, numericSpeed));
  document.documentElement.style.setProperty("--rainbow-duration", `${normalizedSpeed}s`);
  settings.rainbowSpeed.value = String(normalizedSpeed);
  settings.rainbowSpeedValue.value = `${normalizedSpeed}秒`;
  localStorage.setItem(RAINBOW_SPEED_STORAGE_KEY, String(normalizedSpeed));
}

function setRainbowDirection(direction) {
  if (!RAINBOW_DIRECTIONS.includes(direction)) throw new Error(`虹色アニメーションの方向が不正です: ${direction}`);
  document.documentElement.style.setProperty("--rainbow-direction", direction === "left-to-right" ? "reverse" : "normal");
  settings.rainbowDirection.value = direction;
  localStorage.setItem(RAINBOW_DIRECTION_STORAGE_KEY, direction);
}

function setRainbowColors(colors) {
  if (colors.length !== DEFAULT_RAINBOW_COLORS.length || !colors.every((color) => /^#[\da-f]{6}$/i.test(color))) {
    throw new Error("虹色の配色が不正です。");
  }
  const gradientColors = [...colors, ...colors];
  document.documentElement.style.setProperty("--rainbow-gradient", `linear-gradient(90deg, ${gradientColors.join(", ")})`);
  document.documentElement.style.setProperty("--rainbow-preview-gradient", `conic-gradient(${colors.join(", ")})`);
  settings.rainbowColors.forEach((input, index) => {
    input.value = colors[index];
  });
  localStorage.setItem(RAINBOW_COLORS_STORAGE_KEY, JSON.stringify(colors));
}

function toggleRainbowSettings(open) {
  settings.rainbowOverlay.hidden = !open;
  if (open) settings.rainbowSettingsClose.focus();
  else settings.rainbowSettingsOpen.focus();
}

function setCrackerLevel(level) {
  if (!Object.hasOwn(CRACKER_LEVEL_COUNTS, level)) {
    throw new Error(`クラッカーの量が不正です: ${level}`);
  }
  settings.crackerLevel.value = level;
  localStorage.setItem(CRACKER_LEVEL_STORAGE_KEY, level);
}

function showConfetti(count) {
  const celebration = document.querySelector("#class-celebration");
  const colors = ["#ff4d6d", "#ff9f1c", "#ffd60a", "#2ec4b6", "#3a86ff", "#8338ec"];
  window.clearTimeout(confettiTimeout);
  celebration.replaceChildren();
  celebration.classList.toggle("is-active", count > 0);
  for (let index = 0; index < count; index += 1) {
    const piece = document.createElement("span");
    piece.className = "class-confetti__piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[index % colors.length];
    piece.style.setProperty("--confetti-drift", `${Math.round(Math.random() * 180 - 90)}px`);
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    piece.style.animationDuration = `${1.8 + Math.random() * 1.2}s`;
    celebration.appendChild(piece);
  }
  if (count > 0) {
    const burstCount = Math.min(4, Math.ceil(count / 30));
    for (let burstIndex = 0; burstIndex < burstCount; burstIndex += 1) {
      const burstSize = 24;
      const burstCenterX = burstIndex % 2 === 0 ? 14 : 86;
      const burstCenterY = 34 + Math.random() * 16;
      for (let index = 0; index < burstSize; index += 1) {
        const angle = (Math.PI * 2 * index) / burstSize + Math.random() * 0.12;
        const distance = 70 + Math.random() * 90;
        const spark = document.createElement("span");
        spark.className = `class-confetti__piece class-confetti__piece--burst${index % 4 === 0 ? " class-confetti__piece--star" : index % 4 === 1 ? " class-confetti__piece--streamer" : ""}`;
        spark.style.left = `${burstCenterX}%`;
        spark.style.top = `${burstCenterY}%`;
        spark.style.backgroundColor = colors[(index + burstIndex * 2) % colors.length];
        spark.style.setProperty("--burst-x", `${Math.cos(angle) * distance}px`);
        spark.style.setProperty("--burst-y", `${Math.sin(angle) * distance}px`);
        spark.style.animationDelay = `${burstIndex * 0.16}s`;
        celebration.appendChild(spark);
      }
    }
    confettiTimeout = window.setTimeout(() => {
      celebration.replaceChildren();
      celebration.classList.remove("is-active");
    }, 4000);
  }
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

function renderTasks(events) {
  appUi.tasksList.innerHTML = events.map((event) => `
    <li class="task-item">
      <span>${escapeHtml(event.summary)}</span>
      <time datetime="${event.date.toISOString()}">${event.date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}</time>
    </li>
  `).join("");
  appUi.tasksEmpty.hidden = events.length > 0;
}

function renderSavedTasks() {
  const tasks = JSON.parse(localStorage.getItem(taskStorageKey) || "[]")
    .filter((task) => task.reflect)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);
  renderTasks(tasks.map((task) => ({
    summary: task.name,
    date: new Date(`${task.date}T00:00:00`)
  })));
}

function syncTasksToReminders(tasks) {
  let tasksChanged = false;
  tasks.forEach((task) => {
    if (!task.id) {
      task.id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      tasksChanged = true;
    }
  });
  if (tasksChanged) localStorage.setItem(taskStorageKey, JSON.stringify(tasks));

  const reminders = JSON.parse(localStorage.getItem(reminderStorageKey) || "[]");
  const taskIds = new Set(tasks.map((task) => task.id));
  const syncedReminders = reminders.filter((reminder) => !reminder.sourceTaskId || taskIds.has(reminder.sourceTaskId));
  tasks.forEach((task) => {
    const reminder = {
      id: `ju-count-task-${task.id}`,
      sourceTaskId: task.id,
      name: task.name,
      date: task.date,
      time: "",
      note: task.details || ""
    };
    const existingIndex = syncedReminders.findIndex((event) => event.sourceTaskId === task.id);
    if (existingIndex >= 0) syncedReminders[existingIndex] = reminder;
    else syncedReminders.push(reminder);
  });
  localStorage.setItem(reminderStorageKey, JSON.stringify(syncedReminders));
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
    client_id: "958970346089-jcomvpldmnpd4i2ujl4cnemlccm3hdrm.apps.googleusercontent.com",
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

  function connectGoogleCalendar() {
    appUi.taskOverlay.hidden = false;
    appUi.taskName.focus();
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

function isLessonPeriod(period) {
  return !period.isBreak && !/(朝活動|学活|給食|清掃|昼休み)/.test(period.name);
}

function celebrateClassEnd() {
  showConfetti(CRACKER_LEVEL_COUNTS[settings.crackerLevel.value]);
}

function renderSchedule(schedule, activeIndex) {
  elements.list.innerHTML = schedule.map((period, index) => `
    <li class="schedule-item${period.isBreak ? " is-break" : ""}${index === activeIndex ? " is-current" : ""}">
      <span class="schedule-item__number">${period.name === "昼休み" ? "昼休み" : period.isBreak ? "休憩" : `${index + 1}コマ`}</span>
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
  const nextLesson = schedule.find((period) => isLessonPeriod(period) && timeToMinutes(period.start) > nowMinutes);
  const activeLesson = active && isLessonPeriod(active) ? active : null;
  let remaining = 0;
  let progress = 0;

  if (previousLesson && (!activeLesson || activeLesson.start !== previousLesson.start || activeLesson.end !== previousLesson.end)) {
    if (now >= dateAtTime(now, previousLesson.end)) celebrateClassEnd();
  }
  previousLesson = activeLesson;

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
    const bellRemaining = remaining - BELL_COUNTDOWN_SECONDS;
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

  elements.lessonStartCountdown.hidden = !nextLesson;
  if (nextLesson) {
    const lessonStart = dateAtTime(now, nextLesson.start);
    elements.lessonStartCountdown.textContent = `次の授業開始まで: ${Math.ceil((lessonStart - now) / 1000)}秒`;
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
settings.rainbowSettingsOpen.addEventListener("click", () => toggleRainbowSettings(true));
settings.rainbowSettingsClose.addEventListener("click", () => toggleRainbowSettings(false));
settings.rainbowOverlay.addEventListener("click", (event) => {
  if (event.target === settings.rainbowOverlay) toggleRainbowSettings(false);
});
settings.rainbowSpeed.addEventListener("input", (event) => setRainbowSpeed(event.target.value));
settings.rainbowDirection.addEventListener("change", (event) => setRainbowDirection(event.target.value));
settings.rainbowColors.forEach((input) => {
  input.addEventListener("input", () => setRainbowColors(Array.from(settings.rainbowColors, (colorInput) => colorInput.value)));
});
settings.rainbowColorsReset.addEventListener("click", () => setRainbowColors(DEFAULT_RAINBOW_COLORS));
settings.crackerSettingsOpen.addEventListener("click", () => {
  settings.crackerOverlay.hidden = false;
  settings.crackerSettingsClose.focus();
});
settings.crackerSettingsClose.addEventListener("click", () => {
  settings.crackerOverlay.hidden = true;
  settings.crackerSettingsOpen.focus();
});
settings.crackerOverlay.addEventListener("click", (event) => {
  if (event.target === settings.crackerOverlay) {
    settings.crackerOverlay.hidden = true;
    settings.crackerSettingsOpen.focus();
  }
});
settings.crackerLevel.addEventListener("change", (event) => setCrackerLevel(event.target.value));
settings.crackerPreview.addEventListener("click", () => {
  showConfetti(CRACKER_LEVEL_COUNTS[settings.crackerLevel.value]);
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
  name: "新しい予定", start: "00:00", end: "00:30", isBreak: false
  });
  renderScheduleEditor();
});
settings.saveGroup.addEventListener("click", saveGroup);
settings.loadGroup.addEventListener("click", loadGroup);
appUi.menuButton.addEventListener("click", () => toggleMenu(true));
appUi.menuClose.addEventListener("click", () => toggleMenu(false));
appUi.calendarConnect.addEventListener("click", () => {
  toggleMenu(false);
  appUi.taskOverlay.hidden = false;
  appUi.taskMessage.textContent = "";
  appUi.taskName.focus();
});
appUi.taskClose.addEventListener("click", () => {
  appUi.taskOverlay.hidden = true;
});
appUi.taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const tasks = JSON.parse(localStorage.getItem(taskStorageKey) || "[]");
  const task = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: appUi.taskName.value.trim(),
    date: appUi.taskDate.value,
    details: appUi.taskDetails.value.trim(),
    reflect: appUi.taskReflect.checked
  };
  tasks.push(task);
  localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
  syncTasksToReminders(tasks);
  renderSavedTasks();
  appUi.taskOverlay.hidden = true;
  appUi.taskForm.reset();
  appUi.taskReflect.checked = true;
  appUi.taskMessage.textContent = "課題を保存しました。";
});
window.addEventListener("storage", (event) => {
  if (event.key === taskStorageKey) renderSavedTasks();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !settings.crackerOverlay.hidden) {
    settings.crackerOverlay.hidden = true;
    settings.crackerSettingsOpen.focus();
  } else if (event.key === "Escape" && !settings.rainbowOverlay.hidden) toggleRainbowSettings(false);
  else if (event.key === "Escape" && !settings.overlay.hidden) toggleSettings(false);
  if (event.key === "Escape" && !settings.scheduleEditorOverlay.hidden) toggleScheduleEditor(false);
  if (event.key === "Escape" && !appUi.taskOverlay.hidden) appUi.taskOverlay.hidden = true;
  if (event.key === "Escape" && appUi.menuDrawer.classList.contains("is-open")) toggleMenu(false);
});

setThemeColor(savedColor);
setRainbowSpeed(savedRainbowSpeed);
setRainbowDirection(savedRainbowDirection);
setRainbowColors(savedRainbowColors);
setCrackerLevel(savedCrackerLevel);
setDarkMode(savedDarkMode);
setMode(currentMode);
syncTasksToReminders(JSON.parse(localStorage.getItem(taskStorageKey) || "[]"));
renderSavedTasks();
if (!savedMode) settings.modeOnboarding.hidden = false;
setInterval(update, 1000);
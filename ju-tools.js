(() => {
  "use strict";

  const keys = {
    tasks: "ju-count-tasks",
    schedules: "ju-count-schedules",
    mode: "ju-count-mode",
    reminders: "ju-reminder-events",
    oldReminders: "ju-remoinder-events",
    memos: "ju-countool-memos",
    planner: "ju-planner-data",
    exceptions: "ju-schedule-exceptions",
    checklist: "ju-checklist-items",
    decks: "ju-words-decks",
    searchHistory: "ju-search-history"
  };
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const defaultSchedule = {
    normal: [
      { name: "朝活動・学活", start: "08:15", end: "08:25" }, { name: "1時間目", start: "08:40", end: "09:30" },
      { name: "2時間目", start: "09:40", end: "10:30" }, { name: "3時間目", start: "10:40", end: "11:30" },
      { name: "4時間目", start: "11:40", end: "12:30" }, { name: "給食準備・給食", start: "12:30", end: "13:05" },
      { name: "清掃", start: "13:10", end: "13:25" }, { name: "昼休み", start: "13:25", end: "13:40", isBreak: true },
      { name: "5時間目", start: "13:45", end: "14:35" }, { name: "6時間目", start: "14:45", end: "15:35" },
      { name: "学活", start: "15:40", end: "15:50" }
    ]
  };
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const todayKey = () => dateKey(new Date());
  const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const read = (key, fallback) => {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error(`保存データを読み込めませんでした: ${key}`, error);
      return fallback;
    }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const list = (key) => {
    const value = read(key, []);
    return Array.isArray(value) ? value : [];
  };
  const currentTasks = () => list(keys.tasks);
  const reminders = () => {
    const current = localStorage.getItem(keys.reminders);
    if (current !== null) return list(keys.reminders);
    const legacy = localStorage.getItem(keys.oldReminders);
    if (legacy === null) return [];
    try {
      const parsed = JSON.parse(legacy);
      if (!Array.isArray(parsed)) throw new TypeError("リマインダーデータの形式が正しくありません。");
      write(keys.reminders, parsed);
      return parsed;
    } catch (error) {
      console.error("旧リマインダーデータを移行できませんでした。", error);
      return [];
    }
  };
  if (localStorage.getItem(keys.reminders) === null && localStorage.getItem(keys.oldReminders) !== null) reminders();

  let calendarMonth = new Date();
  calendarMonth.setDate(1);
  let studyCards = [];
  let studyIndex = 0;
  let studyFlipped = false;
  let installPrompt = null;
  let deckWasExported = false;

  const navLinks = $$(".tool-nav a");
  function navigate(view) {
    const page = view || location.hash.slice(1) || "planner";
    const safePage = ["planner", "schedule", "checklist", "words", "search", "mobile"].includes(page) ? page : "planner";
    $$("[data-page]").forEach((section) => { section.hidden = section.dataset.page !== safePage; });
    navLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.view === safePage));
    if (location.hash !== `#${safePage}`) history.replaceState(null, "", `#${safePage}`);
    if (safePage === "search") $("#global-search").focus({ preventScroll: true });
    if (safePage === "checklist") renderChecklist();
  }
  navLinks.forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    navigate(link.dataset.view);
  }));
  window.addEventListener("hashchange", () => navigate());
  navigate();

  const themeColor = localStorage.getItem("ju-count-color");
  if (themeColor && /^#[\da-f]{6}$/i.test(themeColor)) document.documentElement.style.setProperty("--accent", themeColor);
  function applyTheme() {
    const dark = localStorage.getItem("ju-tools-dark-mode") === "true" || localStorage.getItem("ju-count-dark-mode") === "true";
    document.body.classList.toggle("dark-mode", dark);
  }
  applyTheme();
  $("#theme-toggle").addEventListener("click", () => {
    const dark = !document.body.classList.contains("dark-mode");
    localStorage.setItem("ju-tools-dark-mode", String(dark));
    localStorage.setItem("ju-count-dark-mode", String(dark));
    localStorage.setItem("ju-tools-dark-mode", String(dark));
    applyTheme();
  });

  function renderPlanner() {
    const tasks = currentTasks();
    const subjectFilter = $("#planner-filter-subject");
    const selectedSubject = subjectFilter.value;
    const subjects = [...new Set(tasks.map((task) => task.subject).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));
    subjectFilter.innerHTML = '<option value="">全教科</option>' + subjects.map((subject) => `<option value="${escapeHTML(subject)}">${escapeHTML(subject)}</option>`).join("");
    subjectFilter.value = subjects.includes(selectedSubject) ? selectedSubject : "";
    const category = $("#planner-filter-category").value;
    const sort = $("#planner-sort").value;
    const filtered = tasks.filter((task) => (!category || (task.category || "課題") === category) && (!subjectFilter.value || task.subject === subjectFilter.value));
    filtered.sort((a, b) => sort === "subject"
      ? (a.subject || "その他").localeCompare(b.subject || "その他", "ja") || (a.date || "").localeCompare(b.date || "")
      : (a.date || "").localeCompare(b.date || ""));
    const today = todayKey();
    $("#planner-list").innerHTML = filtered.length ? filtered.map((task) => {
      const status = task.status || (task.completed ? "完了" : "未着手");
      const overdue = task.date < today && status !== "完了";
      return `<article class="item-row${overdue ? " is-overdue" : ""}${status === "完了" ? " is-done" : ""}">
        <div class="item-copy"><strong>${escapeHTML(task.name)}</strong><small>${escapeHTML(task.date || "日付なし")} · ${escapeHTML(task.subject || "教科なし")} · ${escapeHTML(task.category || "課題")} · 優先度 ${escapeHTML(task.priority || "中")} · ${escapeHTML(status)}</small>${task.details ? `<p>${escapeHTML(task.details)}</p>` : ""}</div>
        <div class="item-actions"><button type="button" data-task-edit="${escapeHTML(task.id)}">編集</button><button type="button" data-task-delete="${escapeHTML(task.id)}">削除</button></div>
      </article>`;
    }).join("") : '<p class="empty-state">該当する予定はありません。</p>';
    renderPlannerCalendar(tasks);
  }
  function renderPlannerCalendar(tasks) {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    $("#planner-month").textContent = `${year}年 ${month + 1}月`;
    const offset = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < offset; i += 1) cells.push('<span class="calendar-day calendar-day--empty"></span>');
    for (let day = 1; day <= days; day += 1) {
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const count = tasks.filter((task) => task.date === key && (task.status || "未着手") !== "完了").length;
      cells.push(`<button type="button" class="calendar-day${key === todayKey() ? " is-today" : ""}${count ? " has-events" : ""}" data-calendar-date="${key}" aria-label="${key}${count ? `、予定${count}件` : ""}">${day}</button>`);
    }
    $("#planner-calendar").innerHTML = cells.join("");
  }
  $("#planner-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const tasks = currentTasks();
    const taskId = $("#planner-id").value;
    const previous = tasks.find((task) => task.id === taskId);
    const task = {
      ...(previous || {}),
      id: taskId || id(),
      name: $("#planner-name").value.trim(),
      date: $("#planner-date").value,
      subject: $("#planner-subject").value.trim(),
      category: $("#planner-category").value,
      priority: $("#planner-priority").value,
      status: $("#planner-status").value,
      details: $("#planner-details").value.trim(),
      reflect: previous?.reflect ?? true
    };
    const updated = taskId ? tasks.map((item) => item.id === taskId ? task : item) : [...tasks, task];
    write(keys.tasks, updated);
    const events = reminders().filter((item) => !item.sourceTaskId || item.sourceTaskId !== task.id);
    events.push({ id: `ju-count-task-${task.id}`, sourceTaskId: task.id, name: task.name, date: task.date, time: "", note: task.details });
    write(keys.reminders, events);
    $("#planner-form").reset();
    $("#planner-id").value = "";
    $("#planner-form-title").textContent = "予定を追加";
    $("#planner-cancel").hidden = true;
    renderPlanner();
  });
  $("#planner-cancel").addEventListener("click", () => {
    $("#planner-form").reset(); $("#planner-id").value = ""; $("#planner-form-title").textContent = "予定を追加"; $("#planner-cancel").hidden = true;
  });
  $("#planner-list").addEventListener("click", (event) => {
    const editId = event.target.dataset.taskEdit;
    const deleteId = event.target.dataset.taskDelete;
    const tasks = currentTasks();
    if (editId) {
      const task = tasks.find((item) => item.id === editId);
      if (!task) return;
      $("#planner-id").value = task.id; $("#planner-name").value = task.name; $("#planner-date").value = task.date || "";
      $("#planner-subject").value = task.subject || ""; $("#planner-category").value = task.category || "課題";
      $("#planner-priority").value = task.priority || "中"; $("#planner-status").value = task.status || (task.completed ? "完了" : "未着手");
      $("#planner-details").value = task.details || ""; $("#planner-form-title").textContent = "予定を編集"; $("#planner-cancel").hidden = false;
      $("#planner-form").scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (deleteId) {
      write(keys.tasks, tasks.filter((item) => item.id !== deleteId));
      write(keys.reminders, reminders().filter((item) => item.sourceTaskId !== deleteId));
      renderPlanner();
    }
  });
  ["planner-filter-category", "planner-filter-subject", "planner-sort"].forEach((selector) => $(`#${selector}`).addEventListener("change", renderPlanner));
  $("#planner-prev").addEventListener("click", () => { calendarMonth.setMonth(calendarMonth.getMonth() - 1); renderPlanner(); });
  $("#planner-next").addEventListener("click", () => { calendarMonth.setMonth(calendarMonth.getMonth() + 1); renderPlanner(); });
  $("#planner-calendar").addEventListener("click", (event) => {
    const date = event.target.dataset.calendarDate;
    if (!date) return;
    $("#planner-date").value = date;
    $("#planner-list").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function scheduleExceptions() { return list(keys.exceptions); }
  function renderSchedule() {
    const filter = $("#schedule-filter-date").value;
    const entries = scheduleExceptions().filter((entry) => !filter || entry.date === filter).sort((a, b) => `${a.date}${a.start || ""}`.localeCompare(`${b.date}${b.start || ""}`));
    $("#schedule-list").innerHTML = entries.length ? entries.map((entry) => `<article class="item-row"><div class="item-copy"><strong>${escapeHTML(entry.date)} · ${escapeHTML(entry.name)}</strong><small>${escapeHTML(entry.type)}${entry.subject ? ` · 教科: ${escapeHTML(entry.subject)}` : ""}${entry.start ? ` · ${escapeHTML(entry.start)}〜${escapeHTML(entry.end || "")}` : ""}</small>${entry.note ? `<p>${escapeHTML(entry.note)}</p>` : ""}<small>通常時間割への変更なし</small></div><div class="item-actions"><button type="button" data-schedule-delete="${escapeHTML(entry.id)}">削除</button></div></article>`).join("") : '<p class="empty-state">臨時変更はありません。</p>';
  }
  $("#schedule-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const entries = scheduleExceptions();
    entries.push({
      id: id(), date: $("#schedule-date").value, type: $("#schedule-type").value, name: $("#schedule-name").value.trim(),
      subject: $("#schedule-subject").value.trim(), start: $("#schedule-start").value, end: $("#schedule-end").value, note: $("#schedule-note").value.trim()
    });
    write(keys.exceptions, entries);
    $("#schedule-form").reset();
    $("#schedule-date").value = todayKey();
    renderSchedule();
    renderChecklist();
  });
  $("#schedule-filter-date").addEventListener("change", renderSchedule);
  $("#schedule-list").addEventListener("click", (event) => {
    const deleteId = event.target.dataset.scheduleDelete;
    if (!deleteId) return;
    write(keys.exceptions, scheduleExceptions().filter((entry) => entry.id !== deleteId));
    renderSchedule(); renderChecklist();
  });

  function checklistItems() { return list(keys.checklist); }
  function getTodaySubjects() {
    const date = todayKey();
    const exceptions = scheduleExceptions().filter((entry) => entry.date === date && entry.type !== "休講");
    if (exceptions.length) return [...new Set(exceptions.map((entry) => entry.subject || entry.name).filter(Boolean))];
    const mode = localStorage.getItem(keys.mode) || "normal";
    let saved = read(keys.schedules, null);
    if (!saved || typeof saved !== "object") saved = defaultSchedule;
    const periods = Array.isArray(saved[mode]) ? saved[mode] : defaultSchedule.normal;
    return [...new Set(periods.filter((period) => !period.isBreak).map((period) => period.subject || period.name).filter((name) => name && !/活動|給食|清掃|学活|休憩/.test(name)))];
  }
  function itemNeeded(item, date = new Date()) {
    if (Array.isArray(item.weekdays) && item.weekdays.length && !item.weekdays.includes(date.getDay())) return false;
    if (!item.subject) return true;
    return getTodaySubjects().some((subject) => subject.toLowerCase().includes(item.subject.toLowerCase()) || item.subject.toLowerCase().includes(subject.toLowerCase()));
  }
  function itemRow(item, checked, isManaged) {
    return `<article class="item-row${checked ? " is-done" : " is-unchecked"}"><div class="item-copy"><strong>${escapeHTML(item.name)}</strong><small>${item.subject ? `${escapeHTML(item.subject)} · ` : "毎日 · "}${Array.isArray(item.weekdays) && item.weekdays.length ? item.weekdays.map((day) => `${weekdays[day]}曜`).join("・") : "毎日"}</small></div><div class="item-actions">${isManaged ? `<button type="button" data-check-edit="${escapeHTML(item.id)}">編集</button><button type="button" data-check-delete="${escapeHTML(item.id)}">削除</button>` : `<label><input type="checkbox" data-check-toggle="${escapeHTML(item.id)}" ${checked ? "checked" : ""} aria-label="${escapeHTML(item.name)}をチェック"> 済</label>`}</div></article>`;
  }
  function renderChecklist() {
    const items = checklistItems();
    const today = new Date();
    const date = todayKey();
    const needed = items.filter((item) => itemNeeded(item, today));
    const checkedCount = needed.filter((item) => item.checkedOn === date).length;
    $("#checklist-today-title").textContent = `今日の持ち物（${weekdays[today.getDay()]}曜日）`;
    $("#checklist-progress").textContent = `${checkedCount} / ${needed.length} 完了`;
    $("#checklist-list").innerHTML = needed.length ? needed.map((item) => itemRow(item, item.checkedOn === date, false)).join("") : '<p class="empty-state">今日必要な持ち物はありません。登録した持ち物はここに表示されます。</p>';
    $("#checklist-manage").innerHTML = items.length ? items.map((item) => itemRow(item, false, true)).join("") : '<p class="empty-state">持ち物を登録してください。</p>';
  }
  $("#checklist-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const items = checklistItems();
    const weekdaysSelected = Array.from($("#checklist-weekdays").selectedOptions).map((option) => Number(option.value));
    items.push({ id: id(), name: $("#checklist-name").value.trim(), subject: $("#checklist-subject").value.trim(), weekdays: weekdaysSelected });
    write(keys.checklist, items);
    $("#checklist-form").reset();
    renderChecklist();
  });
  $("#checklist-list").addEventListener("change", (event) => {
    const checkId = event.target.dataset.checkToggle;
    if (!checkId) return;
    const items = checklistItems();
    const item = items.find((entry) => entry.id === checkId);
    if (item) item.checkedOn = event.target.checked ? todayKey() : "";
    write(keys.checklist, items);
    renderChecklist();
  });
  $("#checklist-manage").addEventListener("click", (event) => {
    const editId = event.target.dataset.checkEdit;
    const deleteId = event.target.dataset.checkDelete;
    const items = checklistItems();
    if (editId) {
      const item = items.find((entry) => entry.id === editId);
      if (!item) return;
      $("#checklist-name").value = item.name; $("#checklist-subject").value = item.subject || "";
      Array.from($("#checklist-weekdays").options).forEach((option) => { option.selected = (item.weekdays || []).includes(Number(option.value)); });
      write(keys.checklist, items.filter((entry) => entry.id !== editId));
      $("#checklist-form button[type=submit]").textContent = "変更内容で再登録";
      $("#checklist-name").focus();
    } else if (deleteId) {
      write(keys.checklist, items.filter((entry) => entry.id !== deleteId));
    }
    renderChecklist();
  });
  $("#checklist-reset").addEventListener("click", () => {
    const items = checklistItems().map((item) => ({ ...item, checkedOn: "" }));
    write(keys.checklist, items); renderChecklist();
  });

  function decks() { return list(keys.decks); }
  function selectedDeck() { return decks().find((deck) => deck.id === $("#deck-select").value); }
  function renderWords() {
    const allDecks = decks();
    const selectedId = $("#deck-select").value;
    $("#deck-select").innerHTML = allDecks.map((deck) => `<option value="${escapeHTML(deck.id)}">${escapeHTML(deck.name)}</option>`).join("");
    if (allDecks.some((deck) => deck.id === selectedId)) $("#deck-select").value = selectedId;
    const deck = selectedDeck();
    if (!deck) {
      $("#deck-stats").innerHTML = '<p class="empty-state">単語帳を作成してください。</p>';
      $("#word-list").innerHTML = "";
      $("#study-history").innerHTML = '<p class="empty-state">学習履歴はありません。</p>';
      return;
    }
    deck.cards = Array.isArray(deck.cards) ? deck.cards : [];
    const answered = deck.cards.filter((card) => Number(card.correct || 0) + Number(card.wrong || 0) > 0).length;
    const correct = deck.cards.reduce((sum, card) => sum + Number(card.correct || 0), 0);
    const attempts = correct + deck.cards.reduce((sum, card) => sum + Number(card.wrong || 0), 0);
    const weak = deck.cards.filter((card) => Number(card.wrong || 0) > Number(card.correct || 0)).length;
    $("#deck-stats").innerHTML = `<span class="stat">登録単語数<strong>${deck.cards.length}</strong></span><span class="stat">学習済み<strong>${answered}</strong></span><span class="stat">正解率<strong>${attempts ? Math.round(correct / attempts * 100) : 0}%</strong></span><span class="stat">苦手<strong>${weak}</strong></span><span class="stat">カテゴリー<strong>${escapeHTML(deck.category || "未設定")}</strong></span><button class="subtle-button" type="button" data-deck-delete="${escapeHTML(deck.id)}">単語帳を削除</button>`;
    $("#word-list").innerHTML = deck.cards.length ? deck.cards.map((card) => `<article class="item-row"><div class="item-copy"><strong>${escapeHTML(card.front)} → ${escapeHTML(card.back)}</strong>${card.note ? `<small>${escapeHTML(card.note)}</small>` : ""}</div><div class="item-actions"><button type="button" data-word-edit="${escapeHTML(card.id)}">編集</button><button type="button" data-word-delete="${escapeHTML(card.id)}">削除</button></div></article>`).join("") : '<p class="empty-state">単語を追加してください。</p>';
    const history = Array.isArray(deck.history) ? deck.history.slice(-10).reverse() : [];
    $("#study-history").innerHTML = history.length ? history.map((entry) => `<article class="item-row"><div class="item-copy"><strong>${escapeHTML(entry.date)} · ${entry.total}問</strong><small>正解 ${entry.correct} · 不正解 ${entry.wrong}</small></div></article>`).join("") : '<p class="empty-state">学習履歴はありません。</p>';
  }
  $("#deck-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const all = decks();
    const deck = { id: id(), name: $("#deck-name").value.trim(), category: $("#deck-category").value.trim(), description: $("#deck-description").value.trim(), cards: [], history: [] };
    all.push(deck); write(keys.decks, all); $("#deck-form").reset(); renderWords(); $("#deck-select").value = deck.id; renderWords();
  });
  $("#deck-select").addEventListener("change", () => { $("#study-panel").hidden = true; renderWords(); });
  $("#word-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const all = decks();
    const deck = all.find((item) => item.id === $("#deck-select").value);
    if (!deck) { $("#deck-name").focus(); return; }
    const wordId = $("#word-id").value;
    const card = { id: wordId || id(), front: $("#word-front").value.trim(), back: $("#word-back").value.trim(), note: $("#word-note").value.trim(), correct: 0, wrong: 0 };
    const previous = deck.cards.find((item) => item.id === wordId);
    if (previous) { card.correct = previous.correct || 0; card.wrong = previous.wrong || 0; deck.cards = deck.cards.map((item) => item.id === wordId ? card : item); }
    else deck.cards.push(card);
    write(keys.decks, all); $("#word-form").reset(); $("#word-id").value = ""; $("#word-cancel").hidden = true; renderWords();
  });
  $("#word-cancel").addEventListener("click", () => { $("#word-form").reset(); $("#word-id").value = ""; $("#word-cancel").hidden = true; });
  $("#word-list").addEventListener("click", (event) => {
    const editId = event.target.dataset.wordEdit;
    const deleteId = event.target.dataset.wordDelete;
    const all = decks();
    const deck = all.find((item) => item.id === $("#deck-select").value);
    if (!deck) return;
    if (editId) {
      const card = deck.cards.find((item) => item.id === editId);
      if (!card) return;
      $("#word-id").value = card.id; $("#word-front").value = card.front; $("#word-back").value = card.back; $("#word-note").value = card.note || ""; $("#word-cancel").hidden = false;
      $("#word-front").focus();
    } else if (deleteId) {
      deck.cards = deck.cards.filter((card) => card.id !== deleteId); write(keys.decks, all); renderWords();
    }
  });
  $("#deck-stats").addEventListener("click", (event) => {
    const deleteId = event.target.dataset.deckDelete;
    if (!deleteId || !window.confirm("この単語帳と学習履歴を削除しますか？")) return;
    write(keys.decks, decks().filter((deck) => deck.id !== deleteId)); $("#study-panel").hidden = true; renderWords();
  });
  function showStudyCard() {
    const card = studyCards[studyIndex];
    if (!card) {
      $("#study-panel").hidden = true;
      const result = studyCards.result || { correct: 0, wrong: 0 };
      const deck = selectedDeck();
      if (deck) {
        deck.history = [...(deck.history || []), { date: todayKey(), total: result.correct + result.wrong, correct: result.correct, wrong: result.wrong }];
        write(keys.decks, decks());
        $("#study-history").innerHTML = deck.history.slice(-10).reverse().map((entry) => `<article class="item-row"><div class="item-copy"><strong>${escapeHTML(entry.date)} · ${entry.total}問</strong><small>正解 ${entry.correct} · 不正解 ${entry.wrong}</small></div></article>`).join("");
      }
      renderWords();
      return;
    }
    $("#study-panel").hidden = false;
    $("#study-progress").textContent = `${studyIndex + 1} / ${studyCards.length}`;
    $("#study-front").textContent = card.front;
    $("#study-back").textContent = card.back;
    $("#study-note").textContent = card.note || "";
    $("#study-back").hidden = !studyFlipped;
    $("#study-note").hidden = !studyFlipped || !card.note;
    $("#study-rating").hidden = !studyFlipped;
    $("#study-flip").hidden = studyFlipped;
  }
  $("#study-start").addEventListener("click", () => {
    const deck = selectedDeck();
    if (!deck) { $("#deck-name").focus(); return; }
    const mode = $("#study-mode").value;
    studyCards = deck.cards.filter((card) => mode !== "weak" || Number(card.wrong || 0) > Number(card.correct || 0)).map((card) => ({ ...card }));
    if (mode === "shuffle") studyCards.sort(() => Math.random() - .5);
    if (!studyCards.length) { $("#study-panel").hidden = false; $("#study-front").textContent = "出題できる単語がありません。"; $("#study-back").hidden = true; $("#study-rating").hidden = true; return; }
    studyIndex = 0; studyFlipped = false; studyCards.result = { correct: 0, wrong: 0 }; showStudyCard();
  });
  $("#study-flip").addEventListener("click", () => { studyFlipped = true; showStudyCard(); });
  function rateStudy(correct) {
    const current = studyCards[studyIndex];
    const deck = selectedDeck();
    const storedDeck = decks().find((item) => item.id === deck?.id);
    const storedCard = storedDeck?.cards.find((item) => item.id === current.id);
    if (storedCard) storedCard[correct ? "correct" : "wrong"] = Number(storedCard[correct ? "correct" : "wrong"] || 0) + 1;
    studyCards.result[correct ? "correct" : "wrong"] += 1;
    write(keys.decks, decks());
    studyIndex += 1; studyFlipped = false; showStudyCard();
  }
  $("#study-correct").addEventListener("click", () => rateStudy(true));
  $("#study-wrong").addEventListener("click", () => rateStudy(false));
  $("#deck-export").addEventListener("click", () => {
    const deck = selectedDeck();
    if (!deck) return;
    download(`${deck.name}.json`, JSON.stringify(deck, null, 2), "application/json");
  });
  $("#deck-import-button").addEventListener("click", () => $("#deck-import-file").click());
  $("#deck-import-file").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      let imported;
      if (file.name.toLowerCase().endsWith(".csv")) {
        const rows = parseCSV(text);
        const header = rows.shift().map((cell) => cell.trim().toLowerCase());
        const front = header.findIndex((value) => ["front", "表面", "問題", "単語"].includes(value));
        const back = header.findIndex((value) => ["back", "裏面", "回答", "答え", "意味"].includes(value));
        const note = header.findIndex((value) => ["note", "補足", "メモ"].includes(value));
        if (front < 0 || back < 0) throw new Error("CSVの1行目に表面/frontと裏面/backの列が必要です。");
        imported = { name: file.name.replace(/\.csv$/i, ""), category: "", description: "", cards: rows.filter((row) => row[front] && row[back]).map((row) => ({ id: id(), front: row[front], back: row[back], note: note >= 0 ? row[note] || "" : "", correct: 0, wrong: 0 })), history: [] };
      } else {
        const parsed = JSON.parse(text);
        imported = Array.isArray(parsed) ? { name: file.name.replace(/\.json$/i, ""), cards: parsed } : parsed;
        if (!imported || !Array.isArray(imported.cards)) throw new Error("単語帳データにcards配列がありません。");
        imported = { id: id(), name: String(imported.name || file.name), category: String(imported.category || ""), description: String(imported.description || ""), cards: imported.cards.map((card) => ({ id: card.id || id(), front: String(card.front || ""), back: String(card.back || ""), note: String(card.note || ""), correct: Number(card.correct || 0), wrong: Number(card.wrong || 0) })).filter((card) => card.front && card.back), history: Array.isArray(imported.history) ? imported.history : [] };
      }
      if (!imported.cards.length) throw new Error("読み込める単語がありません。");
      const all = decks(); all.push({ ...imported, id: id() }); write(keys.decks, all); renderWords(); $("#deck-select").value = all[all.length - 1].id; renderWords();
    } catch (error) {
      window.alert(`単語帳を読み込めませんでした: ${error.message}`);
    }
    event.target.value = "";
  });
  function parseCSV(text) {
    const rows = []; let row = []; let value = ""; let quoted = false;
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      if (quoted && char === '"' && text[i + 1] === '"') { value += '"'; i += 1; }
      else if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) { row.push(value); value = ""; }
      else if ((char === "\n" || char === "\r") && !quoted) {
        row.push(value); value = "";
        if (row.some((cell) => cell.length)) rows.push(row);
        row = [];
        if (char === "\r" && text[i + 1] === "\n") i += 1;
      } else value += char;
    }
    row.push(value); if (row.some((cell) => cell.length)) rows.push(row);
    if (quoted) throw new Error("CSVの引用符が閉じられていません。");
    return rows;
  }
  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a"); link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function searchIndex() {
    const results = [];
    currentTasks().forEach((task) => results.push({ category: /テスト/.test(task.category || "") ? "テスト予定" : "課題", title: task.name, detail: `${task.date || ""} ${task.subject || ""} ${task.details || ""}`, href: "#planner" }));
    checklistItems().forEach((item) => results.push({ category: "持ち物", title: item.name, detail: `${item.subject || "毎日"} ${(item.weekdays || []).map((day) => weekdays[day] + "曜日").join(" ")}`, href: "#checklist" }));
    scheduleExceptions().forEach((entry) => results.push({ category: "時間割", title: entry.name, detail: `${entry.date} ${entry.type} ${entry.subject || ""} ${entry.note || ""}`, href: "#schedule" }));
    const scheduleData = read(keys.schedules, defaultSchedule) || defaultSchedule;
    Object.values(scheduleData).forEach((periods) => (Array.isArray(periods) ? periods : []).forEach((period) => results.push({ category: "時間割", title: period.subject || period.name, detail: `${period.start || ""} ${period.end || ""}`, href: "#schedule" })));
    reminders().forEach((event) => results.push({ category: "予定", title: event.name, detail: `${event.date || ""} ${event.note || ""}`, href: "ju-reminder.html" }));
    list(keys.memos).forEach((memo) => results.push({ category: "授業メモ", title: memo.title || "無題", detail: memo.body || "", href: "memo.html" }));
    decks().forEach((deck) => {
      results.push({ category: "単語帳", title: deck.name, detail: `${deck.category || ""} ${deck.description || ""}`, href: "#words" });
      (deck.cards || []).forEach((card) => results.push({ category: "単語帳", title: card.front, detail: `${card.back} ${card.note || ""}`, href: "#words" }));
    });
    return results;
  }
  function renderSearch() {
    const query = $("#global-search").value.trim().toLocaleLowerCase();
    const category = $("#search-category").value;
    if (!query) { $("#search-results").innerHTML = '<p class="empty-state">キーワードを入力すると検索結果を表示します。</p>'; return; }
    const matches = searchIndex().filter((item) => (!category || item.category === category) && `${item.title} ${item.detail} ${item.category}`.toLocaleLowerCase().includes(query));
    $("#search-results").innerHTML = matches.length ? matches.map((item) => `<a class="item-row search-result" href="${escapeHTML(item.href)}"><div class="item-copy"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.category)} · ${escapeHTML(item.detail)}</small></div><span aria-hidden="true">→</span></a>`).join("") : '<p class="empty-state">一致する情報はありません。別のキーワードを試してください。</p>';
    const history = list(keys.searchHistory);
    if (!history.includes($("#global-search").value.trim())) write(keys.searchHistory, [$("#global-search").value.trim(), ...history].slice(0, 8));
    renderSearchHistory();
  }
  function renderSearchHistory() {
    const history = list(keys.searchHistory);
    $("#search-history").innerHTML = history.length ? history.map((item) => `<button type="button" data-search-query="${escapeHTML(item)}">${escapeHTML(item)}</button>`).join("") : '<span class="muted">検索履歴はありません。</span>';
  }
  $("#global-search").addEventListener("input", renderSearch);
  $("#search-category").addEventListener("change", renderSearch);
  $("#search-history").addEventListener("click", (event) => { const query = event.target.dataset.searchQuery; if (query) { $("#global-search").value = query; renderSearch(); } });
  $("#search-history-clear").addEventListener("click", () => { write(keys.searchHistory, []); renderSearchHistory(); });
  $("#search-results").addEventListener("click", (event) => {
    const anchor = event.target.closest("a");
    if (!anchor || !anchor.getAttribute("href").startsWith("#")) return;
    event.preventDefault(); navigate(anchor.getAttribute("href").slice(1));
  });

  function renderConnection() {
    const online = navigator.onLine;
    $("#connection-status").textContent = online ? "オンライン · データはこの端末に保存されています" : "オフライン · 保存済みデータを利用できます";
    $("#connection-status").classList.toggle("offline", !online);
  }
  window.addEventListener("online", renderConnection);
  window.addEventListener("offline", renderConnection);
  renderConnection();
  function exportBackup() {
    const backup = {};
    Object.values(keys).filter((key) => key !== "oldReminders").forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try { backup[key] = JSON.parse(raw); } catch (error) { console.error(`バックアップに含められないデータがあります: ${key}`, error); }
      }
    });
    download(`ju-count-backup-${todayKey()}.json`, JSON.stringify({ format: "ju-count-backup", version: 1, exportedAt: new Date().toISOString(), data: backup }, null, 2), "application/json");
  }
  $("#backup-export").addEventListener("click", exportBackup);
  $("#backup-import").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const data = parsed.data && parsed.format === "ju-count-backup" ? parsed.data : parsed;
      const allowed = Object.values(keys).filter((key) => key !== "oldReminders");
      const entries = Object.entries(data).filter(([key, value]) => allowed.includes(key) && value !== undefined);
      if (!entries.length) throw new Error("対応するju!countデータが見つかりません。");
      if (!window.confirm(`${entries.length}種類のデータを復元します。現在の同じ種類のデータは置き換わります。続行しますか？`)) return;
      entries.forEach(([key, value]) => write(key, value));
      $("#backup-message").textContent = "復元しました。画面を再読み込みします。";
      setTimeout(() => location.reload(), 700);
    } catch (error) {
      $("#backup-message").textContent = `復元できませんでした: ${error.message}`;
    } finally { event.target.value = ""; }
  });
  window.addEventListener("storage", (event) => {
    if ([keys.tasks, keys.planner, keys.checklist, keys.exceptions, keys.decks, keys.schedules, keys.reminders, keys.memos].includes(event.key)) {
      renderPlanner(); renderSchedule(); renderChecklist(); renderWords();
    }
  });
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); installPrompt = event; $("#install-app").hidden = false; $("#install-help").textContent = "ボタンからホーム画面に追加できます。";
  });
  $("#install-app").addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null; $("#install-app").hidden = true;
  });
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("ju-tools-sw.js").catch((error) => console.error("オフライン機能を準備できませんでした。", error));
  }

  $("#planner-date").value = todayKey();
  $("#schedule-date").value = todayKey();
  renderPlanner(); renderSchedule(); renderChecklist(); renderWords(); renderSearchHistory();
})();

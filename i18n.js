(() => {
  const languageKey = "ju-tools-language";
  const supportedLanguages = ["ja", "en", "zh"];
  const messages = [
    ["表示言語", "Language", "显示语言"],
    ["設定を開く", "Open settings", "打开设置"],
    ["設定を閉じる", "Close settings", "关闭设置"],
    ["前の月", "Previous month", "上个月"],
    ["次の月", "Next month", "下个月"],
    ["カレンダー", "Calendar", "日历"],
    ["「校時,名称,開始時刻,終了時刻」の列を含むCSVに対応します。校時は normal / short / test または通常校時 / 短縮校時 / テスト校時で指定してください。", "CSV must include the columns: mode, name, start time, end time. Use normal, short, or test for the mode.", "CSV 必须包含以下列：校时、名称、开始时间、结束时间。校时可填写 normal、short 或 test。"],
    ["ju!tool ホーム", "ju!tool Home", "ju!tool 首页"],
    ["メニュー", "Menu", "菜单"],
    ["アプリメニュー", "App menu", "应用菜单"],
    ["サイト情報", "Site information", "网站信息"],
    ["現在、メンテナンス中です。ご不便をおかけしますが、しばらくお待ちください。", "We are currently performing maintenance. We apologize for the inconvenience and appreciate your patience.", "目前正在进行维护。给您带来不便，敬请谅解。"],
    ["プライバシーポリシー", "Privacy policy", "隐私政策"],
    ["利用規約", "Terms of use", "使用条款"],
    ["校時表とカウントダウン", "Timetable and countdown", "课程表与倒计时"],
    ["ちょっと便利なメモ", "A handy memo", "便捷备忘录"],
    ["予定とリマインダー", "Plans and reminders", "计划与提醒"],
    ["メニューを開く", "Open menu", "打开菜单"],
    ["メニューを閉じる", "Close menu", "关闭菜单"],
    ["ダークモードに切り替え", "Toggle dark mode", "切换深色模式"],
    ["現在の時限", "Current period", "当前课时"],
    ["休み時間中", "Break time", "休息时间"],
    ["授業前 / 休憩中", "Before class / break", "上课前 / 休息中"],
    ["本日の校時", "Today's timetable", "今日课程表"],
    ["読み込み中", "Loading", "正在加载"],
    ["終了まで", "Until end", "距离结束"],
    ["授業終了まで", "Until class ends", "距离课程结束"],
    ["開始まで", "Until start", "距离开始"],
    ["次の授業まで", "Until next class", "距离下节课"],
    ["すべての校時が終了", "All periods are over", "今天的课程已结束"],
    ["お疲れ様でした！", "Great work today!", "今天辛苦了！"],
    ["次の予定はありません", "No upcoming period", "没有下一个课时"],
    ["直近の課題", "Upcoming assignments", "近期作业"],
    ["手入力", "Manual entry", "手动输入"],
    ["メニューから課題を手入力で登録できます。", "Add assignments manually from the menu.", "可从菜单手动添加作业。"],
    ["時刻は端末の現在時刻を使用しています", "Times use your device's current time.", "时间使用设备的当前时间。"],
    ["課題カレンダー", "Assignment calendar", "作业日历"],
    ["課題を手入力で登録できます。", "Add assignments manually.", "可手动添加作业。"],
    ["課題を登録", "Add assignment", "添加作业"],
    ["課題名", "Assignment", "作业名称"],
    ["提出日", "Due date", "截止日期"],
    ["詳細", "Details", "详情"],
    ["ju!countに反映", "Show in ju!count", "同步到 ju!count"],
    ["保存", "Save", "保存"],
    ["設定", "Settings", "设置"],
    ["ダークモード", "Dark mode", "深色模式"],
    ["暗い場所でも見やすい配色にします", "Use a color scheme that's easier to see in the dark.", "使用更适合暗处的配色。"],
    ["校時", "Timetable mode", "课程表模式"],
    ["通常校時", "Regular", "常规"],
    ["短縮校時", "Shortened", "缩短"],
    ["テスト校時", "Exam", "考试"],
    ["時間割の編集・保存", "Edit and save timetable", "编辑并保存课程表"],
    ["時間割を編集", "Edit timetable", "编辑课程表"],
    ["時間割を初期状態に戻す", "Reset timetable to defaults", "将课程表恢复为默认值"],
    ["時間割を初期状態に戻しました。", "Timetable reset to its defaults.", "课程表已恢复为默认值。"],
    ["編集する校時", "Mode to edit", "编辑模式"],
    ["CSVから時間割を追加", "Add timetable from CSV", "从 CSV 添加课程表"],
    ["＋ 時限を追加", "＋ Add period", "＋ 添加课时"],
    ["グループとして保存", "Save as group", "保存为分组"],
    ["保存するグループ名", "Group name", "分组名称"],
    ["保存済みグループ", "Saved groups", "已保存的分组"],
    ["選択してください", "Select a group", "请选择"],
    ["読み込む", "Load", "加载"],
    ["テーマカラー", "Theme color", "主题颜色"],
    ["カスタムカラー（単色）", "Custom solid color", "自定义纯色"],
    ["カスタムカラー", "Custom color", "自定义颜色"],
    ["ブルー", "Blue", "蓝色"],
    ["パープル", "Purple", "紫色"],
    ["オレンジ", "Orange", "橙色"],
    ["ピンク", "Pink", "粉色"],
    ["ティール", "Teal", "蓝绿色"],
    ["グリーン", "Green", "绿色"],
    ["ブラウン", "Brown", "棕色"],
    ["ブルーグレー", "Blue gray", "蓝灰色"],
    ["ローズ", "Rose", "玫瑰色"],
    ["インディゴ", "Indigo", "靛蓝色"],
    ["スレート", "Slate", "石板灰"],
    ["虹色", "Rainbow", "彩虹色"],
    ["虹色アニメーションの設定", "Rainbow animation settings", "彩虹动画设置"],
    ["授業終了のクラッカー", "End-of-class confetti", "下课彩纸"],
    ["授業終了時に表示するクラッカーの量を設定できます。", "Choose how much confetti appears when class ends.", "设置课程结束时显示的彩纸数量。"],
    ["クラッカー設定・プレビュー", "Confetti settings and preview", "彩纸设置与预览"],
    ["本日の校時を表示", "Show today's timetable", "显示今日课程表"],
    ["本日の校時を閉じる", "Hide today's timetable", "隐藏今日课程表"],
    ["虹色アニメーション", "Rainbow animation", "彩虹动画"],
    ["色が一周する時間", "Time for colors to cycle", "颜色循环时间"],
    ["速い", "Fast", "快"],
    ["ゆっくり", "Slow", "慢"],
    ["秒数が小さいほど速く、大きいほどゆっくり動きます。", "Lower values are faster; higher values are slower.", "数值越小速度越快，数值越大速度越慢。"],
    ["色の移動方向", "Color direction", "颜色移动方向"],
    ["左から右", "Left to right", "从左到右"],
    ["右から左", "Right to left", "从右到左"],
    ["虹色の配色", "Rainbow colors", "彩虹配色"],
    ["色を初期配色に戻す", "Reset colors", "恢复默认配色"],
    ["クラッカー設定", "Confetti settings", "彩纸设置"],
    ["今日の校時を選択", "Choose today's timetable", "选择今日课程表"],
    ["使用する校時表を選んでください。あとから設定で変更できます。", "Choose a timetable. You can change it later in Settings.", "请选择课程表，之后可在设置中更改。"],
    ["いつもの時間割", "Regular timetable", "常规课程表"],
    ["短縮された時間割", "Shortened timetable", "缩短课程表"],
    ["テスト期間の時間割", "Exam timetable", "考试课程表"],
    ["校時の初期設定", "Initial timetable setup", "初始课程表设置"],
    ["名称", "Name", "名称"],
    ["開始時刻", "Start time", "开始时间"],
    ["終了時刻", "End time", "结束时间"],
    ["グループ名を入力してください。", "Enter a group name.", "请输入分组名称。"],
    ["課題を保存しました。", "Assignment saved.", "作业已保存。"],
    ["ju!memo - ju!tool", "ju!memo - ju!tool", "ju!memo - ju!tool"],
    ["メモを追加", "Add memo", "添加备忘录"],
    ["メモを整理", "Organize memos", "整理备忘录"],
    ["メモを検索", "Search memos", "搜索备忘录"],
    ["メモを検索...", "Search memos...", "搜索备忘录..."],
    ["タグで絞り込み", "Filter by tag", "按标签筛选"],
    ["すべて", "All", "全部"],
    ["メモの色", "Memo color", "备忘录颜色"],
    ["色を変更", "Change color", "更改颜色"],
    ["メモのタイトル", "Memo title", "备忘录标题"],
    ["メモの内容", "Memo content", "备忘录内容"],
    ["本文の書式", "Text formatting", "正文格式"],
    ["チェックリストを挿入", "Insert checklist item", "插入清单项"],
    ["箇条書きを挿入", "Insert bullet", "插入项目符号"],
    ["番号付きリストを挿入", "Insert numbered item", "插入编号项"],
    ["太字", "Bold", "粗体"],
    ["見出し", "Heading", "标题"],
    ["プレビュー", "Preview", "预览"],
    ["本文を入力すると、ここにプレビューが表示されます。", "Your formatted memo preview will appear here.", "输入正文后，格式预览会显示在这里。"],
    ["ここに書き残す...", "Write something...", "在此记录..."],
    ["タグを追加（例: 学校, アイデア）", "Add tags (e.g. school, ideas)", "添加标签（例如：学校、灵感）"],
    ["タグ", "Tags", "标签"],
    ["削除", "Delete", "删除"],
    ["見つかりませんでした", "No results found", "未找到结果"],
    ["検索条件やタグを変えてみてください。", "Try changing your search or tag.", "请尝试更改搜索条件或标签。"],
    ["まだメモがありません", "No memos yet", "还没有备忘录"],
    ["＋ボタンから最初のメモを作りましょう。", "Use + to create your first memo.", "点击＋创建第一条备忘录。"],
    ["新しいメモ", "New memo", "新备忘录"],
    ["ju!reminder", "ju!reminder", "ju!reminder"],
    ["PLAN YOUR DAY", "PLAN YOUR DAY", "规划每一天"],
    ["＋ 予定を追加", "＋ Add reminder", "＋ 添加提醒"],
    ["今日", "Today", "今天"],
    ["予定一覧", "Reminders", "提醒列表"],
    ["予定を追加", "Add reminder", "添加提醒"],
    ["NEW REMINDER", "NEW REMINDER", "新建提醒"],
    ["予定追加を閉じる", "Close reminder form", "关闭提醒表单"],
    ["予定", "Reminder", "提醒"],
    ["日付", "Date", "日期"],
    ["時刻（任意）", "Time (optional)", "时间（可选）"],
    ["メモ", "Note", "备注"],
    ["保存する", "Save", "保存"],
    ["例：数学の宿題", "e.g. Math homework", "例如：数学作业"],
    ["場所や持ち物など", "Location, items to bring, etc.", "地点、携带物品等"],
    ["予定はまだありません。カレンダーの日付をクリックして追加できます。", "No reminders yet. Select a date on the calendar to add one.", "还没有提醒。点击日历日期即可添加。"],
    ["ju!tool", "ju!tool", "ju!tool"],
    ["school life tools", "school life tools", "校园生活工具"],
    ["ju!toolのアプリ", "ju!tool apps", "ju!tool 应用"],
    ["校時の進捗", "Period progress", "课时进度"],
    ["課題登録を閉じる", "Close assignment form", "关闭作业表单"],
    ["時間割編集を閉じる", "Close timetable editor", "关闭课程表编辑器"],
    ["アニメーション設定を閉じる", "Close animation settings", "关闭动画设置"],
    ["虹色の色1", "Rainbow color 1", "彩虹颜色 1"],
    ["虹色の色2", "Rainbow color 2", "彩虹颜色 2"],
    ["虹色の色3", "Rainbow color 3", "彩虹颜色 3"],
    ["虹色の色4", "Rainbow color 4", "彩虹颜色 4"],
    ["虹色の色5", "Rainbow color 5", "彩虹颜色 5"],
    ["虹色の色6", "Rainbow color 6", "彩虹颜色 6"],
    ["普通（32個）", "Normal (32)", "普通（32 个）"],
    ["少なめ（12個）", "Few (12)", "较少（12 个）"],
    ["多め（60個）", "More (60)", "较多（60 个）"],
    ["とても多い（100個）", "Many (100)", "很多（100 个）"],
    ["なし", "None", "无"],
    ["カレンダーの日付をクリックして追加できます。", "Select a calendar date to add one.", "点击日历日期即可添加。"],
    ["残り時間", "Time remaining", "剩余时间"],
    ["時限の進捗", "Period progress", "课时进度"],
    ["クラッカーの量", "Confetti amount", "彩纸数量"],
    ["量を少なくすると、端末への負荷を抑えられます。", "Fewer pieces reduce the load on your device.", "减少数量可降低设备负载。"],
    ["大量（100個）", "Many (100)", "大量（100 个）"],
    ["← ju!tool", "← ju!tool", "← ju!tool"],
    ["すべての予定", "All reminders", "所有提醒"],
    ["チャイム済み", "Bell has rung", "铃声已响"],
    ["通常", "Regular", "常规"],
    ["短縮", "Shortened", "缩短"],
    ["テスト", "Exam", "考试"],
    ["無題", "Untitled", "无标题"],
    ["新しい予定", "New event", "新日程"],
    ["接続中", "Connecting", "正在连接"],
    ["課題を取得できませんでした。Googleカレンダーの権限を確認してください。", "Could not load assignments. Check Google Calendar permissions.", "无法获取作业，请检查 Google 日历权限。"],
    ["Google CloudのOAuthクライアントIDをscript.jsのGOOGLE_CLIENT_IDに設定してください。", "Set the Google Cloud OAuth client ID in GOOGLE_CLIENT_ID in script.js.", "请在 script.js 的 GOOGLE_CLIENT_ID 中设置 Google Cloud OAuth 客户端 ID。"],
    ["CSVの引用符の後に不正な文字があります。", "Unexpected character after a CSV quote.", "CSV 引号后存在无效字符。"],
    ["CSVの引用符が閉じられていません。", "A CSV quote is not closed.", "CSV 引号未闭合。"],
    ["CSVに読み込めるデータがありません。", "The CSV has no data to import.", "CSV 中没有可导入的数据。"],
    ["CSVの1行目に「校時,名称,開始時刻,終了時刻」の列が必要です。", "The first CSV row must contain mode, name, start time, and end time columns.", "CSV 第一行必须包含校时、名称、开始时间和结束时间列。"],
    ["CSVに読み込める時間割がありません。", "No timetable entries were found in the CSV.", "CSV 中没有可导入的课时。"],
    ["じゅかうんと", "ju!tool", "ju!tool"],
    ["ju!tool - 学校生活を支えるツール", "ju!tool - Tools for school life", "ju!tool - 校园生活工具"],
    ["校時表に合わせて現在の時限と残り時間を表示する、ju!count。", "ju!count shows the current class period and time remaining.", "ju!count 显示当前课时和剩余时间。"],
    ["ju!countool メモ", "ju!memo", "ju!memo"],
    ["月", "Mon", "一"],
    ["火", "Tue", "二"],
    ["水", "Wed", "三"],
    ["木", "Thu", "四"],
    ["金", "Fri", "五"],
    ["土", "Sat", "六"],
    ["日", "Sun", "日"],
    ["放課後 - ju!count", "After school - ju!count", "放学后 - ju!count"],
    ["Googleログイン機能を読み込み中です。少し待ってから再試行してください。", "Loading Google sign-in. Wait a moment and try again.", "正在加载 Google 登录，请稍候再试。"],
    ["Googleカレンダーへの接続に失敗しました。", "Could not connect to Google Calendar.", "无法连接到 Google 日历。"],
    ["今後30日間の予定を表示しています。", "Showing events for the next 30 days.", "正在显示未来 30 天的日程。"],
    ["予定を取得できませんでした。Googleカレンダーの権限を確認してください。", "Could not load events. Check Google Calendar permissions.", "无法获取日程，请检查 Google 日历权限。"],
    ["プレビュー", "Preview", "预览"],
    ["もう一度試してください。", "Please try again.", "请重试。"],
    ["プライバシーポリシー系統", "Privacy policy", "隐私政策"],
    ["朝活動・学活", "Morning activities / homeroom", "晨间活动 / 班会"],
    ["給食準備・給食", "Lunch preparation / lunch", "午餐准备 / 午餐"],
    ["清掃", "Cleaning", "打扫"],
    ["昼休み", "Lunch break", "午休"],
    ["学活", "Homeroom", "班会"],
    ["1時間目", "Period 1", "第 1 节"],
    ["2時間目", "Period 2", "第 2 节"],
    ["3時間目", "Period 3", "第 3 节"],
    ["4時間目", "Period 4", "第 4 节"],
    ["5時間目", "Period 5", "第 5 节"],
    ["6時間目", "Period 6", "第 6 节"],
    ["1時間目（テスト）", "Period 1 (exam)", "第 1 节（考试）"],
    ["2時間目（テスト）", "Period 2 (exam)", "第 2 节（考试）"],
    ["3時間目（テスト）", "Period 3 (exam)", "第 3 节（考试）"],
    ["4時間目（テスト）", "Period 4 (exam)", "第 4 节（考试）"],
    ["5時間目（テスト）", "Period 5 (exam)", "第 5 节（考试）"],
    ["6時間目（テスト）", "Period 6 (exam)", "第 6 节（考试）"],
    ["休憩", "Break", "休息"]
  ];
  const translations = {
    en: Object.fromEntries(messages.map(([source, english]) => [source, english])),
    zh: Object.fromEntries(messages.map(([source, , chinese]) => [source, chinese]))
  };
  const sourceValues = new WeakMap();
  const attributeSources = new WeakMap();
  const translatableAttributes = ["aria-label", "title", "placeholder", "content"];

  function translateSource(source, language) {
    if (language === "ja") return source;
    const exact = translations[language][source];
    if (exact) return exact;
    let match = /^(\d+)年\s*(\d+)月$/.exec(source);
    if (match) return language === "en" ? `${match[2]}/${match[1]}` : `${match[1]}年${match[2]}月`;
    match = /^(\d{1,2})月(\d{1,2})日\(([日月火水木金土])\)$/.exec(source);
    if (match) {
      const weekdayIndex = ["日", "月", "火", "水", "木", "金", "土"].indexOf(match[3]);
      if (language === "en") return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(match[1]) - 1]} ${match[2]} (${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][weekdayIndex]})`;
      return `${match[1]}月${match[2]}日（星期${["日", "一", "二", "三", "四", "五", "六"][weekdayIndex]}）`;
    }
    match = /^\+(\d+)件$/.exec(source);
    if (match) return language === "en" ? `+${match[1]} more` : `+${match[1]} 项`;
    match = /^(\d+)件$/.exec(source);
    if (match) return language === "en" ? `${match[1]} items` : `${match[1]} 项`;
    match = /^(\d+)コマ$/.exec(source);
    if (match) return language === "en" ? `Period ${match[1]}` : `第 ${match[1]} 节`;
    match = /^(\d+)行目の列数がヘッダーと一致しません。$/.exec(source);
    if (match) return language === "en" ? `Row ${match[1]} has a different number of columns than the header.` : `第 ${match[1]} 行的列数与标题行不一致。`;
    match = /^(\d+)行目の校時は normal \/ short \/ test のいずれかで指定してください。$/.exec(source);
    if (match) return language === "en" ? `Row ${match[1]} must use normal, short, or test as the mode.` : `第 ${match[1]} 行的校时必须填写 normal、short 或 test。`;
    match = /^(\d+)行目の名称が空です。$/.exec(source);
    if (match) return language === "en" ? `The name is empty on row ${match[1]}.` : `第 ${match[1]} 行的名称为空。`;
    match = /^(\d+)行目の時刻が不正です。開始時刻・終了時刻をHH:MM形式で指定してください。$/.exec(source);
    if (match) return language === "en" ? `Invalid time on row ${match[1]}. Use HH:MM for the start and end times.` : `第 ${match[1]} 行的时间无效。请使用 HH:MM 格式。`;
    match = /^チャイムまで: (\d+)秒$/.exec(source);
    if (match) return language === "en" ? `Bell in: ${match[1]}s` : `距离铃声：${match[1]} 秒`;
    match = /^(.+)を削除$/.exec(source);
    if (match) return language === "en" ? `Delete ${match[1]}` : `删除${match[1]}`;
    match = /^「(.+)」を保存しました。$/.exec(source);
    if (match) return language === "en" ? `Saved "${match[1]}".` : `已保存“${match[1]}”。`;
    match = /^「(.+)」を読み込みました。(?:次回起動時から反映されます。|時間割に反映しました。)$/.exec(source);
    if (match) return language === "en" ? `Loaded "${match[1]}" and applied it to the timetable.` : `已加载“${match[1]}”并应用到课程表。`;
    match = /^CSVから(\d+)件追加しました（(.+)）。$/.exec(source);
    if (match) {
      const summary = match[2]
        .replaceAll("通常校時", language === "en" ? "Regular" : "常规")
        .replaceAll("短縮校時", language === "en" ? "Shortened" : "缩短")
        .replaceAll("テスト校時", language === "en" ? "Exam" : "考试")
        .replaceAll("件", language === "en" ? " items" : " 项");
      return language === "en" ? `Added ${match[1]} timetable entries from CSV (${summary}).` : `已从 CSV 添加 ${match[1]} 项课时（${summary}）。`;
    }
    match = /^CSVを読み込めませんでした: (.+)$/.exec(source);
    if (match) return language === "en" ? `Could not read CSV: ${translateSource(match[1], language)}` : `无法读取 CSV：${translateSource(match[1], language)}`;
    match = /^次: (.+) \((.+)〜\)$/.exec(source);
    if (match) return language === "en" ? `Next: ${translateSource(match[1], language)} (${match[2]})` : `下一节：${translateSource(match[1], language)}（${match[2]}）`;
    return source;
  }

  function translateTextNode(node, language) {
    const current = node.nodeValue;
    const state = sourceValues.get(node);
    const source = state && current === state.translated ? state.source : current;
    if (!source.trim()) {
      sourceValues.set(node, { source, translated: current });
      return;
    }
    const leading = source.match(/^\s*/)[0];
    const trailing = source.match(/\s*$/)[0];
    const content = source.slice(leading.length, source.length - trailing.length || undefined);
    const translated = `${leading}${translateSource(content, language)}${trailing}`;
    if (current !== translated) node.nodeValue = translated;
    sourceValues.set(node, { source, translated });
  }

  function translateAttribute(element, name, language) {
    const current = element.getAttribute(name);
    const states = attributeSources.get(element) || new Map();
    const state = states.get(name);
    const source = state && current === state.translated ? state.source : current;
    const translated = translateSource(source, language);
    if (current !== translated) element.setAttribute(name, translated);
    states.set(name, { source, translated });
    attributeSources.set(element, states);
  }

  function translateNode(node, language) {
    if (node.nodeType === Node.TEXT_NODE) {
      translateTextNode(node, language);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    translatableAttributes.forEach((attribute) => {
      if (node.hasAttribute(attribute)) translateAttribute(node, attribute, language);
    });
    node.childNodes.forEach((child) => translateNode(child, language));
  }

  function browserLanguage() {
    const browserValue = (navigator.language || "").toLowerCase();
    if (browserValue.startsWith("zh")) return "zh";
    if (browserValue.startsWith("en")) return "en";
    return "ja";
  }

  const selector = document.querySelector("[data-language-selector]");
  if (!selector) return;
  let language = localStorage.getItem(languageKey);
  if (!supportedLanguages.includes(language)) language = browserLanguage();

  function applyLanguage(nextLanguage) {
    if (!supportedLanguages.includes(nextLanguage)) return;
    language = nextLanguage;
    localStorage.setItem(languageKey, language);
    document.documentElement.lang = language;
    selector.value = language;
    translateNode(document.documentElement, language);
    document.dispatchEvent(new CustomEvent("ju-tools-language-change", { detail: { language } }));
  }

  selector.addEventListener("change", () => applyLanguage(selector.value));
  applyLanguage(language);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "characterData") {
        translateTextNode(mutation.target, language);
      } else if (mutation.type === "attributes") {
        translateAttribute(mutation.target, mutation.attributeName, language);
      } else {
        mutation.addedNodes.forEach((node) => translateNode(node, language));
      }
    });
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: translatableAttributes
  });
})();

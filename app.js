(() => {
  const { order, dictionary } = window.LineLoopLocales;
  const demoLanguages = ["en", "es", "fr", "de", "ru"];
  const lessons = {
    en: [
      { text: "The street gets quiet after sunset.", translation: "日落后，街道渐渐安静下来。" },
      { text: "I usually take the long way home.", translation: "我通常会绕远路回家。" },
      { text: "There is a little café on the corner.", translation: "街角有一家小咖啡馆。" }
    ],
    es: [
      { text: "La calle se queda tranquila al atardecer.", translation: "日落时，街道安静了下来。" },
      { text: "Normalmente vuelvo a casa por el camino largo.", translation: "我通常绕远路回家。" },
      { text: "Hay una pequeña cafetería en la esquina.", translation: "街角有一家小咖啡馆。" }
    ],
    fr: [
      { text: "La rue devient calme après le coucher du soleil.", translation: "日落后，街道渐渐安静。" },
      { text: "Je prends souvent le chemin le plus long pour rentrer.", translation: "我经常绕远路回家。" },
      { text: "Il y a un petit café au coin de la rue.", translation: "街角有一家小咖啡馆。" }
    ],
    de: [
      { text: "Nach Sonnenuntergang wird es auf der Straße ruhig.", translation: "日落后，街道变得安静。" },
      { text: "Ich nehme meistens den längeren Weg nach Hause.", translation: "我通常绕远路回家。" },
      { text: "An der Ecke gibt es ein kleines Café.", translation: "街角有一家小咖啡馆。" }
    ],
    ru: [
      { text: "После заката улица становится тихой.", translation: "日落后，街道变得安静。" },
      { text: "Обычно я иду домой длинной дорогой.", translation: "我通常绕远路回家。" },
      { text: "На углу есть маленькое кафе.", translation: "街角有一家小咖啡馆。" }
    ]
  };
  const timings = [{ start: 8, end: 12 }, { start: 22, end: 27 }, { start: 27, end: 32 }];
  const caption = document.getElementById("video-caption");
  const translation = document.getElementById("player-translation");
  const progress = document.getElementById("demo-progress");
  const time = document.getElementById("demo-time");
  const toggle = document.getElementById("demo-toggle");
  const next = document.getElementById("demo-next");
  const icon = document.getElementById("play-icon");
  const rows = [...document.querySelectorAll("[data-demo-row]")];
  const websiteSelect = document.getElementById("site-language");
  const demoSelects = [document.getElementById("demo-language"), document.getElementById("demo-language-mobile")];
  const detail = document.getElementById("sequence-detail");
  const steps = [...document.querySelectorAll(".sequence-step")];
  const originalNodes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement?.closest("script, style, option, #video-caption, #player-translation, [data-demo-row], #sequence-detail, .sequence-quote, .follow-card")) continue;
    if (node.textContent.trim()) originalNodes.push({ node, source: node.textContent });
  }
  const originalAttributes = [];
  document.querySelectorAll("[aria-label], [alt]").forEach(element => {
    for (const name of ["aria-label", "alt"]) {
      const source = element.getAttribute(name);
      if (source) originalAttributes.push({ element, name, source });
    }
  });
  const originalTitle = document.title;
  const description = document.querySelector('meta[name="description"]');
  const originalDescription = description.content;
  let locale = "zh-CN";
  let demoLanguage = "en";
  let manuallySelectedDemo = false;
  let current = 1;
  let wordIndex = 1;
  let timer = null;
  let selectedStep = 0;

  function translate(source) { return dictionary[locale].get(source) || source; }
  function clock(seconds) { return "00:" + String(Math.round(seconds)).padStart(2, "0"); }
  function findLocale(value) {
    if (!value) return null;
    const normalized = value.toLowerCase();
    if (normalized === "zh" || normalized.startsWith("zh-")) return /tw|hk|mo|hant/.test(normalized) ? "zh-TW" : "zh-CN";
    return order.find(item => item === normalized.split("-")[0]) || null;
  }
  function readPreference() {
    try { return window.localStorage.getItem("lineloop-site-language"); } catch { return null; }
  }
  function savePreference(value) {
    try { window.localStorage.setItem("lineloop-site-language", value); } catch { /* Private browsing still works. */ }
  }
  function applyLocale(value) {
    locale = value;
    document.documentElement.lang = locale;
    websiteSelect.value = locale;
    originalNodes.forEach(({ node, source }) => {
      if (!node.isConnected) return;
      const key = source.trim();
      const translated = dictionary[locale].get(key);
      if (translated) node.textContent = source.replace(key, translated);
    });
    originalAttributes.forEach(({ element, name, source }) => {
      element.setAttribute(name, translate(source));
    });
    document.title = translate(originalTitle);
    description.content = translate(originalDescription);
    document.getElementById("demo-language-label").textContent = translate("视频语言");
    const websiteLabel = {
      "zh-CN": "网站语言", "zh-TW": "網站語言", en: "Website language", es: "Idioma del sitio",
      fr: "Langue du site", de: "Websitesprache", ru: "Язык сайта"
    }[locale];
    websiteSelect.setAttribute("aria-label", websiteLabel);
    document.querySelector(".locale-picker .sr-only").textContent = websiteLabel;
    demoSelects.forEach(select => select.setAttribute("aria-label", translate("视频语言")));
    document.querySelector(".demo-language-picker .sr-only").textContent = translate("视频语言");
    toggle.setAttribute("aria-label", translate(timer === null ? "播放界面演示" : "暂停界面演示"));
    render();
    renderSequence();
  }
  function renderSequence() {
    const descriptions = [
      "先听视频里的真实声音，试着捕捉熟悉的词。",
      "再听一遍中文，确认这句话的意思。",
      "回到原声，看看这次能否直接听懂。"
    ];
    detail.textContent = translate(descriptions[selectedStep]);
  }
  function render() {
    const lesson = lessons[demoLanguage][current];
    const words = lesson.text.split(/\s+/);
    caption.replaceChildren();
    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.textContent = word + (index < words.length - 1 ? " " : "");
      if (index === wordIndex) span.className = "spoken";
      caption.append(span);
    });
    translation.textContent = lesson.translation;
    rows.forEach((row, index) => {
      row.classList.toggle("current", index === current);
      row.querySelector("p").textContent = lessons[demoLanguage][index].text;
      row.querySelector("em")?.remove();
      if (index === current) {
        const meaning = document.createElement("em");
        meaning.textContent = lesson.translation;
        row.append(meaning);
      }
    });
    const fraction = (wordIndex + 1) / words.length;
    progress.style.width = Math.round(fraction * 100) + "%";
    time.textContent = clock(timings[current].start + fraction * (timings[current].end - timings[current].start)) + " / " + clock(timings[current].end);
    document.querySelector(".sequence-quote").textContent = `“${lessons[demoLanguage][1].text}”`;
    const follow = document.querySelector(".follow-card p");
    const mid = Math.max(1, Math.floor(lessons[demoLanguage][1].text.split(/\s+/).length / 2));
    const followWords = lessons[demoLanguage][1].text.split(/\s+/);
    const mark = document.createElement("mark");
    mark.textContent = followWords.slice(mid, mid + 2).join(" ");
    follow.replaceChildren(document.createTextNode(followWords.slice(0, mid).join(" ") + " "), mark, document.createTextNode(" " + followWords.slice(mid + 2).join(" ")));
    document.querySelector(".follow-card small").textContent = lessons[demoLanguage][1].translation;
    demoSelects.forEach(select => select.value = demoLanguage);
  }
  function setDemoLanguage(value, manual = true) {
    if (!demoLanguages.includes(value)) return;
    demoLanguage = value;
    manuallySelectedDemo = manual || manuallySelectedDemo;
    current = 1;
    wordIndex = 0;
    render();
  }
  function advance() {
    const wordCount = lessons[demoLanguage][current].text.split(/\s+/).length;
    if (wordIndex < wordCount - 1) wordIndex += 1;
    else {
      current = (current + 1) % lessons[demoLanguage].length;
      wordIndex = 0;
      if (current === 0 && !manuallySelectedDemo) {
        demoLanguage = demoLanguages[(demoLanguages.indexOf(demoLanguage) + 1) % demoLanguages.length];
      }
    }
    render();
  }
  function stop() {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
    toggle.setAttribute("aria-pressed", "false");
    toggle.setAttribute("aria-label", translate("播放界面演示"));
    icon.textContent = "▶";
  }
  toggle.addEventListener("click", () => {
    if (timer !== null) return stop();
    timer = window.setInterval(advance, 540);
    toggle.setAttribute("aria-pressed", "true");
    toggle.setAttribute("aria-label", translate("暂停界面演示"));
    icon.textContent = "Ⅱ";
    advance();
  });
  next.addEventListener("click", () => {
    current = (current + 1) % lessons[demoLanguage].length;
    wordIndex = 0;
    render();
  });
  demoSelects.forEach(select => select.addEventListener("change", event => setDemoLanguage(event.target.value)));
  websiteSelect.addEventListener("change", event => {
    savePreference(event.target.value);
    applyLocale(event.target.value);
  });
  steps.forEach((step, index) => step.addEventListener("click", () => {
    selectedStep = index;
    steps.forEach((item, itemIndex) => item.classList.toggle("selected", itemIndex === index));
    renderSequence();
  }));
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  const requested = new URLSearchParams(window.location.search).get("lang");
  const initial = findLocale(requested) || findLocale(readPreference()) ||
    (navigator.languages || [navigator.language]).map(findLocale).find(Boolean) || "en";
  applyLocale(initial);
})();

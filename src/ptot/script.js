import "./styles.css";

const LANG_EXTENSIONS = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  svelte: "svelte",
  vue: "vue",
  css: "css",
  html: "html",
  json: "json",
  py: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  php: "php",
};

const COMMENT_PATTERNS = {
  javascript: [/\/\/.*$/gm, /\/\*[\s\S]*?\*\//gm],
  typescript: [/\/\/.*$/gm, /\/\*[\s\S]*?\*\//gm],
  css: [/\/\*[\s\S]*?\*\//gm],
  html: [/<!--[\s\S]*?-->/gm],
  json: [/\/\/.*$/gm],
  python: [/#.*$/gm, /'''[\s\S]*?'''/gm, /"""[\s\S]*?"""/gm],
  java: [/\/\/.*$/gm, /\/\*[\s\S]*?\*\//gm],
  c: [/\/\/.*$/gm, /\/\*[\s\S]*?\*\//gm],
  cpp: [/\/\/.*$/gm, /\/\*[\s\S]*?\*\//gm],
  php: [/\/\/.*$/gm, /#.*$/gm, /\/\*[\s\S]*?\*\//gm],
  svelte: [/\/\/.*$/gm, /\/\*[\s\S]*?\*\//gm],
  vue: [/\/\/.*$/gm, /\/\*[\s\S]*?\*\//gm],
  unknown: [/\/\/.*$/gm, /\/\*[\s\S]*?\*\//gm, /<!--[\s\S]*?-->/gm, /#.*$/gm],
};

const state = { files: [], ignorePatterns: [] };
const dom = {};

function init() {
  Object.assign(dom, {
    dropZone: document.getElementById("dropZone"),
    fileInput: document.getElementById("fileInput"),
    ignoreInput: document.getElementById("ignoreInput"),
    processBtn: document.getElementById("processBtn"),
    downloadBtn: document.getElementById("downloadBtn"),
    copyBtn: document.getElementById("copyBtn"),
    sourcePreview: document.getElementById("sourcePreview"),
    output: document.getElementById("output"),
    stats: document.getElementById("stats"),
    fileList: document.getElementById("fileList"),
  });

  dom.dropZone.addEventListener("click", () => dom.fileInput.click());
  ["dragover", "dragleave", "drop"].forEach((evt) =>
    dom.dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      if (evt === "dragover") dom.dropZone.classList.add("dragover");
      else dom.dropZone.classList.remove("dragover");
    })
  );
  dom.dropZone.addEventListener("drop", handleDrop);
  dom.fileInput.addEventListener("change", (e) =>
    addFiles(Array.from(e.target.files))
  );
  dom.processBtn.addEventListener("click", processFiles);
  dom.downloadBtn.addEventListener("click", downloadResult);
  dom.copyBtn.addEventListener("click", copyResult);

  renderFileList();
  updateActionButtons(false);
}

function handleDrop(e) {
  const items = e.dataTransfer.items;
  if (!items) {
    addFiles(Array.from(e.dataTransfer.files));
    return;
  }

  const files = [];
  for (const item of items) {
    const entry = item.webkitGetAsEntry?.();
    if (entry?.isFile) files.push(item.getAsFile());
    else if (entry?.isDirectory) traverseDirectory(entry, files);
  }
  addFiles(files);
}

async function traverseDirectory(dirEntry, files) {
  const reader = dirEntry.createReader();
  const entries = await new Promise((res) => reader.readEntries(res));
  for (const entry of entries) {
    if (entry.isFile) files.push(await new Promise((res) => entry.file(res)));
    else if (entry.isDirectory) await traverseDirectory(entry, files);
  }
}

function addFiles(newFiles) {
  const filtered = newFiles.filter(
    (f) =>
      !state.ignorePatterns.some((p) =>
        f.name.toLowerCase().includes(p.toLowerCase())
      )
  );
  state.files.push(...filtered);
  renderFileList();
}

function renderFileList() {
  if (!dom.fileList) return;
  dom.fileList.innerHTML = "";

  if (!state.files.length) {
    dom.fileList.innerHTML = `<p class="text-xs text-slate-500 text-center py-2">Файлы не выбраны</p>`;
    dom.sourcePreview.textContent = "";
    return;
  }

  state.files.forEach((file, idx) => {
    const item = document.createElement("div");
    item.className = "file-item";
    const size = formatSize(file.size);
    item.innerHTML = `
      <span class="file-name" title="${file.name}">📄 ${file.name}</span>
      <span class="file-meta">${size}</span>
      <button data-idx="${idx}" class="btn-remove" aria-label="Удалить">✕</button>
    `;
    item.querySelector("button").addEventListener("click", (e) => {
      e.stopPropagation();
      removeFile(idx);
    });
    item.addEventListener("click", () => previewFileContent(file));
    dom.fileList.appendChild(item);
  });
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

async function previewFileContent(file) {
  try {
    const text = await file.text();
    const preview = text.slice(0, 400) + (text.length > 400 ? "\n\n..." : "");
    dom.sourcePreview.textContent = preview;
  } catch (e) {
    dom.sourcePreview.textContent = `❌ Не удалось прочитать ${file.name}`;
  }
}

function removeFile(index) {
  state.files.splice(index, 1);
  renderFileList();
  if (!state.files.length) {
    dom.output.textContent = "";
    dom.stats.textContent = "";
    dom.sourcePreview.textContent = "";
    updateActionButtons(false);
  }
}

function getLangFromExt(ext) {
  return LANG_EXTENSIONS[ext?.toLowerCase()] || "unknown";
}

function minifyText(lang, text) {
  const patterns = COMMENT_PATTERNS[lang] || COMMENT_PATTERNS.unknown;
  for (const pat of patterns) text = text.replace(pat, "");
  return text.replace(/\s+/g, " ").trim();
}

async function processFiles() {
  state.ignorePatterns = dom.ignoreInput.value.trim()
    ? dom.ignoreInput.value.split(",").map((s) => s.trim())
    : [];

  if (!state.files.length) return;

  dom.processBtn.disabled = true;
  dom.output.textContent = "Обработка...";
  dom.stats.textContent = "";
  updateActionButtons(false);

  const results = [];
  let totalOriginal = 0,
    totalMinified = 0;

  for (const file of state.files) {
    try {
      const text = await file.text();
      const ext = file.name.split(".").pop();
      const lang = getLangFromExt(ext);
      const minified = minifyText(lang, text);
      totalOriginal += text.length;
      totalMinified += minified.length;
      results.push(`// ${file.webkitRelativePath || file.name}\n${minified}`);
    } catch (e) {
      console.warn(`Ошибка: ${file.name}`, e);
      results.push(`// ❌ ${file.name}`);
    }
  }

  dom.output.textContent = results.join("\n\n");
  const ratio = totalOriginal
    ? ((1 - totalMinified / totalOriginal) * 100).toFixed(1)
    : 0;
  dom.stats.textContent = `${state.files.length}ф • ${ratio}%`;

  // Показать краткий отчёт в sourcePreview
  dom.sourcePreview.textContent =
    `✅ Обработано: ${state.files.length}\n` +
    state.files
      .slice(0, 5)
      .map((f) => `• ${f.name}`)
      .join("\n") +
    (state.files.length > 5 ? `\n... +${state.files.length - 5}` : "");

  updateActionButtons(true);
  dom.processBtn.disabled = false;
}

function downloadResult() {
  const content = dom.output.textContent;
  if (!content) return;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `minified-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

async function copyResult() {
  const content = dom.output.textContent?.trim();
  if (!content) return;

  const original = dom.copyBtn.textContent;
  try {
    await navigator.clipboard.writeText(content);
    showFeedback("✓");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = content;
    ta.style.cssText = "position:fixed;left:-9999px;top:0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showFeedback("✓");
    } catch {
      showFeedback("❌");
    }
    document.body.removeChild(ta);
  }

  function showFeedback(txt) {
    dom.copyBtn.textContent = txt;
    setTimeout(() => {
      dom.copyBtn.textContent = original;
    }, 1500);
  }
}

function updateActionButtons(enabled) {
  const hasContent = !!dom.output.textContent?.trim();
  dom.downloadBtn.disabled = !(enabled && hasContent);
  dom.copyBtn.disabled = !(enabled && hasContent);
}

document.addEventListener("DOMContentLoaded", init);

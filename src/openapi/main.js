import "./style.css";
import {
  header,
  main,
  footer,
  div,
  span,
  button,
  textarea,
  input, // Добавлен input для чекбоксов
  section,
  label,
} from "@borovlioff/no-jsx";
import * as yaml from "js-yaml";

// --- UTILS & PARSING ---

function parseFlexible(text) {
  const t = String(text).replace(/^\uFEFF/, "").trim();
  if (!t) throw new Error("EMPTY INPUT");
  try {
    return JSON.parse(t);
  } catch {}
  let yamlError = null;
  try {
    const doc = yaml.load(t);
    if (doc !== null && typeof doc === "object") return doc;
    yamlError = new Error("EXPECTED OBJECT");
  } catch (e) {
    yamlError = e;
  }
  try {
    return JSON.parse(t.replace(/,(\s*[}\]])/g, "$1"));
  } catch {}
  const msg = String(yamlError?.reason || yamlError?.message || "UNRECOGNIZED FORMAT").split("\n")[0];
  throw new Error(msg);
}

const dump = (doc, fmt) =>
  fmt === "json"
    ? JSON.stringify(doc, null, 2)
    : yaml.dump(doc, { indent: 2, lineWidth: -1, noRefs: true });

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "options", "head", "trace"];

const unescapePtr = (s) => s.replace(/~1/g, "/").replace(/~0/g, "~");

function resolvePointer(doc, pointer) {
  const parts = pointer.slice(2).split("/").map(unescapePtr);
  let cur = doc;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

function setPointer(doc, pointer, value) {
  const parts = pointer.slice(2).split("/").map(unescapePtr);
  let cur = doc;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

const SECTION_ORDER = [
  "schemas",
  "responses",
  "parameters",
  "examples",
  "requestBodies",
  "headers",
  "securitySchemes",
  "links",
  "callbacks",
  "pathItems",
];

const orderComponents = (c) => {
  const out = {};
  for (const s of SECTION_ORDER) if (s in c) out[s] = c[s];
  for (const s of Object.keys(c)) if (!(s in out)) out[s] = c[s];
  return out;
};

function collectPaths(spec) {
  const p = spec?.paths;
  if (!p || typeof p !== "object" || Array.isArray(p)) return [];
  return Object.entries(p).map(([path, item]) => ({
    path,
    methods:
      item && typeof item === "object"
        ? Object.keys(item).filter((k) => HTTP_METHODS.includes(k))
        : [],
  }));
}

// Извлекаем документ для ОДНОГО пути
function extractSinglePathDoc(spec, pathKey, methodsFilter) {
  const paths = spec.paths;
  if (!paths || typeof paths !== "object") throw new Error("NO paths SECTION");
  const rawItem = paths[pathKey];
  if (rawItem === undefined) throw new Error(`PATH NOT FOUND: ${pathKey}`);

  let pathItem = rawItem;
  if (methodsFilter && rawItem && typeof rawItem === "object") {
    pathItem = {};
    for (const [k, v] of Object.entries(rawItem)) {
      if (HTTP_METHODS.includes(k)) {
        if (methodsFilter.includes(k)) pathItem[k] = v;
      } else {
        pathItem[k] = v;
      }
    }
  }

  const usedTags = new Set();
  if (rawItem && Array.isArray(rawItem.tags)) {
    rawItem.tags.forEach((t) => usedTags.add(typeof t === "string" ? t : t.name));
  }
  if (pathItem && typeof pathItem === "object") {
    for (const [k, v] of Object.entries(pathItem)) {
      if (
        HTTP_METHODS.includes(k) &&
        v &&
        typeof v === "object" &&
        Array.isArray(v.tags)
      ) {
        v.tags.forEach((t) => usedTags.add(typeof t === "string" ? t : t.name));
      }
    }
  }

  const out = {};
  if (spec.openapi) out.openapi = spec.openapi;
  else if (spec.swagger) out.swagger = spec.swagger;
  else out.openapi = "3.0.3";

  if (spec.info) out.info = spec.info;
  if (spec.servers) out.servers = spec.servers;
  if (spec.security) out.security = spec.security;
  
  if (spec.tags && Array.isArray(spec.tags) && usedTags.size > 0) {
    out.tags = spec.tags.filter((t) => {
      const name = typeof t === "string" ? t : t.name;
      return usedTags.has(name);
    });
  }

  for (const k of ["host", "basePath", "schemes"])
    if (spec[k] !== undefined) out[k] = spec[k];

  out.paths = { [pathKey]: pathItem };

  const visited = new Set();
  const queue = [];
  const push = (ref) => {
    if (typeof ref !== "string" || !ref.startsWith("#/") || visited.has(ref)) return;
    visited.add(ref);
    queue.push(ref);
  };

  const scan = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(scan);
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (k === "$ref") push(v);
      else scan(v);
    }
  };

  const addSecuritySchemesFromRequirements = (secReqs) => {
    if (!Array.isArray(secReqs)) return;
    for (const req of secReqs) {
      if (!req || typeof req !== "object") continue;
      for (const name of Object.keys(req)) {
        const enc = name.replace(/~/g, "~0").replace(/\//g, "~1");
        if (spec.components?.securitySchemes?.[name] !== undefined) {
          push(`#/components/securitySchemes/${enc}`);
        } else if (spec.securityDefinitions?.[name] !== undefined) {
          push(`#/securityDefinitions/${enc}`);
        }
      }
    }
  };

  scan(pathItem);
  addSecuritySchemesFromRequirements(spec.security);
  if (rawItem && typeof rawItem === "object" && rawItem.security) {
    addSecuritySchemesFromRequirements(rawItem.security);
  }
  if (pathItem && typeof pathItem === "object") {
    for (const [k, v] of Object.entries(pathItem)) {
      if (HTTP_METHODS.includes(k) && v && typeof v === "object") {
        addSecuritySchemesFromRequirements(v.security);
      }
    }
  }

  while (queue.length) {
    const pointer = queue.shift();
    const target = resolvePointer(spec, pointer);
    if (target === undefined) continue;
    setPointer(out, pointer, target);
    scan(target);
  }

  if (out.components) out.components = orderComponents(out.components);
  return { doc: out, refs: visited.size };
}

// Объединяем несколько документов
function mergeDocs(docsArray) {
  if (docsArray.length === 0) return null;
  if (docsArray.length === 1) return docsArray[0].doc;

  const base = { ...docsArray[0].doc };
  let totalRefs = docsArray[0].refs;
  
  // Инициализируем containers для компонентов
  if (!base.components) base.components = {};
  
  for (let i = 1; i < docsArray.length; i++) {
    const next = docsArray[i].doc;
    totalRefs += docsArray[i].refs;

    // Merge paths
    if (next.paths) {
      if (!base.paths) base.paths = {};
      Object.assign(base.paths, next.paths);
    }

    // Merge components
    if (next.components) {
      for (const [section, items] of Object.entries(next.components)) {
        if (!base.components[section]) base.components[section] = {};
        Object.assign(base.components[section], items);
      }
    }
    
    // Merge tags (unique by name)
    if (next.tags && Array.isArray(next.tags)) {
       if (!base.tags) base.tags = [];
       const existingNames = new Set(base.tags.map(t => typeof t === 'string' ? t : t.name));
       for (const t of next.tags) {
         const name = typeof t === 'string' ? t : t.name;
         if (!existingNames.has(name)) {
           base.tags.push(t);
           existingNames.add(name);
         }
       }
    }
  }
  
  if (base.components) base.components = orderComponents(base.components);
  
  return { doc: base, refs: totalRefs };
}

function countComponents(doc) {
  let n = 0;
  if (doc.components && typeof doc.components === "object")
    for (const sec of Object.values(doc.components))
      n += sec && typeof sec === "object" ? Object.keys(sec).length : 0;
  for (const k of ["definitions", "securityDefinitions", "parameters", "responses"]) {
    const v = doc[k];
    if (v && typeof v === "object") n += Object.keys(v).length;
  }
  return n;
}

const SAMPLE = `openapi: 3.0.3
info:
  title: Petstore API
  version: 1.0.0
servers:
  - url: https://petstore.example.com
security:
  - apiKey: []
paths:
  /pets:
    get:
      summary: Список питомцев
      parameters:
        - name: limit
          in: query
          schema: { type: integer }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                type: array
                items: { $ref: "#/components/schemas/Pet" }
        default: { $ref: "#/components/responses/Error" }
    post:
      summary: Создать питомца
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/NewPet" }
      responses:
        "201":
          description: Создано
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Pet" }
  /pets/{id}:
    get:
      summary: Получить питомца
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Pet" }
        "404": { $ref: "#/components/responses/Error" }
    delete:
      summary: Удалить питомца
      security: [{ apiKey: [] }]
      responses:
        "204": { description: Удалено }
components:
  schemas:
    Pet:
      type: object
      required: [id, name]
      properties:
        id: { type: string }
        name: { type: string }
        status: { $ref: "#/components/schemas/Status" }
    NewPet:
      type: object
      required: [name]
      properties:
        name: { type: string }
    Status:
      type: string
      enum: [available, pending, sold]
  responses:
    Error:
      description: Ошибка
      content:
        application/json:
          schema:
            type: object
            properties:
              code: { type: integer }
              message: { type: string }
  securitySchemes:
    apiKey:
      type: apiKey
      in: header
      name: X-API-Key`;

// --- STATE ---

const state = {
  spec: null,
  paths: [], // { path, methods: [] }
  selectedPaths: [], // Array of strings (path keys)
  activeMethods: {}, // Map<pathKey, string[] | null>
  format: "yaml",
  isPathSelectorOpen: false,
};

// --- UI ELEMENTS ---

const inputTa = textarea({
  className:
    "h-full w-full min-h-0 resize-none bg-[#222422] p-4 font-mono text-xs leading-5 text-[#e8eae8] caret-white outline-none placeholder:text-[#565956]",
  placeholder: "PASTE OPENAPI HERE — JSON, YAML OR MIXED…",
  spellcheck: false,
});

const outputTa = textarea({
  className:
    "h-full w-full min-h-0 resize-none bg-[#3a3c3b] p-4 font-mono text-xs leading-5 text-[#e8eae8] caret-white outline-none placeholder:text-[#6a6d6a]",
  placeholder: "RESULT — SELECTED PATHS + USED COMPONENTS",
  spellcheck: false,
  readOnly: true,
});

outputTa.addEventListener("focus", () =>
  requestAnimationFrame(() => outputTa.select())
);

const FMT_BTN =
  "shrink-0 cursor-pointer text-[11px] uppercase tracking-[0.14em] transition-colors";
const yamlBtn = button(
  { className: FMT_BTN, onClick: () => setFormat("yaml") },
  "YAML"
);
const jsonBtn = button(
  { className: FMT_BTN, onClick: () => setFormat("json") },
  "JSON"
);

function updateFmtBtns() {
  yamlBtn.style.color = state.format === "yaml" ? "#ffffff" : "#636663";
  jsonBtn.style.color = state.format === "json" ? "#ffffff" : "#636663";
}

// Кнопка выбора путей
const pathSelectBtn = button({
  className:
    "shrink-0 flex items-center gap-2 h-8 px-3 rounded-[10px] border border-[#c9ccc9] bg-[#222422] text-left font-mono text-[11px] text-white outline-none hover:bg-[#2e312e] transition-colors max-w-[200px]",
  onClick: () => togglePathSelector(),
}, 
span({ className: "truncate" }, "Select Paths"),
span({ className: "text-[#636663]" }, "▼")
);

// Контейнер для методов (динамический)
const methodsBox = div({
  className: "flex min-w-0 items-center gap-1 overflow-x-auto pb-1",
});

const bar = header(
  {
    className:
      "flex h-12 shrink-0 items-center gap-2 border-b border-[#2e312e] bg-[#222422] px-3 pt-[env(safe-area-inset-top)] sm:gap-3 sm:px-4",
  },
  yamlBtn,
  jsonBtn,
  pathSelectBtn,
  methodsBox
);

const TOOL =
  "shrink-0 cursor-pointer text-[10px] uppercase tracking-[0.14em] text-[#b9bcb9] transition-colors hover:text-white";
const statusText = span(
  {
    className:
      "min-w-0 truncate text-[10px] uppercase tracking-[0.14em] text-[#636663]",
  },
  "PASTE OPENAPI SPEC — JSON / YAML / MIXED"
);
const counterText = span(
  {
    className:
      "ml-auto hidden shrink-0 font-mono text-[10px] text-[#636663] min-[420px]:block",
  },
  "IN 0 · OUT 0"
);

const sampleBtn = button(
  {
    className: TOOL,
    onClick: () => {
      inputTa.value = SAMPLE;
      fullRefresh();
    },
  },
  "SAMPLE"
);
const clearBtn = button(
  {
    className: TOOL,
    onClick: () => {
      inputTa.value = "";
      fullRefresh();
    },
  },
  "CLEAR"
);

async function copyOut() {
  if (!outputTa.value.trim()) {
    setStatus("warn", "RESULT IS EMPTY");
    return;
  }
  try {
    await navigator.clipboard.writeText(outputTa.value);
    setStatus("ok", "COPIED TO CLIPBOARD");
  } catch {
    setStatus("error", "COPY FAILED");
  }
}

const copyBtn = button({ className: TOOL, onClick: copyOut }, "COPY");

const footerBar = footer(
  {
    className:
      "flex h-8 shrink-0 items-center gap-4 border-t border-[#2e312e] bg-[#222422] px-3 pb-[env(safe-area-inset-bottom)] sm:px-4",
  },
  statusText,
  sampleBtn,
  clearBtn,
  copyBtn,
  counterText
);

// Модальное окно/Dropdown для выбора путей
let pathSelectorOverlay = null;
let pathSelectorContent = null;

function createPathSelector() {
  // Overlay
  pathSelectorOverlay = div({
    className: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm hidden flex items-start justify-center pt-14 sm:pt-12",
    onClick: (e) => {
      if (e.target === pathSelectorOverlay) togglePathSelector(false);
    }
  });

  // Content Box
  pathSelectorContent = div({
    className: "bg-[#222422] border border-[#2e312e] rounded-xl shadow-2xl w-[90vw] max-w-md max-h-[70vh] flex flex-col animate-fade-in",
  });

  const header = div({
    className: "flex items-center justify-between p-4 border-b border-[#2e312e]"
  }, 
  span({ className: "font-bold text-sm text-white" }, "Select Paths"),
  button({ 
    className: "text-[#636663] hover:text-white",
    onClick: () => togglePathSelector(false)
  }, "✕")
  );

  const listContainer = div({
    className: "overflow-y-auto p-2 space-y-1"
  });

  pathSelectorContent.append(header, listContainer);
  pathSelectorOverlay.append(pathSelectorContent);
  
  return { overlay: pathSelectorOverlay, list: listContainer };
}

const { overlay: selectorOverlay, list: selectorList } = createPathSelector();
document.body.appendChild(selectorOverlay);

function togglePathSelector(forceState) {
  state.isPathSelectorOpen = forceState !== undefined ? forceState : !state.isPathSelectorOpen;
  if (state.isPathSelectorOpen) {
    renderPathSelectorList();
    selectorOverlay.classList.remove("hidden");
    selectorOverlay.classList.add("flex");
  } else {
    selectorOverlay.classList.add("hidden");
    selectorOverlay.classList.remove("flex");
  }
}

function renderPathSelectorList() {
  selectorList.replaceChildren();

  if (!state.paths.length) {
    selectorList.append(
      div({ className: "p-4 text-center text-[#636663] text-sm" }, "No paths found")
    );
    return;
  }

  // Select All / Deselect All
  const allSelected =
    state.paths.length > 0 && state.selectedPaths.length === state.paths.length;
  const selectAllBtn = button(
    {
      className:
        "w-full text-left px-3 py-2 text-[10px] uppercase tracking-wider text-[#8fd48f] hover:bg-[#2e312e] rounded mb-2",
      onClick: () => {
        if (allSelected) {
          state.selectedPaths = [];
          state.activeMethods = {};
        } else {
          state.selectedPaths = state.paths.map((p) => p.path);
          // Reset methods for newly selected
          state.paths.forEach((p) => {
            if (!state.activeMethods[p.path]) state.activeMethods[p.path] = null;
          });
        }
        renderPathSelectorList();
        recalc();
      },
    },
    allSelected ? "DESELECT ALL" : "SELECT ALL"
  );

  selectorList.append(selectAllBtn);

  state.paths.forEach((p) => {
    const isSelected = state.selectedPaths.includes(p.path);

    const row = div({
      className: `flex items-start gap-3 p-3 rounded cursor-pointer hover:bg-[#2e312e] transition-colors ${
        isSelected ? "bg-[#2e312e]/50" : ""
      }`,
    });

    const checkbox = input({
      type: "checkbox",
      checked: isSelected,
      className: "accent-white h-4 w-4 mt-0.5 shrink-0 cursor-pointer",
      onclick: (e) => {
        e.stopPropagation();
        togglePathSelection(p.path);
      },
    });

    // Изменено: flex-1 min-w-0 позволяет тексту сжиматься и переноситься,
    // а break-all гарантирует, что длинные пути без пробелов не вылезут за границы.
    const labelText = span({
      className: "font-mono text-xs text-[#e8eae8] break-all leading-relaxed",
    }, p.path);


    row.append(checkbox, labelText);

    // Click on row also toggles
    row.onclick = () => togglePathSelection(p.path);

    selectorList.append(row);
  });
}

function togglePathSelection(pathKey) {
  if (state.selectedPaths.includes(pathKey)) {
    state.selectedPaths = state.selectedPaths.filter(p => p !== pathKey);
  } else {
    state.selectedPaths.push(pathKey);
    // Initialize methods filter if not exists
    if (!state.activeMethods[pathKey]) {
      state.activeMethods[pathKey] = null; // null means all
    }
  }
  renderPathSelectorList();
  updatePathSelectBtnLabel();
  recalc();
}

function updatePathSelectBtnLabel() {
  const count = state.selectedPaths.length;
  const firstChild = pathSelectBtn.childNodes[0];
  if (count === 0) {
    firstChild.textContent = "Select Paths";
    firstChild.className = "truncate text-[#636663]";
  } else if (count === 1) {
    firstChild.textContent = state.selectedPaths[0];
    firstChild.className = "truncate text-white";
  } else {
    firstChild.textContent = `${count} paths selected`;
    firstChild.className = "truncate text-white";
  }
}

function setStatus(type, msg) {
  statusText.textContent = msg;
  statusText.style.color =
    type === "error"
      ? "#ff6b6b"
      : type === "warn"
      ? "#d8b04a"
      : type === "ok"
      ? "#8fd48f"
      : "#636663";
}

function setFormat(fmt) {
  state.format = fmt;
  if (inputTa.value.trim()) {
    try {
      inputTa.value = dump(parseFlexible(inputTa.value), fmt);
    } catch {}
  }
  fullRefresh();
}

function parseInput() {
  const text = inputTa.value;
  if (!text.trim()) {
    state.spec = null;
    state.paths = [];
    state.selectedPaths = [];
    state.activeMethods = {};
    return;
  }
  state.spec = parseFlexible(text);
  state.paths = collectPaths(state.spec);
  
  // Filter out selected paths that no longer exist
  const validPaths = new Set(state.paths.map(p => p.path));
  state.selectedPaths = state.selectedPaths.filter(p => validPaths.has(p));
  
  // If nothing selected and paths exist, select first one by default? 
  // Let's keep it empty to force user choice or select all? 
  // Better UX: if empty, select nothing. User clicks "Select All".
}

function renderMethodChips() {
  methodsBox.replaceChildren();
  
  if (state.selectedPaths.length === 0) {
    methodsBox.append(span({ className: "text-[10px] text-[#636663] italic" }, "Select paths first"));
    return;
  }
  
  if (state.selectedPaths.length > 1) {
     methodsBox.append(span({ className: "text-[10px] text-[#636663] italic" }, "Multi-select mode: edit methods in selector"));
     return;
  }

  // Single path selected: show chips
  const pathKey = state.selectedPaths[0];
  const pathObj = state.paths.find(p => p.path === pathKey);
  if (!pathObj) return;

  const currentMethods = state.activeMethods[pathKey] === null 
    ? pathObj.methods 
    : state.activeMethods[pathKey];

  for (const m of pathObj.methods) {
    const on = currentMethods.includes(m);
    const chip = button(
      {
        className:
          "shrink-0 cursor-pointer rounded-[6px] border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors " +
          (on
            ? "border-white text-white"
            : "border-[#434643] text-[#636663] hover:text-[#9a9d9a]"),
      },
      m
    );
    chip.addEventListener("click", () => {
      if (state.activeMethods[pathKey] === null) {
        // Start with all, then remove clicked
        state.activeMethods[pathKey] = pathObj.methods.filter(x => x !== m);
      } else {
        if (state.activeMethods[pathKey].includes(m)) {
          state.activeMethods[pathKey] = state.activeMethods[pathKey].filter(x => x !== m);
        } else {
          state.activeMethods[pathKey].push(m);
        }
      }
      renderMethodChips();
      recalc();
    });
    methodsBox.append(chip);
  }
  
  // Reset button
  if (state.activeMethods[pathKey] !== null) {
     const resetBtn = button({
        className: "shrink-0 cursor-pointer text-[10px] text-[#636663] hover:text-white ml-1",
        onClick: () => {
           state.activeMethods[pathKey] = null;
           renderMethodChips();
           recalc();
        }
     }, "Reset");
     methodsBox.append(resetBtn);
  }
}

function recalc() {
  updateFmtBtns();
  updatePathSelectBtnLabel();
  
  if (!state.spec || state.selectedPaths.length === 0) {
    outputTa.value = "";
    setStatus(
      state.spec ? "warn" : "idle",
      state.spec ? "SPEC PARSED — NO PATHS SELECTED" : "PASTE OPENAPI SPEC — JSON / YAML / MIXED"
    );
    counterText.textContent = `IN ${inputTa.value.length} · OUT 0`;
    renderMethodChips();
    return;
  }

  try {
    const docsToMerge = [];
    let totalMethodsCount = 0;

    for (const pathKey of state.selectedPaths) {
      const pathObj = state.paths.find(p => p.path === pathKey);
      if (!pathObj) continue;
      
      const methodsFilter = state.activeMethods[pathKey]; // null or array
      const { doc, refs } = extractSinglePathDoc(state.spec, pathKey, methodsFilter);
      docsToMerge.push({ doc, refs });
      
      const count = methodsFilter === null ? pathObj.methods.length : methodsFilter.length;
      totalMethodsCount += count;
    }

    const result = mergeDocs(docsToMerge);
    
    if (result) {
       outputTa.value = dump(result.doc, state.format);
       setStatus(
        "ok",
        `${state.selectedPaths.length} PATH(S) · ${totalMethodsCount} METHOD(S) · ${result.refs} REF(S)`
      );
       counterText.textContent = `IN ${inputTa.value.length} · OUT ${outputTa.value.length}`;
    } else {
       outputTa.value = "";
       setStatus("warn", "NO DATA EXTRACTED");
    }

  } catch (e) {
    outputTa.value = "";
    setStatus("error", e.message);
    counterText.textContent = `IN ${inputTa.value.length} · OUT 0`;
  }
  
  renderMethodChips();
}

function fullRefresh() {
  try {
    parseInput();
  } catch (e) {
    state.spec = null;
    state.paths = [];
    state.selectedPaths = [];
    state.activeMethods = {};
    setStatus("error", "PARSE ERROR — " + e.message);
    outputTa.value = "";
    updatePathSelectBtnLabel();
    renderMethodChips();
    updateFmtBtns();
    counterText.textContent = `IN ${inputTa.value.length} · OUT 0`;
    return;
  }
  
  updatePathSelectBtnLabel();
  renderMethodChips();
  recalc();
}

let debounceTimer;
inputTa.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fullRefresh, 300);
});

const mainEl = main({
  className: "grid min-h-0 flex-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1",
}, inputTa, outputTa);

const app = div(
  {
    className:
      "flex h-dvh flex-col overflow-hidden bg-[#222422] text-[#e8eae8] antialiased",
  },
  bar,
  mainEl,
  footerBar
);

document.getElementById("app").append(app);

// Init
updateFmtBtns();
updatePathSelectBtnLabel();
renderMethodChips();
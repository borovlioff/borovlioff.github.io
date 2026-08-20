import "./style.css";
import {
  header, main, footer, div, span, button, textarea, select, option,
} from "@borovlioff/no-jsx";
import * as yaml from "js-yaml";

/* ================= парсинг (JSON / YAML / смешанный) ================= */

function parseFlexible(text) {
  const t = String(text).replace(/^\uFEFF/, "").trim();
  if (!t) throw new Error("EMPTY INPUT");
  try { return JSON.parse(t); } catch { /* не чистый JSON */ }
  let yamlError = null;
  try {
    const doc = yaml.load(t);
    if (doc !== null && typeof doc === "object") return doc;
    yamlError = new Error("EXPECTED OBJECT");
  } catch (e) { yamlError = e; }
  try { return JSON.parse(t.replace(/,(\s*[}\]])/g, "$1")); } catch { /* ок */ }
  const msg = String(yamlError?.reason || yamlError?.message || "UNRECOGNIZED FORMAT").split("\n")[0];
  throw new Error(msg);
}

const dump = (doc, fmt) =>
  fmt === "json"
    ? JSON.stringify(doc, null, 2)
    : yaml.dump(doc, { indent: 2, lineWidth: -1, noRefs: true });

/* ================= извлечение пути ================= */

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

const SECTION_ORDER = ["schemas", "responses", "parameters", "examples", "requestBodies", "headers", "securitySchemes", "links", "callbacks", "pathItems"];
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
    methods: item && typeof item === "object" ? Object.keys(item).filter((k) => HTTP_METHODS.includes(k)) : [],
  }));
}

function extractPathDoc(spec, pathKey, methods) {
  const paths = spec.paths;
  if (!paths || typeof paths !== "object") throw new Error("NO paths SECTION");
  const rawItem = paths[pathKey];
  if (rawItem === undefined) throw new Error(`PATH NOT FOUND: ${pathKey}`);

  let pathItem = rawItem;
  if (methods !== null && rawItem && typeof rawItem === "object") {
    pathItem = {};
    for (const [k, v] of Object.entries(rawItem)) {
      if (HTTP_METHODS.includes(k)) { if (methods.includes(k)) pathItem[k] = v; }
      else pathItem[k] = v;
    }
  }

  const out = {};
  if (spec.openapi) out.openapi = spec.openapi;
  else if (spec.swagger) out.swagger = spec.swagger;
  else out.openapi = "3.0.3";
  if (spec.info) out.info = spec.info;
  if (spec.servers) out.servers = spec.servers;
  for (const k of ["host", "basePath", "schemes"]) if (spec[k] !== undefined) out[k] = spec[k];
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
    if (Array.isArray(node)) { node.forEach(scan); return; }
    for (const [k, v] of Object.entries(node)) {
      if (k === "$ref") push(v);
      else scan(v);
    }
  };
  const addSecurity = (sec) => {
    if (!Array.isArray(sec)) return;
    for (const req of sec) {
      if (!req || typeof req !== "object") continue;
      for (const name of Object.keys(req)) {
        const enc = name.replace(/~/g, "~0").replace(/\//g, "~1");
        if (spec.components?.securitySchemes?.[name] !== undefined) push(`#/components/securitySchemes/${enc}`);
        else if (spec.securityDefinitions?.[name] !== undefined) push(`#/securityDefinitions/${enc}`);
      }
    }
  };

  scan(pathItem);
  addSecurity(spec.security);
  if (pathItem && typeof pathItem === "object") {
    for (const [k, v] of Object.entries(pathItem)) {
      if (HTTP_METHODS.includes(k) && v && typeof v === "object") addSecurity(v.security);
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

function countComponents(doc) {
  let n = 0;
  if (doc.components && typeof doc.components === "object")
    for (const sec of Object.values(doc.components)) n += sec && typeof sec === "object" ? Object.keys(sec).length : 0;
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
  - url: https://api.example.com/v1
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
      name: X-API-Key
`;

/* ================= состояние (обычный объект) ================= */

const state = {
  spec: null,
  paths: [],
  selectedPath: "",
  activeMethods: null,  // null = все методы
  format: "yaml",
};

/* ================= поля ================= */

const inputTa = textarea({
  className: "h-full w-full min-h-0 resize-none bg-[#222422] p-4 font-mono text-xs leading-5 text-[#e8eae8] caret-white outline-none placeholder:text-[#565956]",
  placeholder: "PASTE OPENAPI HERE — JSON, YAML OR MIXED…",
  spellcheck: false,
});

const outputTa = textarea({
  className: "h-full w-full min-h-0 resize-none bg-[#3a3c3b] p-4 font-mono text-xs leading-5 text-[#e8eae8] caret-white outline-none placeholder:text-[#6a6d6a]",
  placeholder: "RESULT — SELECTED PATH + USED COMPONENTS",
  spellcheck: false,
  readOnly: true,
});
outputTa.addEventListener("focus", () => requestAnimationFrame(() => outputTa.select()));

/* ================= header: одна строка ================= */

const FMT_BTN = "shrink-0 cursor-pointer text-[11px] uppercase tracking-[0.14em] transition-colors";

const yamlBtn = button({ className: FMT_BTN, onClick: () => setFormat("yaml") }, "YAML");
const jsonBtn = button({ className: FMT_BTN, onClick: () => setFormat("json") }, "JSON");

function updateFmtBtns() {
  yamlBtn.style.color = state.format === "yaml" ? "#ffffff" : "#636663";
  jsonBtn.style.color = state.format === "json" ? "#ffffff" : "#636663";
}

const pathSelect = select({
  className: "h-8 min-w-0 flex-1 cursor-pointer rounded-[10px] border border-[#c9ccc9] bg-[#222422] px-3 font-mono text-[11px] text-white outline-none",
});

const methodsBox = div({ className: "flex min-w-0 max-w-[55%] items-center gap-1 overflow-x-auto" });

const bar = header({
  className: "flex h-12 shrink-0 items-center gap-2 border-b border-[#2e312e] bg-[#222422] px-3 pt-[env(safe-area-inset-top)] sm:gap-3 sm:px-4",
}, yamlBtn, jsonBtn, pathSelect, methodsBox);

/* ================= футер ================= */

const TOOL = "shrink-0 cursor-pointer text-[10px] uppercase tracking-[0.14em] text-[#b9bcb9] transition-colors hover:text-white";

const statusText = span({
  className: "min-w-0 truncate text-[10px] uppercase tracking-[0.14em] text-[#636663]",
}, "PASTE OPENAPI SPEC — JSON / YAML / MIXED");

const counterText = span({
  className: "ml-auto hidden shrink-0 font-mono text-[10px] text-[#636663] min-[420px]:block",
}, "IN 0 · OUT 0");

const sampleBtn = button({ className: TOOL, onClick: () => { inputTa.value = SAMPLE; fullRefresh(); } }, "SAMPLE");
const clearBtn = button({ className: TOOL, onClick: () => { inputTa.value = ""; fullRefresh(); } }, "CLEAR");

async function copyOut() {
  if (!outputTa.value.trim()) { setStatus("warn", "RESULT IS EMPTY"); return; }
  try {
    await navigator.clipboard.writeText(outputTa.value);
    setStatus("ok", "COPIED TO CLIPBOARD");
  } catch {
    setStatus("error", "COPY FAILED");
  }
}
const copyBtn = button({ className: TOOL, onClick: copyOut }, "COPY");

const footerBar = footer({
  className: "flex h-8 shrink-0 items-center gap-4 border-t border-[#2e312e] bg-[#222422] px-3 pb-[env(safe-area-inset-bottom)] sm:px-4",
}, statusText, sampleBtn, clearBtn, copyBtn, counterText);

/* ================= логика ================= */

function setStatus(type, msg) {
  statusText.textContent = msg;
  statusText.style.color =
    type === "error" ? "#ff6b6b" :
    type === "warn" ? "#d8b04a" :
    type === "ok" ? "#8fd48f" : "#636663";
}

/* YAML/JSON: конвертирует ЛЕВОЕ поле и обновляет правое */
function setFormat(fmt) {
  state.format = fmt;
  if (inputTa.value.trim()) {
    try {
      inputTa.value = dump(parseFlexible(inputTa.value), fmt);
    } catch { /* вход не трогаем — ошибка покажется в статусе */ }
  }
  fullRefresh();
}

function parseInput() {
  const text = inputTa.value;
  if (!text.trim()) {
    state.spec = null;
    state.paths = [];
    state.selectedPath = "";
    state.activeMethods = null;
    return;
  }
  state.spec = parseFlexible(text);
  state.paths = collectPaths(state.spec);
  if (!state.paths.some((p) => p.path === state.selectedPath)) {
    state.selectedPath = state.paths[0]?.path ?? "";
    state.activeMethods = null;
  }
}

function renderPathSelect() {
  pathSelect.replaceChildren();
  if (!state.paths.length) {
    pathSelect.append(option({ value: "" }, "— no paths —"));
    pathSelect.disabled = true;
    return;
  }
  pathSelect.disabled = false;
  for (const p of state.paths) {
    const label = p.methods.length ? p.methods.map((m) => m.toUpperCase()).join(" ") : "—";
    pathSelect.append(option({ value: p.path }, `${p.path}  ${label}`));
  }
  pathSelect.value = state.selectedPath;
}

function renderMethodChips() {
  methodsBox.replaceChildren();
  const item = state.paths.find((p) => p.path === state.selectedPath);
  if (!item) return;
  for (const m of item.methods) {
    const on = state.activeMethods === null || state.activeMethods.includes(m);
    const chip = button({
      className: "shrink-0 cursor-pointer rounded-[6px] border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors " +
        (on ? "border-white text-white" : "border-[#434643] text-[#636663] hover:text-[#9a9d9a]"),
    }, m);
    chip.addEventListener("click", () => {
      const cur = state.activeMethods === null ? [...item.methods] : [...state.activeMethods];
      state.activeMethods = cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m];
      renderMethodChips();
      recalc();
    });
    methodsBox.append(chip);
  }
  const allBtn = button({
    className: "shrink-0 cursor-pointer rounded-[6px] border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors " +
      (state.activeMethods === null ? "border-white text-white" : "border-[#434643] text-[#636663] hover:text-[#9a9d9a]"),
  }, "ALL");
  allBtn.addEventListener("click", () => {
    state.activeMethods = null;
    renderMethodChips();
    recalc();
  });
  methodsBox.append(allBtn);
}

function recalc() {
  updateFmtBtns();

  if (!state.spec || !state.selectedPath) {
    outputTa.value = "";
    setStatus(state.spec ? "warn" : "idle",
      state.spec ? "SPEC PARSED — NO PATH SELECTED" : "PASTE OPENAPI SPEC — JSON / YAML / MIXED");
    counterText.textContent = `IN ${inputTa.value.length} · OUT 0`;
    return;
  }

  const item = state.paths.find((p) => p.path === state.selectedPath);
  try {
    const { doc, refs } = extractPathDoc(state.spec, state.selectedPath, state.activeMethods);
    outputTa.value = dump(doc, state.format);
    const on = state.activeMethods === null ? item.methods.length : item.methods.filter((m) => state.activeMethods.includes(m)).length;
    setStatus("ok", `${state.selectedPath} — ${on} METHOD(S) · ${refs} REF(S) · ${countComponents(doc)} COMPONENT(S)`);
  } catch (e) {
    outputTa.value = "";
    setStatus("error", e.message);
  }
  counterText.textContent = `IN ${inputTa.value.length} · OUT ${outputTa.value.length}`;
}

function fullRefresh() {
  try {
    parseInput();
  } catch (e) {
    state.spec = null;
    state.paths = [];
    state.selectedPath = "";
    state.activeMethods = null;
    setStatus("error", "PARSE ERROR — " + e.message);
    outputTa.value = "";
    renderPathSelect();
    renderMethodChips();
    updateFmtBtns();
    counterText.textContent = `IN ${inputTa.value.length} · OUT 0`;
    return;
  }
  renderPathSelect();
  renderMethodChips();
  recalc();
}

let debounceTimer;
inputTa.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fullRefresh, 300);
});

pathSelect.addEventListener("change", () => {
  state.selectedPath = pathSelect.value;
  state.activeMethods = null;
  renderMethodChips();
  recalc();
});

/* ================= сборка ================= */

const mainEl = main({ className: "grid min-h-0 flex-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1" },
  inputTa, outputTa);

const app = div({ className: "flex h-dvh flex-col overflow-hidden bg-[#222422] text-[#e8eae8] antialiased" },
  bar, mainEl, footerBar);

document.getElementById("app").append(app);

updateFmtBtns();
renderPathSelect();
renderMethodChips();
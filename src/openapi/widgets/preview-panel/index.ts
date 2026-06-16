// widgets/preview-panel/index.ts
import {
  div,
  button,
  span,
  select,
  option,
  pre,
  code,
  h3,
  p,
} from "@borovlioff/no-jsx";
import { apiInfoStore } from "../../shared/state/api-info";
import { serversStore } from "../../shared/state/servers";
import { tagsStore } from "../../shared/state/tags";
import { securityStore } from "../../shared/state/security-schemes";
import { globalSecurityStore } from "../../shared/state/security";
import { schemasStore } from "../../shared/state/schemas";
import { serializeToOpenApi } from "../../shared/lib/openapi-serializer";

type Format = "json" | "yaml";

const toYaml = (obj: any, indent: number = 0): string => {
  const pad = "  ".repeat(indent);
  if (obj === null || obj === undefined) return "null";
  if (typeof obj === "string") {
    if (
      obj.includes("\n") ||
      /[:#\[\]{}&*!|>'",?`@%]/.test(obj) ||
      obj === ""
    ) {
      return `"${obj.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
    }
    return obj;
  }
  if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          const inner = toYaml(item, indent + 1);
          const lines = inner.split("\n");
          return `${pad}- ${lines[0].trimStart()}\n${lines
            .slice(1)
            .map((l) => `${pad}  ${l.trimStart()}`)
            .join("\n")}`;
        }
        return `${pad}- ${toYaml(item, 0)}`;
      })
      .join("\n");
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj);
    if (entries.length === 0) return "{}";
    return entries
      .map(([k, v]) => {
        if (typeof v === "object" && v !== null) {
          const inner = toYaml(v, indent + 1);
          return `${pad}${k}:\n${inner}`;
        }
        return `${pad}${k}: ${toYaml(v, 0)}`;
      })
      .join("\n");
  }
  return String(obj);
};

export const createPreviewPanel = () => {
  let format: Format = "json";
  let width = 420;
  let isMinimized = false;
  let copied = false;

  const togglePanel = () => {
    isMinimized = !isMinimized;
    width = isMinimized ? 40 : 420;
    panel.style.width = `${width}px`;

    const elements = panel.querySelectorAll<HTMLElement>(
      ".preview-header, .preview-content",
    );
    elements.forEach((el) => {
      if (isMinimized) {
        el.style.display = "none";
      } else {
        el.style.removeProperty("display");
      }
    });

    const expandBtn = panel.querySelector<HTMLElement>(".expand-button");
    if (expandBtn) {
      expandBtn.style.display = isMinimized ? "flex" : "none";
    }
  };

  const panel = div(
    {
      className:
        "h-full bg-white border-l border-gray-200 flex flex-col transition-[width] duration-200 ease-in-out relative",
      style: `width: ${width}px;`,
    },
    div(
      {
        className:
          "expand-button absolute inset-0 items-center justify-center bg-white hover:bg-gray-50 cursor-pointer border-l border-gray-200",
        style: "display: none;",
      },
      button(
        {
          className: "p-2 rounded hover:bg-gray-100 transition-colors",
          title: "Развернуть предпросмотр",
          onClick: togglePanel,
        },
        span({ className: "text-xl" }, "📋"),
      ),
    ),
    div(
      {
        className:
          "p-3 border-b border-gray-200 flex items-center justify-between gap-2 shrink-0 preview-header",
      },
      h3(
        { className: "text-sm font-semibold text-gray-800 whitespace-nowrap" },
        "📋 Preview",
      ),
      div(
        { className: "flex items-center gap-2" },
        select(
          {
            className:
              "text-xs border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500",
            onChange: (e: Event) => {
              format = (e.target as HTMLSelectElement).value as Format;
              renderContent();
            },
          },
          option({ value: "json", selected: true }, "JSON"),
          option({ value: "yaml" }, "YAML"),
        ),
        button(
          {
            className:
              "text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors",
            onClick: () => {
              const obj = serializeToOpenApi();
              const text =
                format === "json" ? JSON.stringify(obj, null, 2) : toYaml(obj);
              navigator.clipboard.writeText(text).then(() => {
                copied = true;
                renderContent();
                setTimeout(() => {
                  copied = false;
                  renderContent();
                }, 1500);
              });
            },
          },
          () => (copied ? "✓ Copied" : "📋 Copy"),
        ),
        button(
          {
            className:
              "p-1.5 rounded hover:bg-gray-100 transition-colors shrink-0",
            title: "Свернуть/развернуть",
            onClick: togglePanel,
          },
          "⚙️",
        ),
      ),
    ),
    div(
      {
        className: "flex-1 overflow-auto bg-slate-900 preview-content",
      },
      () => {
        apiInfoStore.get();
        serversStore.get();
        tagsStore.get();
        securityStore.get();
        globalSecurityStore.get();
        schemasStore.get();

        const obj = serializeToOpenApi();
        const text =
          format === "json" ? JSON.stringify(obj, null, 2) : toYaml(obj);
        return pre(
          {
            className:
              "text-xs text-emerald-300 font-mono p-4 whitespace-pre-wrap break-words m-0",
          },
          code({}, text),
        );
      },
    ),
  );

  const resizer = div({
    className:
      "w-1 cursor-col-resize hover:bg-blue-400 transition-colors bg-gray-200 shrink-0",
    style: "user-select: none;",
  });

  let isDragging = false;
  resizer.addEventListener("mousedown", (e) => {
    isDragging = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (!isDragging || isMinimized) return;
    const delta = window.innerWidth - e.clientX;
    width = Math.max(280, Math.min(800, delta));
    panel.style.width = `${width}px`;
  });
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  });

  const renderContent = () => {
    const contentEl = panel.querySelector(".preview-content");
    if (contentEl) {
      const obj = serializeToOpenApi();
      const text =
        format === "json" ? JSON.stringify(obj, null, 2) : toYaml(obj);
      contentEl.innerHTML = "";
      contentEl.appendChild(
        pre(
          {
            className:
              "text-xs text-emerald-300 font-mono p-4 whitespace-pre-wrap break-words m-0",
          },
          code({}, text),
        ),
      );
    }
  };

  return div({ className: "flex shrink-0" }, resizer, panel);
};

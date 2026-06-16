// widgets/sidebar/index.ts
import { div, button, span } from "@borovlioff/no-jsx";
import { activeTab } from "../../shared/state/tabs";
import { NAV_ITEMS } from "../../shared/ui/nav-config";

export const createSidebar = () => {
  let width = 260;
  let isMinimized = false;

  const applyMinimizeState = () => {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    if (isMinimized) {
      sidebar.classList.add("sidebar-minimized");
    } else {
      sidebar.classList.remove("sidebar-minimized");
    }
  };

  const sidebar = div(
    {
      id: "sidebar",
      className:
        "h-full bg-white border-r border-gray-200 flex flex-col transition-[width] duration-200 ease-in-out",
      style: `width: ${width}px;`,
    },
    div(
      {
        className:
          "p-4 border-b border-gray-200 flex items-center justify-between shrink-0",
      },
      span(
        {
          className:
            "font-semibold text-gray-800 whitespace-nowrap overflow-hidden sidebar-title",
        },
        "OpenAPI Builder",
      ),
      button(
        {
          id: "toggle-btn",
          className:
            "p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0",
          title: "Свернуть/развернуть",
          onClick: () => {
            isMinimized = !isMinimized;
            width = isMinimized ? 64 : 260;
            sidebar.style.width = `${width}px`;
            applyMinimizeState();
          },
        },
        "⚙️",
      ),
    ),
    () => {
      activeTab.get();
      return div(
        { className: "flex flex-col" },
        ...NAV_ITEMS.map((item) => {
          const isActive = activeTab.get() === item.id;
          return button(
            {
              className: `w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-4 border-blue-600"
                  : "text-gray-600"
              }`,
              onClick: () => activeTab.set(item.id),
            },
            span(
              {
                className:
                  "w-5 h-5 flex items-center justify-center text-lg shrink-0",
              },
              item.icon,
            ),
            span({ className: "nav-label whitespace-nowrap" }, item.label),
          );
        }),
      );
    },
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
    width = Math.max(180, Math.min(480, e.clientX));
    sidebar.style.width = `${width}px`;
  });
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  });

  return div({ className: "flex shrink-0" }, sidebar, resizer);
};

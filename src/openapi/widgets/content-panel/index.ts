import { div, main, h1, p } from "@borovlioff/no-jsx";
import { activeTab, type TabId } from "../../shared/state/tabs";
import { createApiInfoForm } from "../../features/api-info-form";
import { createServerManager } from "../../features/server-manager";
import { createTagManager } from "../../features/tag-manager";
import { createSecurityManager } from "../../features/security-manager";
import { createSchemaManager } from "../../features/schema-manager";

const TAB_CONTENT: Record<TabId, () => Node> = {
  "api-info": () => createApiInfoForm(),
  servers: () =>
    div(
      { className: "max-w-4xl mx-auto" },
      h1({ className: "text-2xl font-bold text-gray-800 mb-2" }, "Серверы"),
      p(
        { className: "text-gray-600 mb-6" },
        "Укажите базовые URL для вашего API. Поддерживаются переменные окружения.",
      ),
      createServerManager(),
    ),
  tags: () =>
    div(
      { className: "max-w-4xl mx-auto" },
      h1({ className: "text-2xl font-bold text-gray-800 mb-2" }, "Теги"),
      p(
        { className: "text-gray-600 mb-6" },
        "Группируйте операции API с помощью тегов для лучшей навигации в документации.",
      ),
      createTagManager(),
    ),
  security: () =>
    div(
      { className: "max-w-4xl mx-auto" },
      h1(
        { className: "text-2xl font-bold text-gray-800 mb-2" },
        "Безопасность",
      ),
      p(
        { className: "text-gray-600 mb-6" },
        "Определите схемы аутентификации и авторизации, используемые в вашем API.",
      ),
      createSecurityManager(),
    ),
  schemas: () =>
    div(
      { className: "max-w-4xl mx-auto" },
      h1(
        { className: "text-2xl font-bold text-gray-800 mb-2" },
        "Схемы данных",
      ),
      p(
        { className: "text-gray-600 mb-6" },
        "Определите структуры данных (модели), используемые в запросах и ответах API.",
      ),
      createSchemaManager(),
    ),
};

export const createContentPanel = () => {
  return main(
    { className: "flex-1 h-full overflow-auto bg-gray-50 p-8 transition-all" },
    () => {
      const tab = activeTab.get();
      const renderer = TAB_CONTENT[tab] || TAB_CONTENT["api-info"];

      return div({ className: "max-w-4xl mx-auto", key: tab }, renderer());
    },
  );
};

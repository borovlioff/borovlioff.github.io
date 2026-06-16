// features/api-info-form/index.ts
import { div, label, input, textarea, h2 } from "@borovlioff/no-jsx";
import { apiInfoStore, type ApiInfoState } from "../../shared/state/api-info";

const createInput = (
  labelText: string,
  fieldName: keyof ApiInfoState,
  type = "text",
  placeholder = "",
) => {
  const initialValue = apiInfoStore.get()[fieldName];

  return div(
    { className: "flex flex-col gap-1 mb-4" },
    label({ className: "text-sm font-medium text-gray-700" }, labelText),
    input({
      type,
      className:
        "px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
      placeholder,
      value: initialValue,
      onInput: (e: Event) => {
        const target = e.target as HTMLInputElement;
        const current = apiInfoStore.get();
        apiInfoStore.set({ ...current, [fieldName]: target.value });
      },
    }),
  );
};

const createTextarea = (
  labelText: string,
  fieldName: keyof ApiInfoState,
  placeholder = "",
) => {
  const initialValue = apiInfoStore.get()[fieldName];

  return div(
    { className: "flex flex-col gap-1 mb-4" },
    label({ className: "text-sm font-medium text-gray-700" }, labelText),
    textarea({
      rows: 3,
      className:
        "px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y",
      placeholder,
      value: initialValue,
      onInput: (e: Event) => {
        const target = e.target as HTMLTextAreaElement;
        const current = apiInfoStore.get();
        apiInfoStore.set({ ...current, [fieldName]: target.value });
      },
    }),
  );
};

export const createApiInfoForm = () => {
  return div(
    {
      className:
        "bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6",
    },
    h2(
      { className: "text-lg font-semibold text-gray-800 mb-4" },
      "Основные данные",
    ),
    div(
      { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
      div(
        { className: "md:col-span-2" },
        createInput("Название API", "title", "text", "Например: Users API"),
      ),
      createInput("Версия", "version", "text", "1.0.0"),
    ),
    createTextarea(
      "Описание",
      "description",
      "Краткое описание возможностей API...",
    ),
    h2(
      { className: "text-lg font-semibold text-gray-800 mt-8 mb-4" },
      "Контакты и Лицензия",
    ),
    div(
      { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
      createInput("Имя контакта", "contactName", "text", "Support Team"),
      createInput(
        "Email контакта",
        "contactEmail",
        "email",
        "support@example.com",
      ),
      createInput("Лицензия", "licenseName", "text", "Apache 2.0"),
      createInput(
        "URL условий использования",
        "termsOfService",
        "url",
        "https://example.com/terms",
      ),
    ),
  );
};

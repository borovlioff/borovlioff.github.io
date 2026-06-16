// features/tag-manager/index.ts

import {
  div,
  input,
  button,
  label,
  h3,
  p,
  ul,
  li,
  span,
  textarea,
} from "@borovlioff/no-jsx";
import { tagsStore, type Tag } from "../../shared/state/tags";

const createTagItem = (tag: Tag, index: number) => {
  return li(
    {
      className:
        "group flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-300 transition-colors mb-3",
    },
    div(
      { className: "flex-1 min-w-0 mr-4 space-y-2" },
      div(
        { className: "flex items-center gap-2" },
        span(
          {
            className:
              "bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide shrink-0",
          },
          "TAG",
        ),
        input({
          type: "text",
          value: tag.name,
          className:
            "flex-1 text-base font-semibold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-1 py-0.5 bg-transparent",
          placeholder: "Название тега",
          onInput: (e: Event) => {
            const current = tagsStore.get();
            const updated = [...current];
            updated[index] = {
              ...updated[index],
              name: (e.target as HTMLInputElement).value,
            };
            tagsStore.set(updated);
          },
        }),
      ),
      textarea({
        rows: 2,
        value: tag.description || "",
        className:
          "w-full text-sm text-gray-500 border border-gray-200 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none bg-transparent hover:bg-gray-50",
        placeholder: "Описание тега (необязательно)",
        onInput: (e: Event) => {
          const current = tagsStore.get();
          const updated = [...current];
          updated[index] = {
            ...updated[index],
            description: (e.target as HTMLTextAreaElement).value || undefined,
          };
          tagsStore.set(updated);
        },
      }),
    ),
    button(
      {
        className:
          "opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded transition-all shrink-0",
        title: "Удалить тег",
        onClick: () => {
          const current = tagsStore.get();
          tagsStore.set(current.filter((_, i) => i !== index));
        },
      },
      "🗑️",
    ),
  );
};

const createAddTagForm = () => {
  let nameValue = "";
  let descValue = "";

  return div(
    { className: "mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200" },
    h3(
      { className: "text-sm font-semibold text-gray-700 mb-3" },
      "Добавить тег",
    ),
    div(
      { className: "space-y-3" },
      div(
        { className: "flex flex-col gap-1" },
        label({ className: "text-xs font-medium text-gray-500" }, "Имя тега *"),
        input({
          type: "text",
          placeholder: "Например: Products",
          className:
            "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none",
          onInput: (e: Event) => {
            nameValue = (e.target as HTMLInputElement).value;
          },
        }),
      ),
      div(
        { className: "flex flex-col gap-1" },
        label({ className: "text-xs font-medium text-gray-500" }, "Описание"),
        textarea({
          rows: 2,
          placeholder: "Краткое описание группы эндпоинтов...",
          className:
            "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none",
          onInput: (e: Event) => {
            descValue = (e.target as HTMLTextAreaElement).value;
          },
        }),
      ),
      div(
        { className: "flex justify-end pt-2" },
        button(
          {
            className:
              "bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all",
            onClick: () => {
              if (!nameValue.trim()) return;
              const newTag: Tag = {
                name: nameValue.trim(),
                description: descValue.trim() || undefined,
              };
              tagsStore.set([...tagsStore.get(), newTag]);
              nameValue = "";
              descValue = "";
              const inputs = document.querySelectorAll<
                HTMLInputElement | HTMLTextAreaElement
              >("input, textarea");
              inputs.forEach((el) => {
                if (
                  el.tagName === "INPUT" &&
                  (el as HTMLInputElement).placeholder.includes("Products")
                )
                  (el as HTMLInputElement).value = "";
                if (el.tagName === "TEXTAREA")
                  (el as HTMLTextAreaElement).value = "";
              });
            },
          },
          "➕ Добавить тег",
        ),
      ),
    ),
  );
};

export const createTagManager = () => {
  return div(
    { className: "space-y-4" },
    createAddTagForm(),
    div({ className: "bg-gray-100 p-4 rounded-xl min-h-[200px]" }, () => {
      const tags = tagsStore.get();
      if (tags.length === 0) {
        return div(
          { className: "text-center py-10 text-gray-400" },
          p({}, "Нет настроенных тегов"),
          p(
            { className: "text-xs mt-1" },
            "Теги помогают группировать операции API",
          ),
        );
      }
      return ul(
        { className: "list-none m-0 p-0" },
        ...tags.map((tag, index) => createTagItem(tag, index)),
      );
    }),
  );
};

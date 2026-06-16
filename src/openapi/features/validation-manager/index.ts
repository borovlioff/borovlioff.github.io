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
  select,
  option,
  textarea,
} from "@borovlioff/no-jsx";
import {
  validationsStore,
  type Validation,
  type ValidationType,
} from "../../shared/state/validations";

const VALIDATION_TYPE_LABELS: Record<ValidationType, string> = {
  format: "Format",
  pattern: "Pattern (Regex)",
  minLength: "Min Length",
  maxLength: "Max Length",
  minimum: "Minimum",
  maximum: "Maximum",
  enum: "Enum Values",
};

const createValidationItem = (validation: Validation, index: number) => {
  return li(
    {
      className:
        "group flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-cyan-300 transition-colors mb-3",
    },
    div(
      { className: "flex-1 min-w-0 mr-4" },
      div(
        { className: "flex items-center gap-2 mb-1" },
        span(
          {
            className:
              "bg-cyan-100 text-cyan-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide",
          },
          VALIDATION_TYPE_LABELS[validation.type],
        ),
        span(
          { className: "text-base font-semibold text-gray-800" },
          validation.name,
        ),
      ),
      div(
        {
          className:
            "mt-1 text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded break-all",
        },
        Array.isArray(validation.value)
          ? validation.value.join(", ")
          : String(validation.value),
      ),
      validation.description
        ? p({ className: "text-xs text-gray-500 mt-1" }, validation.description)
        : null,
    ),
    button(
      {
        className:
          "opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded transition-all shrink-0",
        onClick: () => {
          validationsStore.set(
            validationsStore.get().filter((_, i) => i !== index),
          );
        },
      },
      "🗑️",
    ),
  );
};

const createAddValidationForm = () => {
  let idValue = "";
  let nameValue = "";
  let typeValue: ValidationType = "format";
  let valueStr = "";
  let descValue = "";
  let enumValue = "";

  const resetForm = (
    inputs: NodeListOf<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    idValue = "";
    nameValue = "";
    typeValue = "format";
    valueStr = "";
    descValue = "";
    enumValue = "";
    inputs.forEach((el) => {
      if (el.tagName === "SELECT") {
        (el as HTMLSelectElement).value = "format";
      } else {
        (el as HTMLInputElement | HTMLTextAreaElement).value = "";
      }
    });
  };

  return div(
    { className: "mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200" },
    h3(
      { className: "text-sm font-semibold text-gray-700 mb-3" },
      "Добавить валидацию",
    ),
    div(
      { className: "space-y-3" },
      div(
        { className: "grid grid-cols-2 gap-3" },
        div(
          { className: "flex flex-col gap-1" },
          label({ className: "text-xs font-medium text-gray-500" }, "ID *"),
          input({
            type: "text",
            placeholder: "email",
            className:
              "w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-cyan-500 outline-none",
            onInput: (e: Event) => {
              idValue = (e.target as HTMLInputElement).value;
            },
          }),
        ),
        div(
          { className: "flex flex-col gap-1" },
          label(
            { className: "text-xs font-medium text-gray-500" },
            "Название *",
          ),
          input({
            type: "text",
            placeholder: "Email",
            className:
              "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 outline-none",
            onInput: (e: Event) => {
              nameValue = (e.target as HTMLInputElement).value;
            },
          }),
        ),
      ),
      div(
        { className: "grid grid-cols-2 gap-3" },
        div(
          { className: "flex flex-col gap-1" },
          label({ className: "text-xs font-medium text-gray-500" }, "Тип"),
          select(
            {
              className:
                "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 outline-none",
              onChange: (e: Event) => {
                typeValue = (e.target as HTMLSelectElement)
                  .value as ValidationType;
              },
            },
            option({ value: "format", selected: true }, "Format"),
            option({ value: "pattern" }, "Pattern (Regex)"),
            option({ value: "minLength" }, "Min Length"),
            option({ value: "maxLength" }, "Max Length"),
            option({ value: "minimum" }, "Minimum"),
            option({ value: "maximum" }, "Maximum"),
            option({ value: "enum" }, "Enum"),
          ),
        ),
        div(
          { className: "flex flex-col gap-1" },
          label(
            { className: "text-xs font-medium text-gray-500" },
            "Значение *",
          ),
          input({
            type: "text",
            placeholder: "email, ^\\d+$, 10, a,b,c",
            className:
              "w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-cyan-500 outline-none",
            onInput: (e: Event) => {
              valueStr = (e.target as HTMLInputElement).value;
            },
          }),
        ),
      ),
      div(
        { className: "flex flex-col gap-1" },
        label({ className: "text-xs font-medium text-gray-500" }, "Описание"),
        textarea({
          rows: 2,
          placeholder: "Описание валидации...",
          className:
            "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 outline-none resize-none",
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
              "bg-cyan-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cyan-700 active:scale-95 transition-all",
            onClick: () => {
              if (!idValue.trim() || !nameValue.trim() || !valueStr.trim())
                return;

              let parsedValue: string | number | string[] = valueStr;
              if (
                typeValue === "minLength" ||
                typeValue === "maxLength" ||
                typeValue === "minimum" ||
                typeValue === "maximum"
              ) {
                parsedValue = Number(valueStr);
              } else if (typeValue === "enum") {
                parsedValue = valueStr
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
              }

              const newValidation: Validation = {
                id: idValue.trim(),
                name: nameValue.trim(),
                type: typeValue,
                value: parsedValue,
                description: descValue.trim() || undefined,
              };

              validationsStore.set([...validationsStore.get(), newValidation]);

              const inputs = document.querySelectorAll<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
              >("input, textarea, select");
              resetForm(inputs);
            },
          },
          "➕ Добавить валидацию",
        ),
      ),
    ),
  );
};

export const createValidationManager = () => {
  return div(
    { className: "space-y-4" },
    createAddValidationForm(),
    div({ className: "bg-gray-100 p-4 rounded-xl min-h-[200px]" }, () => {
      const validations = validationsStore.get();
      if (validations.length === 0) {
        return div(
          { className: "text-center py-10 text-gray-400" },
          p({}, "Нет настроенных валидаций"),
          p(
            { className: "text-xs mt-1" },
            "Добавьте переиспользуемые правила валидации",
          ),
        );
      }
      return ul(
        { className: "list-none m-0 p-0" },
        ...validations.map((validation, index) =>
          createValidationItem(validation, index),
        ),
      );
    }),
  );
};

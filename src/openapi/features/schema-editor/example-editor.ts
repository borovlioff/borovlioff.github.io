import {
  div,
  input,
  button,
  label,
  select,
  option,
  span,
  fragment,
} from "@borovlioff/no-jsx";

// Хелпер для определения типа значения
const getTypeOfValue = (val: any): string => {
  if (Array.isArray(val)) return "array";
  if (val === null) return "null";
  return typeof val;
};

// Рекурсивный редактор значения примера
// Явно указываем тип возврата Node
export const createExampleEditor = (
  value: any,
  onChange: (newValue: any) => void,
  parentType?: string, // Подсказка о типе (например, "string" или "object")
): Node => {
  const currentType = getTypeOfValue(value);

  // 1. Редактирование Примитивов (String, Number, Boolean)
  if (
    currentType === "string" ||
    currentType === "number" ||
    currentType === "boolean"
  ) {
    return div(
      { className: "flex items-center gap-2" },
      currentType === "boolean"
        ? select(
            {
              className: "text-sm border-gray-300 rounded shadow-sm",
              value: String(value),
              onChange: (e: Event) =>
                onChange((e.target as HTMLSelectElement).value === "true"),
            },
            option({ value: "true" }, "True"),
            option({ value: "false" }, "False"),
          )
        : input({
            type: currentType === "number" ? "number" : "text",
            className:
              "w-full text-sm border-gray-300 rounded shadow-sm font-mono",
            value: String(value),
            onInput: (e: Event) => {
              const val = (e.target as HTMLInputElement).value;
              onChange(currentType === "number" ? Number(val) : val);
            },
          }),
    );
  }

  // 2. Редактирование Объекта
  if (currentType === "object" && value !== null) {
    return div(
      { className: "space-y-2 pl-2 border-l-2 border-blue-100" },
      // Используем spread оператор для передачи детей в div
      ...Object.entries(value).map(([key, val]) =>
        div(
          { className: "grid grid-cols-[1fr_2fr] gap-2 items-start mb-1" },
          // Ключ (имя поля)
          input({
            className:
              "text-xs font-bold text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none px-1 py-0.5",
            value: key,
            onInput: (e: Event) => {
              const newKey = (e.target as HTMLInputElement).value;
              if (newKey !== key) {
                const newObj = { ...value };
                delete newObj[key];
                newObj[newKey] = val;
                onChange(newObj);
              }
            },
          }),
          // Значение поля (рекурсия)
          createExampleEditor(val, (newVal) => {
            const newObj = { ...value };
            newObj[key] = newVal;
            onChange(newObj);
          }),
        ),
      ),
      button(
        {
          className:
            "mt-2 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-dashed border-blue-200 w-full",
          onClick: () => {
            onChange({
              ...value,
              [`field${Object.keys(value).length + 1}`]: "",
            });
          },
        },
        "+ Add Field",
      ),
    );
  }

  // 3. Редактирование Массива
  if (currentType === "array") {
    return div(
      { className: "space-y-2 pl-2 border-l-2 border-green-100" },
      // Используем spread оператор для передачи детей в div
      ...(value as any[]).map((item, idx) =>
        div(
          { className: "flex items-center gap-2 mb-1" },
          span(
            { className: "text-xs text-gray-400 w-4 text-right" },
            `${idx}:`,
          ),
          div(
            { className: "flex-1" },
            createExampleEditor(item, (newItem) => {
              const newArr = [...value];
              newArr[idx] = newItem;
              onChange(newArr);
            }),
          ),
          button(
            {
              className: "text-red-400 hover:text-red-600 px-1",
              onClick: () => {
                const newArr = [...value];
                newArr.splice(idx, 1);
                onChange(newArr);
              },
            },
            "×",
          ),
        ),
      ),
      button(
        {
          className:
            "mt-2 text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded border border-dashed border-green-200 w-full",
          onClick: () => {
            onChange([...value, ""]);
          },
        },
        "+ Add Item",
      ),
    );
  }

  // 4. Null или Undefined
  return div({ className: "text-xs text-gray-400 italic" }, "Empty");
};

import {
  div,
  button,
  select,
  option,
  label,
  details,
  summary,
  span,
  fragment,
} from "@borovlioff/no-jsx";
import type { SchemaObject } from "../../shared/state/schemas";
import { schemasStore } from "../../shared/state/schemas";
import { createSchemaNodeEditor } from "./schema-node";

type CompositionType = "allOf" | "oneOf" | "anyOf" | "not";

interface CompositionEditorProps {
  type: CompositionType;
  schemas: SchemaObject[] | undefined;
  onChange: (newSchemas: SchemaObject[]) => void;
}

export const createCompositionEditor = ({
  type,
  schemas,
  onChange,
}: CompositionEditorProps): Node => {
  const list = schemas || [];
  const isNot = type === "not";

  return div(
    { className: "mt-2 border-l-2 border-purple-200 pl-3" },
    details(
      { open: true, className: "group" },
      summary(
        {
          className:
            "cursor-pointer text-sm font-semibold text-purple-700 hover:text-purple-900 list-none flex items-center gap-2 mb-2",
        },
        span({ className: "transition-transform group-open:rotate-90" }, "▶"),
        `${type.toUpperCase()} (${list.length})`,
      ),

      div(
        { className: "space-y-2" },
        // Рендерим список элементов композиции через spread оператора в div
        ...list.map((subSchema, idx) =>
          div(
            {
              className:
                "relative p-2 bg-white border border-gray-200 rounded shadow-sm",
            },
            !isNot &&
              button(
                {
                  className:
                    "absolute top-1 right-1 text-red-500 hover:bg-red-50 p-1 rounded text-xs z-10",
                  onClick: () => {
                    const newList = [...list];
                    newList.splice(idx, 1);
                    onChange(newList);
                  },
                },
                "✕",
              ),

            createSchemaNodeEditor(subSchema, (newSubSchema) => {
              const newList = [...list];
              newList[idx] = newSubSchema;
              onChange(newList);
            }),
          ),
        ),

        div(
          { className: "flex gap-2 mt-2 items-center" },
          button(
            {
              className:
                "text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded border border-gray-300",
              onClick: () => onChange([...list, { type: "object" }]),
            },
            "+ Empty Object",
          ),

          select(
            {
              className:
                "text-xs border-gray-300 rounded shadow-sm bg-white max-w-[200px]",
              onChange: (e: Event) => {
                const refName = (e.target as HTMLSelectElement).value;
                if (!refName) return;
                onChange([
                  ...list,
                  { $ref: `#/components/schemas/${refName}` },
                ]);
                (e.target as HTMLSelectElement).value = "";
              },
            },
            option({ value: "" }, "Add $ref..."),
            // Используем fragment для возврата списка опций из реактивной функции
            () => {
              const available = schemasStore.get();
              return fragment(
                ...available.map((s) => option({ value: s.name }, s.name)),
              );
            },
          ),
        ),
      ),
    ),
  );
};

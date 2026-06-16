// features/schema-editor/schema-node.ts
import {
  div,
  input,
  select,
  option,
  label,
  button,
  details,
  summary,
  span,
  fragment,
} from "@borovlioff/no-jsx";
import type { SchemaObject, SchemaType } from "../../shared/state/schemas";
import { createCompositionEditor } from "./composition-editor";
import { FORMAT_OPTIONS } from "../../shared/types/model";

const TypeOptions = () => [
  option({ value: "" }, "Any / Mixed"),
  option({ value: "string" }, "String"),
  option({ value: "number" }, "Number"),
  option({ value: "integer" }, "Integer"),
  option({ value: "boolean" }, "Boolean"),
  option({ value: "array" }, "Array"),
  option({ value: "object" }, "Object"),
  option({ value: "null" }, "Null"),
];

export const createSchemaNodeEditor = (
  schema: SchemaObject,
  onUpdate: (newSchema: SchemaObject) => void,
  path: string = "root",
): Node => {
  const updateField = <K extends keyof SchemaObject>(
    field: K,
    value: SchemaObject[K],
  ) => {
    onUpdate({ ...schema, [field]: value });
  };

  const hasComposition =
    schema.allOf || schema.oneOf || schema.anyOf || schema.not;
  const isRef = !!schema.$ref;

  return div(
    {
      className:
        "border border-gray-200 rounded-md p-3 mb-2 bg-white shadow-sm relative",
    },
    isRef
      ? div(
          {
            className:
              "bg-blue-50 p-2 rounded border border-blue-200 flex items-center justify-between",
          },
          div(
            {},
            label(
              { className: "text-xs font-bold text-blue-600 block" },
              "Reference ($ref)",
            ),
            span({ className: "font-mono text-sm text-blue-800" }, schema.$ref),
          ),
          button(
            {
              className: "text-xs text-red-600 hover:underline",
              onClick: () => onUpdate({ ...schema, $ref: undefined }),
            },
            "Clear Ref",
          ),
        )
      : div(
          {},
          div(
            { className: "flex gap-2 mb-3 items-start flex-wrap" },
            div(
              { className: "w-32 shrink-0" },
              label(
                { className: "text-xs font-bold text-gray-500 block mb-1" },
                "Type",
              ),
              select(
                {
                  className:
                    "w-full text-sm border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500",
                  value: (schema.type as string) || "",
                  onChange: (e: Event) => {
                    const newType =
                      ((e.target as HTMLSelectElement).value as SchemaType) ||
                      undefined;
                    const allowed = newType ? FORMAT_OPTIONS[newType] : null;
                    const newFormat =
                      allowed && !allowed.includes(schema.format || "")
                        ? undefined
                        : schema.format;
                    onUpdate({ ...schema, type: newType, format: newFormat });
                  },
                },
                ...TypeOptions(),
              ),
            ),
            div(
              { className: "w-32 shrink-0" },
              label(
                { className: "text-xs font-bold text-gray-500 block mb-1" },
                "Format",
              ),
              select(
                {
                  className:
                    "w-full text-sm border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500",
                  value: schema.format || "",
                  onChange: (e: Event) =>
                    updateField(
                      "format",
                      (e.target as HTMLSelectElement).value || undefined,
                    ),
                },
                ...(schema.type
                  ? FORMAT_OPTIONS[schema.type] || [""]
                  : [""]
                ).map((f) => option({ value: f }, f || "—")),
              ),
            ),
            div(
              { className: "flex-1 min-w-[150px]" },
              label(
                { className: "text-xs font-bold text-gray-500 block mb-1" },
                "Description",
              ),
              input({
                type: "text",
                className:
                  "w-full text-sm border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500",
                placeholder: "Describe...",
                value: schema.description || "",
                onInput: (e: Event) =>
                  updateField(
                    "description",
                    (e.target as HTMLInputElement).value,
                  ),
              }),
            ),
          ),
          hasComposition &&
            div(
              { className: "mb-4 space-y-2" },
              schema.allOf &&
                createCompositionEditor({
                  type: "allOf",
                  schemas: schema.allOf,
                  onChange: (v) => updateField("allOf", v),
                }),
              schema.oneOf &&
                createCompositionEditor({
                  type: "oneOf",
                  schemas: schema.oneOf,
                  onChange: (v) => updateField("oneOf", v),
                }),
              schema.anyOf &&
                createCompositionEditor({
                  type: "anyOf",
                  schemas: schema.anyOf,
                  onChange: (v) => updateField("anyOf", v),
                }),
              schema.not &&
                createCompositionEditor({
                  type: "not",
                  schemas: [schema.not],
                  onChange: (v) => updateField("not", v[0]),
                }),
            ),
          !hasComposition &&
            div(
              {
                className: "space-y-3 pl-2 border-l-2 border-gray-100 ml-1",
              },
              div(
                {},
                label(
                  { className: "text-xs font-medium text-gray-600" },
                  "Enum (comma separated)",
                ),
                input({
                  type: "text",
                  className: "w-full text-sm border-gray-300 rounded shadow-sm",
                  placeholder: "val1, val2",
                  value: schema.enum ? schema.enum.join(", ") : "",
                  onInput: (e: Event) => {
                    const val = (e.target as HTMLInputElement).value;
                    const arr = val
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    updateField("enum", arr.length > 0 ? arr : undefined);
                  },
                }),
              ),
              (schema.type === "object" || schema.properties) &&
                div(
                  { className: "mt-2" },
                  details(
                    { open: true, className: "group" },
                    summary(
                      {
                        className:
                          "cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-800 list-none flex items-center gap-2",
                      },
                      span(
                        {
                          className:
                            "transition-transform group-open:rotate-90",
                        },
                        "▶",
                      ),
                      "Properties",
                    ),
                    div(
                      { className: "ml-4 mt-2 space-y-2" },
                      ...(schema.properties
                        ? Object.entries(schema.properties).map(
                            ([key, propSchema]) =>
                              div(
                                {
                                  className:
                                    "flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200",
                                },
                                div(
                                  { className: "w-1/3 pt-1" },
                                  input({
                                    type: "text",
                                    className:
                                      "w-full text-sm font-mono border-gray-300 rounded shadow-sm",
                                    value: key,
                                    onInput: (e: Event) => {
                                      const newName = (
                                        e.target as HTMLInputElement
                                      ).value;
                                      if (newName !== key) {
                                        const newProps = {
                                          ...schema.properties!,
                                        };
                                        delete newProps[key];
                                        newProps[newName] = propSchema;
                                        updateField("properties", newProps);
                                      }
                                    },
                                  }),
                                ),
                                div(
                                  { className: "flex-1" },
                                  createSchemaNodeEditor(
                                    propSchema,
                                    (newPropSchema) => {
                                      const newProps = {
                                        ...schema.properties!,
                                      };
                                      newProps[key] = newPropSchema;
                                      updateField("properties", newProps);
                                    },
                                    `${path}.${key}`,
                                  ),
                                ),
                                button(
                                  {
                                    className:
                                      "text-red-500 hover:bg-red-50 p-1 rounded",
                                    onClick: () => {
                                      const newProps = {
                                        ...schema.properties!,
                                      };
                                      delete newProps[key];
                                      updateField("properties", newProps);
                                    },
                                  },
                                  "🗑️",
                                ),
                              ),
                          )
                        : []),
                      button(
                        {
                          className:
                            "mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200",
                          onClick: () => {
                            const newProps = schema.properties || {};
                            updateField("properties", {
                              ...newProps,
                              [`prop${Object.keys(newProps).length + 1}`]: {
                                type: "string",
                              },
                            });
                          },
                        },
                        "+ Add Property",
                      ),
                    ),
                  ),
                ),
              div(
                { className: "mt-2" },
                label(
                  { className: "text-xs font-medium text-gray-600" },
                  "Required",
                ),
                input({
                  type: "text",
                  className:
                    "w-full text-sm border-gray-300 rounded shadow-sm font-mono",
                  placeholder: "id, name",
                  value: schema.required ? schema.required.join(", ") : "",
                  onInput: (e: Event) => {
                    const val = (e.target as HTMLInputElement).value;
                    const arr = val
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    updateField("required", arr.length > 0 ? arr : undefined);
                  },
                }),
              ),
              (schema.type === "array" || schema.items) &&
                div(
                  { className: "mt-2" },
                  details(
                    { open: true, className: "group" },
                    summary(
                      {
                        className:
                          "cursor-pointer text-sm font-semibold text-green-600 hover:text-green-800 list-none flex items-center gap-2",
                      },
                      span(
                        {
                          className:
                            "transition-transform group-open:rotate-90",
                        },
                        "▶",
                      ),
                      "Items",
                    ),
                    div(
                      { className: "ml-4 mt-2" },
                      createSchemaNodeEditor(
                        schema.items || { type: "string" },
                        (newItemSchema) => updateField("items", newItemSchema),
                        `${path}.items`,
                      ),
                    ),
                  ),
                ),
            ),
          !hasComposition &&
            !isRef &&
            div(
              {
                className:
                  "mt-4 pt-2 border-t border-gray-100 flex flex-wrap gap-2",
              },
              span(
                {
                  className: "text-xs font-bold text-gray-400 w-full mb-1",
                },
                "Add Composition:",
              ),
              button(
                {
                  className:
                    "text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200 hover:bg-purple-100",
                  onClick: () => updateField("allOf", [{ type: "object" }]),
                },
                "allOf",
              ),
              button(
                {
                  className:
                    "text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-200 hover:bg-orange-100",
                  onClick: () => updateField("oneOf", [{ type: "string" }]),
                },
                "oneOf",
              ),
              button(
                {
                  className:
                    "text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded border border-teal-200 hover:bg-teal-100",
                  onClick: () => updateField("anyOf", [{ type: "string" }]),
                },
                "anyOf",
              ),
              button(
                {
                  className:
                    "text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200 hover:bg-red-100",
                  onClick: () => updateField("not", { type: "null" }),
                },
                "not",
              ),
            ),
        ),
  );
};

// schema-manager/index.ts
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
  li,
  createStore,
} from "@borovlioff/no-jsx";
import {
  schemasStore,
  getSortedSchemas,
  type SchemaDefinition,
  type SchemaProperty,
  type AllOfEntry,
} from "../../shared/state/schemas";
import { createExampleEditor } from "../schema-editor/example-editor";
import {
  MODEL_LAYERS,
  LAYER_BADGE,
  LAYER_LABELS,
  type ModelLayer,
} from "../../shared/types/model";

const activeLayerStore = createStore<ModelLayer | "All">("All");

const updateSchema = (index: number, patch: Partial<SchemaDefinition>) => {
  const current = schemasStore.get();
  const updated = [...current];
  updated[index] = { ...updated[index], ...patch };
  schemasStore.set(updated);
};

const createPropertyEditor = (
  prop: SchemaProperty,
  schemaIndex: number,
  propIndex: number,
  isAllOf: boolean = false,
  allOfIndex?: number,
) => {
  const updateProp = (patch: Partial<SchemaProperty>) => {
    const current = schemasStore.get();
    const schema = current[schemaIndex];

    // Создаем новый объект свойства
    const updatedProp = { ...prop, ...patch };

    if (isAllOf && allOfIndex !== undefined) {
      const allOf = [...(schema.allOf || [])];
      const entry = { ...allOf[allOfIndex] };
      const props = [...(entry.properties || [])];
      props[propIndex] = updatedProp;
      entry.properties = props;
      allOf[allOfIndex] = entry;
      updateSchema(schemaIndex, { allOf });
    } else {
      const props = [...(schema.properties || [])];
      props[propIndex] = updatedProp;
      updateSchema(schemaIndex, { properties: props });
    }
  };

  const deleteProp = () => {
    const current = schemasStore.get();
    const schema = current[schemaIndex];

    if (isAllOf && allOfIndex !== undefined) {
      const allOf = [...(schema.allOf || [])];
      const entry = { ...allOf[allOfIndex] };
      const props = [...(entry.properties || [])];
      props.splice(propIndex, 1);
      entry.properties = props;
      allOf[allOfIndex] = entry;
      updateSchema(schemaIndex, { allOf });
    } else {
      const props = [...(schema.properties || [])];
      props.splice(propIndex, 1);
      updateSchema(schemaIndex, { properties: props });
    }
  };

  return div(
    {
      className: "p-3 bg-gray-50 border border-gray-200 rounded mb-2 space-y-2",
    },
    div(
      {
        className:
          "grid grid-cols-[1fr_100px_100px_1fr_auto] gap-2 items-center",
      },
      input({
        type: "text",
        value: prop.name,
        placeholder: "name",
        className:
          "text-sm font-mono border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-purple-400 outline-none",
        onInput: (e: Event) =>
          updateProp({ name: (e.target as HTMLInputElement).value }),
      }),
      select(
        {
          value: prop.type,
          className:
            "text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-purple-400 outline-none",
          onChange: (e: Event) =>
            updateProp({
              type: (e.target as HTMLSelectElement).value as any,
              format: undefined,
            }),
        },
        option({ value: "string" }, "String"),
        option({ value: "integer" }, "Integer"),
        option({ value: "number" }, "Number"),
        option({ value: "boolean" }, "Boolean"),
        option({ value: "object" }, "Object"),
        option({ value: "array" }, "Array"),
      ),
      select(
        {
          value: prop.format || "",
          className:
            "text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-purple-400 outline-none",
          onChange: (e: Event) => {
            const newValue = (e.target as HTMLSelectElement).value;
            // Передаем undefined для пустого значения
            updateProp({ format: newValue || undefined });
          },
        },
        option({ value: "" }, "—"),
        ...(prop.type === "string"
          ? [
              "date",
              "date-time",
              "email",
              "uuid",
              "uri",
              "hostname",
              "ipv4",
              "ipv6",
              "byte",
              "binary",
              "password",
            ]
          : prop.type === "integer"
            ? ["int32", "int64"]
            : prop.type === "number"
              ? ["float", "double"]
              : []
        ).map((f) => option({ value: f }, f)),
      ),
      input({
        type: "text",
        value: prop.description || "",
        placeholder: "description",
        className:
          "text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-purple-400 outline-none",
        onInput: (e: Event) =>
          updateProp({
            description: (e.target as HTMLInputElement).value || undefined,
          }),
      }),
      button(
        {
          className: "text-red-500 hover:bg-red-50 p-1 rounded",
          onClick: deleteProp,
        },
        "🗑️",
      ),
    ),
    div(
      { className: "flex flex-wrap gap-3 items-center text-xs" },
      label(
        { className: "flex items-center gap-1 cursor-pointer" },
        input({
          type: "checkbox",
          checked: prop.nullable || false,
          className: "w-3.5 h-3.5 text-purple-600 rounded",
          onChange: (e: Event) =>
            updateProp({
              nullable: (e.target as HTMLInputElement).checked || undefined,
            }),
        }),
        "Nullable",
      ),
      label(
        { className: "flex items-center gap-1 cursor-pointer" },
        input({
          type: "checkbox",
          checked: prop.readOnly || false,
          className: "w-3.5 h-3.5 text-purple-600 rounded",
          onChange: (e: Event) =>
            updateProp({
              readOnly: (e.target as HTMLInputElement).checked || undefined,
            }),
        }),
        "Read-only",
      ),
      div(
        { className: "flex items-center gap-1" },
        span({ className: "text-gray-500" }, "Default:"),
        input({
          type: "text",
          value: prop.default !== undefined ? String(prop.default) : "",
          placeholder: "value",
          className:
            "w-24 border border-gray-300 rounded px-1.5 py-0.5 text-xs outline-none",
          onInput: (e: Event) => {
            const val = (e.target as HTMLInputElement).value;
            updateProp({ default: val === "" ? undefined : val });
          },
        }),
      ),
      div(
        { className: "flex items-center gap-1" },
        span({ className: "text-gray-500" }, "Example:"),
        input({
          type: "text",
          value: prop.example !== undefined ? String(prop.example) : "",
          placeholder: "example",
          className:
            "w-24 border border-gray-300 rounded px-1.5 py-0.5 text-xs outline-none",
          onInput: (e: Event) => {
            const val = (e.target as HTMLInputElement).value;
            updateProp({ example: val === "" ? undefined : val });
          },
        }),
      ),
    ),
  );
};

const createAllOfEntryEditor = (
  entry: AllOfEntry,
  schemaIndex: number,
  entryIndex: number,
) => {
  const updateEntry = (patch: Partial<AllOfEntry>) => {
    const current = schemasStore.get();
    const schema = current[schemaIndex];
    const allOf = [...(schema.allOf || [])];
    allOf[entryIndex] = { ...allOf[entryIndex], ...patch };
    updateSchema(schemaIndex, { allOf });
  };

  const deleteEntry = () => {
    const current = schemasStore.get();
    const schema = current[schemaIndex];
    const allOf = [...(schema.allOf || [])];
    allOf.splice(entryIndex, 1);
    updateSchema(schemaIndex, { allOf });
  };

  return div(
    { className: "p-3 bg-purple-50 border border-purple-200 rounded mb-2" },
    div(
      { className: "flex items-center gap-2 mb-2" },
      input({
        type: "text",
        value: entry.$ref || "",
        placeholder: "$ref (e.g. #/components/schemas/UserBase)",
        className:
          "flex-1 text-sm font-mono border border-purple-300 rounded px-2 py-1 focus:ring-1 focus:ring-purple-400 outline-none",
        onInput: (e: Event) =>
          updateEntry({
            $ref: (e.target as HTMLInputElement).value || undefined,
            properties: undefined,
            required: undefined,
          }),
      }),
      button(
        {
          className: "text-red-500 hover:bg-red-50 p-1 rounded",
          onClick: deleteEntry,
        },
        "🗑️",
      ),
    ),
    !entry.$ref &&
      div(
        { className: "space-y-2" },
        div(
          { className: "flex items-center gap-2" },
          label(
            { className: "text-xs font-bold text-purple-700" },
            "Properties:",
          ),
          button(
            {
              className:
                "text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded hover:bg-purple-200",
              onClick: () => {
                const props = [...(entry.properties || [])];
                props.push({ name: `prop${props.length + 1}`, type: "string" });
                updateEntry({ properties: props });
              },
            },
            "+ Add Property",
          ),
        ),
        ...(entry.properties || []).map((prop, i) =>
          createPropertyEditor(prop, schemaIndex, i, true, entryIndex),
        ),
        div(
          { className: "mt-2" },
          label(
            { className: "text-xs font-bold text-purple-700 block mb-1" },
            "Required (comma separated):",
          ),
          input({
            type: "text",
            value: entry.required ? entry.required.join(", ") : "",
            placeholder: "prop1, prop2",
            className:
              "w-full text-xs font-mono border border-purple-300 rounded px-2 py-1 focus:ring-1 focus:ring-purple-400 outline-none",
            onInput: (e: Event) => {
              const val = (e.target as HTMLInputElement).value;
              const arr = val
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              updateEntry({ required: arr.length > 0 ? arr : undefined });
            },
          }),
        ),
      ),
  );
};

const createSchemaItem = (schema: SchemaDefinition, index: number): Node => {
  const layer = schema.layer || "Base";
  const hasAllOf = !!(schema.allOf && schema.allOf.length > 0);

  const headerBadge = span(
    {
      className: `text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide ${LAYER_BADGE[layer]}`,
    },
    layer,
  );

  return li(
    {
      className:
        "group flex flex-col p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-purple-300 transition-colors",
    },
    div(
      { className: "flex items-start justify-between gap-2 mb-3" },
      div(
        { className: "flex-1 space-y-2" },
        div(
          { className: "flex items-center gap-2 flex-wrap" },
          headerBadge,
          input({
            type: "text",
            value: schema.name,
            className:
              "flex-1 min-w-[150px] text-base font-semibold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none px-1 py-0.5 bg-transparent",
            placeholder: "Schema Name",
            onInput: (e: Event) =>
              updateSchema(index, {
                name: (e.target as HTMLInputElement).value,
              }),
          }),
          select(
            {
              value: schema.type,
              className:
                "text-xs font-bold px-2 py-1 rounded uppercase tracking-wide bg-gray-100 text-gray-700 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none",
              onChange: (e: Event) =>
                updateSchema(index, {
                  type: (e.target as HTMLSelectElement).value as any,
                }),
            },
            option({ value: "object" }, "Object"),
            option({ value: "array" }, "Array"),
            option({ value: "string" }, "String"),
            option({ value: "integer" }, "Integer"),
            option({ value: "number" }, "Number"),
            option({ value: "boolean" }, "Boolean"),
          ),
        ),
        input({
          type: "text",
          value: schema.description || "",
          placeholder: "Description...",
          className:
            "w-full text-sm text-gray-500 border border-gray-200 rounded px-2 py-1 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none bg-transparent hover:bg-gray-50",
          onInput: (e: Event) =>
            updateSchema(index, {
              description: (e.target as HTMLInputElement).value || undefined,
            }),
        }),
      ),
      button(
        {
          className:
            "p-2 text-red-500 hover:bg-red-50 rounded transition-all shrink-0",
          onClick: () =>
            schemasStore.set(schemasStore.get().filter((_, i) => i !== index)),
        },
        "🗑️",
      ),
    ),
    hasAllOf
      ? div(
          { className: "space-y-2" },
          div(
            { className: "flex items-center gap-2 mb-2" },
            span({ className: "text-xs font-bold text-purple-600" }, "All Of:"),
            button(
              {
                className:
                  "text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded hover:bg-purple-200",
                onClick: () => {
                  const allOf = [...(schema.allOf || [])];
                  allOf.push({
                    properties: [{ name: `prop1`, type: "string" }],
                  });
                  updateSchema(index, { allOf });
                },
              },
              "+ Add Entry",
            ),
          ),
          ...(schema.allOf || []).map((entry, i) =>
            createAllOfEntryEditor(entry, index, i),
          ),
        )
      : div(
          { className: "space-y-2" },
          div(
            { className: "flex items-center gap-2 mb-2" },
            span(
              { className: "text-xs font-bold text-gray-600" },
              "Properties:",
            ),
            button(
              {
                className:
                  "text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded hover:bg-gray-200",
                onClick: () => {
                  const props = [...(schema.properties || [])];
                  props.push({
                    name: `prop${props.length + 1}`,
                    type: "string",
                  });
                  updateSchema(index, { properties: props });
                },
              },
              "+ Add Property",
            ),
          ),
          ...(schema.properties || []).map((prop, i) =>
            createPropertyEditor(prop, index, i),
          ),
          div(
            { className: "mt-2" },
            label(
              { className: "text-xs font-bold text-gray-600 block mb-1" },
              "Required (comma separated):",
            ),
            input({
              type: "text",
              value: schema.required ? schema.required.join(", ") : "",
              placeholder: "prop1, prop2",
              className:
                "w-full text-xs font-mono border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-purple-400 outline-none",
              onInput: (e: Event) => {
                const val = (e.target as HTMLInputElement).value;
                const arr = val
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                updateSchema(index, {
                  required: arr.length > 0 ? arr : undefined,
                });
              },
            }),
          ),
        ),
    schema.example != null &&
      details(
        { className: "group/example mt-3" },
        summary(
          {
            className:
              "cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-800 list-none flex items-center gap-1",
          },
          span(
            {
              className: "transition-transform group-open/example:rotate-90",
            },
            "▶",
          ),
          "Edit Example",
        ),
        div(
          { className: "mt-2 p-2 bg-gray-50 rounded border border-gray-200" },
          createExampleEditor(
            schema.example,
            (newExample) => updateSchema(index, { example: newExample }),
            schema.type,
          ),
        ),
      ),
  );
};

const createGroupHeader = (title: string): Node =>
  div(
    { className: "flex items-center gap-2 mt-6 mb-2 first:mt-0" },
    div({ className: "h-px flex-1 bg-gray-200" }),
    span(
      {
        className:
          "text-xs font-bold text-gray-400 uppercase tracking-widest px-2",
      },
      title,
    ),
    div({ className: "h-px flex-1 bg-gray-200" }),
  );

const createAddSchemaForm = () => {
  let nameValue = "";
  let typeValue: SchemaDefinition["type"] = "object";
  let layerValue: ModelLayer = "Base";
  let nameInputEl: HTMLInputElement | null = null;

  const nameField = input({
    type: "text",
    placeholder: "Schema Name (PascalCase)",
    className:
      "w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-purple-500",
    onInput: (e: Event) => {
      nameValue = (e.target as HTMLInputElement).value;
    },
  });
  nameInputEl = nameField as unknown as HTMLInputElement;

  return div(
    {
      className:
        "mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex gap-2 items-end flex-wrap",
    },
    div({ className: "flex-1 min-w-[200px]" }, nameField),
    div(
      { className: "w-32" },
      select(
        {
          className:
            "w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-purple-500",
          onChange: (e: Event) => {
            typeValue = (e.target as HTMLSelectElement)
              .value as SchemaDefinition["type"];
          },
        },
        option({ value: "object", selected: true }, "Object"),
        option({ value: "array" }, "Array"),
        option({ value: "string" }, "String"),
      ),
    ),
    div(
      { className: "w-32" },
      select(
        {
          className:
            "w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-purple-500",
          onChange: (e: Event) => {
            layerValue = (e.target as HTMLSelectElement).value as ModelLayer;
          },
        },
        option({ value: "Base", selected: true }, "Base"),
        option({ value: "Create" }, "Create"),
        option({ value: "Update" }, "Update"),
        option({ value: "Response" }, "Response"),
      ),
    ),
    button(
      {
        className:
          "bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 active:scale-95 transition-all",
        onClick: () => {
          if (!nameValue.trim()) return;
          schemasStore.set([
            ...schemasStore.get(),
            {
              name: nameValue.trim(),
              type: typeValue,
              layer: layerValue,
              properties: [],
              example:
                typeValue === "object" ? {} : typeValue === "array" ? [] : "",
            },
          ]);
          nameValue = "";
          if (nameInputEl) nameInputEl.value = "";
        },
      },
      "Create",
    ),
  );
};

const createLayerTabs = () => {
  return div(
    {
      className:
        "flex gap-2 mb-4 border-b border-gray-200 pb-2 overflow-x-auto",
    },
    ...MODEL_LAYERS.map((layer) => {
      return () => {
        const isActive = activeLayerStore.get() === layer;
        return button(
          {
            className: `px-4 py-2 text-sm font-medium rounded-t-md transition-colors whitespace-nowrap ${
              isActive
                ? "bg-purple-100 text-purple-700 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`,
            onClick: () => activeLayerStore.set(layer),
          },
          LAYER_LABELS[layer],
        );
      };
    }),
  );
};

export const createSchemaManager = () => {
  return div(
    { className: "space-y-4" },
    createAddSchemaForm(),
    createLayerTabs(),
    div({ className: "bg-gray-100 p-4 rounded-xl min-h-[200px]" }, () => {
      const schemas = schemasStore.get();
      const activeLayer = activeLayerStore.get();

      if (schemas.length === 0) {
        return div(
          { className: "text-center text-gray-400 py-10" },
          "Нет схем.",
        );
      }

      const sorted = getSortedSchemas(schemas);
      const filteredSchemas =
        activeLayer === "All"
          ? sorted
          : sorted.filter((s) => s.layer === activeLayer);

      if (filteredSchemas.length === 0) {
        return div(
          { className: "text-center text-gray-400 py-10" },
          `Нет схем для слоя ${LAYER_LABELS[activeLayer]}.`,
        );
      }

      const nodes: Node[] = [];
      let currentGroup: string | undefined = undefined;

      for (const schema of filteredSchemas) {
        const originalIndex = schemas.findIndex((s) => s.name === schema.name);

        if (schema.entityGroup && schema.entityGroup !== currentGroup) {
          currentGroup = schema.entityGroup;
          nodes.push(createGroupHeader(currentGroup));
        } else if (!schema.entityGroup && currentGroup !== undefined) {
          currentGroup = undefined;
          nodes.push(createGroupHeader("Прочие схемы"));
        }

        nodes.push(createSchemaItem(schema, originalIndex));
      }

      return div({ className: "space-y-3" }, ...nodes);
    }),
  );
};

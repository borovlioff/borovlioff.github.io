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
  details,
  summary,
  pre,
  code,
  textarea,
} from "@borovlioff/no-jsx";
import {
  dbEntitiesStore,
  resolveDbType,
  type DbEntity,
  type DbField,
} from "../../shared/state/db-entities";
import { schemasStore } from "../../shared/state/schemas";
import {
  upsertModels,
  toEntityName,
  getExistingLayers,
} from "../../shared/lib/model-generator";

/* ═══ Field row ═══ */

const createFieldRow = (
  field: DbField,
  entityIndex: number,
  fieldIndex: number,
) => {
  return div(
    {
      className:
        "group/field grid grid-cols-[1fr_1fr_80px_1fr_auto] gap-2 items-center py-2 px-2 rounded hover:bg-gray-50 border-b border-gray-100 last:border-0",
    },
    input({
      type: "text",
      className:
        "text-sm font-mono border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-400 outline-none",
      value: field.name,
      placeholder: "field_name",
      onInput: (e: Event) => {
        const entities = dbEntitiesStore.get();
        const updated = structuredClone(entities);
        updated[entityIndex].fields[fieldIndex].name = (
          e.target as HTMLInputElement
        ).value;
        dbEntitiesStore.set(updated);
      },
    }),
    input({
      type: "text",
      className:
        "text-sm font-mono border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-400 outline-none",
      value: field.type,
      placeholder: "varchar(255)",
      onInput: (e: Event) => {
        const entities = dbEntitiesStore.get();
        const updated = structuredClone(entities);
        updated[entityIndex].fields[fieldIndex].type = (
          e.target as HTMLInputElement
        ).value;
        dbEntitiesStore.set(updated);
      },
    }),
    label(
      {
        className:
          "flex items-center gap-1 text-xs text-gray-500 cursor-pointer select-none",
      },
      input({
        type: "checkbox",
        checked: field.nullable,
        className: "w-3.5 h-3.5 text-emerald-600 rounded",
        onChange: (e: Event) => {
          const entities = dbEntitiesStore.get();
          const updated = structuredClone(entities);
          updated[entityIndex].fields[fieldIndex].nullable = (
            e.target as HTMLInputElement
          ).checked;
          dbEntitiesStore.set(updated);
        },
      }),
      "NULL",
    ),
    input({
      type: "text",
      className:
        "text-xs border border-gray-200 rounded px-2 py-1 text-gray-500 focus:ring-1 focus:ring-emerald-400 outline-none",
      value: field.constraints || "",
      placeholder: "PK, FK→table.id, UNIQUE",
      onInput: (e: Event) => {
        const entities = dbEntitiesStore.get();
        const updated = structuredClone(entities);
        updated[entityIndex].fields[fieldIndex].constraints =
          (e.target as HTMLInputElement).value || undefined;
        dbEntitiesStore.set(updated);
      },
    }),
    button(
      {
        className:
          "opacity-0 group-hover/field:opacity-100 text-red-400 hover:text-red-600 p-1 rounded transition-opacity",
        onClick: () => {
          const entities = dbEntitiesStore.get();
          const updated = structuredClone(entities);
          updated[entityIndex].fields.splice(fieldIndex, 1);
          dbEntitiesStore.set(updated);
        },
      },
      "✕",
    ),
  );
};

/* ═══ Entity card ═══ */

const createEntityCard = (entity: DbEntity, entityIndex: number) => {
  const entityName = toEntityName(entity.name);

  return li(
    {
      className:
        "group bg-white border border-gray-200 rounded-xl shadow-sm hover:border-emerald-300 transition-colors mb-4 overflow-hidden",
    },
    div(
      {
        className:
          "flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200",
      },
      div(
        { className: "flex items-center gap-2" },
        span(
          {
            className:
              "bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide",
          },
          "TABLE",
        ),
        span({ className: "font-semibold text-gray-800" }, entity.name),
        entity.schema
          ? span(
              { className: "text-xs text-gray-400 font-mono" },
              `(${entity.schema})`,
            )
          : null,
        span(
          { className: "text-xs text-gray-400" },
          `${entity.fields.length} fields`,
        ),
      ),
      div(
        { className: "flex items-center gap-2" },
        () => {
          schemasStore.get();
          const layers = getExistingLayers(entityName);
          const count = Object.values(layers).filter(Boolean).length;
          return span(
            {
              className: `text-xs font-mono px-2 py-0.5 rounded ${
                count === 4
                  ? "bg-emerald-100 text-emerald-700"
                  : count > 0
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-400"
              }`,
            },
            `${count}/4`,
          );
        },
        button(
          {
            className:
              "text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-md border border-emerald-200 hover:bg-emerald-100 font-medium transition-colors",
            onClick: () => upsertModels(entity),
          },
          "⚙ → 4 Модели",
        ),
        button(
          {
            className:
              "opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded transition-all",
            onClick: () => {
              dbEntitiesStore.set(
                dbEntitiesStore.get().filter((_, i) => i !== entityIndex),
              );
            },
          },
          "🗑️",
        ),
      ),
    ),
    entity.comment
      ? div(
          {
            className:
              "px-4 py-2 text-sm text-gray-500 bg-yellow-50 border-b border-gray-100",
          },
          `💬 ${entity.comment}`,
        )
      : null,
    div(
      {
        className:
          "grid grid-cols-[1fr_1fr_80px_1fr_auto] gap-2 px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider",
      },
      span({}, "Поле"),
      span({}, "Тип"),
      span({}, "Null"),
      span({}, "Ограничения"),
      span({ className: "w-6" }, ""),
    ),
    div(
      { className: "px-2" },
      ...entity.fields.map((field, fieldIndex) =>
        createFieldRow(field, entityIndex, fieldIndex),
      ),
    ),
    div(
      { className: "p-3 border-t border-gray-100" },
      button(
        {
          className:
            "w-full text-xs text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded border border-dashed border-emerald-200 transition-colors",
          onClick: () => {
            const entities = dbEntitiesStore.get();
            const updated = structuredClone(entities);
            updated[entityIndex].fields.push({
              name: "",
              type: "varchar(255)",
              nullable: true,
            });
            dbEntitiesStore.set(updated);
          },
        },
        "+ Добавить поле",
      ),
    ),
  );
};

/* ═══ SQL-parser ═══ */

function parseSqlCreateTable(sql: string): DbEntity | null {
  const tableMatch = sql.match(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(\w+)\.)?(\w+)\s*$/i,
  );
  if (!tableMatch) return null;
  const schemaName = tableMatch[1] || "public";
  const tableName = tableMatch[2];
  const bodyMatch = sql.match(/\(([^]*)$\s*;?\s*$/);
  if (!bodyMatch) return null;
  const lines = bodyMatch[1]
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
  const fields: DbField[] = [];
  for (const line of lines) {
    if (/^\s*(PRIMARY\s+KEY|UNIQUE|CHECK|CONSTRAINT|FOREIGN\s+KEY)/i.test(line))
      continue;
    const colMatch = line.match(/^(\w+)\s+(\w+(?:$[^)]*$)?)\s*(.*)/i);
    if (!colMatch) continue;
    const name = colMatch[1];
    const type = colMatch[2];
    const rest = colMatch[3] || "";
    const nullable = !/NOT\s+NULL/i.test(rest);
    const constraints: string[] = [];
    if (/PRIMARY\s+KEY/i.test(rest)) constraints.push("PK");
    if (/UNIQUE/i.test(rest)) constraints.push("UNIQUE");
    const fkMatch = rest.match(/REFERENCES\s+(\w+)(?:$(\w+)$)?/i);
    if (fkMatch) constraints.push(`FK→${fkMatch[1]}.${fkMatch[2] || "id"}`);
    const defaultMatch = rest.match(/DEFAULT\s+(.+?)(?:\s+|$)/i);
    fields.push({
      name,
      type,
      nullable,
      constraints: constraints.length > 0 ? constraints.join(", ") : undefined,
      defaultValue: defaultMatch ? defaultMatch[1] : undefined,
    });
  }
  return { name: tableName, schema: schemaName, fields };
}

/* ═══ Add entity form ═══ */

const createAddEntityForm = () => {
  let nameValue = "";
  let schemaValue = "public";
  let commentValue = "";
  let nameInputEl: HTMLInputElement | null = null;
  let commentInputEl: HTMLInputElement | null = null;

  const nameField = input({
    type: "text",
    placeholder: "products",
    className:
      "w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none",
    onInput: (e: Event) => {
      nameValue = (e.target as HTMLInputElement).value;
    },
  });
  nameInputEl = nameField as unknown as HTMLInputElement;

  const commentField = input({
    type: "text",
    placeholder: "Описание таблицы...",
    className:
      "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 outline-none",
    onInput: (e: Event) => {
      commentValue = (e.target as HTMLInputElement).value;
    },
  });
  commentInputEl = commentField as unknown as HTMLInputElement;

  return div(
    { className: "mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200" },
    h3(
      { className: "text-sm font-semibold text-gray-700 mb-3" },
      "Добавить сущность / таблицу",
    ),
    div(
      { className: "grid grid-cols-1 md:grid-cols-4 gap-3 items-end" },
      div(
        { className: "md:col-span-1 flex flex-col gap-1" },
        label(
          { className: "text-xs font-medium text-gray-500" },
          "Имя таблицы *",
        ),
        nameField,
      ),
      div(
        { className: "flex flex-col gap-1" },
        label({ className: "text-xs font-medium text-gray-500" }, "Схема БД"),
        input({
          type: "text",
          placeholder: "public",
          value: "public",
          className:
            "w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none",
          onInput: (e: Event) => {
            schemaValue = (e.target as HTMLInputElement).value;
          },
        }),
      ),
      div(
        { className: "flex flex-col gap-1" },
        label(
          { className: "text-xs font-medium text-gray-500" },
          "Комментарий",
        ),
        commentField,
      ),
      button(
        {
          className:
            "bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 active:scale-95 transition-all",
          onClick: () => {
            if (!nameValue.trim()) return;
            dbEntitiesStore.set([
              ...dbEntitiesStore.get(),
              {
                name: nameValue.trim(),
                schema: schemaValue.trim() || "public",
                comment: commentValue.trim() || undefined,
                fields: [
                  {
                    name: "id",
                    type: "serial",
                    nullable: false,
                    constraints: "PK",
                  },
                ],
              },
            ]);
            nameValue = "";
            commentValue = "";
            if (nameInputEl) nameInputEl.value = "";
            if (commentInputEl) commentInputEl.value = "";
          },
        },
        "➕ Создать",
      ),
    ),
    div(
      { className: "mt-4" },
      details(
        { className: "group" },
        summary(
          {
            className:
              "cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-800 list-none flex items-center gap-1",
          },
          span({ className: "transition-transform group-open:rotate-90" }, "▶"),
          "Импорт из SQL (CREATE TABLE)",
        ),
        div(
          { className: "mt-2" },
          textarea({
            rows: 6,
            className:
              "w-full text-xs font-mono border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-emerald-500 outline-none resize-y",
            placeholder: `CREATE TABLE products (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  price NUMERIC(10,2) NOT NULL,\n  created_at TIMESTAMP DEFAULT now()\n);`,
          }),
          button(
            {
              className:
                "mt-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-emerald-200 border border-emerald-200",
              onClick: (e: Event) => {
                const ta = (e.target as HTMLElement)
                  .closest("div")
                  ?.querySelector("textarea");
                if (!ta || !ta.value.trim()) return;
                const parsed = parseSqlCreateTable(ta.value);
                if (parsed) {
                  dbEntitiesStore.set([...dbEntitiesStore.get(), parsed]);
                  ta.value = "";
                }
              },
            },
            "📥 Импортировать",
          ),
        ),
      ),
    ),
  );
};

/* ═══ Bulk actions ═══ */

const createBulkActions = () => {
  return div(
    { className: "flex gap-2 mb-4" },
    button(
      {
        className:
          "text-sm bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700 transition-colors",
        onClick: () => {
          dbEntitiesStore.get().forEach(upsertModels);
        },
      },
      "🔄 Сгенерировать все модели (4 слоя)",
    ),
  );
};

/* ═══ Main export ═══ */

export const createDbEntityManager = () => {
  return div(
    { className: "space-y-4" },
    createAddEntityForm(),
    createBulkActions(),
    div({ className: "bg-gray-100 p-4 rounded-xl min-h-[200px]" }, () => {
      const entities = dbEntitiesStore.get();
      if (entities.length === 0) {
        return div(
          { className: "text-center py-10 text-gray-400" },
          p({}, "Нет сущностей БД"),
          p(
            { className: "text-xs mt-1" },
            "Добавьте таблицу вручную или импортируйте SQL",
          ),
        );
      }
      return ul(
        { className: "list-none m-0 p-0" },
        ...entities.map((entity, index) => createEntityCard(entity, index)),
      );
    }),
    div(
      { className: "mt-6 pt-4 border-t border-gray-200" },
      details(
        { className: "group" },
        summary(
          {
            className:
              "cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 list-none flex items-center gap-2",
          },
          span({ className: "transition-transform group-open:rotate-90" }, "▶"),
          "Таблица маппинга типов БД → OpenAPI",
        ),
        div(
          { className: "mt-2 overflow-x-auto" },
          (() => {
            const rows = [
              ["uuid", "string", "uuid"],
              ["serial / int", "integer", "int32"],
              ["bigint", "integer", "int64"],
              ["varchar / char", "string", "—"],
              ["text", "string", "—"],
              ["boolean", "boolean", "—"],
              ["numeric / decimal", "number", "double"],
              ["float / real", "number", "float"],
              ["timestamp", "string", "date-time"],
              ["date", "string", "date"],
              ["jsonb / json", "object", "—"],
            ];
            return div(
              {
                className:
                  "bg-white border border-gray-200 rounded-lg overflow-hidden",
              },
              div(
                {
                  className:
                    "grid grid-cols-3 gap-2 px-3 py-2 bg-gray-200 rounded-t text-xs font-bold text-gray-600 uppercase",
                },
                span({}, "Тип БД"),
                span({}, "OpenAPI type"),
                span({}, "format"),
              ),
              ...rows.map((r) =>
                div(
                  {
                    className:
                      "grid grid-cols-3 gap-2 px-3 py-1.5 border-b border-gray-100 text-xs font-mono",
                  },
                  span({ className: "text-emerald-700" }, r[0]),
                  span({ className: "text-blue-700" }, r[1]),
                  span({ className: "text-gray-500" }, r[2]),
                ),
              ),
            );
          })(),
        ),
      ),
    ),
  );
};

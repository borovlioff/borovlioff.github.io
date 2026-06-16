import {
  div,
  button,
  span,
  h3,
  p,
  ul,
  li,
  details,
  summary,
} from "@borovlioff/no-jsx";
import { dbEntitiesStore, type DbEntity } from "../../shared/state/db-entities";
import { schemasStore, type ModelLayer } from "../../shared/state/schemas";
import {
  toEntityName,
  upsertModels,
  deleteEntityModels,
  getExistingLayers,
  isSystemField,
  isForeignKey,
} from "../../shared/lib/model-generator";

const LAYERS: ModelLayer[] = ["Base", "Create", "Update", "Response"];

const LAYER_COLORS: Record<ModelLayer, { on: string; off: string }> = {
  Base: {
    on: "bg-slate-100 text-slate-700 border-slate-300",
    off: "bg-gray-50 text-gray-300 border-gray-200",
  },
  Create: {
    on: "bg-green-100 text-green-700 border-green-300",
    off: "bg-gray-50 text-gray-300 border-gray-200",
  },
  Update: {
    on: "bg-amber-100 text-amber-700 border-amber-300",
    off: "bg-gray-50 text-gray-300 border-gray-200",
  },
  Response: {
    on: "bg-blue-100 text-blue-700 border-blue-300",
    off: "bg-gray-50 text-gray-300 border-gray-200",
  },
};

const createFieldClassification = (entity: DbEntity) => {
  const base = entity.fields.filter(
    (f) => !isSystemField(f) && !isForeignKey(f),
  );
  const sys = entity.fields.filter(isSystemField);
  const fk = entity.fields.filter(isForeignKey);

  const parts: Node[] = [];
  if (base.length > 0) {
    parts.push(
      span(
        { className: "text-slate-500" },
        `Base: ${base.map((f) => f.name).join(", ")}`,
      ),
    );
  }
  if (fk.length > 0) {
    parts.push(
      span(
        { className: "text-orange-500" },
        `FK: ${fk.map((f) => f.name).join(", ")}`,
      ),
    );
  }
  if (sys.length > 0) {
    parts.push(
      span(
        { className: "text-purple-500" },
        `Sys: ${sys.map((f) => f.name).join(", ")}`,
      ),
    );
  }

  return div({ className: "flex flex-wrap gap-3 text-xs mt-1" }, ...parts);
};

const createEntityRow = (entity: DbEntity) => {
  const entityName = toEntityName(entity.name);

  return li(
    {
      className:
        "flex flex-col gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors",
    },
    div(
      { className: "flex items-center justify-between gap-2 flex-wrap" },
      div(
        { className: "flex items-center gap-2 flex-wrap" },
        span(
          { className: "font-semibold text-gray-800 text-sm font-mono" },
          entity.name,
        ),
        span({ className: "text-gray-400 text-xs" }, "→"),
        span(
          { className: "font-semibold text-emerald-700 text-sm" },
          entityName,
        ),
      ),
      div(
        { className: "flex items-center gap-1.5 shrink-0" },
        button(
          {
            className:
              "text-xs bg-emerald-600 text-white px-3 py-1.5 rounded font-medium hover:bg-emerald-700 transition-colors",
            onClick: () => upsertModels(entity),
          },
          "⚙ Создать / Обновить",
        ),
        button(
          {
            className:
              "text-xs bg-red-50 text-red-600 px-2 py-1.5 rounded border border-red-200 hover:bg-red-100 transition-colors",
            onClick: () => deleteEntityModels(entityName),
          },
          "🗑",
        ),
      ),
    ),
    () => {
      schemasStore.get();
      const layers = getExistingLayers(entityName);
      return div(
        { className: "flex gap-1.5" },
        ...LAYERS.map((layer) => {
          const exists = layers[layer];
          const colors = LAYER_COLORS[layer];
          return span(
            {
              className: `text-xs font-bold px-1.5 py-0.5 rounded border ${exists ? colors.on : colors.off}`,
            },
            `${exists ? "✓" : "✗"} ${layer}`,
          );
        }),
      );
    },
    createFieldClassification(entity),
  );
};

export const createModelManager = () => {
  return div(
    {
      className:
        "mb-8 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200",
    },
    div(
      { className: "flex items-center justify-between mb-4" },
      div(
        {},
        h3(
          {
            className:
              "text-base font-bold text-emerald-900 flex items-center gap-2",
          },
          "🏗 Генерация моделей из сущностей БД",
        ),
        p(
          { className: "text-xs text-emerald-700 mt-0.5" },
          "Base → Create → Update → Response для каждой таблицы.",
        ),
      ),
      button(
        {
          className:
            "bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-emerald-800 transition-colors shadow-sm",
          onClick: () => {
            dbEntitiesStore.get().forEach(upsertModels);
          },
        },
        "🔄 Все модели",
      ),
    ),
    details(
      { className: "mb-4 group" },
      summary(
        {
          className:
            "cursor-pointer text-xs font-semibold text-emerald-600 hover:text-emerald-800 list-none flex items-center gap-1",
        },
        span({ className: "transition-transform group-open:rotate-90" }, "▶"),
        "Правила слоёв",
      ),
      div(
        {
          className:
            "mt-2 text-xs text-gray-600 bg-white rounded-lg p-3 border border-emerald-100 space-y-1.5",
        },
        div(
          {},
          span({ className: "font-bold text-slate-700" }, "Base"),
          " — Атомарные поля. Без id, дат, FK.",
        ),
        div(
          {},
          span({ className: "font-bold text-green-700" }, "Create"),
          " — allOf[Base] + FK ID. required для обязательных.",
        ),
        div(
          {},
          span({ className: "font-bold text-amber-700" }, "Update"),
          " — allOf[Base] + FK ID. Без required (PATCH).",
        ),
        div(
          {},
          span({ className: "font-bold text-blue-700" }, "Response"),
          " — allOf[Base] + id, даты + вложенные $ref.",
        ),
      ),
    ),
    () => {
      const entities = dbEntitiesStore.get();
      schemasStore.get();

      if (entities.length === 0) {
        return div(
          { className: "text-center py-6 text-emerald-600/60 text-sm" },
          p({}, "Нет сущностей БД."),
          p(
            { className: "text-xs mt-1" },
            "Перейдите во вкладку «База данных».",
          ),
        );
      }

      return ul(
        { className: "list-none m-0 p-0 space-y-2" },
        ...entities.map((e) => createEntityRow(e)),
      );
    },
  );
};

import type { DbEntity, DbField } from "../state/db-entities";
import { resolveDbType } from "../state/db-entities";
import {
  schemasStore,
  type SchemaDefinition,
  type SchemaProperty,
  type AllOfEntry,
  type ModelLayer,
} from "../state/schemas";
import { validationsStore, type Validation } from "../state/validations";
import {
  getValidationById,
  applyValidationToSchema,
} from "../state/validations";

export const applyValidationsToProp = (prop: SchemaProperty): void => {
  if (!prop.validationIds || prop.validationIds.length === 0) return;
  for (const validationId of prop.validationIds) {
    const validation = getValidationById(validationId);
    if (validation) {
      applyValidationToSchema(prop, validation);
    }
  }
};

const parseVarcharLength = (type: string): number | undefined => {
  const match = type.match(/(?:varchar|char)\((\d+)\)/i);
  return match ? parseInt(match[1], 10) : undefined;
};

const parseNumericPrecision = (
  type: string,
): { min?: number; max?: number } | undefined => {
  const match = type.match(/numeric\((\d+),(\d+)\)/i);
  if (match) {
    const precision = parseInt(match[1], 10);
    const scale = parseInt(match[2], 10);
    const max = Math.pow(10, precision - scale) - Math.pow(10, -scale);
    return { min: -max, max };
  }
  return undefined;
};

const fieldToProp = (f: DbField): SchemaProperty => {
  const m = resolveDbType(f.type);
  const prop: SchemaProperty = {
    name: snakeToCamel(f.name),
    type: m.type,
    format: m.format,
    description: f.comment || undefined,
    example: m.example,
    nullable: f.nullable || undefined,
    default: f.defaultValue || undefined,
    validationIds: [],
  };

  const constraints = f.constraints?.toUpperCase() || "";

  if (constraints.includes("UNIQUE")) {
    const existingValidations = validationsStore.get();
    const uniqueValidation = existingValidations.find((v) => v.id === "unique");
    if (!uniqueValidation) {
      validationsStore.set([
        ...existingValidations,
        {
          id: "unique",
          name: "Unique",
          type: "pattern",
          value: ".*",
          description: "Unique constraint (application-level)",
        },
      ]);
    }
    prop.validationIds!.push("unique");
  }

  const maxLength = parseVarcharLength(f.type);
  if (maxLength) {
    const existingValidations = validationsStore.get();
    const validationId = `maxlength-${maxLength}`;
    if (!existingValidations.find((v) => v.id === validationId)) {
      validationsStore.set([
        ...existingValidations,
        {
          id: validationId,
          name: `Max Length ${maxLength}`,
          type: "maxLength",
          value: maxLength,
          description: `Maximum ${maxLength} characters`,
        },
      ]);
    }
    prop.validationIds!.push(validationId);
  }

  const numericRange = parseNumericPrecision(f.type);
  if (numericRange) {
    const existingValidations = validationsStore.get();
    const validationId = `numeric-range-${numericRange.min}-${numericRange.max}`;
    if (!existingValidations.find((v) => v.id === validationId)) {
      validationsStore.set([
        ...existingValidations,
        {
          id: validationId,
          name: `Numeric Range ${numericRange.min} to ${numericRange.max}`,
          type: "minimum",
          value: numericRange.min!,
          description: `Range: ${numericRange.min} to ${numericRange.max}`,
        },
      ]);
    }
    prop.validationIds!.push(validationId);
  }

  if (f.type.toLowerCase().includes("email")) {
    prop.validationIds!.push("email");
  } else if (f.name.toLowerCase().includes("email")) {
    prop.validationIds!.push("email");
  }

  if (
    f.type.toLowerCase().includes("phone") ||
    f.name.toLowerCase().includes("phone")
  ) {
    prop.validationIds!.push("phone");
  }

  if (
    f.type.toLowerCase().includes("url") ||
    f.name.toLowerCase().includes("url") ||
    f.name.toLowerCase().includes("uri")
  ) {
    prop.validationIds!.push("uri");
  }

  return prop;
};

export const snakeToCamel = (s: string): string =>
  s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

export const singularize = (w: string): string => {
  if (w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (
    w.endsWith("ses") ||
    w.endsWith("xes") ||
    w.endsWith("zes") ||
    w.endsWith("ches") ||
    w.endsWith("shes")
  )
    return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us"))
    return w.slice(0, -1);
  return w;
};

export const toEntityName = (tableName: string): string => {
  const parts = tableName.toLowerCase().split("_");
  parts[parts.length - 1] = singularize(parts[parts.length - 1]);
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
};

const SYS_NAMES = new Set([
  "id",
  "uuid",
  "created_at",
  "updated_at",
  "deleted_at",
]);

export const isSystemField = (f: DbField): boolean =>
  SYS_NAMES.has(f.name.toLowerCase()) ||
  (f.constraints?.includes("PK") ?? false);

export const isForeignKey = (f: DbField): boolean =>
  (f.constraints?.toUpperCase().includes("FK") ?? false) ||
  f.name.endsWith("_id");

export const getFkTarget = (
  f: DbField,
): { table: string; column: string } | null => {
  const m = f.constraints?.match(/FK[→\->]+(\w+)\.(\w+)/);
  if (m) return { table: m[1], column: m[2] };
  if (f.name.endsWith("_id")) {
    const base = f.name.slice(0, -3);
    return { table: base + "s", column: "id" };
  }
  return null;
};

export interface GeneratedModels {
  base: SchemaDefinition;
  create: SchemaDefinition;
  update: SchemaDefinition;
  response: SchemaDefinition;
}

export const generateModels = (entity: DbEntity): GeneratedModels => {
  const E = toEntityName(entity.name);

  const baseFields: DbField[] = [];
  const systemFields: DbField[] = [];
  const foreignKeys: DbField[] = [];

  for (const f of entity.fields) {
    if (isSystemField(f)) systemFields.push(f);
    else if (isForeignKey(f)) foreignKeys.push(f);
    else baseFields.push(f);
  }

  const baseProps = baseFields.map(fieldToProp);
  baseProps.forEach(applyValidationsToProp);

  const fkIdProps = foreignKeys.map((fk) => {
    const m = resolveDbType(fk.type);
    const prop: SchemaProperty = {
      name: snakeToCamel(fk.name),
      type: m.type,
      format: m.format,
      description: fk.comment || "ID связанной сущности",
      example: m.example,
      nullable: fk.nullable || undefined,
      default: fk.defaultValue || undefined,
      validationIds: [],
    };
    applyValidationsToProp(prop);
    return prop;
  });

  const fkNestedProps: SchemaProperty[] = foreignKeys.map((fk) => {
    const target = getFkTarget(fk);
    const refEntity = target ? toEntityName(target.table) : "Unknown";
    return {
      name: snakeToCamel(fk.name.replace(/_id$/, "")),
      type: "object",
      $ref: `#/components/schemas/${refEntity}Response`,
      description: `Вложенный объект ${refEntity}`,
    };
  });

  const base: SchemaDefinition = {
    name: `${E}Base`,
    type: "object",
    description: `Базовые поля ${E}. Только атомарные атрибуты — без id, дат, FK.`,
    properties: baseProps,
    layer: "Base",
    entityGroup: E,
  };

  const createRequired = [
    ...baseFields
      .filter((f) => !f.nullable && !f.defaultValue)
      .map((f) => snakeToCamel(f.name)),
    ...foreignKeys
      .filter((f) => !f.nullable && !f.defaultValue)
      .map((f) => snakeToCamel(f.name)),
  ];

  const createAllOf: AllOfEntry[] = [{ $ref: `#/components/schemas/${E}Base` }];

  if (fkIdProps.length > 0 || createRequired.length > 0) {
    createAllOf.push({
      properties: fkIdProps.length > 0 ? fkIdProps : undefined,
      required: createRequired.length > 0 ? createRequired : undefined,
    });
  }

  const create: SchemaDefinition = {
    name: `${E}Create`,
    type: "object",
    description: `Создание ${E}. allOf[Base] + FK как плоские ID. Обязательные поля в required.`,
    allOf: createAllOf,
    layer: "Create",
    entityGroup: E,
  };

  const updateAllOf: AllOfEntry[] = [{ $ref: `#/components/schemas/${E}Base` }];

  if (fkIdProps.length > 0) {
    updateAllOf.push({ properties: fkIdProps });
  }

  const update: SchemaDefinition = {
    name: `${E}Update`,
    type: "object",
    description: `Частичное обновление ${E} (PATCH). Все поля опциональны.`,
    allOf: updateAllOf,
    layer: "Update",
    entityGroup: E,
  };

  const pkField = systemFields.find(
    (f) => (f.constraints?.includes("PK") ?? false) || f.name === "id",
  );

  const timestamps = systemFields.filter((f) =>
    ["created_at", "updated_at"].includes(f.name.toLowerCase()),
  );

  const responseSysProps: SchemaProperty[] = [];

  if (pkField) {
    const m = resolveDbType(pkField.type);
    const prop: SchemaProperty = {
      name: snakeToCamel(pkField.name),
      type: m.type,
      format: m.format,
      example: m.example,
      description: "Уникальный идентификатор",
      readOnly: true,
      validationIds: [],
    };
    applyValidationsToProp(prop);
    responseSysProps.push(prop);
  }

  for (const tf of timestamps) {
    responseSysProps.push({
      name: snakeToCamel(tf.name),
      type: "string",
      format: "date-time",
      example: "2025-01-15T10:30:00Z",
      readOnly: true,
      validationIds: ["date-time"],
    });
  }

  const responseRequired: string[] = [];
  if (pkField) responseRequired.push(snakeToCamel(pkField.name));
  for (const tf of timestamps) {
    if (!tf.nullable) responseRequired.push(snakeToCamel(tf.name));
  }

  const response: SchemaDefinition = {
    name: `${E}Response`,
    type: "object",
    description: `Полный ответ ${E}. Системные поля + вложенные объекты ($ref) вместо FK ID.`,
    allOf: [
      { $ref: `#/components/schemas/${E}Base` },
      {
        properties: [...responseSysProps, ...fkNestedProps],
        required: responseRequired.length > 0 ? responseRequired : undefined,
      },
    ],
    layer: "Response",
    entityGroup: E,
  };

  return { base, create, update, response };
};

export const upsertModels = (entity: DbEntity): void => {
  const models = generateModels(entity);
  const arr = [models.base, models.create, models.update, models.response];
  const current = [...schemasStore.get()];

  for (const model of arr) {
    const idx = current.findIndex((s) => s.name === model.name);
    if (idx >= 0) current[idx] = model;
    else current.push(model);
  }

  schemasStore.set(current);
};

export const deleteEntityModels = (entityName: string): void => {
  const names = new Set([
    `${entityName}Base`,
    `${entityName}Create`,
    `${entityName}Update`,
    `${entityName}Response`,
  ]);
  schemasStore.set(schemasStore.get().filter((s) => !names.has(s.name)));
};

export const getExistingLayers = (
  entityName: string,
): Record<ModelLayer, boolean> => {
  const names = new Set(schemasStore.get().map((s) => s.name));
  return {
    Base: names.has(`${entityName}Base`),
    Create: names.has(`${entityName}Create`),
    Update: names.has(`${entityName}Update`),
    Response: names.has(`${entityName}Response`),
  };
};

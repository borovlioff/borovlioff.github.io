import { createStore } from "@borovlioff/no-jsx";

export interface DbField {
  name: string;
  type: string; // varchar, int, boolean, text, timestamp, uuid, jsonb...
  nullable: boolean;
  defaultValue?: string;
  constraints?: string; // PK, FK, UNIQUE, INDEX...
  comment?: string;
}

export interface DbEntity {
  name: string;
  schema?: string; // public, auth, etc.
  comment?: string;
  fields: DbField[];
}

const initialEntities: DbEntity[] = [
  {
    name: "users",
    schema: "public",
    comment: "Пользователи системы",
    fields: [
      {
        name: "id",
        type: "uuid",
        nullable: false,
        constraints: "PK",
        defaultValue: "gen_random_uuid()",
      },
      {
        name: "username",
        type: "varchar(255)",
        nullable: false,
        constraints: "UNIQUE",
      },
      {
        name: "email",
        type: "varchar(255)",
        nullable: false,
        constraints: "UNIQUE",
      },
      { name: "password_hash", type: "text", nullable: false },
      {
        name: "is_active",
        type: "boolean",
        nullable: false,
        defaultValue: "true",
      },
      {
        name: "created_at",
        type: "timestamp",
        nullable: false,
        defaultValue: "now()",
      },
    ],
  },
  {
    name: "orders",
    schema: "public",
    comment: "Заказы",
    fields: [
      { name: "id", type: "serial", nullable: false, constraints: "PK" },
      {
        name: "user_id",
        type: "uuid",
        nullable: false,
        constraints: "FK→users.id",
      },
      { name: "total", type: "numeric(10,2)", nullable: false },
      {
        name: "status",
        type: "varchar(50)",
        nullable: false,
        defaultValue: "'pending'",
      },
      {
        name: "created_at",
        type: "timestamp",
        nullable: false,
        defaultValue: "now()",
      },
    ],
  },
];

export const dbEntitiesStore = createStore<DbEntity[]>(initialEntities);

// Маппинг типов БД → OpenAPI типов
export const DB_TYPE_TO_OPENAPI: Record<
  string,
  { type: string; format?: string; example?: any }
> = {
  uuid: {
    type: "string",
    format: "uuid",
    example: "550e8400-e29b-41d4-a716-446655440000",
  },
  serial: { type: "integer", format: "int32", example: 1 },
  bigserial: { type: "integer", format: "int64", example: 1 },
  int: { type: "integer", format: "int32", example: 42 },
  integer: { type: "integer", format: "int32", example: 42 },
  bigint: { type: "integer", format: "int64", example: 100000 },
  smallint: { type: "integer", format: "int32", example: 1 },
  boolean: { type: "boolean", example: true },
  text: { type: "string", example: "some text" },
  jsonb: { type: "object", example: {} },
  json: { type: "object", example: {} },
  timestamp: {
    type: "string",
    format: "date-time",
    example: "2025-01-15T10:30:00Z",
  },
  timestamptz: {
    type: "string",
    format: "date-time",
    example: "2025-01-15T10:30:00Z",
  },
  date: { type: "string", format: "date", example: "2025-01-15" },
  time: { type: "string", format: "time", example: "10:30:00" },
  float: { type: "number", format: "float", example: 3.14 },
  double: { type: "number", format: "double", example: 3.14 },
  real: { type: "number", format: "float", example: 3.14 },
};

/** Получить OpenAPI-тип из строки типа БД (varchar(255) → string) */
export const resolveDbType = (
  dbType: string,
): { type: string; format?: string; example?: any } => {
  const normalized = dbType.toLowerCase().replace(/$.*$/, "").trim();
  if (normalized.startsWith("varchar") || normalized.startsWith("char")) {
    return { type: "string", example: "example" };
  }
  if (normalized.startsWith("numeric") || normalized.startsWith("decimal")) {
    return { type: "number", format: "double", example: 99.99 };
  }
  return DB_TYPE_TO_OPENAPI[normalized] || { type: "string", example: "" };
};

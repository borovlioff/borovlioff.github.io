import { createStore } from "@borovlioff/no-jsx";

export type SchemaType =
  | "object"
  | "array"
  | "string"
  | "integer"
  | "boolean"
  | "number"
  | "null";

export type ModelLayer = "Base" | "Create" | "Update" | "Response";

export interface SchemaProperty {
  name: string;
  type: string;
  format?: string;
  description?: string;
  example?: any;
  $ref?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  enum?: any[];
  nullable?: boolean;
  default?: any;
  readOnly?: boolean;
  writeOnly?: boolean;
  validationIds?: string[];
}

export interface AllOfEntry {
  $ref?: string;
  properties?: SchemaProperty[];
  required?: string[];
}

export interface SchemaDefinition {
  name: string;
  type: "object" | "array" | "string" | "integer" | "boolean" | "number";
  description?: string;
  properties?: SchemaProperty[];
  required?: string[];
  example?: any;
  allOf?: AllOfEntry[];
  layer?: ModelLayer;
  entityGroup?: string;
}

export interface SchemaObject {
  $ref?: string;
  type?: SchemaType;
  format?: string;
  description?: string;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject;
  enum?: any[];
  example?: any;
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  not?: SchemaObject;
  nullable?: boolean;
}

const LAYER_ORDER: Record<ModelLayer, number> = {
  Base: 0,
  Create: 1,
  Update: 2,
  Response: 3,
};

export const getSortedSchemas = (
  schemas: SchemaDefinition[],
): SchemaDefinition[] =>
  [...schemas].sort((a, b) => {
    const aGroup = a.entityGroup || "";
    const bGroup = b.entityGroup || "";

    if (aGroup && !bGroup) return -1;
    if (!aGroup && bGroup) return 1;

    if (aGroup && bGroup) {
      if (aGroup !== bGroup) return aGroup.localeCompare(bGroup);
      const aOrder = a.layer ? (LAYER_ORDER[a.layer] ?? 99) : 99;
      const bOrder = b.layer ? (LAYER_ORDER[b.layer] ?? 99) : 99;
      return aOrder - bOrder;
    }

    return a.name.localeCompare(b.name);
  });

export const serializeProperty = (prop: SchemaProperty): any => {
  if (prop.$ref) return { $ref: prop.$ref };

  const out: any = { type: prop.type };

  if (prop.format) out.format = prop.format;
  if (prop.description) out.description = prop.description;
  if (prop.example !== undefined) out.example = prop.example;
  if (prop.pattern) out.pattern = prop.pattern;
  if (prop.minLength !== undefined) out.minLength = prop.minLength;
  if (prop.maxLength !== undefined) out.maxLength = prop.maxLength;
  if (prop.minimum !== undefined) out.minimum = prop.minimum;
  if (prop.maximum !== undefined) out.maximum = prop.maximum;
  if (prop.enum) out.enum = prop.enum;
  if (prop.nullable) out.nullable = prop.nullable;
  if (prop.default !== undefined) out.default = prop.default;
  if (prop.readOnly) out.readOnly = prop.readOnly;
  if (prop.writeOnly) out.writeOnly = prop.writeOnly;

  return out;
};

export const serializeAllOfEntry = (entry: AllOfEntry): any => {
  if (entry.$ref) return { $ref: entry.$ref };

  const out: any = { type: "object" };

  if (entry.properties && entry.properties.length > 0) {
    out.properties = {};
    for (const p of entry.properties) {
      out.properties[p.name] = serializeProperty(p);
    }
  }

  if (entry.required && entry.required.length > 0) {
    out.required = entry.required;
  }

  return out;
};

export const serializeSchema = (schema: SchemaDefinition): any => {
  if (schema.allOf && schema.allOf.length > 0) {
    const out: any = {};
    if (schema.description) out.description = schema.description;
    out.allOf = schema.allOf.map(serializeAllOfEntry);
    return out;
  }

  const out: any = { type: schema.type };

  if (schema.description) out.description = schema.description;

  if (schema.properties && schema.properties.length > 0) {
    out.properties = {};
    for (const p of schema.properties) {
      out.properties[p.name] = serializeProperty(p);
    }
  }

  if (schema.required && schema.required.length > 0) {
    out.required = schema.required;
  }

  if (schema.example !== undefined) out.example = schema.example;

  return out;
};

const initialSchemas: SchemaDefinition[] = [
  {
    name: "User",
    type: "object",
    layer: "Base",
    description: "A user object",
    example: { id: 123, username: "john_doe", isActive: true },
    properties: [
      { name: "id", type: "integer", format: "int64", example: 123 },
      { name: "username", type: "string", example: "john_doe" },
      { name: "isActive", type: "boolean", example: true },
    ],
    required: ["id", "username"],
  },
];

export const schemasStore = createStore<SchemaDefinition[]>(initialSchemas);

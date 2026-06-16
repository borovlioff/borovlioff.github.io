// shared/types/model.ts
export type ModelLayer = "Base" | "Create" | "Update" | "Response";

export const MODEL_LAYERS: (ModelLayer | "All")[] = [
  "All",
  "Base",
  "Create",
  "Update",
  "Response",
];

export const LAYER_BADGE: Record<ModelLayer, string> = {
  Base: "bg-slate-100 text-slate-700",
  Create: "bg-green-100 text-green-700",
  Update: "bg-amber-100 text-amber-700",
  Response: "bg-blue-100 text-blue-700",
};

export const LAYER_LABELS: Record<ModelLayer | "All", string> = {
  All: "Все",
  Base: "Base",
  Create: "Create",
  Update: "Update",
  Response: "Response",
};

export const FORMAT_OPTIONS: Record<string, string[]> = {
  string: [
    "",
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
  ],
  integer: ["", "int32", "int64"],
  number: ["", "float", "double"],
};

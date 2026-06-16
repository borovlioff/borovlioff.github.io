import { createStore } from "@borovlioff/no-jsx";

export type ValidationType =
  | "format"
  | "pattern"
  | "minLength"
  | "maxLength"
  | "minimum"
  | "maximum"
  | "enum";

export interface Validation {
  id: string;
  name: string;
  type: ValidationType;
  value: string | number | string[];
  description?: string;
}

const initialValidations: Validation[] = [
  {
    id: "email",
    name: "Email",
    type: "format",
    value: "email",
    description: "Email address format",
  },
  {
    id: "uuid",
    name: "UUID",
    type: "format",
    value: "uuid",
    description: "UUID format",
  },
  {
    id: "uri",
    name: "URI",
    type: "format",
    value: "uri",
    description: "URI format",
  },
  {
    id: "date-time",
    name: "DateTime",
    type: "format",
    value: "date-time",
    description: "ISO 8601 date-time",
  },
  {
    id: "phone",
    name: "Phone",
    type: "pattern",
    value: "^\\+?[1-9]\\d{1,14}$",
    description: "E.164 phone format",
  },
  {
    id: "password-strong",
    name: "Strong Password",
    type: "pattern",
    value:
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    description: "Min 8 chars, uppercase, lowercase, number, special char",
  },
];

export const validationsStore = createStore<Validation[]>(initialValidations);

export const getValidationById = (id: string): Validation | undefined => {
  return validationsStore.get().find((v) => v.id === id);
};

export const applyValidationToSchema = (
  schemaProp: any,
  validation: Validation,
): void => {
  switch (validation.type) {
    case "format":
      schemaProp.format = validation.value as string;
      break;
    case "pattern":
      schemaProp.pattern = validation.value as string;
      break;
    case "minLength":
      schemaProp.minLength = validation.value as number;
      break;
    case "maxLength":
      schemaProp.maxLength = validation.value as number;
      break;
    case "minimum":
      schemaProp.minimum = validation.value as number;
      break;
    case "maximum":
      schemaProp.maximum = validation.value as number;
      break;
    case "enum":
      schemaProp.enum = validation.value as string[];
      break;
  }
};

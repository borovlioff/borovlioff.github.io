import { createStore } from "@borovlioff/no-jsx";

export type SecuritySchemeType = "apiKey" | "http" | "oauth2" | "openIdConnect";
export type HttpScheme = "basic" | "bearer";
export type ApiKeyIn = "header" | "query" | "cookie";

export interface SecurityScheme {
  name: string;
  type: SecuritySchemeType;
  description?: string;

  scheme?: HttpScheme;
  bearerFormat?: string;
  in?: ApiKeyIn;
  paramName?: string;
}

const initialSchemes: SecurityScheme[] = [
  {
    name: "BearerAuth",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "JWT Bearer token authentication",
  },
];

export const securityStore = createStore<SecurityScheme[]>(initialSchemes);

import { createStore } from "@borovlioff/no-jsx";

export interface GlobalSecurityRequirement {
  [schemeName: string]: string[];
}

const initialGlobalSecurity: GlobalSecurityRequirement[] = [];

export const globalSecurityStore = createStore<GlobalSecurityRequirement[]>(
  initialGlobalSecurity,
);

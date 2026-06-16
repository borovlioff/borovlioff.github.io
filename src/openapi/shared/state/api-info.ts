import { createStore } from "@borovlioff/no-jsx";

export interface ApiInfoState {
  title: string;
  description: string;
  version: string;
  termsOfService: string;
  contactName: string;
  contactEmail: string;
  licenseName: string;
}

export const apiInfoStore = createStore<ApiInfoState>({
  title: "My API",
  description: "",
  version: "1.0.0",
  termsOfService: "",
  contactName: "",
  contactEmail: "",
  licenseName: "MIT",
});

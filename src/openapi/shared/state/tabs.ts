import { createStore } from "@borovlioff/no-jsx";

export type TabId = "api-info" | "servers" | "tags" | "security" | "schemas";

export const activeTab = createStore<TabId>("api-info");

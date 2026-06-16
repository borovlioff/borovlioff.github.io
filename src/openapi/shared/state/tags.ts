import { createStore } from "@borovlioff/no-jsx";

export interface Tag {
  name: string;
  description?: string;
}

const initialTags: Tag[] = [
  { name: "Users", description: "Operations about user accounts" },
  { name: "Orders", description: "Managing orders and transactions" },
];

export const tagsStore = createStore<Tag[]>(initialTags);

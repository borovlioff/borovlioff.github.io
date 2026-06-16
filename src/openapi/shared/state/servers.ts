import { createStore } from "@borovlioff/no-jsx";

export interface ServerVariable {
  enum?: string[];
  default: string;
  description?: string;
}

export interface Server {
  url: string;
  description?: string;
  variables?: Record<string, ServerVariable>;
}

// Начальное состояние из примера HTML
const initialServers: Server[] = [
  {
    url: "https://api.example.com/v1",
    description: "Production",
  },
];

export const serversStore = createStore<Server[]>(initialServers);

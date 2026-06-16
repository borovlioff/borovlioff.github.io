// features/server-manager/index.ts
import {
  div,
  input,
  button,
  label,
  h3,
  p,
  ul,
  li,
  span,
  details,
  summary,
  textarea,
} from "@borovlioff/no-jsx";
import {
  serversStore,
  type Server,
  type ServerVariable,
} from "../../shared/state/servers";

const updateServer = (index: number, patch: Partial<Server>): void => {
  const current = serversStore.get();
  const updated = [...current];
  updated[index] = { ...updated[index], ...patch };
  serversStore.set(updated);
};

const updateVariable = (
  serverIndex: number,
  oldName: string,
  variable: ServerVariable,
  newName: string,
): void => {
  const server = serversStore.get()[serverIndex];
  const vars = { ...(server.variables || {}) };
  if (oldName !== newName) delete vars[oldName];
  vars[newName] = variable;
  updateServer(serverIndex, { variables: vars });
};

const removeVariable = (serverIndex: number, varName: string): void => {
  const server = serversStore.get()[serverIndex];
  const vars = { ...(server.variables || {}) };
  delete vars[varName];
  updateServer(serverIndex, { variables: vars });
};

const createVariableEditor = (
  serverIndex: number,
  varName: string,
  variable: ServerVariable,
) => {
  let nameValue = varName;
  return div(
    {
      className: "p-3 bg-gray-50 border border-gray-200 rounded-md space-y-2",
    },
    div(
      { className: "flex items-center gap-2" },
      div(
        { className: "flex-1 flex flex-col gap-1" },
        label(
          { className: "text-xs font-medium text-gray-500" },
          "Имя переменной",
        ),
        input({
          type: "text",
          value: varName,
          className:
            "w-full px-2 py-1 text-sm font-mono border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none",
          onInput: (e: Event) => {
            const newName = (e.target as HTMLInputElement).value.trim();
            if (!newName) return;
            nameValue = newName;
            updateVariable(serverIndex, varName, variable, newName);
          },
        }),
      ),
      button(
        {
          className:
            "mt-5 p-2 text-red-500 hover:bg-red-50 rounded transition-all",
          title: "Удалить переменную",
          onClick: () => removeVariable(serverIndex, varName),
        },
        "🗑️",
      ),
    ),
    div(
      { className: "grid grid-cols-1 md:grid-cols-2 gap-2" },
      div(
        { className: "flex flex-col gap-1" },
        label(
          { className: "text-xs font-medium text-gray-500" },
          "Значение по умолчанию *",
        ),
        input({
          type: "text",
          value: variable.default,
          className:
            "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none",
          onInput: (e: Event) => {
            updateVariable(
              serverIndex,
              nameValue,
              {
                ...variable,
                default: (e.target as HTMLInputElement).value,
              },
              nameValue,
            );
          },
        }),
      ),
      div(
        { className: "flex flex-col gap-1" },
        label({ className: "text-xs font-medium text-gray-500" }, "Описание"),
        input({
          type: "text",
          value: variable.description || "",
          className:
            "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none",
          onInput: (e: Event) => {
            updateVariable(
              serverIndex,
              nameValue,
              {
                ...variable,
                description: (e.target as HTMLInputElement).value || undefined,
              },
              nameValue,
            );
          },
        }),
      ),
    ),
    div(
      { className: "flex flex-col gap-1" },
      label(
        { className: "text-xs font-medium text-gray-500" },
        "Enum (через запятую)",
      ),
      input({
        type: "text",
        value: variable.enum ? variable.enum.join(", ") : "",
        placeholder: "val1, val2, val3",
        className:
          "w-full px-2 py-1 text-sm font-mono border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none",
        onInput: (e: Event) => {
          const val = (e.target as HTMLInputElement).value;
          const arr = val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          updateVariable(
            serverIndex,
            nameValue,
            {
              ...variable,
              enum: arr.length > 0 ? arr : undefined,
            },
            nameValue,
          );
        },
      }),
    ),
  );
};

const createVariablesSection = (server: Server, serverIndex: number) => {
  const variables = server.variables || {};
  const entries = Object.entries(variables);
  return details(
    { className: "group mt-3" },
    summary(
      {
        className:
          "cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-800 list-none flex items-center gap-1",
      },
      span(
        {
          className: "transition-transform group-open:rotate-90 inline-block",
        },
        "▶",
      ),
      `Переменные URL (${entries.length})`,
    ),
    div(
      { className: "mt-3 space-y-3 pl-3 border-l-2 border-blue-100" },
      ...entries.map(([name, variable]) =>
        createVariableEditor(serverIndex, name, variable),
      ),
      button(
        {
          className:
            "w-full text-xs text-blue-600 hover:bg-blue-50 px-3 py-2 rounded border border-dashed border-blue-200 transition-colors",
          onClick: () => {
            const vars = { ...(server.variables || {}) };
            let idx = 1;
            let newName = `var${idx}`;
            while (vars[newName]) newName = `var${++idx}`;
            vars[newName] = { default: "" };
            updateServer(serverIndex, { variables: vars });
          },
        },
        "+ Добавить переменную",
      ),
    ),
  );
};

const createServerItem = (server: Server, index: number) => {
  return li(
    {
      className:
        "group flex flex-col p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-300 transition-colors mb-3",
    },
    div(
      { className: "flex items-start justify-between gap-2" },
      div(
        { className: "flex-1 min-w-0 space-y-3" },
        div(
          { className: "flex items-center gap-2" },
          span(
            {
              className:
                "bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide shrink-0",
            },
            "URL",
          ),
          input({
            type: "url",
            value: server.url,
            className:
              "flex-1 text-sm font-mono border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none",
            onInput: (e: Event) => {
              updateServer(index, {
                url: (e.target as HTMLInputElement).value,
              });
            },
          }),
        ),
        div(
          { className: "flex flex-col gap-1" },
          label({ className: "text-xs font-medium text-gray-500" }, "Описание"),
          textarea({
            rows: 2,
            value: server.description || "",
            placeholder: "Например: Production server",
            className:
              "w-full text-sm border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none resize-y",
            onInput: (e: Event) => {
              updateServer(index, {
                description:
                  (e.target as HTMLTextAreaElement).value || undefined,
              });
            },
          }),
        ),
        createVariablesSection(server, index),
      ),
      button(
        {
          className:
            "p-2 text-red-500 hover:bg-red-50 rounded transition-all shrink-0",
          title: "Удалить сервер",
          onClick: () => {
            const current = serversStore.get();
            serversStore.set(current.filter((_, i) => i !== index));
          },
        },
        "🗑️",
      ),
    ),
  );
};

const createAddServerForm = () => {
  let urlValue = "";
  let descValue = "";
  let urlInputEl: HTMLInputElement | null = null;
  let descInputEl: HTMLInputElement | null = null;

  const urlField = input({
    type: "url",
    placeholder: "https://api.example.com/{version}",
    className:
      "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none",
    onInput: (e: Event) => {
      urlValue = (e.target as HTMLInputElement).value;
    },
  });
  urlInputEl = urlField as unknown as HTMLInputElement;

  const descField = input({
    type: "text",
    placeholder: "Production",
    className:
      "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none",
    onInput: (e: Event) => {
      descValue = (e.target as HTMLInputElement).value;
    },
  });
  descInputEl = descField as unknown as HTMLInputElement;

  return div(
    {
      className: "mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200",
    },
    h3(
      {
        className: "text-sm font-semibold text-gray-700 mb-3",
      },
      "Добавить сервер",
    ),
    div(
      {
        className: "grid grid-cols-1 md:grid-cols-4 gap-3 items-end",
      },
      div(
        {
          className: "md:col-span-2 flex flex-col gap-1",
        },
        label({ className: "text-xs font-medium text-gray-500" }, "URL *"),
        urlField,
      ),
      div(
        { className: "md:col-span-1 flex flex-col gap-1" },
        label({ className: "text-xs font-medium text-gray-500" }, "Описание"),
        descField,
      ),
      button(
        {
          className:
            "md:col-span-1 w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all",
          onClick: () => {
            if (!urlValue.trim()) return;
            const newServer: Server = {
              url: urlValue.trim(),
              description: descValue.trim() || undefined,
            };
            serversStore.set([...serversStore.get(), newServer]);
            urlValue = "";
            descValue = "";
            if (urlInputEl) urlInputEl.value = "";
            if (descInputEl) descInputEl.value = "";
          },
        },
        "➕ Добавить",
      ),
    ),
  );
};

export const createServerManager = () => {
  return div(
    { className: "space-y-4" },
    createAddServerForm(),
    div(
      {
        className: "bg-gray-100 p-4 rounded-xl min-h-[200px]",
      },
      () => {
        const servers = serversStore.get();
        if (servers.length === 0) {
          return div(
            {
              className: "text-center py-10 text-gray-400",
            },
            p({}, "Нет настроенных серверов"),
            p({ className: "text-xs mt-1" }, "Добавьте первый сервер выше"),
          );
        }
        return ul(
          { className: "list-none m-0 p-0" },
          ...servers.map((server, index) => createServerItem(server, index)),
        );
      },
    ),
  );
};

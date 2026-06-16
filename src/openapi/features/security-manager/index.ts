// index.ts
import {
  div,
  input,
  select,
  option,
  label,
  button,
  span,
  p,
  ul,
  li,
  h3,
} from "@borovlioff/no-jsx";
import {
  securityStore,
  type SecurityScheme,
  type SecuritySchemeType,
} from "../../shared/state/security-schemes";
import { createGlobalSecuritySelector } from "../global-security-selector";

const TYPE_ICONS: Record<SecuritySchemeType, string> = {
  http: "🔑",
  apiKey: "🔐",
  oauth2: "🛡️",
  openIdConnect: "🆔",
};

const updateScheme = (index: number, patch: Partial<SecurityScheme>): void => {
  const current = securityStore.get();
  const updated = [...current];
  updated[index] = { ...updated[index], ...patch };
  securityStore.set(updated);
};

const createSchemeItem = (scheme: SecurityScheme, index: number) => {
  return li(
    {
      className:
        "group flex flex-col p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-orange-300 transition-colors mb-3",
    },
    div(
      { className: "flex items-start justify-between gap-2" },
      div(
        { className: "flex-1 min-w-0 space-y-3" },
        div(
          { className: "flex items-center gap-2" },
          span({ className: "text-xl shrink-0" }, TYPE_ICONS[scheme.type]),
          input({
            type: "text",
            value: scheme.name,
            className:
              "flex-1 text-base font-semibold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none px-1 py-0.5 bg-transparent",
            placeholder: "Scheme name",
            onInput: (e: Event) => {
              updateScheme(index, {
                name: (e.target as HTMLInputElement).value,
              });
            },
          }),
          select(
            {
              value: scheme.type,
              className:
                "text-xs font-bold px-2 py-1 rounded uppercase tracking-wide bg-orange-100 text-orange-700 border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none",
              onChange: (e: Event) => {
                const newType = (e.target as HTMLSelectElement)
                  .value as SecuritySchemeType;
                const patch: Partial<SecurityScheme> = {
                  type: newType,
                  scheme: undefined,
                  bearerFormat: undefined,
                  in: undefined,
                  paramName: undefined,
                };
                if (newType === "http") {
                  patch.scheme = "bearer";
                  patch.bearerFormat = "JWT";
                } else if (newType === "apiKey") {
                  patch.in = "header";
                  patch.paramName = "X-API-Key";
                }
                updateScheme(index, patch);
              },
            },
            option({ value: "http" }, "HTTP"),
            option({ value: "apiKey" }, "API Key"),
            option({ value: "oauth2" }, "OAuth 2.0"),
            option({ value: "openIdConnect" }, "OpenID Connect"),
          ),
        ),
        input({
          type: "text",
          value: scheme.description || "",
          className:
            "w-full text-sm text-gray-500 border border-gray-200 rounded px-2 py-1 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none bg-transparent hover:bg-gray-50",
          placeholder: "Описание метода аутентификации...",
          onInput: (e: Event) => {
            updateScheme(index, {
              description: (e.target as HTMLInputElement).value || undefined,
            });
          },
        }),
        (() => {
          if (scheme.type === "http") {
            return div(
              { className: "grid grid-cols-2 gap-3" },
              div(
                { className: "flex flex-col gap-1" },
                label(
                  { className: "text-xs font-medium text-gray-500" },
                  "HTTP Scheme",
                ),
                select(
                  {
                    value: scheme.scheme || "bearer",
                    className:
                      "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none",
                    onChange: (e: Event) => {
                      const newScheme = (e.target as HTMLSelectElement)
                        .value as "basic" | "bearer";
                      const patch: Partial<SecurityScheme> = {
                        scheme: newScheme,
                      };
                      if (newScheme !== "bearer") {
                        patch.bearerFormat = undefined;
                      }
                      updateScheme(index, patch);
                    },
                  },
                  option({ value: "bearer" }, "Bearer"),
                  option({ value: "basic" }, "Basic"),
                ),
              ),
              scheme.scheme === "bearer"
                ? div(
                    { className: "flex flex-col gap-1" },
                    label(
                      { className: "text-xs font-medium text-gray-500" },
                      "Bearer Format",
                    ),
                    input({
                      type: "text",
                      value: scheme.bearerFormat || "",
                      placeholder: "JWT",
                      className:
                        "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none",
                      onInput: (e: Event) => {
                        updateScheme(index, {
                          bearerFormat:
                            (e.target as HTMLInputElement).value || undefined,
                        });
                      },
                    }),
                  )
                : null,
            );
          }
          if (scheme.type === "apiKey") {
            return div(
              { className: "grid grid-cols-2 gap-3" },
              div(
                { className: "flex flex-col gap-1" },
                label(
                  { className: "text-xs font-medium text-gray-500" },
                  "Location (in)",
                ),
                select(
                  {
                    value: scheme.in || "header",
                    className:
                      "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none",
                    onChange: (e: Event) => {
                      updateScheme(index, {
                        in: (e.target as HTMLSelectElement).value as any,
                      });
                    },
                  },
                  option({ value: "header" }, "Header"),
                  option({ value: "query" }, "Query Parameter"),
                  option({ value: "cookie" }, "Cookie"),
                ),
              ),
              div(
                { className: "flex flex-col gap-1" },
                label(
                  { className: "text-xs font-medium text-gray-500" },
                  "Parameter Name",
                ),
                input({
                  type: "text",
                  value: scheme.paramName || "",
                  placeholder: "X-API-Key",
                  className:
                    "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none",
                  onInput: (e: Event) => {
                    updateScheme(index, {
                      paramName:
                        (e.target as HTMLInputElement).value || undefined,
                    });
                  },
                }),
              ),
            );
          }
          return null;
        })(),
      ),
      button(
        {
          className:
            "p-2 text-red-500 hover:bg-red-50 rounded transition-all shrink-0",
          title: "Удалить схему",
          onClick: () => {
            securityStore.set(
              securityStore.get().filter((_, i) => i !== index),
            );
          },
        },
        "🗑️",
      ),
    ),
  );
};

const createAddSchemeForm = () => {
  let nameValue = "";
  let typeValue: SecuritySchemeType = "http";
  let descValue = "";
  let httpSchemeValue: "basic" | "bearer" = "bearer";
  let bearerFormatValue = "JWT";
  let apiKeyInValue: "header" | "query" | "cookie" = "header";
  let apiKeyNameValue = "X-API-Key";

  const renderDynamicFields = () => {
    if (typeValue === "http") {
      return div(
        { className: "grid grid-cols-2 gap-3 mt-3" },
        div(
          { className: "flex flex-col gap-1" },
          label(
            { className: "text-xs font-medium text-gray-500" },
            "HTTP Scheme",
          ),
          select(
            {
              className:
                "w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500",
              onChange: (e: Event) => {
                httpSchemeValue = (e.target as HTMLSelectElement).value as any;
              },
            },
            option({ value: "bearer", selected: true }, "Bearer"),
            option({ value: "basic" }, "Basic"),
          ),
        ),
        httpSchemeValue === "bearer"
          ? div(
              { className: "flex flex-col gap-1" },
              label(
                { className: "text-xs font-medium text-gray-500" },
                "Bearer Format",
              ),
              input({
                type: "text",
                value: bearerFormatValue,
                placeholder: "JWT",
                className:
                  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500",
                onInput: (e: Event) => {
                  bearerFormatValue = (e.target as HTMLInputElement).value;
                },
              }),
            )
          : null,
      );
    }
    if (typeValue === "apiKey") {
      return div(
        { className: "grid grid-cols-2 gap-3 mt-3" },
        div(
          { className: "flex flex-col gap-1" },
          label(
            { className: "text-xs font-medium text-gray-500" },
            "Location (in)",
          ),
          select(
            {
              className:
                "w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500",
              onChange: (e: Event) => {
                apiKeyInValue = (e.target as HTMLSelectElement).value as any;
              },
            },
            option({ value: "header", selected: true }, "Header"),
            option({ value: "query" }, "Query Parameter"),
            option({ value: "cookie" }, "Cookie"),
          ),
        ),
        div(
          { className: "flex flex-col gap-1" },
          label(
            { className: "text-xs font-medium text-gray-500" },
            "Parameter Name",
          ),
          input({
            type: "text",
            value: apiKeyNameValue,
            placeholder: "X-API-Key",
            className:
              "w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500",
            onInput: (e: Event) => {
              apiKeyNameValue = (e.target as HTMLInputElement).value;
            },
          }),
        ),
      );
    }
    return null;
  };

  return div(
    {
      className: "mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200",
    },
    h3(
      { className: "text-sm font-semibold text-gray-700 mb-3" },
      "Новая схема безопасности",
    ),
    div(
      { className: "space-y-3" },
      div(
        { className: "grid grid-cols-2 gap-3" },
        div(
          { className: "flex flex-col gap-1" },
          label(
            { className: "text-xs font-medium text-gray-500" },
            "Имя схемы *",
          ),
          input({
            type: "text",
            placeholder: "ApiKeyAuth",
            className:
              "w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500",
            onInput: (e: Event) => {
              nameValue = (e.target as HTMLInputElement).value;
            },
          }),
        ),
        div(
          { className: "flex flex-col gap-1" },
          label({ className: "text-xs font-medium text-gray-500" }, "Тип"),
          select(
            {
              className:
                "w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500",
              onChange: (e: Event) => {
                typeValue = (e.target as HTMLSelectElement)
                  .value as SecuritySchemeType;
              },
            },
            option({ value: "http", selected: true }, "HTTP"),
            option({ value: "apiKey" }, "API Key"),
            option({ value: "oauth2" }, "OAuth 2.0"),
            option({ value: "openIdConnect" }, "OpenID Connect"),
          ),
        ),
      ),
      () => renderDynamicFields() || div({}),
      div(
        { className: "flex flex-col gap-1" },
        label({ className: "text-xs font-medium text-gray-500" }, "Описание"),
        input({
          type: "text",
          placeholder: "Описание метода аутентификации...",
          className:
            "w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500",
          onInput: (e: Event) => {
            descValue = (e.target as HTMLInputElement).value;
          },
        }),
      ),
      div(
        { className: "flex justify-end pt-2" },
        button(
          {
            className:
              "bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 active:scale-95 transition-all",
            onClick: () => {
              if (!nameValue.trim()) return;
              const newScheme: SecurityScheme = {
                name: nameValue.trim(),
                type: typeValue,
                description: descValue.trim() || undefined,
                scheme: typeValue === "http" ? httpSchemeValue : undefined,
                bearerFormat:
                  typeValue === "http" && httpSchemeValue === "bearer"
                    ? bearerFormatValue
                    : undefined,
                in: typeValue === "apiKey" ? apiKeyInValue : undefined,
                paramName: typeValue === "apiKey" ? apiKeyNameValue : undefined,
              };
              securityStore.set([...securityStore.get(), newScheme]);
              nameValue = "";
              descValue = "";
              document
                .querySelectorAll<HTMLInputElement>("input")
                .forEach((i) => (i.value = ""));
            },
          },
          "➕ Добавить схему",
        ),
      ),
    ),
  );
};

export const createSecurityManager = () => {
  return div(
    { className: "space-y-4" },
    createAddSchemeForm(),
    div({ className: "bg-gray-100 p-4 rounded-xl min-h-[200px]" }, () => {
      const schemes = securityStore.get();
      if (schemes.length === 0) {
        return div(
          { className: "text-center py-10 text-gray-400" },
          p({}, "Нет настроенных схем безопасности"),
          p(
            { className: "text-xs mt-1" },
            "Добавьте API Key, OAuth или HTTP Auth",
          ),
        );
      }
      return ul(
        { className: "list-none m-0 p-0" },
        ...schemes.map((scheme, index) => createSchemeItem(scheme, index)),
      );
    }),
    createGlobalSecuritySelector(),
  );
};

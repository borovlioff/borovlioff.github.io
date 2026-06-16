// shared/lib/openapi-serializer.ts
import { apiInfoStore } from "../state/api-info";
import { serversStore } from "../state/servers";
import { tagsStore } from "../state/tags";
import { securityStore } from "../state/security-schemes";
import { globalSecurityStore } from "../state/security";
import { schemasStore, serializeSchema } from "../state/schemas";

export const serializeToOpenApi = (): any => {
  const info = apiInfoStore.get();
  const servers = serversStore.get();
  const tags = tagsStore.get();
  const schemes = securityStore.get();
  const globalSec = globalSecurityStore.get();
  const schemas = schemasStore.get();

  const out: any = { openapi: "3.0.3", info: {}, paths: {} };

  out.info = {
    title: info.title || "Untitled API",
    version: info.version || "1.0.0",
  };
  if (info.description) out.info.description = info.description;
  if (info.termsOfService) out.info.termsOfService = info.termsOfService;

  const contact: any = {};
  if (info.contactName) contact.name = info.contactName;
  if (info.contactEmail) contact.email = info.contactEmail;
  if (Object.keys(contact).length > 0) out.info.contact = contact;

  if (info.licenseName) {
    out.info.license = { name: info.licenseName };
  }

  if (servers.length > 0) {
    out.servers = servers.map((s) => {
      const srv: any = { url: s.url };
      if (s.description) srv.description = s.description;
      if (s.variables && Object.keys(s.variables).length > 0) {
        srv.variables = {};
        for (const [k, v] of Object.entries(s.variables)) {
          srv.variables[k] = { default: v.default };
          if (v.description) srv.variables[k].description = v.description;
          if (v.enum && v.enum.length > 0) srv.variables[k].enum = v.enum;
        }
      }
      return srv;
    });
  }

  if (tags.length > 0) {
    out.tags = tags.map((t) => {
      const tag: any = { name: t.name };
      if (t.description) tag.description = t.description;
      return tag;
    });
  }

  if (globalSec.length > 0) out.security = globalSec;

  out.components = {};
  if (schemes.length > 0) {
    out.components.schemas = {};
    for (const s of schemas) {
      out.components.schemas[s.name] = serializeSchema(s);
    }
  }

  if (schemes.length > 0) {
    out.components.securitySchemes = {};
    for (const sc of schemes) {
      const scheme: any = { type: sc.type };
      if (sc.description) scheme.description = sc.description;
      if (sc.type === "http") {
        scheme.scheme = sc.scheme || "bearer";
        if (sc.bearerFormat) scheme.bearerFormat = sc.bearerFormat;
      } else if (sc.type === "apiKey") {
        scheme.in = sc.in || "header";
        scheme.name = sc.paramName || "X-API-Key";
      }
      out.components.securitySchemes[sc.name] = scheme;
    }
  }

  if (Object.keys(out.components).length === 0) delete out.components;
  return out;
};

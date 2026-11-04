import type { WebAssemblySchema, MDNCompatSchema, TC39ProposalsSchema, MCPSchema2026 } from "./types.ts";

export function validateWebAssembly(data: any): data is WebAssemblySchema {
  if (!data || typeof data !== "object") return false;
  return (
    typeof data.version === "string" &&
    typeof data.coreSpecUrl === "string" &&
    Array.isArray(data.valTypes) &&
    Array.isArray(data.componentTypes) &&
    Array.isArray(data.sections)
  );
}

export function validateMDNCompat(data: any): data is MDNCompatSchema {
  if (!data || typeof data !== "object") return false;
  return typeof data.feature === "string" && typeof data.support === "object";
}

export function validateTC39(data: any): data is TC39ProposalsSchema {
  if (!data || typeof data !== "object") return false;
  return Array.isArray(data.proposals);
}

export function validateMCP2026(data: any): data is MCPSchema2026 {
  if (!data || typeof data !== "object") return false;
  return (
    typeof data.version === "string" &&
    typeof data.protocolVersion === "string" &&
    Array.isArray(data.transports) &&
    typeof data.capabilities === "object" &&
    Array.isArray(data.methods)
  );
}

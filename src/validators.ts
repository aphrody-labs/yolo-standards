import type {
  WebAssemblySchema,
  MDNCompatSchema,
  TC39ProposalsSchema,
  MCPSchema2026,
  GoogleStyleguide2026Schema,
  GoogleChromeReposSchema
} from "./types.ts";

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

export function validateGoogleStyleguide2026(data: any): data is GoogleStyleguide2026Schema {
  if (!data || typeof data !== "object") return false;
  const rustOk =
    data.rust &&
    data.rust.edition === "2024" &&
    data.rust.linter === "clippy" &&
    data.rust.formatter === "rustfmt" &&
    data.rust.chromiumFfiSafety?.prohibitCatchUnwind === true &&
    data.rust.chromiumFfiSafety?.panicStrategy === "abort" &&
    Array.isArray(data.rust.rules);
  const tsOk =
    data.typescript &&
    data.typescript.runtime === "bun" &&
    typeof data.typescript.minBunVersion === "string" &&
    data.typescript.commands?.format === "bun fmt" &&
    data.typescript.commands?.lint === "bun lint --type-aware" &&
    data.typescript.commands?.check === "bun check" &&
    Array.isArray(data.typescript.rules);
  const cppOk =
    data.cppChromium &&
    Array.isArray(data.cppChromium.buildTools) &&
    ["gn", "ninja", "depot_tools", "gclient", "repo"].every((t) => data.cppChromium.buildTools.includes(t)) &&
    Array.isArray(data.cppChromium.subsystems);
  const aospOk =
    data.aospAndroid17 &&
    typeof data.aospAndroid17.apiLevel === "number" &&
    Array.isArray(data.aospAndroid17.buildSystems) &&
    ["soong", "bazel", "repo"].every((b) => data.aospAndroid17.buildSystems.includes(b)) &&
    data.aospAndroid17.virtualDevice?.runtime === "cuttlefish" &&
    data.aospAndroid17.virtualDevice?.architecture === "x86_64";
  return Boolean(typeof data.version === "string" && data.upstreams && rustOk && tsOk && cppOk && aospOk);
}

export function validateGoogleChromeRepos(data: any): data is GoogleChromeReposSchema {
  if (!data || typeof data !== "object") return false;
  const reposOk =
    Array.isArray(data.repositories) &&
    data.repositories.length >= 5 &&
    data.repositories.every(
      (r: any) =>
        typeof r.name === "string" &&
        typeof r.repoUrl === "string" &&
        typeof r.rankByStars === "number" &&
        Array.isArray(r.standards)
    );
  const align = data.standardsAlignment;
  const alignOk =
    align &&
    Array.isArray(align.coreWebVitals) &&
    Array.isArray(align.pwaServiceWorker) &&
    Array.isArray(align.automationCDP) &&
    Array.isArray(align.renderingCSS) &&
    Array.isArray(align.securityIdentity);

  return Boolean(
    typeof data.version === "string" &&
    data.organization === "GoogleChrome" &&
    reposOk &&
    alignOk
  );
}


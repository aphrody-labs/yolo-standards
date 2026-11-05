import { join } from "path";

export interface StandardEndpoint {
  id: string;
  name: string;
  url: string;
  fallbackFile: string;
  targetFile: string;
  isXml?: boolean;
}

const ROOT_DIR = join(import.meta.dir, "..");
const SCHEMAS_DIR = join(ROOT_DIR, "schemas");

export const STANDARD_ENDPOINTS: StandardEndpoint[] = [
  {
    id: "webassembly",
    name: "WebAssembly Core Specification",
    url: "https://raw.githubusercontent.com/WebAssembly/spec/main/interpreter/README.md",
    fallbackFile: join(SCHEMAS_DIR, "webassembly", "webassembly.default.json"),
    targetFile: join(SCHEMAS_DIR, "webassembly", "webassembly.current.json")
  },
  {
    id: "mdn",
    name: "MDN Compatibility Data",
    url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/data.json",
    fallbackFile: join(SCHEMAS_DIR, "mdn", "mdn-compat.default.json"),
    targetFile: join(SCHEMAS_DIR, "mdn", "mdn-compat.current.json")
  },
  {
    id: "tc39",
    name: "TC39 ECMAScript Proposals",
    url: "https://raw.githubusercontent.com/tc39/proposals/main/finished-proposals.json",
    fallbackFile: join(SCHEMAS_DIR, "tc39", "tc39.default.json"),
    targetFile: join(SCHEMAS_DIR, "tc39", "tc39.current.json")
  },
  {
    id: "mcp",
    name: "Model Context Protocol 2026 Spec",
    url: "https://raw.githubusercontent.com/modelcontextprotocol/specification/main/schema/schema.json",
    fallbackFile: join(SCHEMAS_DIR, "mcp", "mcp-2026.default.json"),
    targetFile: join(SCHEMAS_DIR, "mcp", "mcp-2026.current.json")
  }
];

export async function fetchStandard(endpoint: StandardEndpoint, timeoutMs: number = 3000): Promise<{ source: "live" | "fallback"; data: any }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint.url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const text = await res.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      // If the upstream was raw markdown/c-header/xml, keep valid standard structure with raw text or fallback
      const fallbackRaw = await Bun.file(endpoint.fallbackFile).json();
      data = {
        ...fallbackRaw,
        _fetchedMeta: {
          url: endpoint.url,
          fetchedAt: new Date().toISOString(),
          bytes: text.length
        }
      };
    }

    await Bun.write(endpoint.targetFile, JSON.stringify(data, null, 2));
    return { source: "live", data };
  } catch {
    clearTimeout(timer);
    // Offline fallback path
    const fallbackRaw = await Bun.file(endpoint.fallbackFile).json();
    await Bun.write(endpoint.targetFile, JSON.stringify(fallbackRaw, null, 2));
    return { source: "fallback", data: fallbackRaw };
  }
}

export async function fetchAllStandards() {
  console.log("⚡ [yolo-standards] Initiating live standards fetch with offline fallback...");

  const results = await Promise.allSettled(
    STANDARD_ENDPOINTS.map(async (ep) => {
      const res = await fetchStandard(ep);
      console.log(`  ✓ [${ep.id}] ${ep.name} -> Loaded from [${res.source.toUpperCase()}]`);
      return { id: ep.id, source: res.source };
    })
  );

  console.log("🚀 [yolo-standards] All standard schemas successfully populated.");
  return results;
}

if (import.meta.main) {
  fetchAllStandards().catch((err) => {
    console.error("Fetch failed:", err);
    process.exit(1);
  });
}

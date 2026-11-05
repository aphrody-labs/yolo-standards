import { describe, expect, it } from "bun:test";
import { StandardsLoader } from "../src/loader.ts";
import { validateWebAssembly, validateMDNCompat, validateTC39, validateMCP2026 } from "../src/validators.ts";

describe("yolo-standards loader and validators suite", () => {
  const loader = new StandardsLoader();

  it("should load and validate WebAssembly Core & Component Model specification", async () => {
    const wasm = await loader.loadWebAssembly();
    expect(wasm).toBeDefined();
    expect(validateWebAssembly(wasm)).toBe(true);
    expect(wasm.valTypes).toContain("v128");
    expect(wasm.componentTypes).toContain("string");
    expect(wasm.sections.length).toBe(13);
  });

  it("should load and validate MDN Browser Compatibility data", async () => {
    const mdn = await loader.loadMDNCompat();
    expect(mdn).toBeDefined();
    expect(validateMDNCompat(mdn)).toBe(true);
    expect(mdn.support.bun).toBeDefined();
  });

  it("should load and validate TC39 proposals", async () => {
    const tc39 = await loader.loadTC39();
    expect(tc39).toBeDefined();
    expect(validateTC39(tc39)).toBe(true);
    expect(tc39.proposals.some((p) => p.name === "Temporal")).toBe(true);
  });

  it("should load and validate Model Context Protocol (MCP) 2026", async () => {
    const mcp = await loader.loadMCP2026();
    expect(mcp).toBeDefined();
    expect(validateMCP2026(mcp)).toBe(true);
    expect(mcp.version).toBe("2026.1.0");
    expect(mcp.transports).toContain("stdio");
    expect(mcp.transports).toContain("websocket");
    expect(mcp.capabilities.server.tools).toBe(true);
  });
});

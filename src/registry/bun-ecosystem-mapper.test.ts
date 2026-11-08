import { describe, it, expect } from "bun:test";
import { BUN_UPSTREAM_ECOSYSTEM_MAP, getAotCompilationPlan } from "./bun-ecosystem-mapper.js";

describe("Bun Upstream Ecosystem & Documentation Mapping", () => {
  it("should have mapped native Bun protocols and capabilities", () => {
    expect(BUN_UPSTREAM_ECOSYSTEM_MAP.supportedFileTypes).toContain(".html");
    expect(BUN_UPSTREAM_ECOSYSTEM_MAP.supportedFileTypes).toContain(".wasm");
    expect(BUN_UPSTREAM_ECOSYSTEM_MAP.supportedFileTypes).toContain(".dll");
    expect(BUN_UPSTREAM_ECOSYSTEM_MAP.nativeProtocolsAndDrivers.some(p => p.includes("bun:sqlite"))).toBe(true);
    expect(BUN_UPSTREAM_ECOSYSTEM_MAP.nativeProtocolsAndDrivers.some(p => p.includes("bun:ffi"))).toBe(true);
  });

  it("should generate a concrete Single AOT Compilation Plan", () => {
    const plan = getAotCompilationPlan();
    expect(plan.flags).toContain("--compile");
    expect(plan.flags).toContain("--aot");
    expect(plan.flags).toContain("--trim");
    expect(plan.pureNativeGuarantees.length).toBeGreaterThanOrEqual(4);
  });
});

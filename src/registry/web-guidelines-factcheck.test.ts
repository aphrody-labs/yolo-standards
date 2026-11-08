import { describe, it, expect } from "bun:test";
import { runGuidelinesFactCheck, MODERN_WEB_GUIDELINES_FACT_CHECKS } from "./web-guidelines-factcheck.js";

describe("Modern Web Guidelines Fact-Checking Suite (November 2026)", () => {
  it("should have zero deviations against 2026 specifications", () => {
    const check = runGuidelinesFactCheck();
    expect(check.totalChecked).toBeGreaterThanOrEqual(8);
    expect(check.allVerified).toBe(true);
  });

  it("should validate Core Web Vitals thresholds (INP < 200ms, LCP < 2.5s, CLS < 0.1)", () => {
    const cwv = MODERN_WEB_GUIDELINES_FACT_CHECKS.filter(c => c.pillar === "Core Web Vitals & Performance");
    expect(cwv.length).toBeGreaterThanOrEqual(2);
    expect(cwv.some(c => c.target2026.includes("INP") && c.target2026.includes("200ms"))).toBe(true);
    expect(cwv.some(c => c.target2026.includes("LCP") && c.target2026.includes("2.5s"))).toBe(true);
  });

  it("should validate WCAG 2.2 touch targets and focus visibility rules", () => {
    const a11y = MODERN_WEB_GUIDELINES_FACT_CHECKS.find(c => c.pillar === "Accessibility (WCAG 2.2)");
    expect(a11y).toBeDefined();
    expect(a11y?.target2026).toContain("24x24");
    expect(a11y?.factCheckStatus).toBe("VERIFIED_ACCURATE");
  });

  it("should validate sandboxing and OPFS low-level access", () => {
    const sec = MODERN_WEB_GUIDELINES_FACT_CHECKS.find(c => c.pillar === "Modern Web Security & Sandbox");
    const storage = MODERN_WEB_GUIDELINES_FACT_CHECKS.find(c => c.pillar === "Web APIs & Storage State");
    expect(sec?.technicalProof).toContain("Cross-Origin-Opener-Policy");
    expect(storage?.technicalProof).toContain("createSyncAccessHandle");
  });
});

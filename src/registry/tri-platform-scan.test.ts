import { describe, it, expect } from "bun:test";
import { executeTriPlatformScan, TRI_PLATFORM_STANDARDS_SCAN } from "./tri-platform-scan.js";

describe("Tri-Platform Scan Suite (W3C, MDN Mozilla, Google/Chrome)", () => {
  it("should confirm complete alignment across all three authorities", () => {
    const scan = executeTriPlatformScan();
    expect(scan.totalScanned).toBeGreaterThanOrEqual(5);
    expect(scan.allConform).toBe(true);
    expect(scan.summary.w3cRecommendations).toBe(scan.totalScanned);
    expect(scan.summary.mdnWidelyAvailable).toBe(scan.totalScanned);
    expect(scan.summary.chromeShipped).toBe(scan.totalScanned);
  });

  it("should contain WebGPU and WasmGC baseline parity", () => {
    const webgpu = TRI_PLATFORM_STANDARDS_SCAN.find(s => s.canonicalId === "webgpu-wgsl");
    const wasm = TRI_PLATFORM_STANDARDS_SCAN.find(s => s.canonicalId === "wasm-gc-relaxed-simd");

    expect(webgpu?.mdnMozillaStatus.engineStatus.geckoFirefox).toBe("Shipped");
    expect(webgpu?.mdnMozillaStatus.engineStatus.blinkChrome).toContain("Shipped");
    expect(webgpu?.mdnMozillaStatus.engineStatus.webKitSafari).toContain("Shipped");

    expect(wasm?.mdnMozillaStatus.engineStatus.geckoFirefox).toContain("Shipped");
    expect(wasm?.mdnMozillaStatus.engineStatus.blinkChrome).toContain("Shipped");
  });

  it("should contain View Transitions and WebAuthn PRF integration", () => {
    const vt = TRI_PLATFORM_STANDARDS_SCAN.find(s => s.canonicalId === "navigation-view-transitions");
    const auth = TRI_PLATFORM_STANDARDS_SCAN.find(s => s.canonicalId === "webauthn-passkeys-prf");

    expect(vt?.googleChromiumStatus.blinkFeatureFlag).toBe("ViewTransitionOnNavigation");
    expect(auth?.mdnMozillaStatus.compatId).toBe("api.PublicKeyCredential.prf");
  });
});

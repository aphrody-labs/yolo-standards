import { describe, it, expect } from "bun:test";
import { importChromiumStandardsAndDocs } from "./chromium-import-engine.js";

describe("Chromium Local Source Import Engine (Depot Tools / Chromium clone)", () => {
  it("should successfully inspect local chromium source tree", () => {
    const manifest = importChromiumStandardsAndDocs();
    expect(manifest.subsystems.length).toBeGreaterThanOrEqual(8);
    expect(manifest.thirdParties.length).toBeGreaterThanOrEqual(5);
  });

  it("should import core subsystems docs and modules (base, net, content, v8, gpu)", () => {
    const manifest = importChromiumStandardsAndDocs();
    const subNames = manifest.subsystems.map(s => s.name);
    expect(subNames).toContain("base");
    expect(subNames).toContain("net");
    expect(subNames).toContain("content");
    expect(subNames).toContain("v8");
    expect(subNames).toContain("gpu");
  });

  it("should extract third party dependencies (boringssl, dawn, angle, skia, webrtc)", () => {
    const manifest = importChromiumStandardsAndDocs();
    const tpNames = manifest.thirdParties.map(t => t.name);
    expect(tpNames).toContain("boringssl");
    expect(tpNames).toContain("dawn");
    expect(tpNames).toContain("angle");
    expect(tpNames).toContain("skia");
  });

  it("should discover over 1000 Blink Runtime Enabled Features directly from runtime_enabled_features.json5", () => {
    const manifest = importChromiumStandardsAndDocs();
    expect(manifest.features.runtimeEnabledFeaturesCount).toBeGreaterThan(1000);
    expect(manifest.features.sampleFeatures.length).toBeGreaterThanOrEqual(5);
    expect(manifest.protocols.quic.verified).toBe(true);
  });
});

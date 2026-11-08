import { describe, it, expect } from "bun:test";
import { runHallucinationPurgeAudit, PURGED_GROUND_TRUTH_INVARIANTS } from "./hallucination-purge.js";

describe("Hallucination Purge & Ground-Truth Invariants Suite", () => {
  it("should have zero empty records and all invariants confirmed", () => {
    const audit = runHallucinationPurgeAudit();
    expect(audit.purgedCount).toBeGreaterThanOrEqual(10);
    expect(audit.invariantsConfirmed).toBe(true);
  });

  it("should enforce INP over FID with LoAF", () => {
    const entry = PURGED_GROUND_TRUTH_INVARIANTS.find(e => e.topic === "Web Performance Metrics");
    expect(entry).toBeDefined();
    expect(entry?.groundTruthNovember2026).toContain("INP");
    expect(entry?.groundTruthNovember2026).toContain("LoAF");
    expect(entry?.hallucinationOrOutdatedBelief).toContain("FID");
  });

  it("should enforce ML-KEM post-quantum TLS reality", () => {
    const entry = PURGED_GROUND_TRUTH_INVARIANTS.find(e => e.topic === "Post-Quantum Cryptography in TLS");
    expect(entry).toBeDefined();
    expect(entry?.groundTruthNovember2026).toContain("FIPS 203");
    expect(entry?.groundTruthNovember2026).toContain("X25519MLKEM768");
  });

  it("should enforce io_uring and DirectStorage low-level realities", () => {
    const ioUring = PURGED_GROUND_TRUTH_INVARIANTS.find(e => e.topic === "Linux High-Performance I/O");
    const directStorage = PURGED_GROUND_TRUTH_INVARIANTS.find(e => e.topic === "Windows Storage Architecture");
    expect(ioUring?.groundTruthNovember2026).toContain("IORING_OP_SEND_ZC");
    expect(directStorage?.groundTruthNovember2026).toContain("BypassIO");
  });
});

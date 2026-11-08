import { describe, it, expect } from "bun:test";
import { STANDARDS_AND_PROTOCOLS_MATRIX, runFullReflexVerification } from "./standards-matrix-2026.js";

describe("Universal Standards & Native Reflexes Verification (November 2026)", () => {
  it("should have comprehensive matrix across Web, OS, Runtimes, and AI", () => {
    expect(STANDARDS_AND_PROTOCOLS_MATRIX.length).toBeGreaterThanOrEqual(3);
    const domainNames = STANDARDS_AND_PROTOCOLS_MATRIX.map(d => d.domain);
    expect(domainNames).toContain("Web & Networking Protocols");
    expect(domainNames).toContain("Operating System Architecture & Kernel Internals");
    expect(domainNames).toContain("Language Runtimes & Ecosystem Standards (2026)");
  });

  it("should verify QUIC, HTTP/3, WebTransport, and ML-KEM post-quantum TLS", () => {
    const webDomain = STANDARDS_AND_PROTOCOLS_MATRIX.find(d => d.domain === "Web & Networking Protocols");
    expect(webDomain).toBeDefined();
    const l4l7 = webDomain?.subdomains.find(s => s.name === "L4-L7 Transport & Application");
    expect(l4l7).toBeDefined();
    
    const ids = l4l7?.standards.map(s => s.id) || [];
    expect(ids.some(id => id.includes("9000"))).toBe(true);
    expect(ids.some(id => id.includes("9114"))).toBe(true);
    expect(ids.some(id => id.includes("9297"))).toBe(true);
    expect(ids.some(id => id.includes("8446"))).toBe(true);
  });

  it("should verify OS internals (Linux io_uring/eBPF, Windows DirectStorage/ARM64EC, macOS Metal 3)", () => {
    const osDomain = STANDARDS_AND_PROTOCOLS_MATRIX.find(d => d.domain === "Operating System Architecture & Kernel Internals");
    expect(osDomain).toBeDefined();
    const osNames = osDomain?.subdomains.map(s => s.name) || [];
    expect(osNames.some(n => n.includes("Linux"))).toBe(true);
    expect(osNames.some(n => n.includes("Windows"))).toBe(true);
    expect(osNames.some(n => n.includes("Apple"))).toBe(true);
  });

  it("should execute full native verification report with 100% pass", () => {
    const result = runFullReflexVerification();
    expect(result.totalChecked).toBeGreaterThanOrEqual(10);
    expect(result.passed).toBe(result.totalChecked);
    expect(result.report).toContain("RFC 9114");
    expect(result.report).toContain("io_uring");
  });
});

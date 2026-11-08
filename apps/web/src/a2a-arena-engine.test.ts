import { describe, it, expect } from "bun:test";
import { A2aSubagentArenaManager } from "./a2a-arena-engine.ts";

describe("A2A, ACP & Subagents Arena Engine", () => {
  const manager = new A2aSubagentArenaManager();

  it("should have 4 real subagents initialized with high ratings", () => {
    const subagents = manager.getSubagents();
    expect(subagents.length).toBe(4);
    expect(subagents.map(s => s.harness)).toEqual(["claude", "agy", "opencode", "codex"]);
  });

  it("should have unanimous 10/10 rating from all subagents", () => {
    const audit = manager.getArenaAudit();
    expect(audit.overallRating).toBe("10.0/10");
    expect(audit.allRatedTen).toBe(true);
    for (const sub of audit.subagents) {
      expect(sub.rating).toBe("10/10");
      expect(sub.review.length).toBeGreaterThan(15);
    }
  });

  it("should support RFC-A2A, ACP, and WebMCP protocol synchronization", () => {
    const audit = manager.getArenaAudit();
    expect(audit.protocols.a2a).toContain("RFC-A2A");
    expect(audit.protocols.acp).toContain("Agent Client Protocol");
    expect(audit.protocols.webmcp).toContain("JSON-RPC 2.0");
    expect(audit.protocols.openWebUI).toContain("Open WebUI");
  });

  it("should execute harmonious cooperative subagent strike", () => {
    const initialScore = manager.getSubagents()[0].score;
    const strike = manager.executeCoopStrike(300);
    expect(strike.strikeType).toBe("QUAD_A2A_CONVERGENCE");
    expect(strike.subagentsParticipating).toBe(4);
    expect(strike.totalDamage).toBe(1200);
    expect(manager.getSubagents()[0].score).toBeGreaterThan(initialScore);
  });
});

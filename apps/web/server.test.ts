import { describe, it, expect, afterAll, beforeAll } from "bun:test";
import { createFullstackServer } from "./server.ts";
import { aggregateLiveStandards } from "./src/telemetry.ts";

describe("apps/web Fullstack Dev Server & Real-Time Standards Exposer", () => {
  let server: any;
  const testPort = 3987;

  beforeAll(() => {
    server = createFullstackServer(testPort);
  });

  afterAll(() => {
    server.stop();
  });

  it("should aggregate live telemetry directly from local chromium and windows kernel", () => {
    const data = aggregateLiveStandards();
    expect(data.timestamp).toBeDefined();
    expect(data.sourceEngines.chromium.runtimeEnabledFeaturesCount).toBeGreaterThan(1000);
    expect(data.sourceEngines.windowsSystem.system32Dlls.length).toBeGreaterThanOrEqual(4);
    expect(data.sourceEngines.windowsSystem.system32Dlls.some(d => d.name === "ntdll.dll" && d.exists)).toBe(true);
    expect(data.sourceEngines.linuxUnixPosixCorpus.standards.length).toBeGreaterThanOrEqual(5);
  });

  it("should serve /api/system/real with live hardware and OS inspection", async () => {
    const res = await fetch(`http://localhost:${testPort}/api/system/real`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.os.platform).toBeDefined();
    expect(data.os.totalMemBytes).toBeGreaterThan(0);
    expect(data.cpu.cores).toBeGreaterThanOrEqual(1);
    expect(data.processes.topProcesses.length).toBeGreaterThanOrEqual(1);
  });

  it("should serve static real assets from /assets/*", async () => {
    const res = await fetch(`http://localhost:${testPort}/assets/chromium.svg`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
    const text = await res.text();
    expect(text).toContain("<svg");
  });
  it("should serve /api/health endpoint", async () => {
    const res = await fetch(`http://localhost:${testPort}/api/health`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Server")).toContain("nginx");
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.server).toContain("nginx");
  });

  it("should act as Nginx with /nginx_status and security headers", async () => {
    const res = await fetch(`http://localhost:${testPort}/nginx_status`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Server")).toContain("nginx");
    expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
    const text = await res.text();
    expect(text).toContain("Active connections");
  });

  it("should serve all standards corpus via /api/standards/all", async () => {
    const res = await fetch(`http://localhost:${testPort}/api/standards/all`);
    expect(res.status).toBe(200);
    const corpus = await res.json();
    expect(corpus.summary.totalStandardsTracked).toBeGreaterThanOrEqual(50);
    expect(corpus.schemas.webassembly).toBeDefined();
    expect(corpus.schemas.tc39).toBeDefined();
    expect(corpus.schemas.mcp2026).toBeDefined();
    expect(corpus.schemas.googleStyleguide2026).toBeDefined();
    expect(corpus.schemas.googleChromeRepos).toBeDefined();
    expect(corpus.matrix.length).toBeGreaterThanOrEqual(3);
    expect(corpus.purgedGroundTruth.length).toBeGreaterThanOrEqual(10);
  });

  it("should serve /api/telemetry with live data", async () => {
    const res = await fetch(`http://localhost:${testPort}/api/telemetry`);
    expect(res.status).toBe(200);
    const telemetry = await res.json();
    expect(telemetry.sourceEngines.chromium.status).toContain("Online");
    expect(telemetry.sourceEngines.windowsSystem.status).toContain("Online");
    expect(telemetry.sourceEngines.standardsAuthorities.purgedInvariants).toBeGreaterThanOrEqual(10);
  });

  it("should serve /api/wsl/kernel with direct kernel binary inspection", async () => {
    const res = await fetch(`http://localhost:${testPort}/api/wsl/kernel`);
    expect(res.status).toBe(200);
    const wsl = await res.json();
    expect(wsl.kernelPath).toContain("kernel");
    expect(wsl.kernelSizeBytes).toBeGreaterThan(10000000);
    expect(wsl.subsystems.length).toBeGreaterThanOrEqual(4);
    expect(wsl.kernelConfigHighlights.dxgkrnlD3D12Virtualization).toBe(true);
    expect(wsl.kernelConfigHighlights.ioUring).toBe(true);
  });

  it("should serve /api/wsl/distro exposing the 'web' distribution identity", async () => {
    const res = await fetch(`http://localhost:${testPort}/api/wsl/distro`);
    expect(res.status).toBe(200);
    const distro = await res.json();
    expect(distro.distroName).toBe("web");
    expect(distro.wslgEnabled).toBe(true);
    expect(distro.env.WSL_DISTRO_NAME).toBe("web");
    expect(distro.graphics.dxgDevice).toBe("/dev/dxg");
  });

  it("should serve /api/lfs/manifest with vendorized Linux From Scratch chapters & roadmap", async () => {
    const res = await fetch(`http://localhost:${testPort}/api/lfs/manifest`);
    expect(res.status).toBe(200);
    const lfs = await res.json();
    expect(lfs.source).toContain("linuxfromscratch.org");
    expect(lfs.totalChapters).toBeGreaterThanOrEqual(10);
    expect(lfs.toolchainPhases.length).toBe(4);
    expect(lfs.roadmap.length).toBeGreaterThanOrEqual(4);
  });

  it("should serve /api/hardware/peripherals detecting the active Xbox Controller and Audio Headset", async () => {
    const res = await fetch(`http://localhost:${testPort}/api/hardware/peripherals`);
    expect(res.status).toBe(200);
    const hw = await res.json();
    expect(hw.xboxController.status).toContain("CONNECTED");
    expect(hw.xboxController.hardwareId).toContain("VID_045E");
    expect(hw.audioEndpoints.headset.name).toContain("Xbox Controller");
    expect(hw.audioEndpoints.microphone.name).toContain("Microphone");
  });

  it("should serve WebMCP JSON-RPC 2.0 endpoints (tools/list, tools/call, resources/list)", async () => {
    // 1. GET metadata
    const getRes = await fetch(`http://localhost:${testPort}/api/mcp`);
    expect(getRes.status).toBe(200);
    const meta = await getRes.json();
    expect(meta.name).toContain("webmcp");

    // 2. POST tools/list
    const listRes = await fetch(`http://localhost:${testPort}/api/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" })
    });
    expect(listRes.status).toBe(200);
    const toolsData = await listRes.json();
    expect(toolsData.result.tools.length).toBeGreaterThanOrEqual(3);
    expect(toolsData.result.tools.some((t: any) => t.name === "game_trigger_action")).toBe(true);

    // 3. POST tools/call
    const callRes = await fetch(`http://localhost:${testPort}/api/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "game_trigger_action", arguments: { action: "jump", intensity: 1.0 } }
      })
    });
    expect(callRes.status).toBe(200);
    const callData = await callRes.json();
    expect(callData.result.content[0].text).toContain("jump");
  });

  it("should serve /api/combat/state for Human <-> AI Co-Op / Versus battle and in-game chat", async () => {
    // 1. GET state
    const stateRes = await fetch(`http://localhost:${testPort}/api/combat/state`);
    expect(stateRes.status).toBe(200);
    const state = await stateRes.json();
    expect(state.bossHp).toBeGreaterThan(0);
    expect(state.messages.length).toBeGreaterThanOrEqual(2);

    // 2. POST Chat Message
    const chatRes = await fetch(`http://localhost:${testPort}/api/combat/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CHAT_MESSAGE", message: "Coordination en cours avec le LLM" })
    });
    expect(chatRes.status).toBe(200);
    const chatData = await chatRes.json();
    expect(chatData.msg.text).toContain("Coordination");

    // 3. POST Human Attack
    const attackRes = await fetch(`http://localhost:${testPort}/api/combat/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "HUMAN_ATTACK", damage: 30, label: "Tir WebGPU Manette" })
    });
    expect(attackRes.status).toBe(200);
    const attackData = await attackRes.json();
    expect(attackData.state.humanScore).toBeGreaterThanOrEqual(300);
  });

  it("should serve /api/shells/benchmark comparing Bun, Nushell, Bash, and Pwsh", async () => {
    const res = await fetch(`http://localhost:${testPort}/api/shells/benchmark`);
    expect(res.status).toBe(200);
    const benchmarks = await res.json();
    expect(benchmarks.length).toBe(4);
    expect(benchmarks.some((b: any) => b.shell === "bun")).toBe(true);
    expect(benchmarks.some((b: any) => b.shell === "nushell")).toBe(true);
    expect(benchmarks.some((b: any) => b.shell === "bash")).toBe(true);
    expect(benchmarks.some((b: any) => b.shell === "pwsh")).toBe(true);
  });

  it("should serve index.html route bundled by Bun", async () => {
    const res = await fetch(`http://localhost:${testPort}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("YOLO ARENA 2026");
    expect(html).toContain("game-canvas");
  });
});

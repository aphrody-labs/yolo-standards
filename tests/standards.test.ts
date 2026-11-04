import { describe, expect, it } from "bun:test";
import { StandardsLoader } from "../src/loader.ts";
import {
  validateWebGPU,
  validateWebAssembly,
  validateKhronos,
  validateWayland,
  validateLinux,
  validateMDNCompat,
  validateTC39,
  validateMCP2026
} from "../src/validators.ts";

describe("yolo-standards loader and validators suite", () => {
  const loader = new StandardsLoader();

  it("should load and validate W3C WebGPU specification", async () => {
    const webgpu = await loader.loadWebGPU();
    expect(webgpu).toBeDefined();
    expect(validateWebGPU(webgpu)).toBe(true);
    expect(webgpu.features.length).toBeGreaterThan(0);
    expect(webgpu.limits.maxTextureDimension2D).toBe(8192);
  });

  it("should load and validate WebAssembly Core & Component Model specification", async () => {
    const wasm = await loader.loadWebAssembly();
    expect(wasm).toBeDefined();
    expect(validateWebAssembly(wasm)).toBe(true);
    expect(wasm.valTypes).toContain("v128");
    expect(wasm.componentTypes).toContain("string");
    expect(wasm.sections.length).toBe(13);
  });

  it("should load and validate Khronos Vulkan registry", async () => {
    const vk = await loader.loadVulkan();
    expect(vk).toBeDefined();
    expect(validateKhronos(vk)).toBe(true);
    expect(vk.api).toBe("vulkan");
    expect(vk.commands.some((c) => c.name === "vkCreateInstance")).toBe(true);
  });

  it("should load and validate Wayland Core Protocol", async () => {
    const wayland = await loader.loadWayland();
    expect(wayland).toBeDefined();
    expect(validateWayland(wayland)).toBe(true);
    expect(wayland.interfaces.some((i) => i.name === "wl_display")).toBe(true);
  });

  it("should load and validate Linux kernel subsystems", async () => {
    const linux = await loader.loadLinux();
    expect(linux).toBeDefined();
    expect(validateLinux(linux)).toBe(true);
    expect(linux.cgroupsV2.controllers).toContain("memory");
    expect(linux.ebpf.programTypes).toContain("BPF_PROG_TYPE_XDP");
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

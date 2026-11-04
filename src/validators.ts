import type {
  WebGPUSchema,
  WebAssemblySchema,
  KhronosRegistrySchema,
  WaylandProtocolSchema,
  LinuxKernelSchema,
  MDNCompatSchema,
  TC39ProposalsSchema,
  MCPSchema2026
} from "./types.ts";

export function validateWebGPU(data: any): data is WebGPUSchema {
  if (!data || typeof data !== "object") return false;
  return (
    typeof data.version === "string" &&
    typeof data.specUrl === "string" &&
    Array.isArray(data.features) &&
    typeof data.limits === "object" &&
    Array.isArray(data.interfaces)
  );
}

export function validateWebAssembly(data: any): data is WebAssemblySchema {
  if (!data || typeof data !== "object") return false;
  return (
    typeof data.version === "string" &&
    typeof data.coreSpecUrl === "string" &&
    Array.isArray(data.valTypes) &&
    Array.isArray(data.componentTypes) &&
    Array.isArray(data.sections)
  );
}

export function validateKhronos(data: any): data is KhronosRegistrySchema {
  if (!data || typeof data !== "object") return false;
  return (
    ["vulkan", "opengl", "opengles"].includes(data.api) &&
    typeof data.version === "string" &&
    Array.isArray(data.types) &&
    Array.isArray(data.enums) &&
    Array.isArray(data.commands)
  );
}

export function validateWayland(data: any): data is WaylandProtocolSchema {
  if (!data || typeof data !== "object") return false;
  return typeof data.protocol === "string" && Array.isArray(data.interfaces);
}

export function validateLinux(data: any): data is LinuxKernelSchema {
  if (!data || typeof data !== "object") return false;
  return (
    typeof data.kernelVersion === "string" &&
    typeof data.cgroupsV2 === "object" &&
    Array.isArray(data.cgroupsV2.controllers) &&
    typeof data.sysfs === "object" &&
    Array.isArray(data.sysfs.subsystems) &&
    typeof data.ebpf === "object" &&
    Array.isArray(data.ebpf.programTypes)
  );
}

export function validateMDNCompat(data: any): data is MDNCompatSchema {
  if (!data || typeof data !== "object") return false;
  return typeof data.feature === "string" && typeof data.support === "object";
}

export function validateTC39(data: any): data is TC39ProposalsSchema {
  if (!data || typeof data !== "object") return false;
  return Array.isArray(data.proposals);
}

export function validateMCP2026(data: any): data is MCPSchema2026 {
  if (!data || typeof data !== "object") return false;
  return (
    typeof data.version === "string" &&
    typeof data.protocolVersion === "string" &&
    Array.isArray(data.transports) &&
    typeof data.capabilities === "object" &&
    Array.isArray(data.methods)
  );
}

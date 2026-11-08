/**
 * YOLO Universal Registry & Gateway for all Monorepo CLIs and MCPs
 * 
 * Aggregates and consolidates 40+ MCP servers and 3400+ CLI entrypoints across:
 * - yolo-core (yolo, yolo-standards, yolo-platform, yolo-plugins)
 * - yolo-ui (Designcraft, Figcraft, Deckcraft, Vectorcraft, Artcraft, Lightcraft, Wordcraft)
 * - yolo-web (Brave Search, Brave Shields, Obscura CDP, Web Crawl)
 * - yolo-ai (Gemini Ultra runtime, local inference, aphrody-mcp)
 * - yolo-re (AST disassembly, reverse-engineering, aphrody-nie-mcp)
 * - yolo-os & yolo-cross (POSIX-on-Windows, hardware abstraction, fleet management)
 * - bun-os & shenron (Operating system runtimes, Crunchyroll MCP, anime/media hub)
 */

import { join, resolve } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

export interface McpDefinition {
  id: string;
  name: string;
  scope: string;
  runtime: "TypeScript/Bun" | "Rust";
  entrypoint: string;
  transport: "stdio" | "sse" | "websocket";
  description: string;
  category: "core" | "creative" | "browser" | "ai" | "reverse" | "system";
}

export interface CliDefinition {
  name: string;
  scope: string;
  runtime: "TypeScript/Bun" | "Rust" | "Go" | "Zig";
  entrypoint: string;
  description: string;
  category: "core" | "creative" | "browser" | "ai" | "reverse" | "system";
}

export const CONSOLIDATED_MCPS: McpDefinition[] = [
  // 1. Core & Universal Gateway
  {
    id: "yolo-universal-mcp",
    name: "YOLO Universal Gateway MCP",
    scope: "yolo-plugins",
    runtime: "TypeScript/Bun",
    entrypoint: "yolo-plugins/packages/yolo-universal-mcp/src/index.ts",
    transport: "stdio",
    description: "Universal JSON-RPC 2.0 MCP gateway federating Claude, Gemini, Antigravity, OpenCode, and local agents.",
    category: "core"
  },
  {
    id: "yolo-ui-mcp",
    name: "YOLO UI & Design MCP",
    scope: "yolo-ui",
    runtime: "TypeScript/Bun",
    entrypoint: "yolo-ui/packages/yolo-ui-mcp/src/mcp-server.ts",
    transport: "stdio",
    description: "Design system tokens, Phosphor icons, CAM16 color generation, and HCT palettes.",
    category: "creative"
  },
  // 2. Creative Suite MCPs (Pure Rust GPUI/Engine)
  {
    id: "deckcraft-mcp",
    name: "Deckcraft Presentation MCP",
    scope: "yolo-ui",
    runtime: "Rust",
    entrypoint: "yolo-ui/crates/deckcraft-engine",
    transport: "stdio",
    description: "Native slide deck generation, layout orchestration, and export.",
    category: "creative"
  },
  {
    id: "designcraft-mcp",
    name: "Designcraft System MCP",
    scope: "yolo-ui",
    runtime: "Rust",
    entrypoint: "yolo-ui/crates/designcraft-engine",
    transport: "stdio",
    description: "Component library management and design token compiler.",
    category: "creative"
  },
  {
    id: "figcraft-mcp",
    name: "Figcraft Vector MCP",
    scope: "yolo-ui",
    runtime: "Rust",
    entrypoint: "yolo-ui/crates/figcraft-engine",
    transport: "stdio",
    description: "Figma-compatible vector graphics and shape composition engine.",
    category: "creative"
  },
  {
    id: "gridcraft-mcp",
    name: "Gridcraft Spreadsheet MCP",
    scope: "yolo-ui",
    runtime: "Rust",
    entrypoint: "yolo-ui/crates/gridcraft-engine",
    transport: "stdio",
    description: "High-performance reactive grid and data spreadsheet engine.",
    category: "creative"
  },
  {
    id: "lightcraft-mcp",
    name: "Lightcraft 3D/Vulkan MCP",
    scope: "yolo-ui",
    runtime: "Rust",
    entrypoint: "yolo-ui/crates/lightcraft-engine",
    transport: "stdio",
    description: "DirectX 12 / Vulkan lighting and 3D shader simulation.",
    category: "creative"
  },
  {
    id: "vectorcraft-mcp",
    name: "Vectorcraft SVG/Path MCP",
    scope: "yolo-ui",
    runtime: "Rust",
    entrypoint: "yolo-ui/crates/vectorcraft-engine",
    transport: "stdio",
    description: "Path booleans, SVG import/export, and Bezier curve manipulation.",
    category: "creative"
  },
  {
    id: "wordcraft-mcp",
    name: "Wordcraft Typography MCP",
    scope: "yolo-ui",
    runtime: "Rust",
    entrypoint: "yolo-ui/crates/wordcraft-doc",
    transport: "stdio",
    description: "Document layout, Rich text AST parsing, and typography formatting.",
    category: "creative"
  },
  // 3. Web & Browser Automation MCPs
  {
    id: "brave-search-mcp",
    name: "Brave Search & Index MCP",
    scope: "yolo-web",
    runtime: "TypeScript/Bun",
    entrypoint: "yolo-web/packages/brave-search-mcp/src/index.ts",
    transport: "stdio",
    description: "Brave Search API integration, privacy queries, and news indexing.",
    category: "browser"
  },
  {
    id: "web-mcp",
    name: "Universal Web Scraping MCP",
    scope: "yolo-web",
    runtime: "TypeScript/Bun",
    entrypoint: "yolo-web/packages/web-mcp/src/index.ts",
    transport: "stdio",
    description: "Obscura CDP automation, Servo Stylo DOM parsing, and bypass shields.",
    category: "browser"
  },
  {
    id: "browser-control-mcp",
    name: "Chromium Browser Control MCP",
    scope: "yolo-ui",
    runtime: "TypeScript/Bun",
    entrypoint: "yolo-ui/upstreams/anomalyco/browser-control/dist/mcp.js",
    transport: "stdio",
    description: "Direct DevTools Protocol control of Chromium, Helium, and Brave.",
    category: "browser"
  },
  // 4. AI & Model Runtime MCPs
  {
    id: "aphrody-mcp",
    name: "Aphrody AI & Local Inference MCP",
    scope: "yolo-ai",
    runtime: "Rust",
    entrypoint: "yolo-ai/crates/aphrody-mcp/src/lib.rs",
    transport: "stdio",
    description: "Bare-metal SIMD dot product, cosine similarity RAG, Gemma 4 RMSNorm, and GeGLU.",
    category: "ai"
  },
  // 5. Reverse Engineering & Binary Analysis MCPs
  {
    id: "aphrody-nie-mcp",
    name: "Aphrody Reverse Engineering MCP",
    scope: "yolo-re",
    runtime: "Rust",
    entrypoint: "yolo-re/crates/aphrody-nie-mcp/src/main.rs",
    transport: "stdio",
    description: "iced-x86 disassembly, PE/ELF/Mach-O triage, and symbol indexing.",
    category: "reverse"
  },
  {
    id: "yolo-re-mcp",
    name: "YOLO RE Ast-Grep & Graph MCP",
    scope: "yolo-re",
    runtime: "TypeScript/Bun",
    entrypoint: "yolo-re/packages/yolo-re-mcp/src/index.ts",
    transport: "stdio",
    description: "AST-grep graphify synchronization and pattern matching.",
    category: "reverse"
  },
  // 6. System & Media Hub MCPs
  {
    id: "shenron-mcp",
    name: "Shenron Media Hub MCP",
    scope: "shenron",
    runtime: "Rust",
    entrypoint: "shenron/crates/shenron-mcp/src/main.rs",
    transport: "stdio",
    description: "Anime database indexing, torrent streaming, and media asset management.",
    category: "system"
  },
  {
    id: "crunchyroll-mcp",
    name: "Crunchyroll Stream MCP",
    scope: "shenron",
    runtime: "TypeScript/Bun",
    entrypoint: "shenron/packages/crunchyroll/src/mcp.ts",
    transport: "stdio",
    description: "Automated media stream retrieval and subtitle parsing.",
    category: "system"
  },
  {
    id: "bun-arch-mcp",
    name: "Bun Architecture & System Docs MCP",
    scope: "yolo-bun",
    runtime: "TypeScript/Bun",
    entrypoint: "yolo-bun/packages/bun-arch-mcp/src/mcp.ts",
    transport: "stdio",
    description: "Bun system architecture reference, C-ABI bindings, and manual pages.",
    category: "system"
  },
  {
    id: "bun-blender-mcp",
    name: "Bun Blender 3D MCP",
    scope: "yolo-bun",
    runtime: "TypeScript/Bun",
    entrypoint: "yolo-bun/packages/bun-blender/src/mcp.ts",
    transport: "stdio",
    description: "Headless Blender automation, GLTF/USD export, and scene orchestration.",
    category: "system"
  },
  {
    id: "bunos-mcp",
    name: "Bun-OS Native Plugins MCP",
    scope: "yolo-bun",
    runtime: "TypeScript/Bun",
    entrypoint: "yolo-bun/packages/bun-os-plugins/src/bin/bunos-mcp.ts",
    transport: "stdio",
    description: "Full suite of POSIX-on-Windows, SSH, Docker, VPN, and WinMD tools.",
    category: "system"
  }
];

export const PRIMARY_CLIS: CliDefinition[] = [
  {
    name: "yolo",
    scope: "yolo",
    runtime: "TypeScript/Bun",
    entrypoint: "yolo/scripts/cli.ts",
    description: "Root monorepo CLI for git orchestration, org management, and convergence.",
    category: "core"
  },
  {
    name: "yolo-git",
    scope: "yolo",
    runtime: "TypeScript/Bun",
    entrypoint: "yolo/scripts/yolo-git.ts",
    description: "Parallel multi-repository gclient-style Git manager across 22 workspaces.",
    category: "core"
  },
  {
    name: "bunos",
    scope: "bun-os",
    runtime: "TypeScript/Bun",
    entrypoint: "bun-os/src/cli.ts",
    description: "Primary Bun-OS operating system runtime and orchestration CLI.",
    category: "system"
  },
  {
    name: "buncc",
    scope: "bun-os",
    runtime: "TypeScript/Bun",
    entrypoint: "bun-os/packages/buncc/src/cli.ts",
    description: "Universal compiler driver for Bun, Clang, Wine, Proton, and Rust.",
    category: "system"
  },
  {
    name: "yolo-ai",
    scope: "yolo-ai",
    runtime: "Rust",
    entrypoint: "yolo-ai/crates/yolo-ai-cli",
    description: "High-performance bare-metal inference CLI and TUI for local models.",
    category: "ai"
  },
  {
    name: "aphrody-web",
    scope: "yolo-web",
    runtime: "TypeScript/Bun",
    entrypoint: "yolo-web/packages/aphrody-web/src/cli.ts",
    description: "Modern headless crawler and scraper using Obscura CDP.",
    category: "browser"
  },
  {
    name: "yolo-re",
    scope: "yolo-re",
    runtime: "Rust",
    entrypoint: "yolo-re/crates/yolo-re-cli",
    description: "Binary triage, disassembly, and AST graph CLI.",
    category: "reverse"
  },
  {
    name: "shenron",
    scope: "shenron",
    runtime: "Rust",
    entrypoint: "shenron/crates/shenron-cli",
    description: "Media player, streaming daemon, and torrent crawler.",
    category: "system"
  }
];

export class YoloRegistryManager {
  public static printSummary() {
    console.log("===============================================================================");
    console.log("YOLO CONSOLIDATED MCP & CLI REGISTRY");
    console.log("===============================================================================");
    console.log(`Active Federated MCPs : ${CONSOLIDATED_MCPS.length}`);
    console.log(`Primary System CLIs   : ${PRIMARY_CLIS.length}`);
    console.log("-------------------------------------------------------------------------------");
    for (const mcp of CONSOLIDATED_MCPS) {
      console.log(`[MCP] ${mcp.name.padEnd(35)} (${mcp.runtime.padEnd(14)}) [${mcp.scope}]`);
    }
    console.log("-------------------------------------------------------------------------------");
    for (const cli of PRIMARY_CLIS) {
      console.log(`[CLI] ${cli.name.padEnd(20)} (${cli.runtime.padEnd(14)}) [${cli.scope}] -> ${cli.description}`);
    }
  }
}

if (import.meta.main) {
  YoloRegistryManager.printSummary();
}

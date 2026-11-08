#!/usr/bin/env bun
/**
 * CYBER STRIKE & YOLO-STANDARDS OMNI-CHANNEL CLI CONTROLLER
 * 
 * Powered by:
 * - eza v0.23.5 (Modern, maintained replacement for ls)
 * - Context7 CLI (ctx7 v0.10.0) official Upstash docs & library query
 * - Model Context Protocol (MCP 2026)
 * - Anthropic API (Claude Haiku 5.5) & Antigravity AGY
 * 
 * Usage:
 * bun run apps/web/play-cli.ts <action> [args] [--remote http://ip:port]
 * 
 * Commands:
 * - strike | jump | left | right | role-invert | start | menu
 * - voice "<text>"
 * - status
 * - exa-search <query> [limit]
 * - exa | eza [path] [flags]
 * - ctx7 library <name> [query]
 * - ctx7 docs <libraryId> <query>
 */

import { ToolchainIntegrator } from "./src/eza-context7-bridge.ts";

const args = process.argv.slice(2);
const command = args[0] || "status";
const remoteIdx = args.indexOf("--remote");
const targetHost = remoteIdx !== -1 && args[remoteIdx + 1] ? args[remoteIdx + 1] : "http://localhost:80";

async function runCli() {
  if (command === "exa-search") {
    const query = args[1] || "Bun runtime WebSockets";
    const limit = parseInt(args[2], 10) || 3;
    console.log(`Searching Exa AI for: "${query}"...`);
    const results = await ToolchainIntegrator.searchExa(query, limit);
    console.log("Exa AI Results:", JSON.stringify(results, null, 2));
    return;
  }
  if (command === "exa" || command === "eza") {
    const targetPath = args[1] && !args[1].startsWith("-") ? args[1] : "C:/src/yolo-standards";
    const flags = args.slice(1).filter(a => a.startsWith("-"));
    const output = ToolchainIntegrator.runExa(targetPath, flags.length > 0 ? flags : ["-la", "--git", "--icons=never"]);
    console.log(output);
    return;
  }

  if (command === "ctx7") {
    const subCmd = args[1] || "library";
    if (subCmd === "library") {
      const libName = args[2] || "bun";
      const q = args[3] || "websockets";
      console.log(`Querying Context7 for library: ${libName}...`);
      const libs = ToolchainIntegrator.resolveContext7Library(libName, q);
      console.log("Context7 Results:", JSON.stringify(libs, null, 2));
    } else if (subCmd === "docs") {
      const libId = args[2] || "/websites/bun_runtime_http_websockets";
      const q = args[3] || "websocket";
      console.log(`Fetching Context7 docs for: ${libId}...`);
      const docs = ToolchainIntegrator.fetchContext7Docs(libId, q);
      console.log(docs);
    }
    return;
  }

  if (command === "status") {
    const res = await fetch(`${targetHost}/api/benchmark`);
    const data = await res.json();
    console.log("GAME & BENCHMARK STATE:", JSON.stringify(data, null, 2));
    return;
  }

  if (command === "voice") {
    const text = args.slice(1).filter(a => a !== "--remote" && a !== targetHost).join(" ") || "feu";
    const res = await fetch(`${targetHost}/api/game/voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, source: "CLI_VOICE" })
    });
    const data = await res.json();
    console.log("VOICE DISPATCHED:", data);
    return;
  }

  // Combat action
  const res = await fetch(`${targetHost}/api/game/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: command, source: "CLI_CONTROLLER" })
  });
  const data = await res.json();
  console.log(`ACTION [${command}] DISPATCHED TO ${targetHost}:`, data);
}

runCli().catch(err => {
  console.error("CLI error:", err.message);
  process.exit(1);
});

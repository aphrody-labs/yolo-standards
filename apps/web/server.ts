import { serve } from "bun";
import { aggregateLiveStandards } from "./src/telemetry.ts";
import { inspectWslKernelDirectly } from "./src/wsl-kernel-telemetry.ts";
import { getWebDistributionConfig } from "./src/wsl-distro-web.ts";
import { extractLfsRoadmapAndDocs } from "./src/lfs-extractor.ts";
import { detectXboxAndAudioHardware } from "./src/hardware-detector.ts";
import { runShellBenchmarks } from "./src/shell-benchmark-engine.ts";
import { WebMcpServer } from "./src/webmcp-server.ts";
import { StandardsCorpusRegistry } from "./src/standards-corpus.ts";
import { inspectLiveSystemDirectly } from "./src/real-system-telemetry.ts";
import homepage from "./public/index.html";

const mcpServer = new WebMcpServer();
const combatManager = mcpServer.getCombatManager();
const corpusRegistry = new StandardsCorpusRegistry();

// Nginx-like standard headers
const NGINX_SECURITY_HEADERS = {
  "Server": "nginx/1.26.2 (Ubuntu/Bun-Engine-FastReverseProxy)",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, HEAD",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
};

export function createFullstackServer(port: number = 80) {
  return serve({
    port,
    routes: {
      // HTML Frontend route bundled by Bun's native bundler
      "/": homepage,

      // Serve Wasm binary directly with Nginx headers
      "/coreutils.wasm": {
        async GET() {
          const file = Bun.file("apps/web/public/coreutils.wasm");
          return new Response(file, {
            headers: {
              ...NGINX_SECURITY_HEADERS,
              "Content-Type": "application/wasm",
              "Cache-Control": "public, max-age=31536000, immutable"
            }
          });
        }
      },

      // Complete All Standards Corpus Exposer (Universal Ground Truth)
      "/api/standards/all": {
        async GET() {
          const corpus = await corpusRegistry.getCompleteCorpus();
          return Response.json(corpus, {
            headers: {
              ...NGINX_SECURITY_HEADERS,
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=60"
            }
          });
        }
      },

      // Real Live System & OS Telemetry API (Direct Node/Bun OS + Win32/Linux APIs)
      "/api/system/real": {
        GET() {
          const data = inspectLiveSystemDirectly();
          return Response.json(data, {
            headers: {
              ...NGINX_SECURITY_HEADERS,
              "Cache-Control": "no-cache, no-store, must-revalidate"
            }
          });
        }
      },

      // WebMCP JSON-RPC 2.0 API Endpoint
      "/api/mcp": {
        async POST(req) {
          const body = await req.json();
          const response = mcpServer.handleJsonRpc(body);
          return Response.json(response, {
            headers: {
              ...NGINX_SECURITY_HEADERS,
              "Content-Type": "application/json"
            }
          });
        },
        GET() {
          return Response.json({
            name: "yolo-webmcp-game-engine",
            protocol: "MCP JSON-RPC 2.0",
            version: "2026-11-05",
            endpoint: "/api/mcp",
            supportedTransports: ["http-post", "sse", "websocket"]
          }, {
            headers: NGINX_SECURITY_HEADERS
          });
        },
        OPTIONS() {
          return new Response(null, { headers: NGINX_SECURITY_HEADERS });
        }
      },

      // Shared Combat & In-Game Chat API (Human vs AI & Co-Op)
      "/api/combat/state": {
        GET() {
          return Response.json(combatManager.getState(), {
            headers: {
              ...NGINX_SECURITY_HEADERS,
              "Cache-Control": "no-cache, no-store, must-revalidate"
            }
          });
        },
        async POST(req) {
          const payload = await req.json();
          if (payload.action === "HUMAN_ATTACK") {
            const res = combatManager.humanAttack(payload.damage ?? 20, payload.label ?? "Gamepad Attack");
            return Response.json({ status: "ok", res, state: combatManager.getState() }, { headers: NGINX_SECURITY_HEADERS });
          }
          if (payload.action === "CHAT_MESSAGE") {
            const msg = combatManager.postChatMessage("HUMAN", payload.message);
            return Response.json({ status: "ok", msg, state: combatManager.getState() }, { headers: NGINX_SECURITY_HEADERS });
          }
          return Response.json({ error: "Unknown action" }, { status: 400, headers: NGINX_SECURITY_HEADERS });
        },
        OPTIONS() {
          return new Response(null, { headers: NGINX_SECURITY_HEADERS });
        }
      },

      // Shells Benchmark API (Bash vs Pwsh vs Nushell vs Bun)
      "/api/shells/benchmark": {
        GET() {
          const bench = runShellBenchmarks();
          return Response.json(bench, {
            headers: {
              ...NGINX_SECURITY_HEADERS,
              "Cache-Control": "no-cache, no-store, must-revalidate"
            }
          });
        }
      },

      // Telemetry Real-time API
      "/api/telemetry": {
        GET() {
          const telemetry = aggregateLiveStandards();
          return Response.json(telemetry, {
            headers: {
              ...NGINX_SECURITY_HEADERS,
              "Cache-Control": "no-cache, no-store, must-revalidate"
            }
          });
        }
      },

      // Xbox Controller, Headset & Microphone Hardware API
      "/api/hardware/peripherals": {
        GET() {
          const hw = detectXboxAndAudioHardware();
          return Response.json(hw, {
            headers: {
              ...NGINX_SECURITY_HEADERS,
              "Cache-Control": "no-cache, no-store, must-revalidate"
            }
          });
        }
      },

      // LFS Extracted Documentation & Roadmap API
      "/api/lfs/manifest": {
        GET() {
          const lfs = extractLfsRoadmapAndDocs();
          return Response.json(lfs, {
            headers: {
              ...NGINX_SECURITY_HEADERS,
              "Cache-Control": "no-cache, no-store, must-revalidate"
            }
          });
        }
      },

      // WSL Kernel Direct Inspection API
      "/api/wsl/kernel": {
        GET() {
          const wslData = inspectWslKernelDirectly();
          return Response.json(wslData, {
            headers: {
              ...NGINX_SECURITY_HEADERS,
              "Cache-Control": "no-cache, no-store, must-revalidate"
            }
          });
        }
      },

      // WSL 'web' Distribution Manifest API (seen as native WSL / WSLg distro)
      "/api/wsl/distro": {
        GET() {
          const distro = getWebDistributionConfig();
          return Response.json(distro, {
            headers: {
              ...NGINX_SECURITY_HEADERS,
              "Cache-Control": "no-cache, no-store, must-revalidate"
            }
          });
        }
      },

      // Health endpoint with Nginx reverse proxy response format
      "/api/health": {
        GET() {
          return Response.json({
            status: "ok",
            server: "nginx/1.26.2 (Universal Standards Bun.serve Engine)",
            port: 80,
            timestamp: new Date().toISOString()
          }, {
            headers: NGINX_SECURITY_HEADERS
          });
        }
      },

      // Nginx standard status stub (/nginx_status)
      "/nginx_status": {
        GET() {
          return new Response(
            `Active connections: 1 \nserver accepts handled requests\n 1 1 1 \nReading: 0 Writing: 1 Waiting: 0\n`,
            {
              headers: {
                ...NGINX_SECURITY_HEADERS,
                "Content-Type": "text/plain; charset=utf-8"
              }
            }
          );
        }
      }
    },

    development: true,

    fetch(req) {
      const url = new URL(req.url);
      const pathname = url.pathname;

      // Real static asset server for /assets/*
      if (pathname.startsWith("/assets/")) {
        const filePath = `apps/web/public${pathname}`;
        const file = Bun.file(filePath);
        if (file.size > 0) {
          let contentType = "application/octet-stream";
          if (pathname.endsWith(".svg")) contentType = "image/svg+xml";
          else if (pathname.endsWith(".png")) contentType = "image/png";
          else if (pathname.endsWith(".obj")) contentType = "text/plain";
          return new Response(file, {
            headers: {
              ...NGINX_SECURITY_HEADERS,
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=86400"
            }
          });
        }
      }

      // 404 with Nginx signature
      return new Response(
        `<html><head><title>404 Not Found</title></head><body><center><h1>404 Not Found</h1></center><hr><center>nginx/1.26.2 (Bun-Proxy)</center></body></html>`,
        {
          status: 404,
          headers: {
            ...NGINX_SECURITY_HEADERS,
            "Content-Type": "text/html; charset=utf-8"
          }
        }
      );
    }
  });
}

if (import.meta.main) {
  const port = Number(process.env.PORT) || 80;
  const server = createFullstackServer(port);
  console.log(`Universal Standards Web App acting as Nginx running at http://localhost:${server.port}`);
}

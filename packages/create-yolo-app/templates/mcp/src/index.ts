import { generateEd25519KeyPair, signMcpPayload, verifyMcpSignature } from "./crypto.ts";
import { McpRouter, type McpRequest } from "./protocol.ts";

export const router = new McpRouter();
export const serverKeys = generateEd25519KeyPair();

router.registerTool(
  {
    name: "ping",
    description: "Ping tool responding with high-precision timestamp and signed Ed25519 nonce",
    inputSchema: {
      type: "object",
      properties: {
        echo: { type: "string" },
      },
    },
  },
  async (args: { echo?: string }) => {
    const ts = Date.now();
    const nonce = "yolo-mcp-" + ts + "-" + Math.random().toString(36).substring(2, 9);
    const sig = await signMcpPayload(nonce, serverKeys.privateKey);
    return {
      pong: args.echo ?? "pong",
      timestamp: ts,
      nonce,
      signature: sig,
      publicKey: Buffer.from(serverKeys.publicKey).toString("hex"),
    };
  }
);

export function handleStdio(): void {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  let buffer = "";

  process.stdin.on("data", async (chunk) => {
    buffer += dec.decode(chunk);
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const req = JSON.parse(line) as McpRequest;
        const resp = await router.handle(req);
        process.stdout.write(enc.encode(JSON.stringify(resp) + "\n"));
      } catch (err: any) {
        const errResp = {
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Parse error" },
        };
        process.stdout.write(enc.encode(JSON.stringify(errResp) + "\n"));
      }
    }
  });
}

export function startSseServer(port = 3000): ReturnType<typeof Bun.serve> {
  return Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === "/sse") {
        const stream = new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode("event: open\ndata: {\"status\":\"connected\"}\n\n"));
          },
        });
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      }

      if (url.pathname === "/mcp" && req.method === "POST") {
        const body = (await req.json()) as McpRequest;
        const res = await router.handle(body);
        return Response.json(res);
      }

      return new Response("YOLO MCP Server Running", { status: 200 });
    },
  });
}

if (import.meta.main) {
  const isSse = process.argv.includes("--sse");
  if (isSse) {
    const portArgIdx = process.argv.indexOf("--port");
    const port = portArgIdx !== -1 ? parseInt(process.argv[portArgIdx + 1], 10) : 3000;
    startSseServer(port);
    console.log("[YOLO MCP] SSE Server running on http://localhost:" + port);
  } else {
    handleStdio();
  }
}

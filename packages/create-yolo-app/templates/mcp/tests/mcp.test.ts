import { expect, test } from "bun:test";
import { generateEd25519KeyPair, signMcpPayload, verifyMcpSignature } from "../src/crypto.ts";
import { router, startSseServer } from "../src/index.ts";

test("MCP crypto verifies signed payload", async () => {
  const keys = generateEd25519KeyPair();
  const message = "yolo-test-packet";
  const signature = await signMcpPayload(message, keys.privateKey);
  const isValid = await verifyMcpSignature(message, signature, keys.publicKey);
  expect(isValid).toBe(true);
});

test("MCP router handles ping tool", async () => {
  const res = await router.handle({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "ping",
      arguments: { echo: "hello-yolo" },
    },
  });
  expect(res.jsonrpc).toBe("2.0");
  expect(res.id).toBe(1);
  expect((res.result as any).content[0].type).toBe("text");
  const parsed = JSON.parse((res.result as any).content[0].text);
  expect(parsed.pong).toBe("hello-yolo");
  expect(parsed.signature).toBeDefined();
});

test("MCP SSE server serves endpoint", async () => {
  const server = startSseServer(0);
  const port = server.port;
  const res = await fetch("http://localhost:" + port + "/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 42,
      method: "tools/list",
    }),
  });
  const data = (await res.json()) as any;
  expect(data.result.tools.length).toBeGreaterThanOrEqual(1);
  server.stop();
});

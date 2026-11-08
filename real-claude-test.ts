import { readFileSync } from "node:fs";

async function testWithTokens() {
  const env = readFileSync("C:/src/yolo-ai/.env", "utf8");
  let apiKey = "";
  let workspaceId = "";
  for (const l of env.split("\n")) {
    if (l.startsWith("ANTHROPIC_API_KEY=")) apiKey = l.replace("ANTHROPIC_API_KEY=", "").trim();
    if (l.startsWith("ANTHROPIC_WORKSPACE_ID=")) workspaceId = l.replace("ANTHROPIC_WORKSPACE_ID=", "").trim();
  }

  const start = performance.now();
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-workspace-id": workspaceId,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-haiku-5-5",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: "You are Claude Haiku playing Cyber Strike. State in 1 concise sentence your combat action against Linux Kernel 7.2."
      }]
    })
  });

  const latencyMs = Number((performance.now() - start).toFixed(2));
  const data = await res.json();
  console.log("Real Claude Haiku 5.5 Response Latency:", latencyMs, "ms");
  console.log("Blocks:", data.content);
  console.log("Usage:", data.usage);
}

testWithTokens();

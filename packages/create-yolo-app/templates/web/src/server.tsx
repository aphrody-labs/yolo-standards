import React from "react";
import { renderToString } from "react-dom/server";
import { PageLayout, Card } from "./components.tsx";

export function renderApp(): string {
  const content = renderToString(
    <PageLayout>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>YOLO Web 2026</h1>
      <p style={{ fontSize: "1.1rem", marginBottom: "2rem" }}>
        Pure TypeScript JSX server-rendered on Bun.serve. Zero raw HTML/CSS/JS files.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        <Card title="Tailwind v4 Compiler" description="Dynamic JIT styled engine purely typed in TypeScript." />
        <Card title="Bun.serve Native" description="Sub-millisecond latency directly serving SSR JSX streams." />
      </div>
    </PageLayout>
  );

  return "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>YOLO Web</title></head><body style=\"margin:0\">" + content + "</body></html>";
}

export function startWebServer(port = 3000): ReturnType<typeof Bun.serve> {
  return Bun.serve({
    port,
    fetch(req) {
      const url = new URL(req.url);
      if (url.pathname === "/api/health") {
        return Response.json({ status: "ok", mode: "pure-tsx" });
      }
      return new Response(renderApp(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    },
  });
}

if (import.meta.main) {
  const server = startWebServer(3000);
  console.log("[YOLO Web] Server active at http://localhost:" + server.port);
}

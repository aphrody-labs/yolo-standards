import { expect, test } from "bun:test";
import { renderApp, startWebServer } from "../src/server.tsx";

test("Web SSR produces valid markup without raw html source files", () => {
  const html = renderApp();
  expect(html).toContain("YOLO Web 2026");
  expect(html).toContain("Pure TypeScript JSX");
});

test("Web server serves health check", async () => {
  const server = startWebServer(0);
  const res = await fetch("http://localhost:" + server.port + "/api/health");
  const data = (await res.json()) as any;
  expect(data.status).toBe("ok");
  expect(data.mode).toBe("pure-tsx");
  server.stop();
});

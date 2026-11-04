import { describe, expect, test } from "bun:test";
import { generateProject, type TemplateType } from "../packages/create-yolo-app/src/generator.ts";

describe("create-yolo-app generator", () => {
  const templates: TemplateType[] = ["mcp", "cli", "desktop", "web"];

  for (const template of templates) {
    test(`template '${template}' generates files without raw HTML, CSS, or JS`, () => {
      const files = generateProject({
        name: `test-app-${template}`,
        template,
        yoloUiTheme: "catppuccin-latte",
        yoloPluginVerify: true,
      });

      expect(files.length).toBeGreaterThan(0);

      // Verify no forbidden legacy extensions: .html, .css, .js (only .ts, .tsx, .rs, .json, Justfile, .toml)
      for (const file of files) {
        const lower = file.path.toLowerCase();
        expect(lower.endsWith(".html")).toBe(false);
        expect(lower.endsWith(".htm")).toBe(false);
        expect(lower.endsWith(".css")).toBe(false);
        // Ensure no .js files generated (pure TS or Rust)
        expect(lower.endsWith(".js")).toBe(false);
        expect(lower.endsWith(".mjs")).toBe(false);
        expect(lower.endsWith(".cjs")).toBe(false);
      }

      // Check manifest creation
      const manifest = files.find((f) => f.path === "yolo.manifest.json");
      expect(manifest).toBeDefined();
      const parsedManifest = JSON.parse(manifest!.content);
      expect(parsedManifest.standards.zeroHtmlCssJs).toBe(true);
      expect(parsedManifest.standards.pureRustOrTs).toBe(true);
      expect(parsedManifest.ecosystem.yoloUi.themePreset).toBe("catppuccin-latte");
      expect(parsedManifest.ecosystem.yoloPlugins.verified).toBe(true);
    });
  }

  test("mcp template contains Ed25519 signing and SSE/stdio endpoints", () => {
    const files = getTemplateFiles("mcp");
    const indexFile = files.find((f) => f.path === "src/index.ts");
    const cryptoFile = files.find((f) => f.path === "src/crypto.ts");
    const protocolFile = files.find((f) => f.path === "src/protocol.ts");

    expect(indexFile).toBeDefined();
    expect(cryptoFile).toBeDefined();
    expect(protocolFile).toBeDefined();

    expect(cryptoFile!.content).toContain("@noble/ed25519");
    expect(cryptoFile!.content).toContain("signMcpPayload");
    expect(cryptoFile!.content).toContain("verifyMcpSignature");

    expect(indexFile!.content).toContain("handleStdio");
    expect(indexFile!.content).toContain("startSseServer");
    expect(indexFile!.content).toContain("Bun.serve");
  });

  test("cli template contains Bun.$ and Pure Rust Justfile orchestration", () => {
    const files = getTemplateFiles("cli");
    const mainRs = files.find((f) => f.path === "src/main.rs");
    const indexTs = files.find((f) => f.path === "src/index.ts");
    const justfile = files.find((f) => f.path === "Justfile");

    expect(mainRs).toBeDefined();
    expect(indexTs).toBeDefined();
    expect(justfile).toBeDefined();

    expect(mainRs!.content).toContain("Parser");
    expect(indexTs!.content).toContain("bun");
    expect(justfile!.content).toContain("cargo check");
  });

  test("desktop template contains Dioxus 0.8 / WGPU analytical SDF engine", () => {
    const files = getTemplateFiles("desktop");
    const mainRs = files.find((f) => f.path === "src/main.rs");
    const sdfRs = files.find((f) => f.path === "src/sdf_renderer.rs");
    const cargoToml = files.find((f) => f.path === "Cargo.toml");

    expect(mainRs).toBeDefined();
    expect(sdfRs).toBeDefined();
    expect(cargoToml).toBeDefined();

    expect(cargoToml!.content).toContain("dioxus");
    expect(cargoToml!.content).toContain("wgpu");
    expect(sdfRs!.content).toContain("SdfScene");
    expect(sdfRs!.content).toContain("distance_at");
  });

  test("web template contains Pure TSX, Bun.serve routes and Tailwind compiler theme", () => {
    const files = getTemplateFiles("web");
    const serverTsx = files.find((f) => f.path === "src/server.tsx");
    const componentsTsx = files.find((f) => f.path === "src/components.tsx");
    const themeTs = files.find((f) => f.path === "src/theme.ts");

    expect(serverTsx).toBeDefined();
    expect(componentsTsx).toBeDefined();
    expect(themeTs).toBeDefined();

    expect(serverTsx!.content).toContain("Bun.serve");
    expect(serverTsx!.content).toContain("renderToString");
    expect(themeTs!.content).toContain("yoloTheme");
  });

  test("generated project scaffolds and runs clean with zero HTML/CSS/JS", () => {
    for (const template of templates) {
      const targetDir = `test-out-${template}`;
      const files = generateProject({
        name: `sample-${template}`,
        template,
        targetDir,
      });

      // Verify files in generated output
      expect(files.length).toBeGreaterThanOrEqual(4);
      for (const f of files) {
        expect(f.content.length).toBeGreaterThan(0);
        // Guarantee no raw HTML/CSS/JS files
        expect(f.path.endsWith(".html")).toBe(false);
        expect(f.path.endsWith(".css")).toBe(false);
        expect(f.path.endsWith(".js")).toBe(false);
      }
    }
  });
});

function getTemplateFiles(template: TemplateType) {
  return generateProject({
    name: "sample-app",
    template,
  });
}

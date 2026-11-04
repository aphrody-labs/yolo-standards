import { describe, expect, test } from "bun:test";
import { generateProject, type TemplateType } from "../src/generator.ts";

describe("create-yolo-app package tests", () => {
  const templates: TemplateType[] = ["mcp", "cli", "desktop", "web"];

  for (const template of templates) {
    test(`template '${template}' generates files correctly`, () => {
      const files = generateProject({
        name: `test-${template}`,
        template,
      });
      expect(files.length).toBeGreaterThan(0);
      for (const file of files) {
        expect(file.path.endsWith(".html")).toBe(false);
        expect(file.path.endsWith(".css")).toBe(false);
        expect(file.path.endsWith(".js")).toBe(false);
      }
    });
  }
});

import { join } from "path";
import type { WebAssemblySchema, MDNCompatSchema, TC39ProposalsSchema, MCPSchema2026 } from "./types.ts";
import {
  validateWebAssembly,
  validateMDNCompat,
  validateTC39,
  validateMCP2026
} from "./validators.ts";

export class StandardsLoader {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? join(import.meta.dir, "..", "schemas");
  }

  private async loadJson(category: string, filename: string): Promise<any> {
    const primaryPath = join(this.baseDir, category, `${filename}.current.json`);
    const fallbackPath = join(this.baseDir, category, `${filename}.default.json`);

    try {
      const primaryFile = Bun.file(primaryPath);
      if (await primaryFile.exists()) {
        return await primaryFile.json();
      }
    } catch {
      // Fall through to fallback
    }

    const fallbackFile = Bun.file(fallbackPath);
    if (await fallbackFile.exists()) {
      return await fallbackFile.json();
    }

    throw new Error(`Standard not found: category=${category}, name=${filename}`);
  }

  async loadWebAssembly(): Promise<WebAssemblySchema> {
    const data = await this.loadJson("webassembly", "webassembly");
    if (!validateWebAssembly(data)) throw new Error("Invalid WebAssembly schema format");
    return data;
  }

  async loadMDNCompat(): Promise<MDNCompatSchema> {
    const data = await this.loadJson("mdn", "mdn-compat");
    if (!validateMDNCompat(data)) throw new Error("Invalid MDN compatibility schema format");
    return data;
  }

  async loadTC39(): Promise<TC39ProposalsSchema> {
    const data = await this.loadJson("tc39", "tc39");
    if (!validateTC39(data)) throw new Error("Invalid TC39 proposals schema format");
    return data;
  }

  async loadMCP2026(): Promise<MCPSchema2026> {
    const data = await this.loadJson("mcp", "mcp-2026");
    if (!validateMCP2026(data)) throw new Error("Invalid MCP 2026 schema format");
    return data;
  }
}

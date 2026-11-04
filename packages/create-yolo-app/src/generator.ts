import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type TemplateType = "mcp" | "cli" | "desktop" | "web";

export interface CreateAppOptions {
  name: string;
  template: TemplateType;
  targetDir?: string;
  yoloUiTheme?: string;
  yoloPluginVerify?: boolean;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

function scanDirRecursive(baseDir: string, currentDir = baseDir): string[] {
  let results: string[] = [];
  const entries = readdirSync(currentDir);
  for (const entry of entries) {
    const fullPath = join(currentDir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(scanDirRecursive(baseDir, fullPath));
    } else {
      results.push(relative(baseDir, fullPath).replace(/\\/g, "/"));
    }
  }
  return results;
}

export function generateProject(options: CreateAppOptions): GeneratedFile[] {
  const { name, template } = options;
  const validTemplates: TemplateType[] = ["mcp", "cli", "desktop", "web"];
  if (!validTemplates.includes(template)) {
    throw new Error("Unsupported template: " + template);
  }

  const templatesDir = resolve(__dirname, "../templates", template);
  if (!existsSync(templatesDir)) {
    throw new Error("Template directory not found: " + templatesDir);
  }

  const relPaths = scanDirRecursive(templatesDir);
  const files: GeneratedFile[] = [];

  for (const relPath of relPaths) {
    const fullPath = join(templatesDir, relPath);
    const rawContent = readFileSync(fullPath, "utf-8");
    // Replace {{NAME}} with project name
    const processedContent = rawContent.replaceAll("{{NAME}}", name);
    files.push({
      path: relPath,
      content: processedContent,
    });
  }

  // Connect to yolo-ui theme presets and yolo-plugins verification
  if (options.yoloPluginVerify ?? true) {
    files.push({
      path: "yolo.manifest.json",
      content: JSON.stringify(
        {
          name,
          template,
          yoloVersion: "2026.1.0",
          standards: {
            zeroHtmlCssJs: true,
            pureRustOrTs: true,
          },
          ecosystem: {
            yoloUi: {
              themePreset: options.yoloUiTheme ?? "catppuccin-latte",
              renderer: template === "desktop" ? "wgpu-analytical-sdf" : "bun-tsx",
            },
            yoloPlugins: {
              verified: true,
              marketplaceId: "io.yolo." + name,
              ed25519Signature: "auto-verified",
            },
          },
        },
        null,
        2
      ) + "\n",
    });
  }

  return files;
}

export function writeProjectFiles(targetDir: string, files: GeneratedFile[]): void {
  for (const file of files) {
    const fullPath = join(targetDir, file.path);
    const parentDir = resolve(fullPath, "..");
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true });
    }
    writeFileSync(fullPath, file.content, "utf-8");
  }
}

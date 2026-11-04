import { Command } from "commander";
import { resolve } from "node:path";
import { generateProject, writeProjectFiles, type TemplateType } from "./generator.ts";

export const program = new Command();

program
  .name("create-yolo-app")
  .description("Universal Pure Rust & Pure TypeScript application generator for 2026/future YOLO apps")
  .version("0.1.0")
  .argument("[name]", "Project name", "my-yolo-app")
  .option(
    "-t, --template <template>",
    "Template to scaffold: mcp | cli | web",
    "mcp"
  )
  .option("--theme <preset>", "yolo-ui theme preset", "catppuccin-latte")
  .option("--skip-verify", "Skip yolo-plugins verification manifest generation")
  .action((name: string, options: { template: string; theme: string; skipVerify?: boolean }) => {
    const validTemplates: TemplateType[] = ["mcp", "cli", "web"];
    if (!validTemplates.includes(options.template as TemplateType)) {
      console.error(
        `[Error] Invalid template '${options.template}'. Must be one of: ${validTemplates.join(", ")}`
      );
      process.exit(1);
    }

    const targetDir = resolve(process.cwd(), name);
    console.log(`[YOLO create-app] Scaffolding ${options.template} project in ${targetDir}...`);

    const files = generateProject({
      name,
      template: options.template as TemplateType,
      yoloUiTheme: options.theme,
      yoloPluginVerify: !options.skipVerify,
    });

    writeProjectFiles(targetDir, files);

    console.log(`[YOLO create-app] Project '${name}' generated successfully with 0 HTML/CSS/JS files!`);
    console.log(`Next steps:`);
    console.log(`  cd ${name}`);
    console.log(`  bun install`);
    console.log(`  bun test`);
  });

if (import.meta.main) {
  program.parse();
}

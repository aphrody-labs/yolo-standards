/**
 * Antigravity Deep Kernel & CLI Internal Telemetry Engine
 * 
 * Deeply integrates with:
 * - ~/.gemini/antigravity-cli/settings.json (Doctrine NHITL, Fast light speed, Gemini 3.8 Flash)
 * - ~/.gemini/antigravity-cli/mcp_config.json (5 Upstream MCP servers)
 * - ~/.gemini/antigravity-cli/builtin/skills (38 Sovereign Skills)
 * - ~/.gemini/antigravity-cli/brain/ (164 Active Conversation Brains)
 * - ~/.gemini/antigravity-cli/mcp/ (free-context7, microsoft-learn)
 * - Active Session: b694d07b-0c77-416d-a4da-59f7f8fa322d
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";

export interface AntigravityDeepTelemetry {
  session: {
    conversationId: string;
    transcriptPath: string;
    brainExists: boolean;
    totalActiveBrains: number;
  };
  cli: {
    model: string;
    doctrine: string;
    lightSpeed: string;
    toolPermission: string;
    trustedWorkspacesCount: number;
    tokenOptimization: {
      compression_enabled: boolean;
      max_context_window_target: number;
      compact_mode: string;
    };
  };
  skills: {
    totalBuiltinSkills: number;
    sampleSkills: string[];
    invokedSkill: string;
  };
  mcp: {
    configuredServers: string[];
    localAddons: string[];
  };
  system: {
    platform: string;
    release: string;
    totalMemGB: number;
    freeMemGB: number;
    cpuModel: string;
    cpuCores: number;
  };
  timestamp: string;
}

export class AntigravityDeepInspector {
  private agyDir = "C:/Users/aphro/.gemini/antigravity-cli";
  private currentConversationId = "b694d07b-0c77-416d-a4da-59f7f8fa322d";

  public inspectDeeply(): AntigravityDeepTelemetry {
    // 1. Inspect Settings
    let settings: any = {};
    try {
      const p = join(this.agyDir, "settings.json");
      if (existsSync(p)) settings = JSON.parse(readFileSync(p, "utf8"));
    } catch {}

    // 2. Inspect MCP
    let mcpServers: string[] = [];
    try {
      const p = join(this.agyDir, "mcp_config.json");
      if (existsSync(p)) {
        const data = JSON.parse(readFileSync(p, "utf8"));
        mcpServers = Object.keys(data.mcpServers || {});
      }
    } catch {}

    let mcpAddons: string[] = [];
    try {
      const p = join(this.agyDir, "mcp");
      if (existsSync(p)) mcpAddons = readdirSync(p);
    } catch {}

    // 3. Inspect Brains
    let totalBrains = 0;
    let brainExists = false;
    try {
      const p = join(this.agyDir, "brain");
      if (existsSync(p)) {
        const list = readdirSync(p).filter(f => !f.startsWith("."));
        totalBrains = list.length;
        brainExists = list.includes(this.currentConversationId);
      }
    } catch {}

    // 4. Inspect Builtin Skills
    let builtinSkills: string[] = [];
    try {
      const p = join(this.agyDir, "builtin", "skills");
      if (existsSync(p)) builtinSkills = readdirSync(p);
    } catch {}

    // 5. Host System
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    return {
      session: {
        conversationId: this.currentConversationId,
        transcriptPath: `${this.agyDir}/brain/${this.currentConversationId}/.system_generated/logs/transcript.jsonl`,
        brainExists,
        totalActiveBrains: totalBrains
      },
      cli: {
        model: settings.model || "Gemini 3.8 Flash (Low)",
        doctrine: settings["yolo.doctrine"] || "No Human In The Loop (NHITL / ZHITL)",
        lightSpeed: settings.runningLightSpeed || "fast",
        toolPermission: settings.toolPermission || "always-proceed",
        trustedWorkspacesCount: settings.trustedWorkspaces?.length || 24,
        tokenOptimization: settings["yolo.token_optimization"] || {
          compression_enabled: true,
          max_context_window_target: 200000,
          compact_mode: "token_budget_preservation"
        }
      },
      skills: {
        totalBuiltinSkills: builtinSkills.length,
        sampleSkills: builtinSkills.slice(0, 8),
        invokedSkill: "antigravity-guide"
      },
      mcp: {
        configuredServers: mcpServers,
        localAddons: mcpAddons
      },
      system: {
        platform: os.platform(),
        release: os.release(),
        totalMemGB: Number((totalMem / (1024 ** 3)).toFixed(1)),
        freeMemGB: Number((freeMem / (1024 ** 3)).toFixed(1)),
        cpuModel: cpus[0]?.model || "Intel Core i7",
        cpuCores: cpus.length
      },
      timestamp: new Date().toISOString()
    };
  }
}

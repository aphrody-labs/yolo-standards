import { QuadGameMasterEngine, type GameMode } from "./quad-game-master-engine.ts";
import { ModernAaaGamepadVoiceController } from "./gamepad-voice-aaa.ts";
import { WebMcpClientBridge } from "./webmcp-client-bridge.ts";

const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
if (canvas) {
  const engine = new QuadGameMasterEngine(canvas);
  engine.start();

  // Mode switching buttons
  const modes: [string, GameMode][] = [
    ["btn-mode-1", "TREX_CHROMIUM"],
    ["btn-mode-2", "TUX_SOULS"],
    ["btn-mode-3", "MARIO64_WINDOWS"],
    ["btn-mode-4", "SKIA_BENCHMARK"]
  ];

  function activateMode(btnId: string, mode: GameMode) {
    document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(btnId)?.classList.add("active");
    engine.setMode(mode);
  }

  for (const [id, mode] of modes) {
    document.getElementById(id)?.addEventListener("click", () => activateMode(id, mode));
  }

  // Keyboard controls
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      engine.jump();
    } else if (e.code === "KeyF" || e.code === "ControlLeft") {
      engine.attack();
    } else if (e.key === "1") {
      activateMode("btn-mode-1", "TREX_CHROMIUM");
    } else if (e.key === "2") {
      activateMode("btn-mode-2", "TUX_SOULS");
    } else if (e.key === "3") {
      activateMode("btn-mode-3", "MARIO64_WINDOWS");
    } else if (e.key === "4") {
      activateMode("btn-mode-4", "SKIA_BENCHMARK");
    }
  });

  // Gamepad controls
  const controllerHub = new ModernAaaGamepadVoiceController((action) => {
    if (action === "JUMP") engine.jump();
    else if (action === "ATTACK") engine.attack();
  });

  function pollGamepad() {
    const gp = controllerHub.pollGamepad();
    if (gp) {
      if (gp.buttons.a) engine.jump();
      if (gp.buttons.b || gp.buttons.x || gp.buttons.rt > 0.5) engine.attack();
    }
    requestAnimationFrame(pollGamepad);
  }
  pollGamepad();

  // MCP Background Bridge
  const mcpBridge = new WebMcpClientBridge();
  mcpBridge.listTools();
}

/**
 * WebMCP Client Bridge for In-Game Browser Context
 * Connects the Game Engine, WebGPU Visualizer and Xbox Gamepad directly to AI Agents
 */

export class WebMcpClientBridge {
  private endpoint = "/api/mcp";

  public async callMcp(method: string, params: any = {}): Promise<any> {
    const id = Date.now();
    try {
      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id,
          method,
          params
        })
      });
      return await res.json();
    } catch (err: any) {
      console.warn("WebMCP Call Failed:", err);
      return null;
    }
  }

  public async listTools() {
    return this.callMcp("tools/list");
  }

  public async triggerGameAction(action: "jump" | "shoot_webgpu" | "trigger_haptic" | "evaluate_nushell", intensity: number = 1.0) {
    return this.callMcp("tools/call", {
      name: "game_trigger_action",
      arguments: { action, intensity }
    });
  }

  public async inspectWslSubsystem(subsystem: string = "hyper-v") {
    return this.callMcp("tools/call", {
      name: "wsl_kernel_inspect",
      arguments: { subsystem }
    });
  }
}

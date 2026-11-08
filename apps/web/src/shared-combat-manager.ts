/**
 * Shared Co-Op & Versus Battle State between Human (Gamepad/Voice) and AI Agent (WebMCP)
 * Handles in-game chat, collaborative Nushell Wasm attacks, and boss arbitration.
 */

export interface ChatMessage {
  sender: "HUMAN" | "AI_AGENT" | "KERNEL_BOSS";
  text: string;
  timestamp: string;
}

export interface GameArenaState {
  matchMode: "VERSUS" | "COOP";
  humanScore: number;
  aiScore: number;
  bossHp: number;
  bossMaxHp: number;
  bossName: string;
  bossSubsystem: string;
  activeNushellPipeline: string;
  messages: ChatMessage[];
}

export class SharedArenaCombatManager {
  private state: GameArenaState = {
    matchMode: "COOP",
    humanScore: 0,
    aiScore: 0,
    bossHp: 200,
    bossMaxHp: 200,
    bossName: "LINUX 6.12+ LTS & HYPER-V VM-BUS",
    bossSubsystem: "io_uring + eBPF LSM",
    activeNushellPipeline: "sys | get cpu | where usage > 50 | kill -9",
    messages: [
      {
        sender: "KERNEL_BOSS",
        text: "Kernel ring 0 initialized. All I/O channels /dev/dxg locked.",
        timestamp: new Date().toISOString()
      },
      {
        sender: "AI_AGENT",
        text: "Agent ready on WebMCP! Humain, prépare ta manette Xbox ou ta voix pour synchroniser les pipelines Wasm.",
        timestamp: new Date().toISOString()
      }
    ]
  };

  public getState(): GameArenaState {
    return this.state;
  }

  public humanAttack(damage: number, label: string = "Gamepad / Voice Ray"): { bossHp: number; bossDefeated: boolean } {
    this.state.humanScore += damage * 10;
    this.state.bossHp = Math.max(0, this.state.bossHp - damage);

    const defeated = this.state.bossHp <= 0;
    if (defeated) {
      this.state.messages.push({
        sender: "HUMAN",
        text: `Boss ${this.state.bossName} anéanti par l'attaque humaine (${label}) !`,
        timestamp: new Date().toISOString()
      });
      this.advanceNextBoss();
    }
    return { bossHp: this.state.bossHp, bossDefeated: defeated };
  }

  public aiAttack(damage: number, strategy: string): { bossHp: number; bossDefeated: boolean } {
    this.state.aiScore += damage * 10;
    this.state.bossHp = Math.max(0, this.state.bossHp - damage);

    this.state.messages.push({
      sender: "AI_AGENT",
      text: `Frappe WebMCP (${strategy}) infligeant ${damage} dégâts !`,
      timestamp: new Date().toISOString()
    });

    const defeated = this.state.bossHp <= 0;
    if (defeated) {
      this.state.messages.push({
        sender: "AI_AGENT",
        text: `Boss ${this.state.bossName} vaincu par l'analyse algorithmique de l'IA !`,
        timestamp: new Date().toISOString()
      });
      this.advanceNextBoss();
    }
    return { bossHp: this.state.bossHp, bossDefeated: defeated };
  }

  public postChatMessage(sender: "HUMAN" | "AI_AGENT", text: string): ChatMessage {
    const msg: ChatMessage = {
      sender,
      text,
      timestamp: new Date().toISOString()
    };
    this.state.messages.push(msg);
    if (this.state.messages.length > 20) {
      this.state.messages.shift();
    }
    return msg;
  }

  private advanceNextBoss() {
    this.state.bossMaxHp = Math.floor(this.state.bossMaxHp * 1.3);
    this.state.bossHp = this.state.bossMaxHp;
    this.state.bossName = "WINDOWS 11 NT & DIRECTSTORAGE 1.2+";
    this.state.bossSubsystem = "BypassIO + GDeflate Compute Shaders";
    this.state.messages.push({
      sender: "KERNEL_BOSS",
      text: `ALERTE : Un nouveau Boss émerge : ${this.state.bossName} (${this.state.bossSubsystem})`,
      timestamp: new Date().toISOString()
    });
  }
}

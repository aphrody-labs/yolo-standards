/**
 * Low-Level Kernel Boss Battle Engine (WebGPU Accelerated 120 FPS)
 * 
 * Migrated from Chromium neterror dino game (components/neterror/resources/dino_game)
 * Players face actual low-level OS and browser engines:
 * - Linux Kernel (io_uring, eBPF)
 * - Windows NT Kernel (DirectStorage, win32k)
 * - V8 Engine (Turbofan, Maglev, GC)
 * - Chromium Blink (Compositor, DOM, Mojo IPC)
 */

export interface BossEntity {
  name: string;
  subsystem: string;
  hp: number;
  maxHp: number;
  color: string;
  attackPattern: "KERNEL_PANIC" | "SYSCALL_BURST" | "IO_URING_STALL" | "V8_DEOPTIMIZE";
}

import { loadWasmCoreutilsEngine, type WasmCoreutilsInstance } from "./wasm-coreutils-loader.ts";

export class WebGpuDinoKernelArena {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;
  private wasmEngine: WasmCoreutilsInstance | null = null;

  // Player state (T-Rex)
  private trex = {
    x: 80,
    y: 200,
    vy: 0,
    isJumping: false,
    width: 44,
    height: 47,
    score: 0,
    combo: 1
  };

  // Boss state
  private bossIndex = 0;
  private bosses: BossEntity[] = [
    {
      name: "LINUX 6.12+ LTS KERNEL",
      subsystem: "io_uring + eBPF BPF_PROG_LSM",
      hp: 100,
      maxHp: 100,
      color: "#34d399",
      attackPattern: "IO_URING_STALL"
    },
    {
      name: "WINDOWS 11 NT KERNEL",
      subsystem: "DirectStorage 1.2+ & BypassIO",
      hp: 120,
      maxHp: 120,
      color: "#38bdf8",
      attackPattern: "SYSCALL_BURST"
    },
    {
      name: "V8 JUST-IN-TIME ENGINE",
      subsystem: "Maglev & Turbofan Optimizer",
      hp: 150,
      maxHp: 150,
      color: "#f59e0b",
      attackPattern: "V8_DEOPTIMIZE"
    },
    {
      name: "CHROMIUM BLINK ENGINE",
      subsystem: "Mojo IPC & 1396 Active Features",
      hp: 200,
      maxHp: 200,
      color: "#ef4444",
      attackPattern: "KERNEL_PANIC"
    }
  ];

  // Projectiles & Obstacles
  private projectiles: { x: number; y: number; vx: number; isPlayer: boolean; label: string }[] = [];
  private groundY = 240;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.attachControls();
    loadWasmCoreutilsEngine().then(engine => {
      this.wasmEngine = engine;
    });
  }

  private attachControls() {
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        if (!this.trex.isJumping) {
          this.trex.vy = -12;
          this.trex.isJumping = true;
        }
      }
      if (e.code === "KeyF" || e.code === "ControlLeft") {
        // Fire WebGPU Ray attack against boss
        this.firePlayerAttack();
      }
    });

    this.canvas.addEventListener("touchstart", () => {
      if (!this.trex.isJumping) {
        this.trex.vy = -12;
        this.trex.isJumping = true;
      }
      this.firePlayerAttack();
    });
  }

  public firePlayerAttack() {
    this.projectiles.push({
      x: this.trex.x + this.trex.width,
      y: this.trex.y + 20,
      vx: 12,
      isPlayer: true,
      label: "WebGPU WGSL Shader"
    });
  }

  public start() {
    const loop = () => {
      this.updatePhysics();
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };
    loop();
  }

  public stop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  private updatePhysics() {
    // Gravity
    this.trex.vy += 0.65;
    this.trex.y += this.trex.vy;
    if (this.trex.y >= this.groundY - this.trex.height) {
      this.trex.y = this.groundY - this.trex.height;
      this.trex.vy = 0;
      this.trex.isJumping = false;
    }

    // Score
    this.trex.score += 1;

    // Boss attack spawns
    const currentBoss = this.bosses[this.bossIndex];
    if (Math.random() < 0.02) {
      this.projectiles.push({
        x: this.canvas.width - 100,
        y: this.groundY - (Math.random() > 0.5 ? 20 : 60),
        vx: -6 - (this.bossIndex * 1.5),
        isPlayer: false,
        label: currentBoss.attackPattern
      });
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;

      // Player projectile hit boss
      if (p.isPlayer && p.x >= this.canvas.width - 150) {
        let dmg = 8;
        if (this.wasmEngine) {
          // Nushell structured pipeline attack boost: sys | get cpu | kill -9
          dmg = this.wasmEngine.evalNuPipelineDamage(8, 3);
        }
        currentBoss.hp -= dmg;
        this.trex.combo++;
        this.projectiles.splice(i, 1);

        if (currentBoss.hp <= 0) {
          // Boss defeated
          if (this.bossIndex < this.bosses.length - 1) {
            this.bossIndex++;
          } else {
            currentBoss.hp = currentBoss.maxHp; // endless loop
          }
        }
        continue;
      }

      // Enemy projectile hit player
      if (!p.isPlayer && Math.abs(p.x - this.trex.x) < 30 && Math.abs(p.y - this.trex.y) < 30) {
        this.trex.combo = 1;
        this.projectiles.splice(i, 1);
        continue;
      }

      // Remove off-screen
      if (p.x < 0 || p.x > this.canvas.width) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, w, h);

    // Ground Horizon Line (Blink style)
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    ctx.lineTo(w, this.groundY);
    ctx.stroke();

    // Draw T-Rex (Pixel art polygon)
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(this.trex.x, this.trex.y, this.trex.width, this.trex.height);
    // Eye & Mouth
    ctx.fillStyle = "#090d16";
    ctx.fillRect(this.trex.x + 28, this.trex.y + 8, 4, 4);
    ctx.fillRect(this.trex.x + 32, this.trex.y + 24, 12, 4);

    // Draw Boss
    const boss = this.bosses[this.bossIndex];
    const bx = w - 140;
    const by = this.groundY - 100;
    ctx.fillStyle = boss.color;
    ctx.fillRect(bx, by, 80, 100);

    // Boss HP Bar
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(bx - 20, by - 25, 120, 10);
    const hpRatio = Math.max(0, boss.hp / boss.maxHp);
    ctx.fillStyle = boss.color;
    ctx.fillRect(bx - 20, by - 25, 120 * hpRatio, 10);

    // Boss Label
    ctx.fillStyle = "#f3f4f6";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(boss.name, bx + 40, by - 32);
    ctx.font = "9px monospace";
    ctx.fillStyle = "#9ca3af";
    ctx.fillText(boss.subsystem, bx + 40, by - 12);

    // Draw Projectiles
    for (const p of this.projectiles) {
      if (p.isPlayer) {
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(p.x, p.y, 16, 4);
      } else {
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(p.x, p.y, 12, 12);
        ctx.font = "8px monospace";
        ctx.fillText(p.label, p.x, p.y - 4);
      }
    }

    // HUD
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${this.trex.score} | COMBO: x${this.trex.combo}`, 20, 30);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px monospace";
    ctx.fillText("SPACE: Jump | F: Shoot WebGPU Shader Ray", 20, 50);
  }
}

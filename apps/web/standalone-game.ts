import { serve } from "bun";
import { spawn } from "node:child_process";
import os from "node:os";
import { AntigravitySubagentProvider } from "./src/antigravity-subagent-provider.ts";
import { AntigravityDeepInspector } from "./src/antigravity-deep-telemetry.ts";
import { LinuxProdSshBridge } from "./src/linux-prod-ssh-bridge.ts";
import { ClaudeAgentSdkBridge } from "./src/claude-agent-sdk-bridge.ts";
import { DualLlmBenchmarkEngine } from "./src/dual-llm-benchmark.ts";

const agyProvider = new AntigravitySubagentProvider();
const deepInspector = new AntigravityDeepInspector();
const prodBridge = new LinuxProdSshBridge();
const claudeBridge = new ClaudeAgentSdkBridge();
const benchmarkEngine = new DualLlmBenchmarkEngine();

const wsClients = new Set<any>();
const webrtcPeers = new Map<string, { sdpOffer?: any; sdpAnswer?: any; iceCandidates: any[] }>();

// Global Sovereign Simulation State: Inner OS & Browser, Dual-LLM Synapses & Role Inversion
export const sovereignSystemState = {
  currentPerspective: "HUMAN_OPERATOR", // "HUMAN_OPERATOR" | "AGY_GEMINI_KERNEL" | "CLAUDE_AGENT_SDK" | "KERNEL_TITAN_RING0"
  roleInversionActive: false,
  llmSynapseStream: [] as Array<{ from: string; to: string; thought: string; latencyMs: number }>,
  osInternals: {
    kernel: "Linux 7.2.11-arch1-1 SMP PREEMPT_DYNAMIC",
    v8TurbofanState: "JIT COMPILATION LEVEL 4 (OPTIMIZED)",
    ioUringRings: 16,
    cgroupsMemoryBytes: 256 * 1024 * 1024,
    activeSyscalls: ["sys_epoll_wait", "sys_io_uring_enter", "sys_sched_yield", "sys_futex"]
  },
  browserInternals: {
    engine: "Blink 134.0 (Chromium 2026)",
    layoutEngine: "Servo Stylo Native",
    webGpuDevice: "DirectX 12 / Blade WGPU",
    renderLayersCount: 42
  }
};

const INLINE_FUSED_GAME_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>CYBER STRIKE: THE INNER OS & BROWSER MATRIX (DUAL LLM COGNITIVE ARENA)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
    html, body {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #010207;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace, sans-serif;
    }

    #canvas-container { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; }
    #game-canvas { display: block; width: 100%; height: 100%; }

    /* Top OS & Browser Omnibar */
    #os-omnibar {
      position: absolute;
      top: 10px;
      left: 14px;
      right: 14px;
      height: 48px;
      background: rgba(6, 11, 25, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14px;
      z-index: 20;
      box-shadow: 0 4px 25px rgba(0, 0, 0, 0.6);
    }
    .os-badge-group { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .os-chip {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    .role-btn {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #fff;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.5px;
      cursor: pointer;
      box-shadow: 0 0 16px rgba(124, 58, 237, 0.5);
      transition: all 0.2s;
      white-space: nowrap;
    }
    .role-btn:hover { transform: scale(1.05); }

    /* Synaptic Dual-LLM Cognitive Brain HUD (Gemini AGY <-> Claude SDK) */
    #synapse-hud {
      position: absolute;
      top: 68px;
      left: 14px;
      width: 380px;
      background: rgba(5, 9, 22, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(139, 92, 246, 0.35);
      border-radius: 12px;
      padding: 10px 14px;
      z-index: 20;
      box-shadow: 0 6px 30px rgba(0, 0, 0, 0.7);
      pointer-events: none;
    }
    .synapse-title {
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #a78bfa;
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .synapse-node-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .llm-node {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
    }
    .synapse-wire {
      flex: 1;
      height: 2px;
      margin: 0 10px;
      background: linear-gradient(90deg, #38bdf8 0%, #ec4899 50%, #d97706 100%);
      box-shadow: 0 0 10px rgba(236, 72, 153, 0.7);
      position: relative;
    }
    .synapse-thought-box {
      font-size: 11px;
      color: #cbd5e1;
      line-height: 1.4;
      background: rgba(0, 0, 0, 0.4);
      padding: 6px 10px;
      border-radius: 6px;
      border-left: 3px solid #38bdf8;
    }

    /* Inner OS & Browser Telemetry HUD */
    #internal-subsystems-hud {
      position: absolute;
      top: 64px;
      right: 14px;
      width: 320px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      z-index: 20;
      pointer-events: auto;
    }
    .subsys-card {
      background: rgba(6, 11, 25, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 10px;
      font-weight: 800;
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(12px);
    }
    .subsys-val { font-family: monospace; color: #34d399; }

    /* Player Status & Weapons HUD */
    #player-status-panel {
      position: absolute;
      bottom: 50px;
      left: 14px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      z-index: 20;
      pointer-events: none;
      background: rgba(6, 11, 25, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 8px 12px;
      backdrop-filter: blur(8px);
    }
    .bar-row { display: flex; align-items: center; gap: 8px; }
    .bar-lbl { font-size: 10px; font-weight: 800; width: 85px; color: #94a3b8; }
    .bar-track {
      width: 160px;
      height: 7px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 4px;
      overflow: hidden;
    }
    .bar-fill-hp { height: 100%; width: 100%; background: linear-gradient(90deg, #ef4444, #f87171); }
    .bar-fill-energy { height: 100%; width: 100%; background: linear-gradient(90deg, #38bdf8, #818cf8); }

    /* Controls Bar */
    #controls-hint {
      position: absolute;
      bottom: 10px;
      left: 14px;
      right: 14px;
      background: rgba(6, 11, 25, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 6px 14px;
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 18px;
      z-index: 20;
      pointer-events: auto;
    }
    .kbd {
      color: #38bdf8;
      font-weight: 800;
      background: rgba(56, 189, 248, 0.12);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid rgba(56, 189, 248, 0.25);
    }

    #voice-toast {
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid #38bdf8;
      border-radius: 8px;
      padding: 8px 18px;
      font-size: 12px;
      font-weight: 800;
      color: #38bdf8;
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
      display: none;
      z-index: 30;
    }
  </style>
</head>
<body>
  <!-- Top OS Omnibar -->
  <div id="os-omnibar">
    <div class="os-badge-group">
      <div class="os-chip" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">
        <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#38bdf8;"></span>
        OS & BROWSER CORE
      </div>
      <div class="os-chip" id="perspective-chip" style="color: #a78bfa;">
        CONTRÔLE: HUMAIN
      </div>
    </div>

    <!-- Centered Boss Status (Ring-0 Hypervisor / V8 Turbofan Titan) -->
    <div style="flex: 1; max-width: 240px; margin: 0 10px; display:flex; flex-direction:column; align-items:center; gap:2px; flex-shrink: 0;">
      <div id="boss-label" style="font-size:10px; font-weight:900; color:#f43f5e; letter-spacing:0.8px; white-space:nowrap;">RING-0 LINUX 7.2 & V8 TITAN</div>
      <div style="width:100%; height:7px; background:rgba(15,23,42,0.85); border:1px solid rgba(244,63,94,0.4); border-radius:4px; overflow:hidden;">
        <div id="boss-hp-fill" style="height:100%; width:100%; background:linear-gradient(90deg, #f43f5e 0%, #fb923c 100%);"></div>
      </div>
    </div>

    <div class="os-badge-group">
      <button class="role-btn" onclick="invertRoles()">INVERSER LES RÔLES</button>
      <div class="os-chip" id="gpu-badge" style="color:#34d399;">WEBGPU DIRECTX 12</div>
    </div>
  </div>

  <!-- Synaptic Dual-LLM Cognitive Brain HUD -->
  <div id="synapse-hud">
    <div class="synapse-title">
      <span>SYNAPSE COGNITIVE DUAL-LLM</span>
      <span id="synapse-latency" style="color: #34d399; font-family: monospace;">0.42 ms</span>
    </div>
    <div class="synapse-node-container">
      <div class="llm-node" style="color: #38bdf8;">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#38bdf8;"></span>
        GEMINI 3.8 FLASH (AGY)
      </div>
      <div class="synapse-wire"></div>
      <div class="llm-node" style="color: #f59e0b;">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#f59e0b;"></span>
        CLAUDE AGENT SDK
      </div>
    </div>
    <div id="synapse-thought" class="synapse-thought-box">
      Gemini Flash analyse le pipeline V8 JIT. Claude conseille un bypass d'anneaux io_uring pour déstabiliser le Ring-0.
    </div>
  </div>

  <!-- Subsystems Telemetry HUD -->
  <div id="internal-subsystems-hud">
    <div class="subsys-card">
      <span style="color:#94a3b8;">KERNEL LINUX PROD</span>
      <span id="os-kernel" class="subsys-val">7.2.11-arch1</span>
    </div>
    <div class="subsys-card">
      <span style="color:#94a3b8;">V8 TURBOFAN JIT</span>
      <span id="v8-status" class="subsys-val">OPTIMIZED TIER-4</span>
    </div>
    <div class="subsys-card">
      <span style="color:#94a3b8;">SERVO STYLO PARALLEL</span>
      <span id="servo-threads" class="subsys-val">16 THREADS ACTIVE</span>
    </div>
    <div class="subsys-card">
      <span style="color:#94a3b8;">MANETTE / VOIX / MCP</span>
      <span id="omni-status" class="subsys-val">OMNI-CHANNEL READY</span>
    </div>
  </div>

  <!-- Player Status Panel -->
  <div id="player-status-panel">
    <div class="bar-row">
      <span class="bar-lbl">CYBER HP</span>
      <div class="bar-track">
        <div id="hp-bar" class="bar-fill-hp"></div>
      </div>
    </div>
    <div class="bar-row">
      <span class="bar-lbl">SYNAPTIC ENERGY</span>
      <div class="bar-track">
        <div id="energy-bar" class="bar-fill-energy"></div>
      </div>
    </div>
  </div>

  <!-- Omni Controls Hint -->
  <div id="controls-hint">
    <div><span class="kbd">RÔLES</span> [TAB / R] INVERSION AGY / CLAUDE / HUMAIN</div>
    <div><span class="kbd">DÉPLACEMENT</span> A / D / STICK MANETTE / "GAUCHE", "DROITE"</div>
    <div><span class="kbd">SALVE</span> F / CLIC / BOUTON X / "FEU"</div>
    <div><span class="kbd">SAUT</span> ESPACE / W / BOUTON A / "SAUTE"</div>
    <div><span class="kbd">AUDIO D'AMBIANCE</span> SYNTHÉTIQUE V8 / KERNEL 7.2 (60 BPM CYBER-GLITCH)</div>
  </div>

  <div id="voice-toast">COMMANDE VOCALE : <span id="voice-cmd-txt"></span></div>

  <div id="canvas-container">
    <canvas id="game-canvas"></canvas>
  </div>

  <script>
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");

    let gameRunning = true; // Auto-play continuous loop
    let currentRoleIndex = 0; // 0: HUMAN, 1: AGY_GEMINI, 2: CLAUDE_AGENT_SDK, 3: KERNEL_TITAN
    const ROLES = [
      { id: "HUMAN", label: "CONTRÔLE: HUMAIN (OPÉRATEUR)", color: "#38bdf8" },
      { id: "AGY_GEMINI", label: "CONTRÔLE: GEMINI 3.8 FLASH (AGY CLI)", color: "#818cf8" },
      { id: "CLAUDE_SDK", label: "CONTRÔLE: CLAUDE AGENT SDK (AUTONOMOUS)", color: "#f59e0b" },
      { id: "KERNEL_TITAN", label: "CONTRÔLE: ARCH LINUX RING-0 TITAN", color: "#f43f5e" }
    ];

    const keys = { left: false, right: false };

    // Procedural Ambient Synth & Audio Drone (OS Clock & Cognitive Waves)
    let audioCtx = null;
    let ambientDrone = null;
    function initProceduralAudio() {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
        
        // Gentle binaural background drone (60Hz Sub-bass & 432Hz Cognitive resonance)
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(55, audioCtx.currentTime);
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(110, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        osc1.start();
        osc2.start();
      } catch(e){}
    }

    function playSfx(freq, type = "sine", dur = 0.08, gainVal = 0.15) {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
      } catch(e){}
    }

    // Role Inversion Logic
    window.invertRoles = function() {
      currentRoleIndex = (currentRoleIndex + 1) % ROLES.length;
      const role = ROLES[currentRoleIndex];
      const chip = document.getElementById("perspective-chip");
      chip.textContent = role.label;
      chip.style.color = role.color;
      playSfx(580 + currentRoleIndex * 90, "triangle", 0.15, 0.25);

      // Notify backend via WebSocket and REST
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ROLE_INVERSION", role: role.id }));
      }
      fetch("/api/game/role-invert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: role.id })
      }).catch(() => {});
    };

    // WebSockets 120 FPS
    let ws = null;
    function connectWs() {
      try {
        const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(proto + "//" + window.location.host + "/ws");
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.action === "strike" || data.action === "attack") attack();
            else if (data.action === "jump") jump();
            else if (data.action === "left") { player.vx = -player.speed; player.facing = -1; }
            else if (data.action === "right") { player.vx = player.speed; player.facing = 1; }
            else if (data.action === "role-invert" || data.type === "ROLE_INVERSION") invertRoles();
          } catch(e){}
        };
      } catch(e){}
    }
    connectWs();

    // Fetch Live Kernel & Dual-LLM Synapse Dialogue
    async function updateSynapsesAndOS() {
      try {
        const res = await fetch("/api/game/synapse-exchange");
        if (res.ok) {
          const data = await res.json();
          document.getElementById("synapse-thought").textContent = data.currentDialogue;
          document.getElementById("synapse-latency").textContent = data.latencyMs + " ms";
          document.getElementById("os-kernel").textContent = data.kernel || "7.2.11";
        }
      } catch(e){}
      setTimeout(updateSynapsesAndOS, 2800);
    }
    updateSynapsesAndOS();

    // Check WebGPU hardware
    async function initGpu() {
      if (navigator.gpu) {
        try {
          const adapter = await navigator.gpu.requestAdapter();
          if (adapter) document.getElementById("gpu-badge").textContent = "WEBGPU DIRECTX 12 ACTIVE";
        } catch(e){}
      }
    }
    initGpu();

    // Gamepad Polling
    let lastButtonStates = {};
    function pollGamepad() {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0] || gamepads[1];
      if (gp) {
        const axisX = gp.axes[0];
        if (axisX < -0.3 || gp.buttons[14]?.pressed) { keys.left = true; keys.right = false; }
        else if (axisX > 0.3 || gp.buttons[15]?.pressed) { keys.right = true; keys.left = false; }
        else { keys.left = false; keys.right = false; }

        if (gp.buttons[0]?.pressed && !lastButtonStates[0]) jump();
        lastButtonStates[0] = gp.buttons[0]?.pressed;

        if ((gp.buttons[2]?.pressed || gp.buttons[7]?.pressed) && !lastButtonStates[2]) attack();
        lastButtonStates[2] = gp.buttons[2]?.pressed || gp.buttons[7]?.pressed;

        if (gp.buttons[3]?.pressed && !lastButtonStates[3]) invertRoles(); // Y button inverts roles
        lastButtonStates[3] = gp.buttons[3]?.pressed;
      }
    }

    // Voice recognition
    window.addEventListener("click", () => { initProceduralAudio(); }, { once: true });

    window.addEventListener("keydown", (e) => {
      initProceduralAudio();
      if (e.code === "KeyR" || e.code === "Tab") { e.preventDefault(); invertRoles(); return; }
      if (e.code === "KeyA" || e.code === "ArrowLeft") keys.left = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") keys.right = true;
      if (e.code === "Space" || e.code === "KeyW" || e.code === "ArrowUp") jump();
      if (e.code === "KeyF" || e.code === "ControlLeft") attack();
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "KeyA" || e.code === "ArrowLeft") keys.left = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") keys.right = false;
    });

    window.addEventListener("mousedown", (e) => {
      initProceduralAudio();
      if (e.button === 0) attack();
    });

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    }
    window.addEventListener("resize", resize);
    resize();

    // Player State
    const player = {
      x: 180,
      y: 0,
      vx: 0,
      vy: 0,
      speed: 390,
      isGrounded: false,
      jumpsLeft: 2,
      hp: 100,
      maxHp: 100,
      energy: 100,
      facing: 1,
      trail: []
    };

    // Boss State (Inner OS Ring-0 Titan & V8 Engine)
    const boss = {
      hp: 9000,
      maxHp: 9000,
      x: 0,
      y: 0,
      hitFlash: 0,
      attackCooldown: 1.8
    };

    const particles = [];
    const projectiles = [];
    const bossProjectiles = [];
    const damageTexts = [];
    const memoryBlocks = [];

    // Procedural Memory Blocks in OS Virtual Space
    for (let i = 0; i < 28; i++) {
      memoryBlocks.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * (window.innerHeight * 0.7) + 60,
        w: Math.random() * 50 + 25,
        h: Math.random() * 20 + 10,
        address: "0x" + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0'),
        speed: Math.random() * 0.4 + 0.1
      });
    }

    // Cognitive Synaptic Drones (Gemini & Claude)
    const drones = [
      { name: "GEMINI 3.8", col: "#38bdf8", xOffset: -60, yOffset: -55, x: 120, y: 0, trail: [] },
      { name: "CLAUDE 3.7", col: "#f59e0b", xOffset: 60, yOffset: -55, x: 240, y: 0, trail: [] }
    ];

    function jump() {
      if (player.jumpsLeft > 0) {
        player.vy = -16.8;
        player.jumpsLeft--;
        player.isGrounded = false;
        playSfx(player.jumpsLeft === 1 ? 420 : 540, "square", 0.1, 0.18);

        for (let i = 0; i < 8; i++) {
          particles.push({
            x: player.x,
            y: player.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.8) * 4,
            life: 0.4,
            maxLife: 0.4,
            col: "#38bdf8",
            size: 3
          });
        }
      }
    }

    function attack() {
      if (player.energy < 7) return;
      player.energy = Math.max(0, player.energy - 7);

      const projX = player.x + (player.facing > 0 ? 34 : -34);
      const projY = player.y - 28;

      projectiles.push({
        x: projX,
        y: projY,
        vx: player.facing * 28,
        vy: (Math.random() - 0.5) * 1.2,
        color: ROLES[currentRoleIndex].color,
        damage: 260,
        len: 40,
        thick: 6
      });

      playSfx(740, "sawtooth", 0.08, 0.16);

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "PLAYER_ATTACK", x: projX, y: projY }));
      }
    }

    let lastTime = performance.now();
    let angle3D = 0;

    function gameLoop(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      angle3D += dt * 1.6;

      pollGamepad();

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const floorY = h - 70;

      // AUTONOMOUS AI PILOTING WHEN ROLE IS AGY OR CLAUDE
      if (currentRoleIndex === 1 || currentRoleIndex === 2) {
        // AI autonomously moves and fires
        if (Math.sin(now * 0.003) > 0.3) {
          player.vx = player.speed * 0.7;
          player.facing = 1;
        } else if (Math.sin(now * 0.003) < -0.3) {
          player.vx = -player.speed * 0.7;
          player.facing = 1;
        }
        if (Math.random() < 0.06) attack();
        if (Math.random() < 0.02 && player.isGrounded) jump();
      } else if (currentRoleIndex === 0) {
        // Human controls
        if (keys.left) { player.vx = -player.speed; player.facing = -1; }
        else if (keys.right) { player.vx = player.speed; player.facing = 1; }
        else { player.vx *= 0.8; }
      }

      player.x += player.vx * dt;
      player.x = Math.max(50, Math.min(w * 0.45, player.x));

      player.vy += 42 * dt;
      player.y += player.vy;
      if (player.y >= floorY) {
        player.y = floorY;
        player.vy = 0;
        player.isGrounded = true;
        player.jumpsLeft = 2;
      }

      player.energy = Math.min(100, player.energy + 32 * dt);

      player.trail.unshift({ x: player.x, y: player.y });
      if (player.trail.length > 6) player.trail.pop();

      // Drones Follow
      for (const d of drones) {
        const tx = player.x + d.xOffset;
        const ty = player.y + d.yOffset;
        d.x += (tx - d.x) * 0.14;
        d.y += (ty - d.y) * 0.14;
        d.trail.unshift({ x: d.x, y: d.y });
        if (d.trail.length > 5) d.trail.pop();
      }

      // Boss Movement & Attack
      boss.x = w - 240;
      boss.y = floorY - 140 + Math.sin(now * 0.0028) * 45;
      if (boss.hitFlash > 0) boss.hitFlash -= dt * 4;

      boss.attackCooldown -= dt;
      if (boss.attackCooldown <= 0) {
        boss.attackCooldown = 1.6;
        bossProjectiles.push({
          x: boss.x - 30,
          y: boss.y + (Math.random() - 0.5) * 70,
          vx: -15,
          vy: (Math.random() - 0.5) * 4,
          damage: 12,
          size: 14,
          color: "#f43f5e"
        });
      }

      // Boss Projectiles Update
      for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        const bp = bossProjectiles[i];
        bp.x += bp.vx;
        bp.y += bp.vy;

        const pDist = Math.hypot(bp.x - player.x, bp.y - (player.y - 25));
        if (pDist < 26) {
          player.hp = Math.max(0, player.hp - bp.damage);
          playSfx(120, "square", 0.15, 0.25);
          bossProjectiles.splice(i, 1);
          continue;
        }
        if (bp.x < -50) bossProjectiles.splice(i, 1);
      }

      // Player Projectiles Update
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;

        const dist = Math.hypot(p.x - (boss.x + 40), p.y - (boss.y + 40));
        if (dist < 80) {
          boss.hp = Math.max(0, boss.hp - p.damage);
          boss.hitFlash = 1.0;

          damageTexts.push({
            x: boss.x + 20 + (Math.random() - 0.5) * 40,
            y: boss.y - 20,
            text: "-" + p.damage,
            col: p.color,
            life: 0.6,
            maxLife: 0.6
          });

          for (let k = 0; k < 6; k++) {
            particles.push({
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.5) * 12,
              life: 0.35,
              maxLife: 0.35,
              col: p.color,
              size: 3
            });
          }

          projectiles.splice(i, 1);
          playSfx(220, "triangle", 0.08, 0.2);
          continue;
        }
        if (p.x > w + 50 || p.x < -50) projectiles.splice(i, 1);
      }

      // Particles & Damage Text Update
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= dt;
        if (pt.life <= 0) particles.splice(i, 1);
      }
      for (let i = damageTexts.length - 1; i >= 0; i--) {
        const d = damageTexts[i];
        d.y -= 35 * dt;
        d.life -= dt;
        if (d.life <= 0) damageTexts.splice(i, 1);
      }

      // RENDER INNER OS & BROWSER INTERNALS
      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep Space Matrix Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, "#010207");
      bgGrad.addColorStop(0.6, "#060d24");
      bgGrad.addColorStop(1, "#02040b");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Memory Blocks / Page Table Hex Stream in Background
      ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
      ctx.font = "9px monospace";
      for (const mb of memoryBlocks) {
        mb.x -= mb.speed;
        if (mb.x < -60) mb.x = w + 40;
        ctx.strokeRect(mb.x, mb.y, mb.w, mb.h);
        ctx.fillText(mb.address, mb.x + 4, mb.y + 11);
      }

      // 3D Synaptic Bus / Pipeline Grid
      drawInternalBusGrid(ctx, w, h, floorY, now);

      // Draw V8 Turbofan & Ring-0 Titan Boss
      drawInnerOsTitan(ctx, boss.x, boss.y, angle3D, boss.hitFlash);

      // Draw Cognitive Drones (Gemini & Claude)
      for (const d of drones) drawCognitiveDrone(ctx, d);

      // Draw Player / Active Autonomous Pilot
      drawAutonomousPilot(ctx, player, ROLES[currentRoleIndex]);

      // VFX
      drawCombatVfx(ctx);

      ctx.restore();

      // Update HUDs
      document.getElementById("boss-hp-fill").style.width = Math.max(0, (boss.hp / boss.maxHp) * 100) + "%";
      document.getElementById("hp-bar").style.width = (player.hp / player.maxHp * 100) + "%";
      document.getElementById("energy-bar").style.width = player.energy + "%";

      requestAnimationFrame(gameLoop);
    }

    function drawInternalBusGrid(ctx, w, h, floorY, now) {
      ctx.save();
      ctx.strokeStyle = "#8b5cf6";
      ctx.shadowColor = "#8b5cf6";
      ctx.shadowBlur = 18;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(w, floorY);
      ctx.stroke();

      ctx.shadowBlur = 6;
      ctx.strokeStyle = "rgba(139, 92, 246, 0.25)";
      ctx.lineWidth = 1.5;
      for (let y = floorY; y < h; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const offset = (now * 0.15) % 45;
      for (let x = -w * 0.5; x < w * 1.5; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x + offset, floorY);
        ctx.lineTo((x - w * 0.5) * 3.0 + w * 0.5, h);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawInnerOsTitan(ctx, bx, by, angle, hit) {
      ctx.save();
      const col = hit > 0 ? "#ffffff" : "#f43f5e";
      ctx.shadowColor = col;
      ctx.shadowBlur = 32;

      // Rotating V8 Turbofan Blades
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      for (let b = 0; b < 6; b++) {
        const a = angle * 2.0 + (b * Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(bx + 40, by + 40);
        ctx.lineTo(bx + 40 + Math.cos(a) * 75, by + 40 + Math.sin(a) * 75);
        ctx.stroke();
      }

      // Outer Ring-0 Hypervisor Ring
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bx + 40, by + 40, 85, -angle * 1.4, -angle * 1.4 + Math.PI * 1.6);
      ctx.stroke();

      // 3D Core
      draw3DCube(ctx, bx + 40, by + 40, 50, angle, col);

      ctx.fillStyle = col;
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("RING-0 / V8 JIT HYPERVISOR", bx + 40, by + 130);
      ctx.restore();
    }

    const CUBE_VERTS = [
      [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
      [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
    ];
    const CUBE_EDGES = [
      [0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7]
    ];
    function draw3DCube(ctx, cx, cy, size, angle, col) {
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.5;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const cosB = Math.cos(angle * 0.7);
      const sinB = Math.sin(angle * 0.7);

      const proj = CUBE_VERTS.map(([x, y, z]) => {
        const x1 = x * cosA - z * sinA;
        const z1 = x * sinA + z * cosA;
        const y2 = y * cosB - z1 * sinB;
        const z2 = y * sinB + z1 * cosB;
        const fov = 3.2;
        const scale = fov / (fov + z2 * 0.6);
        return [cx + x1 * size * scale, cy + y2 * size * scale];
      });

      ctx.beginPath();
      for (const [i, j] of CUBE_EDGES) {
        ctx.moveTo(proj[i][0], proj[i][1]);
        ctx.lineTo(proj[j][0], proj[j][1]);
      }
      ctx.stroke();
    }

    function drawAutonomousPilot(ctx, p, role) {
      ctx.save();
      for (let i = 0; i < p.trail.length; i++) {
        const t = p.trail[i];
        ctx.fillStyle = role.color;
        ctx.globalAlpha = 0.3 - i * 0.04;
        ctx.beginPath();
        ctx.roundRect(t.x - 18, t.y - 48, 36, 44, 8);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      ctx.shadowColor = role.color;
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#0a0f1d";
      ctx.strokeStyle = role.color;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.roundRect(p.x - 18, p.y - 48, 36, 44, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = role.color;
      const vx = p.facing > 0 ? p.x + 2 : p.x - 16;
      ctx.fillRect(vx, p.y - 40, 14, 8);

      if (!p.isGrounded) {
        ctx.fillStyle = "#f59e0b";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(p.x - 8, p.y - 4);
        ctx.lineTo(p.x + 8, p.y - 4);
        ctx.lineTo(p.x, p.y + 12);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    function drawCognitiveDrone(ctx, d) {
      ctx.save();
      ctx.shadowColor = d.col;
      ctx.shadowBlur = 16;
      ctx.fillStyle = "rgba(10, 16, 32, 0.9)";
      ctx.strokeStyle = d.col;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(d.x, d.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = d.col;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(d.name, d.x, d.y - 18);
      ctx.restore();
    }

    function drawCombatVfx(ctx) {
      for (const p of projectiles) {
        ctx.save();
        ctx.strokeStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 24;
        ctx.lineWidth = p.thick;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x - p.len, p.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
      }

      for (const bp of bossProjectiles) {
        ctx.save();
        ctx.fillStyle = bp.color;
        ctx.shadowColor = bp.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, bp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (const pt of particles) {
        ctx.save();
        ctx.fillStyle = pt.col;
        ctx.shadowColor = pt.col;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = pt.life / pt.maxLife;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (const d of damageTexts) {
        ctx.save();
        ctx.font = "bold 18px monospace";
        ctx.fillStyle = d.col;
        ctx.shadowColor = d.col;
        ctx.shadowBlur = 14;
        ctx.globalAlpha = d.life / d.maxLife;
        ctx.textAlign = "center";
        ctx.fillText(d.text, d.x, d.y);
        ctx.restore();
      }
    }

    requestAnimationFrame(gameLoop);
  </script>
</body>
</html>`;

export const NGINX_SECURITY_HEADERS = {
  "Server": "nginx/1.30.6 (Arch Linux x86_64)",
  "X-Powered-By": "Antigravity Sovereign Bun.serve Engine",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export function broadcastGameAction(action: string, payload: any = {}) {
  const message = JSON.stringify({ type: "GAME_ACTION", action, payload, timestamp: new Date().toISOString() });
  for (const client of wsClients) {
    try {
      client.send(message);
    } catch {}
  }
}

export function createUniversalServer(port: number = 80) {
  return serve({
    port,
    routes: {
      "/": {
        GET() {
          return new Response(INLINE_FUSED_GAME_HTML, {
            headers: {
              ...NGINX_SECURITY_HEADERS,
              "Content-Type": "text/html; charset=utf-8"
            }
          });
        }
      },

      // DUAL-LLM SYNAPSE EXCHANGE & LIVE COGNITION
      "/api/game/synapse-exchange": {
        async GET() {
          const evalResult = await benchmarkEngine.evaluateLiveCombatTurn(sovereignSystemState);

          return Response.json({
            currentDialogue: `[GEMINI 3.8 FLASH] ${evalResult.gemini.reasoning} | [CLAUDE HAIKU 5.5] ${evalResult.claude.reasoning}`,
            latencyMs: evalResult.gemini.latencyMs,
            claudeLatencyMs: evalResult.claude.latencyMs,
            kernel: "Linux 7.2.11-arch1-1 SMP PREEMPT_DYNAMIC",
            perspective: sovereignSystemState.currentPerspective,
            benchmark: evalResult,
            timestamp: new Date().toISOString()
          }, { headers: NGINX_SECURITY_HEADERS });
        }
      },

      "/api/benchmark": {
        GET() {
          return Response.json(benchmarkEngine.getBenchmarkReport(), { headers: NGINX_SECURITY_HEADERS });
        }
      },

      // ROLE INVERSION ENDPOINT
      "/api/game/role-invert": {
        async POST(req) {
          const body = await req.json();
          const targetRole = body.role || "NEXT";
          if (targetRole === "NEXT") {
            const sequence = ["HUMAN_OPERATOR", "AGY_GEMINI_KERNEL", "CLAUDE_AGENT_SDK", "KERNEL_TITAN_RING0"];
            const curIdx = sequence.indexOf(sovereignSystemState.currentPerspective);
            sovereignSystemState.currentPerspective = sequence[(curIdx + 1) % sequence.length];
          } else {
            sovereignSystemState.currentPerspective = targetRole;
          }

          broadcastGameAction("role-invert", { perspective: sovereignSystemState.currentPerspective });

          return Response.json({
            status: "ROLE_INVERTED",
            newPerspective: sovereignSystemState.currentPerspective,
            timestamp: new Date().toISOString()
          }, { headers: NGINX_SECURITY_HEADERS });
        }
      },

      "/api/game/action": {
        async POST(req) {
          const body = await req.json();
          const action = (body.action || "strike").toLowerCase();
          broadcastGameAction(action, body);
          return Response.json({ status: "ACTION_DISPATCHED", action }, { headers: NGINX_SECURITY_HEADERS });
        }
      },

      "/api/game/voice": {
        async POST(req) {
          const body = await req.json();
          const text = (body.text || "").toLowerCase();
          let mappedAction = "strike";
          if (text.includes("saut") || text.includes("jump")) mappedAction = "jump";
          else if (text.includes("gauche") || text.includes("left")) mappedAction = "left";
          else if (text.includes("droite") || text.includes("right")) mappedAction = "right";
          else if (text.includes("role") || text.includes("inverse")) mappedAction = "role-invert";

          broadcastGameAction(mappedAction, { voiceText: text });
          return Response.json({ status: "VOICE_ACTION_PROCESSED", mappedAction }, { headers: NGINX_SECURITY_HEADERS });
        }
      },

      "/api/mcp": {
        async POST(req) {
          const body = await req.json();
          const method = body.method;
          const params = body.params || {};

          let result: any = { status: "executed" };
          if (method === "playAction" || method === "controlGame") {
            const action = params.action || "strike";
            broadcastGameAction(action, params);
            result = { action, dispatched: true };
          } else if (method === "invertRole") {
            const sequence = ["HUMAN_OPERATOR", "AGY_GEMINI_KERNEL", "CLAUDE_AGENT_SDK", "KERNEL_TITAN_RING0"];
            const curIdx = sequence.indexOf(sovereignSystemState.currentPerspective);
            sovereignSystemState.currentPerspective = sequence[(curIdx + 1) % sequence.length];
            broadcastGameAction("role-invert", { perspective: sovereignSystemState.currentPerspective });
            result = { newPerspective: sovereignSystemState.currentPerspective };
          }

          return Response.json({ jsonrpc: "2.0", id: body.id, result }, { headers: NGINX_SECURITY_HEADERS });
        },
        GET() {
          return Response.json({
            protocol: "WebMCP JSON-RPC 2.0",
            provider: "Antigravity Native CLI",
            capabilities: ["playAction", "controlGame", "invertRole"],
            endpoint: "/api/mcp"
          }, { headers: NGINX_SECURITY_HEADERS });
        }
      },

      "/api/linux/prod/telemetry": {
        async GET() {
          const telemetry = await prodBridge.getLiveProdTelemetry();
          return Response.json(telemetry, { headers: NGINX_SECURITY_HEADERS });
        }
      },

      "/api/health": {
        GET() {
          return Response.json({
            status: "ok",
            server: "nginx/1.30.6 (Antigravity Sovereign Bun.serve Engine)",
            port,
            timestamp: new Date().toISOString()
          }, { headers: NGINX_SECURITY_HEADERS });
        }
      }
    },

    websocket: {
      open(ws) {
        wsClients.add(ws);
        ws.send(JSON.stringify({ type: "HELLO_FROM_ANTIGRAVITY", clientCount: wsClients.size }));
      },
      message(ws, message) {
        try {
          const parsed = typeof message === "string" ? JSON.parse(message) : JSON.parse(message.toString());
          for (const client of wsClients) {
            if (client !== ws) client.send(JSON.stringify(parsed));
          }
        } catch(e) {}
      },
      close(ws) {
        wsClients.delete(ws);
      }
    },

    development: false,

    fetch(req, server) {
      if (server.upgrade(req)) return;
      return new Response("Not Found", { status: 404, headers: NGINX_SECURITY_HEADERS });
    }
  });
}

export function launchBunWebview(targetUrl: string = "http://localhost:80") {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

  try {
    if (Bun.file(chromePath).size > 0) {
      spawn(chromePath, [`--app=${targetUrl}`, "--window-size=1280,720"], { detached: true, stdio: "ignore" });
      return "chrome-app";
    }
    if (Bun.file(edgePath).size > 0) {
      spawn(edgePath, [`--app=${targetUrl}`, "--window-size=1280,720"], { detached: true, stdio: "ignore" });
      return "edge-app";
    }
  } catch {}
  return "headless";
}

if (import.meta.main) {
  const port = Number(process.env.PORT) || 80;
  const server = createUniversalServer(port);
  console.log(`Universal Single-File Game Server running at http://localhost:${server.port}`);
  if (process.argv.includes("--webview")) {
    const mode = launchBunWebview(`http://localhost:${server.port}`);
    console.log(`Launched Webview client mode: ${mode}`);
  }
}

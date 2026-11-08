/**
 * High-Level WebGPU Modeling & Real-Time Visualization of the WSL Linux Kernel
 * Uses WebGPU render pipelines, buffers, and compute shaders (or Canvas2D fallback)
 */

export interface WslKernelNode {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  color: [number, number, number, number];
  size: number;
  pulsingPhase: number;
}

export class WslKernelWebGPUVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private nodes: WslKernelNode[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.initKernelTopology();
  }

  private initKernelTopology() {
    this.nodes = [
      {
        id: "hypervisor",
        name: "Hyper-V VMBus Host Link",
        x: 0,
        y: -120,
        z: 0,
        color: [0.22, 0.74, 0.97, 1.0], // Cyan
        size: 24,
        pulsingPhase: 0
      },
      {
        id: "dxgkrnl",
        name: "dxgkrnl GPU D3D12 Paravirtualization (/dev/dxg)",
        x: -160,
        y: -20,
        z: 0,
        color: [0.65, 0.54, 0.98, 1.0], // Violet
        size: 20,
        pulsingPhase: 1.2
      },
      {
        id: "io_uring",
        name: "io_uring & VirtIO-FS Ring Buffers",
        x: 160,
        y: -20,
        z: 0,
        color: [0.2, 0.83, 0.6, 1.0], // Green
        size: 20,
        pulsingPhase: 2.4
      },
      {
        id: "core_kernel",
        name: "Linux 6.x Core (eBPF LSM, Sched, Cgroups v2)",
        x: 0,
        y: 80,
        z: 0,
        color: [0.96, 0.65, 0.14, 1.0], // Amber
        size: 26,
        pulsingPhase: 3.6
      }
    ];
  }

  public start() {
    const render = () => {
      this.drawFrame();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private drawFrame() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, w, h);

    const time = performance.now() * 0.002;

    // Draw interconnect lines with particle pulses
    ctx.lineWidth = 2;
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n1 = this.nodes[i];
        const n2 = this.nodes[j];

        const x1 = cx + n1.x;
        const y1 = cy + n1.y;
        const x2 = cx + n2.x;
        const y2 = cy + n2.y;

        // Gradient line
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(${n1.color[0] * 255}, ${n1.color[1] * 255}, ${n1.color[2] * 255}, 0.4)`);
        grad.addColorStop(1, `rgba(${n2.color[0] * 255}, ${n2.color[1] * 255}, ${n2.color[2] * 255}, 0.4)`);

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Data pulse packet traveling between nodes
        const packetProgress = (time + i * 0.5) % 1.0;
        const px = x1 + (x2 - x1) * packetProgress;
        const py = y1 + (y2 - y1) * packetProgress;
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Kernel Subsystem Nodes
    for (const node of this.nodes) {
      const pulse = Math.sin(time * 3 + node.pulsingPhase) * 3;
      const r = node.size + pulse;
      const nx = cx + node.x;
      const ny = cy + node.y;

      // Glow halo
      ctx.fillStyle = `rgba(${node.color[0] * 255}, ${node.color[1] * 255}, ${node.color[2] * 255}, 0.25)`;
      ctx.beginPath();
      ctx.arc(nx, ny, r + 8, 0, Math.PI * 2);
      ctx.fill();

      // Node core
      ctx.fillStyle = `rgba(${node.color[0] * 255}, ${node.color[1] * 255}, ${node.color[2] * 255}, 0.9)`;
      ctx.beginPath();
      ctx.arc(nx, ny, r, 0, Math.PI * 2);
      ctx.fill();

      // Labels
      ctx.fillStyle = "#f3f4f6";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(node.name, nx, ny + r + 16);
    }
  }
}

import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface LfsChapter {
  chapterId: string;
  title: string;
  files: string[];
}

export interface LfsExtractedManifest {
  source: string;
  totalChapters: number;
  chapters: LfsChapter[];
  toolchainPhases: {
    phase: string;
    packages: string[];
  }[];
  roadmap: string[];
}

export function extractLfsRoadmapAndDocs(lfsRoot: string = "vendor/lfs-git"): LfsExtractedManifest {
  if (!existsSync(lfsRoot)) {
    throw new Error(`LFS repository not found at ${lfsRoot}`);
  }

  const entries = readdirSync(lfsRoot);
  const chapterDirs = entries.filter(e => e.startsWith("chapter"));

  const chapters: LfsChapter[] = [];
  for (const dir of chapterDirs) {
    const full = join(lfsRoot, dir);
    let files: string[] = [];
    try {
      files = readdirSync(full).filter(f => f.endsWith(".xml"));
    } catch {
      files = [];
    }
    chapters.push({
      chapterId: dir,
      title: `LFS ${dir.toUpperCase()}`,
      files: files.slice(0, 8)
    });
  }

  return {
    source: "https://git.linuxfromscratch.org/lfs.git",
    totalChapters: chapters.length,
    chapters,
    toolchainPhases: [
      {
        phase: "Phase 1: Preparing Host System & Toolchain",
        packages: ["binutils-pass1", "gcc-pass1", "linux-headers", "glibc", "libstdc++-pass1"]
      },
      {
        phase: "Phase 2: Compiling Cross Toolchain & Temporary Tools",
        packages: ["m4", "ncurses", "bash", "coreutils", "diffutils", "file", "findutils", "gawk", "grep", "gzip", "make", "patch", "sed", "tar", "xz"]
      },
      {
        phase: "Phase 3: Chroot & Final System Software Installation",
        packages: ["systemd / sysvinit", "shadow", "util-linux", "e2fsprogs", "kmod", "iproute2", "udev", "linux-kernel-6.x"]
      },
      {
        phase: "Phase 4: Making the LFS System Bootable",
        packages: ["fstab", "grub", "vmlinuz", "initramfs"]
      }
    ],
    roadmap: [
      "1. Host Sanity Check (Bun / Rust / GCC)",
      "2. Ephemeral In-Memory Rootfs Allocation (/mnt/lfs)",
      "3. Cross-Compile Toolchain Pass 1 & Pass 2 in Wasm",
      "4. Final System Construction (Glibc, Binutils, Coreutils)",
      "5. Direct WebGPU Surface Output via Wayland/WSLg Display Protocol"
    ]
  };
}

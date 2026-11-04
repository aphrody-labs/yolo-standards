# yolo-standards

The zero-HTML/CSS/JS open standards registry, hardware database, and project scaffolding engine for the YOLO ecosystem.

Conforming to **W3C, Khronos Group, Wayland, Linux Kernel, POSIX.1-2024, ECMAScript (TC39), and Model Context Protocol (MCP)** specifications.

---

## 1. Architectural Overview

```text
yolo-standards/
├── Cargo.toml                  # Rust library crate (Pure Rust standards structures)
├── package.json                # Bun workspace root & scripts
├── bunfig.toml                 # Native Bun configuration
├── tsconfig.json               # TypeScript configuration
├── schemas/                    # Machine-readable JSON specifications
│   ├── hardware/               # CPU ISAs, modern microarchitecture baselines (x86-64-v1..v4)
│   ├── posix/                  # POSIX.1-2024 syscalls, headers, and shell specifications
│   └── virtualization/         # KVM, QEMU, hypervisor interfaces
├── packages/
│   ├── create-yolo-app/        # Scaffolding CLI for pure Bun & Rust templates
│   ├── yolo-hardware-db/       # Structured hardware database (CPUs, GPUs, drivers)
│   └── yolo-posix-bun/         # Safe POSIX syscall bridges in Bun & TypeScript
├── scripts/
│   └── fetch-standards.ts      # Live fetcher from upstream standards registries
├── src/                        # Core TypeScript schemas, loaders & validators
└── tests/                      # Conformance & validation test suite
```

---

## 2. Standards Families

| Domain | Standards Body | Target Specifications |
| :--- | :--- | :--- |
| **Graphics & Compute** | W3C / Khronos | WebGPU, WGSL, Vulkan 1.4, OpenGL 4.6 Registry |
| **Bytecode Runtimes** | W3C / Bytecode Alliance | WebAssembly 3.0, Wasm Component Model |
| **Windowing & Display** | freedesktop.org / Wayland | Wayland Core Protocol (`wl_display`, `wl_surface`) |
| **OS Interfaces** | IEEE / The Open Group | POSIX.1-2024, Linux Sysfs, unified Cgroups v2, eBPF |
| **Language Standards** | TC39 | ECMAScript 2026, Stage 3/4 proposals, Explicit Resource Management (`using`) |
| **Agent Protocols** | Model Context Protocol | MCP JSON-RPC 2.0 stdio, SSE & Stream transport |

---

## 3. Quickstart

### Prerequisites
- [Bun](https://bun.sh) v1.4.4+
- [Rust](https://rust-lang.org) 1.85+ with Cargo

### Validation & Testing

```bash
# Install dependencies
bun install

# Run comprehensive test suite
bun test

# Validate Rust bindings
cargo check
```

### Scaffolding a New YOLO Project

```bash
bun run create-yolo-app my-app --template dioxus-subsecond
```

---

## 4. Contributing & Governance

- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Subsystem Maintainers](MAINTAINERS.md)
- [Governance Model](GOVERNANCE.md)

---

## 5. License

Licensed under the Apache License, Version 2.0 ([LICENSE](LICENSE)).

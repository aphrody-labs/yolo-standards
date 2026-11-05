# yolo-standards

The open standards registry and project scaffolding engine for the YOLO ecosystem.

Tracking **WebAssembly, ECMAScript (TC39), MDN browser compatibility, and Model Context Protocol (MCP)** specifications.

---

## 1. Architectural Overview

```text
yolo-standards/
├── Cargo.toml                  # Rust library crate (Pure Rust standards structures)
├── crates/
│   └── yolo-posix/             # Rust POSIX.1-2024 and GNU compatibility crate
├── package.json                # Bun workspace root & scripts
├── bunfig.toml                 # Native Bun configuration
├── tsconfig.json               # TypeScript configuration
├── schemas/                    # Machine-readable JSON specifications
├── packages/
│   ├── create-yolo-app/        # Scaffolding CLI for pure Bun & Rust templates
├── scripts/
│   └── fetch-standards.ts      # Live fetcher from upstream standards registries
├── src/                        # Core TypeScript schemas, loaders & validators
└── tests/                      # Conformance & validation test suite
```

The Rust workspace includes `crates/yolo-posix`, a dual-licensed POSIX.1-2024
and GNU compatibility crate for Unix and Windows. The crate and its
specification document are maintained here; yolo-cross consumes compiler and
target tooling only and does not carry a second copy.

---

## 2. Standards Families

| Domain | Standards Body | Target Specifications |
| :--- | :--- | :--- |
| **Bytecode Runtimes** | W3C / Bytecode Alliance | WebAssembly 3.0, Wasm Component Model |
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
bun run create-yolo-app my-app --template mcp
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

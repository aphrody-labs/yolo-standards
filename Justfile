# Justfile for yolo-standards
# Pure Rust & Pure Bun Standards Orchestration

default:
    @just --list

# Fetch all live standards specs with offline fallback
fetch:
    bun run scripts/fetch-standards.ts

# Validate all schemas and run test suites
test:
    bun test
    cargo check

# Run TypeScript schema validation tests
validate:
    bun test

# Full update pipeline
update:
    bun run scripts/fetch-standards.ts
    bun test
    cargo check

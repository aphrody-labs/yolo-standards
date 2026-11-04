import { expect, test } from "bun:test";
import { program } from "../src/index.ts";

test("CLI program parses commands", () => {
  expect(program.name()).toBe("{{NAME}}");
  expect(program.commands.some((c) => c.name() === "exec")).toBe(true);
  expect(program.commands.some((c) => c.name() === "status")).toBe(true);
});

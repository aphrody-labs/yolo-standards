import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { YoloHeadlessCodeEditor } from "./headless-editor";
import { writeFileSync, readFileSync, unlinkSync, existsSync, mkdirSync, rmdirSync } from "fs";
import { join } from "path";

describe("YoloHeadlessCodeEditor", () => {
  const testDir = join(import.meta.dir, "__test_tmp__");

  beforeEach(() => {
    if (!existsSync(testDir)) mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      try {
        YoloHeadlessCodeEditor.massiveDelete({ rootDir: testDir });
        rmdirSync(testDir);
      } catch {}
    }
  });

  it("applies character-precise edits correctly", () => {
    const original = "Hello World!";
    const edited = YoloHeadlessCodeEditor.applyCharEdits(original, [
      { startOffset: 6, endOffset: 11, replacement: "Antigravity" }
    ]);
    expect(edited).toBe("Hello Antigravity!");
  });

  it("applies line-precise edits correctly", () => {
    const original = ["line 1", "line 2 to change", "line 3"].join("\n");
    const edited = YoloHeadlessCodeEditor.applyLineEdits(original, [
      { startLine: 2, endLine: 2, replacement: "line 2 patched" }
    ]);
    expect(edited).toBe(["line 1", "line 2 patched", "line 3"].join("\n"));
  });

  it("executes batch parallel edits across files", () => {
    const f1 = join(testDir, "test1.txt");
    const f2 = join(testDir, "test2.txt");
    writeFileSync(f1, "prefix OLD_VALUE suffix", "utf-8");
    writeFileSync(f2, "header OLD_VALUE footer", "utf-8");

    const res = YoloHeadlessCodeEditor.batchEditFiles([
      { filePath: f1, exactTarget: "OLD_VALUE", replacement: "NEW_VALUE" },
      { filePath: f2, exactTarget: "OLD_VALUE", replacement: "NEW_VALUE" }
    ]);

    expect(res.modified.length).toBe(2);
    expect(readFileSync(f1, "utf-8")).toBe("prefix NEW_VALUE suffix");
    expect(readFileSync(f2, "utf-8")).toBe("header NEW_VALUE footer");
  });

  it("massively deletes files matching criteria", () => {
    const f1 = join(testDir, "garbage_1.tmp");
    const f2 = join(testDir, "garbage_2.tmp");
    const fKeep = join(testDir, "keep.txt");
    writeFileSync(f1, "temp data 1", "utf-8");
    writeFileSync(f2, "temp data 2", "utf-8");
    writeFileSync(fKeep, "keep this", "utf-8");

    const res = YoloHeadlessCodeEditor.massiveDelete({
      rootDir: testDir,
      namePattern: /\.tmp$/
    });

    expect(res.deletedFiles.length).toBe(2);
    expect(existsSync(f1)).toBe(false);
    expect(existsSync(f2)).toBe(false);
    expect(existsSync(fKeep)).toBe(true);
  });
});

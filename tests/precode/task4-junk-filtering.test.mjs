import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

test("Task 4 precode: help should document which junk domains are filtered by default", () => {
  const cliPath = resolve(process.cwd(), "dist/cli.js");
  const help = execFileSync("node", [cliPath, "--help"], { encoding: "utf8" });

  assert.match(help, /include junk domains/i);
  assert.match(help, /default filters/i);
  assert.match(help, /youtube\.com/i);
  assert.match(help, /quora\.com/i);
  assert.match(help, /facebook\.com/i);
  assert.match(help, /pinterest\.com/i);
});

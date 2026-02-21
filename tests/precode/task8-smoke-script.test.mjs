import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("Task 8 precode: package.json should expose a smoke npm script", () => {
  const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"));
  assert.ok("smoke" in pkg.scripts, 'package.json scripts should include "smoke"');
  assert.ok(pkg.scripts.smoke.includes("build"), "smoke script should reference build");
  assert.ok(pkg.scripts.smoke.includes("typecheck"), "smoke script should reference typecheck");
});

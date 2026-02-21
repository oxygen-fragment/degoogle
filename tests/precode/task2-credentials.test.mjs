import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

// TODO(Task 2): CLI should detect missing API credentials before attempting a search
// and print a plain-language setup message.
// This WILL fail until Task 2 is implemented — currently returns "Query is required."
// instead of a credentials error when a query IS provided but no key/cx exist.

test("Task 2 precode: missing credentials should exit non-zero with setup guidance", () => {
  const result = spawnSync(
    "node",
    ["dist/cli.js", "site:edu filetype:txt"],
    {
      env: { ...process.env, GOOGLE_API_KEY: "", GOOGLE_CX: "" },
      encoding: "utf8"
    }
  );

  assert.notEqual(result.status, 0, "should exit non-zero when credentials are missing");

  const output = (result.stdout ?? "") + (result.stderr ?? "");
  assert.match(
    output,
    /GOOGLE_API_KEY|--api-key/i,
    "error message should mention how to supply credentials"
  );
});

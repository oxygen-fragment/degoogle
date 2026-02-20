import test from "node:test";
import assert from "node:assert/strict";
import { formatTextOutput } from "../../dist/lib/output.js";

test("Task 5 precode: text output should include a clear query summary header", () => {
  const query = "site:edu filetype:txt";
  const text = formatTextOutput(query, [
    { desc: "Example result", url: "https://example.com" }
  ]);

  assert.match(text, /Query: site:edu filetype:txt/);
  assert.match(text, /Results: 1/);
});

test("Task 5 precode: empty result output should stay user-friendly", () => {
  const query = "noresults query";
  const text = formatTextOutput(query, []);

  assert.match(text, /Query: noresults query/);
  assert.match(text, /Results: 0/);
  assert.match(text, /No results found\./);
});

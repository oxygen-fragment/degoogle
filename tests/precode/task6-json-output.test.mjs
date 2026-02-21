import test from "node:test";
import assert from "node:assert/strict";
import { formatJsonOutput } from "../../dist/lib/output.js";

test("Task 6 precode: JSON output should be parseable with metadata envelope", () => {
  const query = "site:edu filetype:txt";
  const results = [{ desc: "Example", url: "https://example.edu/file.txt" }];
  const json = formatJsonOutput(query, results);

  const parsed = JSON.parse(json); // must not throw
  assert.equal(parsed.query, query);
  assert.equal(parsed.count, 1);
  assert.equal(parsed.results.length, 1);
  assert.equal(parsed.results[0].url, "https://example.edu/file.txt");
});

test("Task 6 precode: empty JSON output should still be parseable", () => {
  const json = formatJsonOutput("no results", []);
  const parsed = JSON.parse(json); // must not throw
  assert.equal(parsed.count, 0);
  assert.deepEqual(parsed.results, []);
});

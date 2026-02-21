import test from "node:test";
import assert from "node:assert/strict";
import { buildWebHtml } from "../../dist/lib/web.js";

test("Task 7 precode: HTML output should contain the query string", () => {
  const query = "site:edu filetype:txt";
  const html = buildWebHtml(query, [{ desc: "Example", url: "https://example.edu/file.txt" }]);

  assert.ok(html.includes("site:edu filetype:txt"), "HTML should contain the query");
});

test("Task 7 precode: HTML output should contain the result count", () => {
  const results = [
    { desc: "A", url: "https://a.com" },
    { desc: "B", url: "https://b.com" }
  ];
  const html = buildWebHtml("test query", results);

  assert.match(html, /Results:<\/strong> 2/);
});

test("Task 7 precode: HTML output should be a valid doctype HTML document", () => {
  const html = buildWebHtml("q", []);

  assert.ok(html.startsWith("<!doctype html>"), "should start with doctype");
  assert.ok(html.includes("</html>"), "should close html tag");
  assert.ok(html.includes("No results."), "empty results should show placeholder");
});

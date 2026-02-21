import test from "node:test";
import assert from "node:assert/strict";

// TODO(Task 3): parseApiResponse will be exported from dist/lib/degoogle.js
// after the HTML scraper is replaced with the Custom Search API client.
// This WILL fail until Task 3 is implemented.

test("Task 3 precode: parseApiResponse should map API items to SearchResult shape", async () => {
  const { parseApiResponse } = await import("../../dist/lib/degoogle.js");

  const mockResponse = {
    items: [
      {
        title: "Example Result",
        link: "https://example.edu/file.txt",
        snippet: "An example text file on an edu domain."
      }
    ]
  };

  const results = parseApiResponse(mockResponse);
  assert.equal(results.length, 1);
  assert.equal(results[0].url, "https://example.edu/file.txt");
  assert.equal(results[0].desc, "An example text file on an edu domain.");
});

test("Task 3 precode: parseApiResponse should return empty array when items is absent", async () => {
  const { parseApiResponse } = await import("../../dist/lib/degoogle.js");

  const results = parseApiResponse({});
  assert.deepEqual(results, []);
});

import type { SearchResult } from "../types";

export function formatTextOutput(query: string, results: SearchResult[]): string {
  const header = `Query: ${query}\nResults: ${results.length}`;

  if (results.length === 0) {
    return `${header}\n\nNo results found.`;
  }

  const body = results
    .map((r, i) => `${i + 1}. ${r.desc}\n   ${r.url}`)
    .join("\n\n");

  return `${header}\n\n${body}`;
}

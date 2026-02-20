import { writeFile } from "node:fs/promises";
import type { SearchResult } from "../types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function writeWebReport(
  outFile: string,
  query: string,
  results: SearchResult[]
): Promise<void> {
  const rows = results
    .map((r, i) => {
      const safeDesc = escapeHtml(r.desc);
      const safeUrl = escapeHtml(r.url);
      return `<article class="card"><div class="idx">#${i + 1}</div><h2>${safeDesc}</h2><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a></article>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>degoogle results</title>
  <style>
    :root { color-scheme: light; }
    body { margin: 0; background: linear-gradient(180deg, #f7fafc, #edf2f7); color: #1a202c; font-family: "Segoe UI", system-ui, sans-serif; }
    main { max-width: 980px; margin: 0 auto; padding: 24px 16px 36px; }
    header { margin-bottom: 18px; }
    h1 { margin: 0 0 6px; font-size: 1.5rem; }
    .meta { color: #4a5568; font-size: 0.95rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; box-shadow: 0 3px 10px rgba(0,0,0,0.04); }
    .idx { display: inline-block; font-size: 0.75rem; color: #2b6cb0; background: #ebf8ff; border-radius: 999px; padding: 2px 8px; margin-bottom: 8px; }
    h2 { font-size: 0.95rem; margin: 0 0 8px; line-height: 1.35; }
    a { color: #2c5282; word-break: break-all; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>degoogle</h1>
      <div class="meta"><strong>Query:</strong> ${escapeHtml(query)} | <strong>Results:</strong> ${results.length}</div>
    </header>
    <section class="grid">
      ${rows || "<p>No results.</p>"}
    </section>
  </main>
</body>
</html>`;

  await writeFile(outFile, html, "utf8");
}

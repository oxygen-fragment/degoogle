import { URL } from "node:url";
import type { SearchOptions, SearchResult } from "../types";

const JUNK_PATTERNS = [
  "facebook.com/",
  "pinterest.com/",
  "quora.com/",
  "youtube.com/",
  "youtu.be/"
];

function isValidTimeWindow(value: string): boolean {
  const unit = value[0];
  const validUnit = ["a", "d", "h", "m", "n", "w", "y"].includes(unit);
  if (!validUnit) {
    return false;
  }

  if (value.length === 1) {
    return true;
  }

  return /^[0-9]+$/.test(value.slice(1));
}

function decodeMaybe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeUrl(value: string): string {
  let out = value.replace(/%20/g, "+");
  out = decodeMaybe(out);
  out = out.replace(/\|/g, "%7C");
  out = out.replace(/"/g, "%22");
  out = out.replace(/>/g, "%3E");
  out = out.replace(/</g, "%3C");
  if (out.endsWith(".")) {
    out = `${out.slice(0, -1)}%2E`;
  }
  return out;
}

function normalizeDesc(value: string): string {
  return value.replace(/&amp;/g, "&").trim();
}

function isJunkUrl(url: string): boolean {
  return JUNK_PATTERNS.some((pattern) => url.includes(pattern));
}

function extractEntry(entry: string, excludeJunk: boolean): SearchResult | null {
  const split = entry.split('<a href="/url?q=');
  if (split.length < 2) {
    return null;
  }

  const linkPart = split[1];
  const ampIndex = linkPart.search(/&amp;(sa|usg|ved)=/);
  if (ampIndex === -1) {
    return null;
  }
  const rawUrl = linkPart.slice(0, ampIndex);
  if (!rawUrl.startsWith("http")) {
    return null;
  }
  if (excludeJunk && isJunkUrl(rawUrl)) {
    return null;
  }

  const descSplit = entry.split(/<[spandiv]{3,4} class=".+?(?=">)">|<\/[spandiv]{3,4}>/);
  const rawDesc = descSplit.find((segment) => segment && !segment.startsWith("<"))?.trim();
  if (!rawDesc) {
    return null;
  }

  return {
    desc: normalizeDesc(rawDesc),
    url: normalizeUrl(rawUrl)
  };
}

function extractPageEntries(html: string): string[] {
  const matchEntry =
    /<a href="\/url\?q=http.+?(?="><[spandiv]{3,4})"><[spandiv]{3,4} class="[A-Za-z\d ]+">.*?(?=<[spandiv]{3,4})/g;

  return html.match(matchEntry) ?? [];
}

async function fetchSearchPage(
  query: string,
  page: number,
  options: SearchOptions
): Promise<string | null> {
  const start = options.offset * 10 + page * 10;

  const url = new URL("https://www.google.com/search");
  url.searchParams.set("start", String(start));
  url.searchParams.set("tbs", `qdr:${options.timeWindow}`);
  url.searchParams.set("q", query);
  url.searchParams.set("filter", "0");

  const res = await fetch(url.toString(), {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0 Safari/537.36"
    }
  });

  if (!res.ok) {
    throw new Error(`Google request failed: HTTP ${res.status}`);
  }

  const html = await res.text();
  if (html.includes("did not match any documents")) {
    return null;
  }
  return html;
}

export async function runSearch(query: string, options: SearchOptions): Promise<SearchResult[]> {
  if (!query.trim()) {
    throw new Error("Query is required.");
  }
  if (!isValidTimeWindow(options.timeWindow)) {
    throw new Error("Invalid time window. Expected values like a, d7, w2, m3, y1.");
  }

  const allEntries: string[] = [];
  const seenEntries = new Set<string>();

  for (let page = 0; page < options.pages; page += 1) {
    const html = await fetchSearchPage(query, page, options);
    if (!html) {
      break;
    }
    for (const entry of extractPageEntries(html)) {
      if (!seenEntries.has(entry)) {
        seenEntries.add(entry);
        allEntries.push(entry);
      }
    }
  }

  const results: SearchResult[] = [];
  for (const entry of allEntries) {
    const extracted = extractEntry(entry, options.excludeJunk);
    if (extracted) {
      results.push(extracted);
    }
  }

  return results;
}

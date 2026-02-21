import type { SearchOptions, SearchResult } from "../types";

const JUNK_PATTERNS = [
  "facebook.com/",
  "pinterest.com/",
  "quora.com/",
  "youtube.com/",
  "youtu.be/"
];

function isJunkUrl(url: string): boolean {
  return JUNK_PATTERNS.some((pattern) => url.includes(pattern));
}

interface ApiItem {
  title?: string;
  link?: string;
  snippet?: string;
}

interface ApiResponse {
  items?: ApiItem[];
  error?: { code: number; message: string };
}

function mapTimeWindowToDateRestrict(timeWindow: string): string | null {
  // "a" means all-time, so dateRestrict should be omitted.
  if (!timeWindow || timeWindow === "a") {
    return null;
  }
  return timeWindow;
}

function buildSearchUrl(query: string, page: number, options: SearchOptions): URL {
  // Custom Search API uses 1-based start index; each page = 10 results
  const start = options.offset * 10 + page * 10 + 1;

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", options.apiKey);
  url.searchParams.set("cx", options.cx);
  url.searchParams.set("q", query);
  url.searchParams.set("num", "10");
  url.searchParams.set("start", String(start));

  const dateRestrict = mapTimeWindowToDateRestrict(options.timeWindow);
  if (dateRestrict) {
    url.searchParams.set("dateRestrict", dateRestrict);
  }

  return url;
}

export function parseApiResponse(response: ApiResponse): SearchResult[] {
  if (!response.items) return [];
  return response.items
    .filter((item): item is ApiItem & { link: string } => typeof item.link === "string")
    .map((item) => ({
      url: item.link,
      desc: (item.snippet ?? item.title ?? "").trim()
    }));
}

async function fetchPage(
  query: string,
  page: number,
  options: SearchOptions
): Promise<ApiResponse | null> {
  const url = buildSearchUrl(query, page, options);
  const res = await fetch(url.toString());

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ApiResponse;
    throw new Error(body.error?.message ?? `API request failed: HTTP ${res.status}`);
  }

  const data = (await res.json()) as ApiResponse;
  return data.items?.length ? data : null;
}

export async function runSearch(query: string, options: SearchOptions): Promise<SearchResult[]> {
  if (!query.trim()) {
    throw new Error("Query is required.");
  }

  const results: SearchResult[] = [];
  const seen = new Set<string>();

  for (let page = 0; page < options.pages; page += 1) {
    const data = await fetchPage(query, page, options);
    if (!data) break;

    for (const r of parseApiResponse(data)) {
      if (!seen.has(r.url) && (!options.excludeJunk || !isJunkUrl(r.url))) {
        seen.add(r.url);
        results.push(r);
      }
    }
  }

  return results;
}

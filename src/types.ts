export interface SearchOptions {
  offset: number;
  pages: number;
  timeWindow: string;
  excludeJunk: boolean;
  apiKey: string;
  cx: string;
}

export interface SearchResult {
  desc: string;
  url: string;
}

export interface CliOptions extends SearchOptions {
  query: string;
  outputJson: boolean;
  outputWeb: boolean;
  outFile: string;
}

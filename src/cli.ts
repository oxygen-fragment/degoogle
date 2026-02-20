#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { runSearch } from "./lib/degoogle";
import { writeWebReport } from "./lib/web";
import type { CliOptions } from "./types";

function printHelp(): void {
  console.log(`degoogle-ts - modern TypeScript CLI

Usage:
  degoogle-ts "query"
  degoogle-ts "query" -p 3 -t m3 --json
  degoogle-ts "query" --web --out degoogle-results.html

Options:
  -o, --offset <n>        page offset (default: 0)
  -p, --pages <n>         number of pages to fetch (default: 1)
  -t, --time-window <qdr> Google qdr window: a,d,h,m,n,w,y + optional number (default: a)
  -j, --include-junk      include junk domains (default filters: youtube.com, youtu.be, quora.com, facebook.com, pinterest.com)
  --json                  print JSON output
  --web                   generate simple HTML output
  --out <file>            output file for --web or --json (default: degoogle-results.html / degoogle-results.json)
  -h, --help              show help`);
}

function parseIntSafe(value: string, flag: string, min: number): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < min) {
    throw new Error(`Invalid value for ${flag}: ${value}`);
  }
  return parsed;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    query: "",
    offset: 0,
    pages: 1,
    timeWindow: "a",
    excludeJunk: true,
    outputJson: false,
    outputWeb: false,
    outFile: ""
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    switch (a) {
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
      case "-o":
      case "--offset":
        i += 1;
        if (!argv[i]) throw new Error(`Missing value for ${a}`);
        opts.offset = parseIntSafe(argv[i], a, 0);
        break;
      case "-p":
      case "--pages":
        i += 1;
        if (!argv[i]) throw new Error(`Missing value for ${a}`);
        opts.pages = parseIntSafe(argv[i], a, 1);
        break;
      case "-t":
      case "--time-window":
        i += 1;
        if (!argv[i]) throw new Error(`Missing value for ${a}`);
        opts.timeWindow = argv[i];
        break;
      case "-j":
      case "--include-junk":
        opts.excludeJunk = false;
        break;
      case "--json":
        opts.outputJson = true;
        break;
      case "--web":
        opts.outputWeb = true;
        break;
      case "--out":
        i += 1;
        if (!argv[i]) throw new Error("Missing value for --out");
        opts.outFile = argv[i];
        break;
      default:
        if (a.startsWith("-")) {
          throw new Error(`Unknown option: ${a}`);
        }
        if (!opts.query) {
          opts.query = a;
        } else {
          opts.query = `${opts.query} ${a}`;
        }
    }
  }

  if (!opts.query.trim()) {
    throw new Error("Query is required.");
  }
  if (opts.outputJson && opts.outputWeb) {
    throw new Error("Choose only one output mode: --json or --web.");
  }
  if (opts.outFile && !opts.outputJson && !opts.outputWeb) {
    throw new Error("--out is only valid with --json or --web.");
  }
  return opts;
}

function toTextOutput(results: Array<{ desc: string; url: string }>): string {
  if (results.length === 0) {
    return "no results";
  }

  let out = `-- ${results.length} results --\n\n`;
  for (const r of results) {
    out += `${r.desc}\n${r.url}\n\n`;
  }
  return out.trimEnd();
}

async function main(): Promise<void> {
  try {
    const args = parseArgs(process.argv.slice(2));
    const results = await runSearch(args.query, {
      offset: args.offset,
      pages: args.pages,
      timeWindow: args.timeWindow,
      excludeJunk: args.excludeJunk
    });

    if (args.outputWeb) {
      const file = args.outFile || "degoogle-results.html";
      await writeWebReport(file, args.query, results);
      console.log(`wrote web report: ${file}`);
      return;
    }

    if (args.outputJson) {
      const json = JSON.stringify(results, null, 2);
      if (args.outFile) {
        await writeFile(args.outFile, json, "utf8");
        console.log(`wrote json: ${args.outFile}`);
      } else {
        console.log(json);
      }
      return;
    }

    console.log(toTextOutput(results));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`error: ${message}`);
    process.exitCode = 1;
  }
}

void main();

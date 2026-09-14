import { readFile as fsReadFile } from 'node:fs/promises';
import type { ChainReader } from './analyzers.js';
import { createRpcReader } from './rpc-reader.js';
import { renderMarkdownReport } from './report.js';
import { parseScanRequest, runScan } from './scan.js';

export interface CliDeps {
  readFile(path: string): Promise<string>;
  createReader(rpcUrl: string): ChainReader;
  write(text: string): void;
}

function valueAfter(argv: string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

export async function runCli(argv: string[], deps: CliDeps): Promise<void> {
  const inputPath = valueAfter(argv, '--input');
  if (!inputPath) throw new Error('--input <request.json> is required');
  const rpcUrl = valueAfter(argv, '--rpc');
  if (!rpcUrl) throw new Error('--rpc <https://...> is required');

  const raw = await deps.readFile(inputPath);
  const request = parseScanRequest(JSON.parse(raw));
  const report = await runScan(deps.createReader(rpcUrl), request);
  const format = valueAfter(argv, '--format') ?? 'json';
  if (format === 'markdown') {
    deps.write(renderMarkdownReport(report, request.treasury, request.subject));
    return;
  }
  if (format !== 'json') throw new Error('--format must be json or markdown');
  deps.write(`${JSON.stringify(report, null, 2)}\n`);
}

const script = process.argv[1]?.replaceAll('\\', '/');
const isDirect = script?.endsWith('/src/cli.ts') || script?.endsWith('/dist/cli.js');

if (isDirect) {
  runCli(process.argv.slice(2), {
    readFile: (path) => fsReadFile(path, 'utf8'),
    createReader: createRpcReader,
    write: (text) => process.stdout.write(text),
  }).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}

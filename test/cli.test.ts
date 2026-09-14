import { describe, expect, it } from 'vitest';
import { runCli } from '../src/cli.js';
import type { ChainReader } from '../src/analyzers.js';

const TOKEN = '0x3000000000000000000000000000000000000003';
const TREASURY = '0x1000000000000000000000000000000000000001';
const SUBJECT = '0x2000000000000000000000000000000000000002';

const reader: ChainReader = {
  async readContract(request) {
    if (request.functionName === 'allowance') return 5n;
    throw new Error('unexpected call');
  },
};

const deps = (output: string[]) => ({
  readFile: async () => JSON.stringify({ treasury: TREASURY, subject: SUBJECT, safe: false, erc20: [TOKEN] }),
  createReader: () => reader,
  write: (line: string) => output.push(line),
});

describe('CLI', () => {
  it('prints a JSON report from an input file and injected read-only reader', async () => {
    const output: string[] = [];
    await runCli(['--input', 'request.json', '--rpc', 'https://example.invalid'], deps(output));
    expect(JSON.parse(output.join('')).verdict).toBe('residual_access_found');
  });

  it('prints a customer-ready Markdown report when requested', async () => {
    const output: string[] = [];
    await runCli(['--input', 'request.json', '--rpc', 'https://example.invalid', '--format', 'markdown'], deps(output));
    expect(output.join('')).toContain('# NightFall Crypto Access Exit Report');
    expect(output.join('')).toContain('**Verdict:** residual_access_found');
  });

  it('requires both --input and --rpc', async () => {
    await expect(runCli([], deps([]))).rejects.toThrow(/--input/);
  });
});

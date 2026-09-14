import { describe, expect, it } from 'vitest';
import { parseScanRequest, runScan } from '../src/scan.js';
import type { ChainReader, ReadRequest } from '../src/analyzers.js';

const SAFE = '0x1000000000000000000000000000000000000001';
const SUBJECT = '0x2000000000000000000000000000000000000002';
const TOKEN = '0x3000000000000000000000000000000000000003';
const MODULE = '0x4000000000000000000000000000000000000004';

class RoutingReader implements ChainReader {
  async readContract(request: ReadRequest): Promise<unknown> {
    if (request.functionName === 'getOwners') return [];
    if (request.functionName === 'getModulesPaginated') return [[], '0x0000000000000000000000000000000000000001'];
    if (request.functionName === 'getDelegates') return [[SUBJECT], 0n];
    if (request.functionName === 'getTokenAllowance') return [100n, 0n, 86400n, 0n, 1n];
    if (request.functionName === 'allowance') return request.address === TOKEN ? 9n : 0n;
    if (request.functionName === 'isApprovedForAll') return false;
    throw new Error(`unsupported ${request.functionName}`);
  }
}

describe('scan orchestration', () => {  it('returns residual access with the exact active permission path', async () => {
    const report = await runScan(new RoutingReader(), {
      treasury: SAFE,
      subject: SUBJECT,
      safe: true,
      erc20: [TOKEN],
      erc721: [],
      erc1155: [],
    });
    expect(report.verdict).toBe('residual_access_found');
    expect(report.findings.find((finding) => finding.status === 'active')?.path).toContain(TOKEN);
  });

  it('includes Safe Allowance Module residue in the overall verdict', async () => {
    const request = parseScanRequest({
      treasury: SAFE,
      subject: SUBJECT,
      safe: false,
      safeAllowance: { network: '8453', tokens: [TOKEN] },
    });
    const report = await runScan(new RoutingReader(), request);
    expect(report.verdict).toBe('residual_access_found');
    expect(report.findings.some((finding) => finding.id === 'safe-allowance-delegate')).toBe(true);
  });
  it('rejects malformed scan requests instead of silently skipping checks', () => {
    expect(() => parseScanRequest({ treasury: 'not-an-address', subject: SUBJECT })).toThrow(/treasury/i);
  });
});
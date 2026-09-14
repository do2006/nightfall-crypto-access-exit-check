import { describe, expect, it } from 'vitest';
import { parseScanRequest, runScan } from '../src/scan.js';
import type { ChainReader, ReadRequest } from '../src/analyzers.js';

const SAFE = '0x1000000000000000000000000000000000000001';
const SUBJECT = '0x2000000000000000000000000000000000000002';
const TOKEN = '0x3000000000000000000000000000000000000003';

class RoutingReader implements ChainReader {
  async readContract(request: ReadRequest): Promise<unknown> {
    if (request.functionName === 'getOwners') return [];
    if (request.functionName === 'getModulesPaginated') return [[], '0x0000000000000000000000000000000000000001'];
    if (request.functionName === 'allowance') return request.address === TOKEN ? 9n : 0n;
    if (request.functionName === 'isApprovedForAll') return false;
    throw new Error(`unsupported ${request.functionName}`);
  }
}

describe('scan orchestration', () => {
  it('returns residual access with the exact active permission path', async () => {
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

  it('rejects malformed scan requests instead of silently skipping checks', () => {
    expect(() => parseScanRequest({ treasury: 'not-an-address', subject: SUBJECT })).toThrow(/treasury/i);
  });
});

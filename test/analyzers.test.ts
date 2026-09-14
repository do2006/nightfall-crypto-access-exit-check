import { describe, expect, it } from 'vitest';
import {
  checkErc20Allowance,
  checkOperatorApproval,
  checkSafeModule,
  checkSafeOwner,
  type ChainReader,
} from '../src/analyzers.js';

const SAFE = '0x1000000000000000000000000000000000000001';
const SUBJECT = '0x2000000000000000000000000000000000000002';
const TOKEN = '0x3000000000000000000000000000000000000003';

class FakeReader implements ChainReader {
  constructor(private readonly values: Record<string, unknown | Error>) {}
  async readContract(request: { functionName: string }): Promise<unknown> {
    const value = this.values[request.functionName];
    if (value instanceof Error) throw value;
    return value;
  }
}

describe('permission analyzers', () => {
  it('detects subject that remains a Safe owner', async () => {
    const result = await checkSafeOwner(new FakeReader({ getOwners: [SUBJECT] }), SAFE, SUBJECT);
    expect(result.status).toBe('active');
  });

  it('detects subject that remains an enabled Safe module', async () => {
    const result = await checkSafeModule(new FakeReader({ getModulesPaginated: [[SUBJECT], '0x0000000000000000000000000000000000000001'] }), SAFE, SUBJECT);
    expect(result.status).toBe('active');
  });

  it('detects nonzero ERC20 allowance from treasury to subject', async () => {
    const result = await checkErc20Allowance(new FakeReader({ allowance: 42n }), TOKEN, SAFE, SUBJECT);
    expect(result.status).toBe('active');
    expect(result.evidence).toContain('42');
  });

  it.each(['erc721', 'erc1155'] as const)('detects %s operator approval', async (standard) => {
    const result = await checkOperatorApproval(new FakeReader({ isApprovedForAll: true }), standard, TOKEN, SAFE, SUBJECT);
    expect(result.status).toBe('active');
  });

  it('maps RPC failures to unknown instead of revoked', async () => {
    const result = await checkSafeOwner(new FakeReader({ getOwners: new Error('rpc unavailable') }), SAFE, SUBJECT);
    expect(result.status).toBe('unknown');
    expect(result.evidence).toContain('rpc unavailable');
  });
});

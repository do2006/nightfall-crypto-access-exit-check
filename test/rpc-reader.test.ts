import { describe, expect, it } from 'vitest';
import { ViemChainReader } from '../src/rpc-reader.js';

const SAFE = '0x1000000000000000000000000000000000000001';

describe('ViemChainReader', () => {
  it('uses the Safe ABI for getOwners and returns the decoded value', async () => {
    const calls: unknown[] = [];
    const client = {
      async readContract(request: unknown) {
        calls.push(request);
        return ['0x2000000000000000000000000000000000000002'];
      },
    };
    const reader = new ViemChainReader(client);
    const result = await reader.readContract({ address: SAFE, functionName: 'getOwners' });
    expect(result).toEqual(['0x2000000000000000000000000000000000000002']);
    expect(calls).toHaveLength(1);
  });

  it('rejects unsupported functions instead of guessing an ABI', async () => {
    const reader = new ViemChainReader({ async readContract() { return null; } });
    await expect(reader.readContract({ address: SAFE, functionName: 'transfer' })).rejects.toThrow(/unsupported/i);
  });
});

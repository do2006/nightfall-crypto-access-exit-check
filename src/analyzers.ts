import type { Finding } from './domain.js';

export interface ReadRequest {
  address?: string;
  functionName: string;
  args?: readonly unknown[];
}

export interface ChainReader {
  readContract(request: ReadRequest): Promise<unknown>;
}

const SENTINEL = '0x0000000000000000000000000000000000000001';
const eq = (a: unknown, b: string) => typeof a === 'string' && a.toLowerCase() === b.toLowerCase();

function unknownFinding(id: string, path: string, error: unknown): Finding {
  const message = error instanceof Error ? error.message : String(error);
  return { id, status: 'unknown', path, evidence: `unverifiable: ${message}` };
}

export async function checkSafeOwner(reader: ChainReader, safe: string, subject: string): Promise<Finding> {
  const path = `safe:${safe}:owner:${subject}`;
  try {
    const owners = await reader.readContract({ address: safe, functionName: 'getOwners' });
    if (!Array.isArray(owners)) throw new Error('unexpected getOwners response');
    const active = owners.some((owner) => eq(owner, subject));
    return { id: 'safe-owner', status: active ? 'active' : 'absent', path, evidence: active ? 'subject is a Safe owner' : 'subject is not a Safe owner' };
  } catch (error) {
    return unknownFinding('safe-owner', path, error);
  }
}

export async function checkSafeModule(reader: ChainReader, safe: string, subject: string): Promise<Finding> {
  const path = `safe:${safe}:module:${subject}`;
  try {
    const raw = await reader.readContract({ address: safe, functionName: 'getModulesPaginated', args: [SENTINEL, 100n] });
    if (!Array.isArray(raw) || !Array.isArray(raw[0])) throw new Error('unexpected getModulesPaginated response');
    const modules = raw[0] as unknown[];
    const active = modules.some((module) => eq(module, subject));
    return { id: 'safe-module', status: active ? 'active' : 'absent', path, evidence: active ? 'subject is an enabled Safe module' : 'subject is not an enabled Safe module' };
  } catch (error) {
    return unknownFinding('safe-module', path, error);
  }
}

export async function checkErc20Allowance(reader: ChainReader, token: string, treasury: string, subject: string): Promise<Finding> {
  const path = `erc20:${token}:allowance:${treasury}->${subject}`;
  try {
    const raw = await reader.readContract({ address: token, functionName: 'allowance', args: [treasury, subject] });
    if (typeof raw !== 'bigint') throw new Error('unexpected allowance response');
    return { id: `erc20-allowance:${token}`, status: raw > 0n ? 'active' : 'absent', path, evidence: `allowance=${raw.toString()}` };
  } catch (error) {
    return unknownFinding(`erc20-allowance:${token}`, path, error);
  }
}

export async function checkOperatorApproval(reader: ChainReader, standard: 'erc721' | 'erc1155', token: string, treasury: string, subject: string): Promise<Finding> {
  const path = `${standard}:${token}:operator:${treasury}->${subject}`;
  try {
    const raw = await reader.readContract({ address: token, functionName: 'isApprovedForAll', args: [treasury, subject] });
    if (typeof raw !== 'boolean') throw new Error('unexpected isApprovedForAll response');
    return { id: `${standard}-operator:${token}`, status: raw ? 'active' : 'absent', path, evidence: `isApprovedForAll=${raw}` };
  } catch (error) {
    return unknownFinding(`${standard}-operator:${token}`, path, error);
  }
}

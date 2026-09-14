import { createPublicClient, http, parseAbi, type Address } from 'viem';
import type { ChainReader, ReadRequest } from './analyzers.js';

const SAFE_ABI = parseAbi([
  'function getOwners() view returns (address[])',
  'function getModulesPaginated(address start,uint256 pageSize) view returns (address[] array,address next)',
]);
const SAFE_ALLOWANCE_ABI = parseAbi([
  'function getDelegates(address safe,uint48 start,uint8 pageSize) view returns (address[] results,uint48 next)',
  'function getTokenAllowance(address safe,address delegate,address token) view returns (uint256[5])',
]);
const ERC20_ABI = parseAbi([
  'function allowance(address owner,address spender) view returns (uint256)',
]);
const OPERATOR_ABI = parseAbi([
  'function isApprovedForAll(address account,address operator) view returns (bool)',
]);

interface PublicClientLike {
  readContract(request: Record<string, unknown>): Promise<unknown>;
}

function abiFor(functionName: string) {
  if (functionName === 'getOwners' || functionName === 'getModulesPaginated') return SAFE_ABI;
  if (functionName === 'getDelegates' || functionName === 'getTokenAllowance') return SAFE_ALLOWANCE_ABI;
  if (functionName === 'allowance') return ERC20_ABI;
  if (functionName === 'isApprovedForAll') return OPERATOR_ABI;
  throw new Error(`unsupported read function: ${functionName}`);
}

export class ViemChainReader implements ChainReader {
  constructor(private readonly client: PublicClientLike) {}

  async readContract(request: ReadRequest): Promise<unknown> {
    if (!request.address) throw new Error('contract address is required');
    return this.client.readContract({
      address: request.address as Address,
      abi: abiFor(request.functionName),
      functionName: request.functionName,
      args: request.args ?? [],
    });
  }
}

export function createRpcReader(rpcUrl: string): ViemChainReader {
  if (!/^https?:\/\//i.test(rpcUrl)) throw new Error('rpcUrl must be http(s)');
  const client = createPublicClient({ transport: http(rpcUrl) });
  return new ViemChainReader(client as unknown as PublicClientLike);
}

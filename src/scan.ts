import {
  checkErc20Allowance,
  checkOperatorApproval,
  checkSafeModule,
  checkSafeOwner,
  type ChainReader,
} from './analyzers.js';
import { summarizeFindings, type ScanSummary } from './domain.js';

export interface ScanRequest {
  treasury: string;
  subject: string;
  safe: boolean;
  erc20: string[];
  erc721: string[];
  erc1155: string[];
}

const ADDRESS = /^0x[a-fA-F0-9]{40}$/;

function requireAddress(value: unknown, field: string): string {
  if (typeof value !== 'string' || !ADDRESS.test(value)) {
    throw new Error(`${field} must be a 20-byte hex address`);
  }
  return value;
}

function addressList(value: unknown, field: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
  return value.map((entry, index) => requireAddress(entry, `${field}[${index}]`));
}

export function parseScanRequest(value: unknown): ScanRequest {
  if (!value || typeof value !== 'object') throw new Error('scan request must be an object');
  const input = value as Record<string, unknown>;
  return {
    treasury: requireAddress(input.treasury, 'treasury'),
    subject: requireAddress(input.subject, 'subject'),
    safe: input.safe === undefined ? true : input.safe === true,
    erc20: addressList(input.erc20, 'erc20'),
    erc721: addressList(input.erc721, 'erc721'),
    erc1155: addressList(input.erc1155, 'erc1155'),
  };
}

export async function runScan(reader: ChainReader, request: ScanRequest): Promise<ScanSummary> {
  const findings = [];
  if (request.safe) {
    findings.push(await checkSafeOwner(reader, request.treasury, request.subject));
    findings.push(await checkSafeModule(reader, request.treasury, request.subject));
  }
  for (const token of request.erc20) {
    findings.push(await checkErc20Allowance(reader, token, request.treasury, request.subject));
  }
  for (const token of request.erc721) {
    findings.push(await checkOperatorApproval(reader, 'erc721', token, request.treasury, request.subject));
  }
  for (const token of request.erc1155) {
    findings.push(await checkOperatorApproval(reader, 'erc1155', token, request.treasury, request.subject));
  }
  if (findings.length === 0) {
    return summarizeFindings([{ id: 'no-checks', status: 'unknown', path: 'scan', evidence: 'no supported checks selected' }]);
  }
  return summarizeFindings(findings);
}

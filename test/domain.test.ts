import { describe, expect, it } from 'vitest';
import { summarizeFindings, type Finding } from '../src/domain.js';

const absent = (id: string): Finding => ({ id, status: 'absent', path: id, evidence: 'confirmed absent' });
const active = (id: string): Finding => ({ id, status: 'active', path: id, evidence: 'active authority' });
const unknown = (id: string): Finding => ({ id, status: 'unknown', path: id, evidence: 'rpc failure' });

describe('summarizeFindings', () => {
  it('reports residual access when any active authority remains', () => {
    expect(summarizeFindings([absent('owner'), active('allowance')]).verdict).toBe('residual_access_found');
  });

  it('reports revoked when every checked authority is confirmed absent', () => {
    expect(summarizeFindings([absent('owner'), absent('module')]).verdict).toBe('revoked');
  });

  it('fails closed when no authority is active but any check is unverifiable', () => {
    expect(summarizeFindings([absent('owner'), unknown('module')]).verdict).toBe('unable_to_verify');
  });
});

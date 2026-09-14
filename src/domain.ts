export type FindingStatus = 'active' | 'absent' | 'unknown';
export type Verdict = 'residual_access_found' | 'revoked' | 'unable_to_verify';

export interface Finding {
  id: string;
  status: FindingStatus;
  path: string;
  evidence: string;
}

export interface ScanSummary {
  verdict: Verdict;
  findings: Finding[];
}

export function summarizeFindings(findings: Finding[]): ScanSummary {
  if (findings.some((finding) => finding.status === 'active')) {
    return { verdict: 'residual_access_found', findings };
  }
  if (findings.some((finding) => finding.status === 'unknown')) {
    return { verdict: 'unable_to_verify', findings };
  }
  return { verdict: 'revoked', findings };
}

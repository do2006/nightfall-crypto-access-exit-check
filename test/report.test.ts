import { describe, expect, it } from 'vitest';
import { renderMarkdownReport } from '../src/report.js';
import type { ScanSummary } from '../src/domain.js';

const summary: ScanSummary = {
  verdict: 'residual_access_found',
  findings: [
    {
      id: 'erc20-allowance:token',
      status: 'active',
      path: 'erc20:token:allowance:owner->subject',
      evidence: 'allowance=5000000',
    },
    {
      id: 'safe-owner',
      status: 'absent',
      path: 'safe:owners',
      evidence: 'subject not present in owners',
    },
  ],
};

describe('renderMarkdownReport', () => {
  it('renders verdict and exact permission evidence', () => {
    const report = renderMarkdownReport(summary, '0xowner', '0xsubject');
    expect(report).toContain('# NightFall Crypto Access Exit Report');
    expect(report).toContain('**Verdict:** residual_access_found');
    expect(report).toContain('allowance=5000000');
    expect(report).toContain('erc20:token:allowance:owner->subject');
  });
});

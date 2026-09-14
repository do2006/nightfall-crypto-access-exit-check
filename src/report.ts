import type { ScanSummary } from './domain.js';

export function renderMarkdownReport(summary: ScanSummary, treasury: string, subject: string): string {
  const lines = [
    '# NightFall Crypto Access Exit Report',
    '',
    `**Treasury:** ${treasury}`,
    `**Subject:** ${subject}`,
    `**Verdict:** ${summary.verdict}`,
    '',
    '## Findings',
    '',
  ];

  for (const finding of summary.findings) {
    lines.push(`### ${finding.id}`);
    lines.push(`- Status: ${finding.status}`);
    lines.push(`- Permission path: ${finding.path}`);
    lines.push(`- Evidence: ${finding.evidence}`);
    lines.push('');
  }

  lines.push('This report is read-only and reflects only the explicitly selected supported checks.');
  return `${lines.join('\n')}\n`;
}

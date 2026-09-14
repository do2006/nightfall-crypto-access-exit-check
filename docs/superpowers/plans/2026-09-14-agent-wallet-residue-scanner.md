# Agent Wallet Residue Scanner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a zero-cost read-only CLI that detects residual wallet authority for a subject address.

**Architecture:** Deterministic analyzers consume a minimal `ChainReader` abstraction. Safe ownership/modules and ERC approval checks normalize to `Finding[]`; an aggregator emits `revoked`, `residual_access_found`, or `unable_to_verify` with evidence.

**Tech Stack:** Node.js 22+, TypeScript, viem ABI types, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-14-agent-wallet-residue-scanner-design.md`

## Global Constraints
- Read-only: no signing, custody, transaction submission, or private keys.
- Unsupported/failed checks must become `unable_to_verify`, never a false-safe verdict.
- V1 supports Safe owner/module checks and explicit ERC-20/721/1155 approval targets.
- All production behavior is introduced test-first.

---

### Task 1: Domain verdict engine
Create `src/domain.ts` and `test/domain.test.ts`. RED: findings with active authority produce `residual_access_found`; all confirmed-absent findings produce `revoked`; any unverifiable finding without active authority produces `unable_to_verify`. GREEN: implement `summarizeFindings(findings)` and exact evidence-preserving result types.

### Task 2: Read-only permission analyzers
Create `src/analyzers.ts` and `test/analyzers.test.ts`. RED: Safe owner membership, enabled module equality, ERC20 allowance > 0, ERC721/ERC1155 operator approval, RPC failure mapping. GREEN: implement analyzers against `ChainReader.readContract()` only.

### Task 3: CLI scan orchestration
Create `src/scan.ts`, `src/cli.ts`, `test/scan.test.ts`, and README. RED: JSON request with fake reader returns deterministic report; malformed request fails closed. GREEN: compose selected analyzers, summarize, serialize JSON, and provide command usage. Verify with `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check`.

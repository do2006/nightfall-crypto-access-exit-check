# AI-Agent Wallet Permission Residue Scanner Design

## Goal
Build a zero-upfront, read-only scanner that determines whether a supposedly revoked agent/person address still has meaningful authority over a supported crypto treasury.

## V1 Scope
Support Safe owner membership, Safe enabled-module exposure, Safe spending-limit beneficiaries when queryable, and ERC-20/721/1155 approval residue supplied through explicit scan targets. Produce one of: `revoked`, `residual_access_found`, or `unable_to_verify`.

## Safety and Trust Model
The scanner never requests private keys, never signs transactions, never moves funds, and never claims universal chain coverage. Every finding must include the exact permission path and evidence source. Unsupported contracts return `unable_to_verify` rather than a green result.

## Architecture
A chain-reader interface isolates RPC access from deterministic analyzers. Individual analyzers produce normalized permission findings; an aggregator computes the final verdict. A CLI consumes a JSON scan request and emits both JSON and concise text.

## Data Flow
Input: chain ID, RPC URL, subject address, treasury address, and optional explicit token/operator scan targets. Chain readers fetch public state; analyzers interpret state; aggregator classifies residual authority; reporter serializes evidence.

## Verification
Unit tests use deterministic fake chain reads. Integration tests use local mocked JSON-RPC responses only; no mainnet writes. Every analyzer gets red/green tests for positive residue, confirmed revocation, and unsupported/unverifiable state.

## Monetization Boundary
V1 is a local proof-of-value. No hosting, paid RPC, token issuance, or custody. Commercialization is considered only after the demo detects residue that generic wallet-owner checks would miss.

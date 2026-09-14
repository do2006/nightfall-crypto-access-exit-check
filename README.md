# NightFall Crypto Access Exit Check

**Prove that a former AI agent, bot, employee, or contractor is actually revoked.**

Read-only wallet offboarding verification for supported Safe smart-account permissions and token approvals. The scanner reports exactly which supported permission paths remain, which checks passed, and which checks could not be verified.

[![npm](https://img.shields.io/npm/v/nightfall-crypto-access-exit-check)](https://www.npmjs.com/package/nightfall-crypto-access-exit-check)
[![GitHub release](https://img.shields.io/github/v/release/do2006/nightfall-crypto-access-exit-check)](https://github.com/do2006/nightfall-crypto-access-exit-check/releases)

## Need a verified exit report now?

**[Buy the $49 Crypto Access Exit Verification via PayPal](https://www.paypal.com/ncp/payment/WHEDRHSJN6TFJ)**

You receive a human-readable report for one treasury / subject pair covering the supported checks below. No seed phrase or private key is required.

After payment, send the public treasury address, subject address, relevant contract addresses, and authorized scope to **dwayneoneill@nightfalltechnologies.com**.

## Who this is for

- Teams offboarding AI agents, bots, employees, contractors, or automation accounts
- Safe smart-account and treasury operators
- Wallet-security, account-abstraction, and Web3 engineering teams
- Security or finance leads who need evidence that supported on-chain permissions were actually removed

## What it checks

- Safe owner membership
- Safe enabled modules
- Safe Allowance Module delegates and token spending limits
- ERC-20 allowances
- ERC-721 operator approvals
- ERC-1155 operator approvals

The scanner never signs transactions, never requests private keys, and never moves funds.

## Why this exists

Removing a signer or disabling an account is not always the same as removing every permission that address received. A departing subject may have authority through a separate Safe module, allowance, token approval, or other supported on-chain path.

This project focuses specifically on **post-revocation verification**: after the offboarding procedure is supposed to be finished, what supported authority still remains?

## Verdicts

- `revoked` Ã¢â‚¬â€ every selected supported check is absent
- `residual_access_found` Ã¢â‚¬â€ at least one selected supported permission remains
- `unable_to_verify` Ã¢â‚¬â€ at least one selected check could not be verified and none showed residual access

Unknown or unverifiable checks fail closed to `unable_to_verify`; they do not produce a reassuring green result.

## Install and run

```powershell
npm install nightfall-crypto-access-exit-check
```

```powershell
npx nightfall-crypto-exit-check --input request.json --rpc https://mainnet.base.org --format markdown
```

Repository development mode:

```powershell
npm install
npm run scan -- --input examples/base-usdc-smoke.json --rpc https://mainnet.base.org
```
Input JSON:

```json
{
  "treasury": "0x...",
  "subject": "0x...",
  "safe": true,
  "safeAllowance": {
    "network": "8453",
    "tokens": ["0x..."]
  },
  "erc20": ["0x..."],
  "erc721": [],
  "erc1155": []
}
```

For supported Safe deployments, `safeAllowance.network` resolves the released Allowance Module address from Safe's official deployment package. You may instead supply an explicit `safeAllowance.module` address.

Only include contracts you are authorized to assess. Public-chain reads are non-custodial and read-only.

## Customer-ready Markdown output

See:
- `examples/base-usdc-smoke-report.md` for a live Base/USDC ERC-20 allowance example
- `examples/base-safe-allowance-smoke-report.md` for a live Base Safe Allowance Module example

## Need a broader security architecture review?

NightFall Technologies also offers a fixed-scope **Security Architecture Risk Sprint** for SaaS, AI, fintech, infrastructure, and technology teams: https://www.nightfalltechnologies.com/services/security-architecture-sprint

## Verification

```powershell
npm test -- --no-color
npm run typecheck
npm run build
```

CI runs the same verification on every push to `main` and on pull requests.

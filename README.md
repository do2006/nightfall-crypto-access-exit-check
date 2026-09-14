# NightFall Crypto Access Exit Check

Read-only verification that a former AI agent, bot, employee, or contractor no longer retains supported on-chain authority.

## What it checks

- Safe owner membership
- Safe enabled modules
- Safe Allowance Module delegates and token spending limits
- ERC-20 allowances
- ERC-721 operator approvals
- ERC-1155 operator approvals

The scanner never signs transactions, never requests private keys, and never moves funds.

## Verdicts

- `revoked` — every selected check is absent
- `residual_access_found` — at least one selected permission remains
- `unable_to_verify` — at least one selected check could not be verified and none showed residual access

## Install and run

Install from npm:

```powershell
npm install nightfall-crypto-access-exit-check
```

Run the published CLI:

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

```powershell
npm run scan -- --input request.json --rpc https://mainnet.base.org --format markdown
```
See:
- `examples/base-usdc-smoke-report.md` for a live Base/USDC ERC-20 allowance example.
- `examples/base-safe-allowance-smoke.json` for a live Base Safe Allowance Module example.

## Paid verification report

NightFall Technologies can run an authorized exit check and return a human-readable revocation report with the exact supported permission paths that remain, the checks that passed, and anything that could not be verified.

Introductory fixed price: **$49 per treasury / subject pair** for the supported v0.2 checks above.

Contact: **dwayneoneill@nightfalltechnologies.com**

No seed phrase or private key is required. The customer provides only public addresses, relevant contract addresses, and authorization to assess the supplied scope.

## Verification

```powershell
npm test -- --no-color
npm run typecheck
npm run build
```

CI runs the same verification on every push to `main` and on pull requests.

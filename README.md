# NightFall Crypto Access Exit Check

Read-only verification that a former AI agent, bot, employee, or contractor no longer retains supported on-chain authority.

## What it checks

- Safe owner membership
- Safe enabled modules
- ERC-20 allowances
- ERC-721 operator approvals
- ERC-1155 operator approvals

The scanner never signs transactions, never requests private keys, and never moves funds.

## Verdicts

- `revoked` — every selected check is absent
- `residual_access_found` — at least one selected permission remains
- `unable_to_verify` — at least one selected check could not be verified and none showed residual access

## Install and run

```powershell
npm install
npm exec -- tsx src/cli.ts --input examples/base-usdc-smoke.json --rpc https://mainnet.base.org
```

Input JSON:

```json
{
  "treasury": "0x...",
  "subject": "0x...",
  "safe": true,
  "erc20": ["0x..."],
  "erc721": [],
  "erc1155": []
}
```

Only include contracts you are authorized to assess. Public-chain reads are non-custodial and read-only.

## Paid verification report

NightFall Technologies can run an authorized exit check and return a human-readable revocation report with the exact supported permission paths that remain, the checks that passed, and anything that could not be verified.

Introductory fixed price: **$49 per treasury / subject pair** for the supported v1 checks above.

Contact: **dwayneoneill@nightfalltechnologies.com**

No seed phrase or private key is required. The customer provides only public addresses, the relevant contract addresses, and authorization to assess the supplied scope.

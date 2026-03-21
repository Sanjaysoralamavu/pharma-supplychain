# Pharma Supply Chain — Ethereum Blockchain

A blockchain-based pharmaceutical supply chain provenance system built with Solidity + Hardhat. Tracks drug batches from manufacturer to patient with full custody history, IPFS certificate storage, and regulator recall capability.

## Features

- **Role-based access control** — Manufacturer, Distributor, Pharmacy, Regulator
- **Full custody tracking** — immutable on-chain history of every handoff
- **IPFS integration** — certificate of analysis stored off-chain, CID anchored on-chain
- **Recall mechanism** — regulators can recall batches, blocking further transfers
- **Expiry enforcement** — transfers blocked on expired batches
- **Public verification** — anyone can verify a batch by ID (e.g. via QR code)

## Project Structure

```
pharma-supplychain/
├── contracts/
│   └── PharmaSupplyChain.sol   # Main smart contract
├── scripts/
│   └── deploy.js               # Deployment script
├── test/
│   └── PharmaSupplyChain.test.js
├── frontend/                   # React + Ethers.js UI (coming soon)
├── hardhat.config.js
└── .env.example
```

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run tests
```bash
npm test
```

### 3. Deploy locally
```bash
npm run node          # Terminal 1 — start local Hardhat node
npm run deploy:local  # Terminal 2 — deploy contract
```

### 4. Deploy to Sepolia testnet
```bash
cp .env.example .env
# Fill in SEPOLIA_RPC_URL and PRIVATE_KEY in .env
npm run deploy:sepolia
```

## Smart Contract Overview

### Roles
| Role | Can do |
|------|--------|
| Manufacturer | Register batches |
| Distributor | Transfer custody |
| Pharmacy | Transfer custody, mark dispensed |
| Regulator | Recall batches |
| Admin (deployer) | Assign roles |

### Key Functions
| Function | Who | Description |
|----------|-----|-------------|
| `assignRole(address, role)` | Admin | Grant a role to an address |
| `registerBatch(...)` | Manufacturer | Register a new drug batch with IPFS cert CID |
| `transferCustody(batchId, to, location)` | Supply chain actors | Transfer ownership |
| `markDispensed(batchId)` | Pharmacy | Mark batch as dispensed to patient |
| `recallBatch(batchId, reason)` | Regulator | Recall a batch (blocks further transfers) |
| `verifyBatch(batchId)` | Anyone | Check if batch is valid, recalled, or expired |
| `getCustodyHistory(batchId)` | Anyone | Get full audit trail |

### Events Emitted
- `BatchRegistered` — new batch on chain
- `CustodyTransferred` — ownership handoff
- `StatusUpdated` — status change
- `BatchRecalled` — regulator recall
- `RoleAssigned` — role grant

## IPFS Integration

Before calling `registerBatch`, upload the certificate of analysis PDF to IPFS using [Pinata](https://pinata.cloud) or [web3.storage](https://web3.storage). Pass the returned CID as `ipfsCertCID`. Anyone can retrieve and verify the document hasn't been tampered with.

```js
// Example with Pinata SDK
const { IpfsHash } = await pinata.pinFileToIPFS(certFile);
await contract.registerBatch(batchId, drugName, ndcCode, expiry, IpfsHash);
```

## Tools & Platforms
- **Solidity 0.8.20** — smart contract language
- **Hardhat** — compile, test, deploy
- **Ethers.js** — frontend interaction
- **Sepolia** — Ethereum testnet
- **IPFS / Pinata** — off-chain document storage

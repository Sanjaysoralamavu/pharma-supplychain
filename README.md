# PharmaChain 🏥⛓️
### Blockchain-Based Pharmaceutical Supply Chain Provenance System
> Built with Ethereum, Solidity, Hardhat, React, and MetaMask

---

## 📖 What is PharmaChain?

PharmaChain tracks medicine from the factory to the pharmacy using blockchain. Every step is permanently recorded — nobody can fake, edit, or delete it. Anyone can verify if a medicine is real by scanning a QR code or entering a batch ID.

---

## ⚙️ What You Need to Install First (Prerequisites)

Before anything else, install these on your computer:

### 1. Node.js (version 18 or 20 — NOT 25)
- Go to: https://nodejs.org
- Download the **LTS version**
- Install it
- Check it worked — open terminal and type:
```bash
node --version
```
It should show `v20.x.x`

### 2. Git
- Go to: https://git-scm.com/downloads
- Download and install for your OS
- Check it worked:
```bash
git --version
```

### 3. MetaMask Browser Extension
- Go to: https://metamask.io/download
- Click **"Install MetaMask for Chrome"**
- It opens Chrome Web Store — click **"Add to Chrome"**
- Follow setup — create a new wallet, save your recovery phrase somewhere safe

---

## 📥 Step 1 — Download the Project

```bash
git clone https://github.com/YOUR_GITHUB_REPO_LINK_HERE
cd pharma-supplychain
```

Or just unzip the downloaded folder and open terminal inside it.

---

## 📦 Step 2 — Install Dependencies

```bash
npm install
```

This downloads all the blockchain tools needed. Takes about 1-2 minutes.

---

## ✅ Step 3 — Run the Tests

```bash
npm test
```

You should see **16 passing** in green. If you do, everything is working correctly.

> ⚠️ **Windows users:** If you get `'hardhat' is not recognized`, make sure you ran `npm install` first.

> ⚠️ **Node v25 users:** Run `nvm install 20 && nvm use 20` first, then retry.

---

## 🔗 Step 4 — Start the Local Blockchain

Open a **new terminal window** and run:

```bash
npm run node
```

**Leave this running the whole time.** You will see something like:

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

Account #3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
```

> 📌 **Keep this terminal open and visible during the demo — you will need these addresses!**

---

## 🚀 Step 5 — Deploy the Smart Contract

Open a **second terminal window** and run:

```bash
npm run deploy:local
```

You will see:

```
PharmaSupplyChain deployed to: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
Demo roles assigned:
  Manufacturer: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
  Distributor:  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
  Pharmacy:     0x90F79bf6EB2c4f870365E785982E1f101E93b906
  Regulator:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

> 📌 **Copy the contract address** (the `0x...` after "deployed to") — you need it in the next step!

> ⚠️ **Important:** Every time you restart `npm run node`, you must run `npm run deploy:local` again and update the `.env` file with the new address.

---

## 🔧 Step 6 — Set the Contract Address

**Mac/Linux:**
```bash
echo "REACT_APP_CONTRACT_ADDRESS=0xPasteYourAddressHere" > frontend/.env
```

**Windows (PowerShell):**
```powershell
echo "REACT_APP_CONTRACT_ADDRESS=0xPasteYourAddressHere" > frontend/.env
```

Replace `0xPasteYourAddressHere` with the actual address from Step 5.

---

## 🖥️ Step 7 — Start the Frontend

Open a **third terminal window** and run:

```bash
cd frontend
npm install
npm start
```

This opens http://localhost:3000 in your browser automatically.

---

## 🦊 Step 8 — Set Up MetaMask

### 8a. Add the Local Hardhat Network

1. Open MetaMask (fox icon in Chrome top right)
2. Click the network dropdown at the top
3. Click **"Add a custom network"**
4. Fill in exactly:

| Field | Value |
|-------|-------|
| Network Name | `Hardhat Local` |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency Symbol | `ETH` |

5. Click **Save**

### 8b. Import the Test Accounts

You need to import accounts so you can act as different roles. These are **fake test accounts** with fake ETH — safe to use.

**Import Manufacturer (Account #1):**
1. Click your account icon in MetaMask
2. Click **"Add account or hardware wallet"**
3. Click **"Import account"**
4. Paste private key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
5. Click Import

**Import Distributor (Account #2):**
Repeat above with: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

**Import Pharmacy (Account #3):**
Repeat above with: `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`

**Import Regulator (Account #0):**
Repeat above with: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

---

## 🎬 Step 9 — Run the Demo

### Demo Cheat Sheet 📋

| Role | Address |
|------|---------|
| Manufacturer | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| Distributor | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` |
| Pharmacy | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` |
| Regulator | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` |

---

### 1️⃣ Register a Drug Batch (as Manufacturer)
- Switch MetaMask to **Imported Account 1** (Manufacturer) + **Hardhat Local** network
- Go to http://localhost:3000 → Click **Connect MetaMask**
- You should see **MANUFACTURER** badge top right
- Click **Actions** tab → **Register Drug Batch**
- Fill in:
  - Batch ID: `PHR-AMX-2024-007`
  - Drug Name: `Amoxicillin Trihydrate 500mg`
  - NDC Code: `0093-3161-01`
  - Expiry Date: `06/30/2027`
- Click **Register Batch** → **Confirm** in MetaMask

### 2️⃣ Transfer to Distributor (as Manufacturer)
- Still as Manufacturer → **Actions** tab → **Transfer Custody**
- Batch ID: `PHR-AMX-2024-007`
- Recipient Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- Location: `Distribution Center, Phoenix AZ`
- Click **Transfer** → **Confirm** in MetaMask
- Go to **All Batches** — status changes to **In Transit** 🟠

### 3️⃣ Transfer to Pharmacy (as Distributor)
- Switch MetaMask to **Imported Account 2** (Distributor)
- Refresh page → **Connect MetaMask**
- You should see **DISTRIBUTOR** badge
- Actions tab → Transfer Custody
- Batch ID: `PHR-AMX-2024-007`
- Recipient Address: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- Location: `CVS Pharmacy, Tempe AZ`
- Click **Transfer** → **Confirm** in MetaMask
- Go to **All Batches** — status changes to **At Pharmacy** 🟣

### 4️⃣ Verify the Batch (anyone can do this)
- Click **Verify / QR** tab
- Enter: `PHR-AMX-2024-007`
- Click **Verify**
- See ✅ **AUTHENTIC** with full custody timeline!

### 5️⃣ (Optional) Issue a Recall (as Regulator)
- Switch MetaMask to **Regulator account** (Account #0)
- Refresh → Connect MetaMask
- Actions tab → Recall Batch → enter batch ID → Confirm
- Now Verify shows ❌ **RECALLED**

---

## 🛠️ 3 Terminals Summary

| Terminal | Command | Purpose |
|----------|---------|---------|
| Terminal 1 | `npm run node` | Local blockchain (keep running always) |
| Terminal 2 | `npm run deploy:local` | Deploy contract (run once after node starts) |
| Terminal 3 | `cd frontend && npm start` | Frontend UI |

---

## ❓ Common Issues

**"hardhat is not recognized"**
→ Run `npm install` first

**"MetaMask not found"**
→ Install MetaMask extension from metamask.io/download

**"Not current owner" error**
→ You're using the wrong account. Check which account owns the batch.

**"Batch already registered" error**
→ Change the Batch ID — each ID can only be used once

**Contract address is wrong / transactions failing**
→ Restart `npm run node`, run `npm run deploy:local` again, update `frontend/.env` with new address, restart `npm start`

**MetaMask showing wrong network**
→ Make sure you selected "Hardhat Local" network in MetaMask (Chain ID: 31337)

---

## 📁 Project Structure

```
pharma-supplychain/
├── contracts/
│   └── PharmaSupplyChain.sol    ← Main smart contract
├── scripts/
│   └── deploy.js                ← Deployment script
├── test/
│   └── PharmaSupplyChain.test.js ← 16 unit tests
├── frontend/
│   ├── src/
│   │   ├── App.jsx              ← Main React app
│   │   ├── components/          ← UI components
│   │   ├── hooks/useContract.js ← MetaMask/Ethers connection
│   │   └── utils/               ← Constants, IPFS helper
│   └── .env                     ← Contract address goes here
├── hardhat.config.js            ← Hardhat configuration
└── package.json                 ← Scripts and dependencies
```

---

## 🧑‍💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.20 |
| Blockchain Framework | Hardhat |
| Testing | Chai + Ethers.js |
| Frontend | React 18 |
| Wallet | MetaMask + Ethers.js v5 |
| Off-chain Storage | IPFS via Pinata |
| Test Network | Hardhat Local / Sepolia |

---

## 👥 Team
CSE540 — Project 1
Group: [Your Group Name]

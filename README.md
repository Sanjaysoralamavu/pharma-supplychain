# PharmaChain
### Blockchain-Based Pharmaceutical Supply Chain Provenance System
Built with Ethereum, Solidity, Hardhat, React, and MetaMask

---

## What is PharmaChain?

PharmaChain tracks medicine from the factory to the pharmacy using blockchain. Every step is permanently recorded and nobody can fake, edit, or delete it. Anyone can verify if a medicine is real by entering a batch ID or scanning a QR code.

---

## Prerequisites

Install the following before anything else.

### 1. Node.js (version 18 or 20 only, do NOT use v25)
Download from https://nodejs.org and install the LTS version.
Verify installation:
```
node --version
```
Should show v20.x.x

### 2. Git
Download from https://git-scm.com/downloads
Verify installation:
```
git --version
```

### 3. MetaMask Browser Extension
Go to https://metamask.io/download and install for Chrome. Follow the setup wizard, create a new wallet, and save your recovery phrase somewhere safe.

---

## Step 1 - Download the Project

```
git clone https://github.com/YOUR_REPO_LINK_HERE
cd pharma-supplychain
```

Or unzip the downloaded folder and open terminal inside it.

---

## Step 2 - Install Dependencies

```
npm install
```

Takes about 1-2 minutes.

---

## Step 3 - Run the Tests

```
npm test
```

You should see 16 passing. If yes, everything is working correctly.

Note for Windows users: If you get hardhat is not recognized, make sure you ran npm install first.

Note for Node v25 users: Run the following first, then retry.
```
nvm install 20
nvm use 20
```

---

## Step 4 - Start the Local Blockchain

Open a new terminal window and run:
```
npm run node
```

Leave this running the entire time. You will see output like this:

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

Keep this terminal visible during the demo. You will need these addresses.

---

## Step 5 - Deploy the Smart Contract

Open a second terminal window and run:
```
npm run deploy:local
```

You will see output like this:
```
PharmaSupplyChain deployed to: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
Demo roles assigned:
  Manufacturer: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
  Distributor:  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
  Pharmacy:     0x90F79bf6EB2c4f870365E785982E1f101E93b906
  Regulator:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

Copy the contract address shown after "deployed to". You need it in the next step.

Important: Every time you restart npm run node, you must run npm run deploy:local again and update the .env file with the new address.

---

## Step 6 - Set the Contract Address

Mac/Linux:
```
echo "REACT_APP_CONTRACT_ADDRESS=0xPasteYourAddressHere" > frontend/.env
```

Windows PowerShell:
```
echo "REACT_APP_CONTRACT_ADDRESS=0xPasteYourAddressHere" > frontend/.env
```

Replace 0xPasteYourAddressHere with the actual address from Step 5.

---

## Step 7 - Start the Frontend

Open a third terminal window and run:
```
cd frontend
npm install
npm start
```

This opens http://localhost:3000 automatically.

---

## Step 8 - Set Up MetaMask

### Add the Hardhat Local Network

1. Open MetaMask
2. Click the network dropdown at the top
3. Click "Add a custom network"
4. Fill in exactly:

Network Name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH

5. Click Save

### Import the Test Accounts

These are fake test accounts with fake ETH. Safe to use for local development.

Import Manufacturer (Account 1):
1. Click your account icon in MetaMask
2. Click "Add account or hardware wallet"
3. Click "Import account"
4. Paste private key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
5. Click Import

Import Distributor (Account 2):
Repeat with private key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

Import Pharmacy (Account 3):
Repeat with private key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6

Import Regulator (Account 0):
Repeat with private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

---

## Step 9 - Run the Demo

### Role and Address Reference

Role          | Address
--------------|------------------------------------------
Manufacturer  | 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Distributor   | 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Pharmacy      | 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Regulator     | 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

---

### Step 9a - Register a Drug Batch (as Manufacturer)

1. Switch MetaMask to Imported Account 1 (Manufacturer) and Hardhat Local network
2. Go to http://localhost:3000 and click Connect MetaMask
3. You should see MANUFACTURER badge in top right
4. Click Actions tab and fill in Register Drug Batch:
   - Batch ID: PHR-AMX-2024-007
   - Drug Name: Amoxicillin Trihydrate 500mg
   - NDC Code: 0093-3161-01
   - Expiry Date: 06/30/2027
5. Click Register Batch and Confirm in MetaMask

### Step 9b - Transfer to Distributor (as Manufacturer)

1. Still as Manufacturer, click Actions tab and Transfer Custody:
   - Batch ID: PHR-AMX-2024-007
   - Recipient Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
   - Location: Distribution Center, Phoenix AZ
2. Click Transfer and Confirm in MetaMask
3. Go to All Batches - status changes to In Transit

### Step 9c - Transfer to Pharmacy (as Distributor)

1. Switch MetaMask to Imported Account 2 (Distributor)
2. Refresh page and click Connect MetaMask
3. You should see DISTRIBUTOR badge
4. Actions tab and Transfer Custody:
   - Batch ID: PHR-AMX-2024-007
   - Recipient Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
   - Location: CVS Pharmacy, Tempe AZ
5. Click Transfer and Confirm in MetaMask
6. Go to All Batches - status changes to At Pharmacy

### Step 9d - Verify the Batch (public, no role needed)

1. Click Verify / QR tab
2. Enter: PHR-AMX-2024-007
3. Click Verify
4. You will see AUTHENTIC with the full custody timeline showing all 3 events

### Step 9e - Issue a Recall (as Regulator, optional)

1. Switch MetaMask to Regulator account (Account 0)
2. Refresh and Connect MetaMask
3. Actions tab, find Recall Batch, enter batch ID and confirm
4. Verify tab now shows RECALLED

---

## Terminal Summary

Terminal 1: npm run node                                    (keep running always)
Terminal 2: npm run deploy:local                            (run once after node starts)
Terminal 3: cd frontend && npm install && npm start         (frontend)

---

## Common Issues

"hardhat is not recognized"
Run npm install first.

"MetaMask not found"
Install MetaMask extension from metamask.io/download and refresh the page.

"Not current owner" error
You are using the wrong account. The batch can only be transferred by its current owner.

"Batch already registered" error
Change the Batch ID. Each ID can only be registered once per deployment.

Transactions failing or wrong contract
Restart npm run node, run npm run deploy:local again, update frontend/.env with the new contract address, and restart npm start.

MetaMask showing wrong network
Make sure you selected Hardhat Local in MetaMask with Chain ID 31337.

---

## Project Structure

```
pharma-supplychain/
    contracts/
        PharmaSupplyChain.sol         Main smart contract
    scripts/
        deploy.js                     Deployment script
    test/
        PharmaSupplyChain.test.js     16 unit tests
    frontend/
        src/
            App.jsx                   Main React app
            components/               UI components
            hooks/useContract.js      MetaMask and Ethers connection
            utils/                    Constants and IPFS helper
        .env                          Contract address goes here
    hardhat.config.js                 Hardhat configuration
    package.json                      Scripts and dependencies
```

---

## Tech Stack

Layer             | Technology
------------------|---------------------------
Smart Contract    | Solidity 0.8.20
Blockchain Tools  | Hardhat
Testing           | Chai + Ethers.js
Frontend          | React 18
Wallet            | MetaMask + Ethers.js v5
Off-chain Storage | IPFS via Pinata
Test Network      | Hardhat Local / Sepolia

---

## Team

CSE540 - Project 1
Group: [Your Group Name]
Members: [List your team members here]
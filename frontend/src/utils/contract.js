import { ethers } from "ethers";

export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "";

export const ABI = [
  "function assignRole(address account, uint8 role) external",
  "function roles(address) view returns (uint8)",
  "function registerBatch(string batchId, string drugName, string ndcCode, uint256 expiryDate, string ipfsCertCID) external",
  "function transferCustody(string batchId, address to, string location) external",
  "function markDispensed(string batchId) external",
  "function recallBatch(string batchId, string reason) external",
  "function getBatch(string batchId) view returns (tuple(string batchId, string drugName, string ndcCode, address currentOwner, uint8 status, uint256 manufactureDate, uint256 expiryDate, string ipfsCertCID, bool exists, bool recalled))",
  "function getCustodyHistory(string batchId) view returns (tuple(address actor, uint8 status, string location, uint256 timestamp)[])",
  "function getAllBatchIds() view returns (string[])",
  "function verifyBatch(string batchId) view returns (bool isValid, bool isRecalled, bool isExpired)",
  "event BatchRegistered(string indexed batchId, string drugName, string ndcCode, address manufacturer, uint256 timestamp)",
  "event CustodyTransferred(string indexed batchId, address indexed from, address indexed to, string location, uint256 timestamp)",
  "event BatchRecalled(string indexed batchId, string reason, address regulator, uint256 timestamp)",
];

export const ROLES = { None: 0, Manufacturer: 1, Distributor: 2, Pharmacy: 3, Regulator: 4 };
export const ROLE_NAMES = ["None", "Manufacturer", "Distributor", "Pharmacy", "Regulator"];

export const STATUS_NAMES = ["Manufactured", "In Transit", "At Pharmacy", "Dispensed", "Recalled"];
export const STATUS_COLORS = ["#3b82f6", "#f59e0b", "#8b5cf6", "#10b981", "#ef4444"];

export async function getContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask not found. Please install it.");
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  return { provider, signer, address, chainId: network.chainId.toString() };
}

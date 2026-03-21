// Auto-generated after deployment. Update CONTRACT_ADDRESS after running deploy.js
export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

export const ABI = [
  "function assignRole(address account, uint8 role) external",
  "function roles(address) view returns (uint8)",
  "function admin() view returns (address)",
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
  "event BatchRecalled(string indexed batchId, string reason, address regulator, uint256 timestamp)"
];

export const ROLES = { 0: "None", 1: "Manufacturer", 2: "Distributor", 3: "Pharmacy", 4: "Regulator" };
export const STATUS = { 0: "Manufactured", 1: "In Transit", 2: "At Pharmacy", 3: "Dispensed", 4: "Recalled" };
export const STATUS_COLOR = {
  0: "#22c55e", 1: "#3b82f6", 2: "#a855f7", 3: "#10b981", 4: "#ef4444"
};

export const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";

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
  "event BatchRecalled(string indexed batchId, string reason, address regulator, uint256 timestamp)"
];

export const ROLE_NAMES = { 0: "None", 1: "Manufacturer", 2: "Distributor", 3: "Pharmacy", 4: "Regulator" };
export const STATUS_NAMES = { 0: "Manufactured", 1: "In Transit", 2: "At Pharmacy", 3: "Dispensed", 4: "Recalled" };
export const STATUS_COLORS = {
  0: "#00d4aa", 1: "#f5a623", 2: "#4a9eff", 3: "#22c55e", 4: "#ef4444"
};

// Update CONTRACT_ADDRESS after deploying
export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

export const ROLES = { None: 0, Manufacturer: 1, Distributor: 2, Pharmacy: 3, Regulator: 4 };
export const ROLE_NAMES = ["None", "Manufacturer", "Distributor", "Pharmacy", "Regulator"];
export const STATUS_NAMES = ["Manufactured", "In Transit", "At Pharmacy", "Dispensed", "Recalled"];
export const STATUS_COLORS = {
  0: "#2563eb", // blue
  1: "#d97706", // amber
  2: "#7c3aed", // purple
  3: "#16a34a", // green
  4: "#dc2626", // red
};

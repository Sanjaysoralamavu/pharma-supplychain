/**
 * IPFS upload utility using Pinata.
 * Set REACT_APP_PINATA_JWT in your .env with your Pinata JWT token.
 * Get one free at https://pinata.cloud
 */
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;

/**
 * Upload a file to IPFS via Pinata.
 * @param {File} file - The file to upload (e.g. PDF certificate of analysis)
 * @param {string} batchId - Used as the pin name
 * @returns {Promise<string>} IPFS CID
 */
export async function uploadToIPFS(file, batchId) {
  if (!PINATA_JWT) throw new Error("REACT_APP_PINATA_JWT not set in .env");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("pinataMetadata", JSON.stringify({ name: `cert-${batchId}` }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  });

  if (!res.ok) throw new Error(`Pinata error: ${res.statusText}`);
  const data = await res.json();
  return data.IpfsHash; // CID to store on-chain
}

/**
 * Get the IPFS gateway URL for a CID.
 */
export function ipfsGatewayUrl(cid) {
  return `https://ipfs.io/ipfs/${cid}`;
}

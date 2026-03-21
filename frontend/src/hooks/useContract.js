import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../utils/constants";
import ABI from "../abis/PharmaSupplyChain.json";

export function useContract() {
  const [contract, setContract]     = useState(null);
  const [account, setAccount]       = useState(null);
  const [role, setRole]             = useState(0);
  const [isAdmin, setIsAdmin]       = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (!window.ethereum) { alert("MetaMask not found."); return; }
    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const addr = accounts[0];
      const paddedAddr = "000000000000000000000000" + addr.slice(2).toLowerCase();

      const [adminRaw, rolesRaw] = await Promise.all([
        window.ethereum.request({ method: "eth_call", params: [{ to: CONTRACT_ADDRESS, data: "0xf851a440" }, "latest"] }),
        window.ethereum.request({ method: "eth_call", params: [{ to: CONTRACT_ADDRESS, data: "0x99374642" + paddedAddr }, "latest"] }),
      ]);

      const adminAddr = "0x" + adminRaw.slice(-40);
      const userRole = parseInt(rolesRaw.slice(-64), 16);
      console.log("Connected:", addr, "Role:", userRole, "Admin:", adminAddr);

      // Build contract with ethers AFTER successful calls
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      const sign = provider.getSigner(addr);
      const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, sign);

      setContract(c);
      setAccount(addr);
      setRole(userRole);
      setIsAdmin(adminAddr.toLowerCase() === addr.toLowerCase());
    } catch (e) {
      console.error("Full error:", e);
      alert("Connection failed: " + (e.message || JSON.stringify(e)));
    } finally {
      setConnecting(false);
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.on("accountsChanged", connect);
    window.ethereum.on("chainChanged", () => window.location.reload());
    return () => window.ethereum.removeAllListeners();
  }, [connect]);

  return { contract, account, role, isAdmin, connecting, connect };
}
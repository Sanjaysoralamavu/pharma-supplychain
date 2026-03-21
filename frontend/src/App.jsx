import { useState, useEffect, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import { useContract } from "./hooks/useContract";
import Header from "./components/Header";
import ActionPanel from "./components/ActionPanel";
import BatchCard from "./components/BatchCard";
import VerifyPanel from "./components/VerifyPanel";
import "./App.css";

export default function App() {
  const { contract, account, role, isAdmin, connecting, connect } = useContract();
  const [batches, setBatches] = useState([]);
  const [histories, setHistories] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("dashboard"); // dashboard | actions | verify
  const [loadingBatches, setLoadingBatches] = useState(false);

  const loadBatches = useCallback(async () => {
    if (!contract) return;
    setLoadingBatches(true);
    try {
      const ids = await contract.getAllBatchIds();
      const batchData = await Promise.all(ids.map(id => contract.getBatch(id)));
      setBatches(batchData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBatches(false);
    }
  }, [contract]);

  const loadHistory = useCallback(async (batchId) => {
    if (!contract || histories[batchId]) return;
    try {
      const h = await contract.getCustodyHistory(batchId);
      setHistories(prev => ({...prev, [batchId]: h}));
    } catch(e) { console.error(e); }
  }, [contract, histories]);

  useEffect(() => { loadBatches(); }, [loadBatches]);

  const handleSelect = (id) => {
    setSelectedId(prev => prev === id ? null : id);
    loadHistory(id);
  };

  return (
    <div className="app">
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: "monospace", fontSize: 13 }}} />
      <Header account={account} role={role} isAdmin={isAdmin} connecting={connecting} onConnect={connect} />

      {!account ? (
        <div className="connect-prompt">
          <div className="connect-icon">⬡</div>
          <h2>PharmaChain</h2>
          <p>Blockchain-powered pharmaceutical supply chain provenance on Ethereum.</p>
          <button className="btn-connect large" onClick={connect} disabled={connecting}>
            {connecting ? "Connecting…" : "Connect MetaMask"}
          </button>
        </div>
      ) : (
        <main className="main">
          <nav className="tab-nav">
            {["dashboard", "actions", "verify"].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t === "dashboard" ? "All Batches" : t === "actions" ? "Actions" : "Verify / QR"}
              </button>
            ))}
          </nav>

          {tab === "dashboard" && (
            <div className="dashboard">
              <div className="dashboard-header">
                <h2 className="page-title">Drug Batches <span className="count">{batches.length}</span></h2>
                <button className="btn-refresh" onClick={loadBatches} disabled={loadingBatches}>
                  {loadingBatches ? "Loading…" : "↻ Refresh"}
                </button>
              </div>
              {batches.length === 0 ? (
                <div className="empty-state">No batches registered yet.</div>
              ) : (
                <div className="batch-list">
                  {batches.map(b => (
                    <BatchCard key={b.batchId} batch={b}
                      history={histories[b.batchId]}
                      selected={selectedId === b.batchId}
                      onSelect={handleSelect} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "actions" && (
            <ActionPanel contract={contract} role={role} isAdmin={isAdmin} onRefresh={loadBatches} />
          )}

          {tab === "verify" && (
            <VerifyPanel contract={contract} />
          )}
        </main>
      )}
    </div>
  );
}

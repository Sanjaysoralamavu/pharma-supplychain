import { useState } from "react";
import { STATUS_NAMES, STATUS_COLORS } from "../utils/constants";

export default function VerifyPanel({ contract }) {
  const [batchId, setBatchId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verify = async () => {
    if (!batchId.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const [isValid, isRecalled, isExpired] = await contract.verifyBatch(batchId.trim());
      const batch = await contract.getBatch(batchId.trim());
      const history = await contract.getCustodyHistory(batchId.trim());
      setResult({ isValid, isRecalled, isExpired, batch, history });
    } catch (e) {
      setError(e.reason || "Batch not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-panel">
      <h3 className="section-title">Verify Drug Batch</h3>
      <p className="verify-desc">Enter a batch ID (or scan a QR code) to verify authenticity.</p>
      <div className="verify-row">
        <input className="form-input verify-input" placeholder="e.g. BATCH-2024-001"
          value={batchId} onChange={e => setBatchId(e.target.value)}
          onKeyDown={e => e.key === "Enter" && verify()} />
        <button className="btn-action" onClick={verify} disabled={loading}>
          {loading ? "Checking…" : "Verify"}
        </button>
      </div>
      {error && <div className="verify-error">{error}</div>}
      {result && (
        <div className={`verify-result ${result.isValid ? "valid" : "invalid"}`}>
          <div className="verify-badge">
            {result.isValid ? "✓ AUTHENTIC" : result.isRecalled ? "⚠ RECALLED" : result.isExpired ? "✗ EXPIRED" : "✗ INVALID"}
          </div>
          <div className="verify-details">
            <div><strong>{result.batch.drugName}</strong></div>
            <div>NDC: {result.batch.ndcCode}</div>
            <div>Status: <span style={{color: STATUS_COLORS[result.batch.status]}}>{STATUS_NAMES[result.batch.status]}</span></div>
            <div>Expiry: {new Date(Number(result.batch.expiryDate)*1000).toLocaleDateString()}</div>
            {result.batch.ipfsCertCID && (
              <div style={{marginTop: "10px", padding: "8px 12px", background: "#0f2a1a", borderRadius: "6px", border: "1px solid #22c55e33"}}>
                <div style={{fontSize: "11px", color: "#888", marginBottom: "4px"}}>Certificate of Analysis (IPFS)</div>
                <a
                  href={`https://ipfs.io/ipfs/${result.batch.ipfsCertCID}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ipfs-link"
                  style={{color: "#22c55e", fontSize: "13px", wordBreak: "break-all"}}
                >
                  View Certificate of Analysis ↗
                </a>
                <div style={{fontSize: "10px", color: "#555", marginTop: "4px", fontFamily: "monospace", wordBreak: "break-all"}}>
                  CID: {result.batch.ipfsCertCID}
                </div>
              </div>
            )}
          </div>
          <div className="verify-history">
            <div className="timeline-label">Chain of Custody ({result.history.length} events)</div>
            {result.history.map((evt, i) => (
              <div key={i} className="timeline-event">
                <div className="tl-dot" style={{background: STATUS_COLORS[evt.status]}}/>
                <div className="tl-content">
                  <div className="tl-status">{STATUS_NAMES[evt.status]}</div>
                  <div className="tl-location">{evt.location}</div>
                  <div className="tl-time">{new Date(Number(evt.timestamp)*1000).toLocaleString()}</div>
                  {i === 0 && result.batch.ipfsCertCID && (
                    <a
                      href={`https://ipfs.io/ipfs/${result.batch.ipfsCertCID}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: "6px",
                        fontSize: "11px",
                        color: "#22c55e",
                        background: "#0f2a1a",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        border: "1px solid #22c55e44",
                        textDecoration: "none"
                      }}
                    >
                      Certificate of Analysis ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
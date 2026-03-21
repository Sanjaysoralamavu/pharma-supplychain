import QRCode from "react-qr-code";
import { STATUS_NAMES, STATUS_COLORS } from "../utils/constants";

export default function BatchCard({ batch, history, onSelect, selected }) {
  const statusColor = STATUS_COLORS[batch.status] || "#888";
  const expiry = new Date(Number(batch.expiryDate) * 1000);
  const isExpired = expiry < new Date();

  return (
    <div className={`batch-card ${selected ? "selected" : ""} ${batch.recalled ? "recalled" : ""}`}
         onClick={() => onSelect(batch.batchId)}>
      <div className="batch-card-top">
        <div>
          <div className="batch-name">{batch.drugName}</div>
          <div className="batch-id">{batch.batchId}</div>
          <div className="batch-ndc">NDC: {batch.ndcCode}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <span className="status-pill" style={{background: statusColor + "22", color: statusColor, border: `1px solid ${statusColor}44`}}>
            {batch.recalled ? "⚠ Recalled" : STATUS_NAMES[batch.status]}
          </span>
          <div className="expiry" style={{color: isExpired ? "#dc2626" : "#888"}}>
            {isExpired ? "EXPIRED" : `Exp: ${expiry.toLocaleDateString()}`}
          </div>
        </div>
      </div>

      {selected && (
        <div className="batch-detail">
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Current Owner</div>
              <div className="detail-val mono">{batch.currentOwner.slice(0,10)}…{batch.currentOwner.slice(-6)}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Manufactured</div>
              <div className="detail-val">{new Date(Number(batch.manufactureDate)*1000).toLocaleDateString()}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">IPFS Certificate</div>
              <div className="detail-val">
                {batch.ipfsCertCID ? (
                  <a href={`https://ipfs.io/ipfs/${batch.ipfsCertCID}`} target="_blank" rel="noreferrer" className="ipfs-link">
                    View on IPFS ↗
                  </a>
                ) : "None"}
              </div>
            </div>
          </div>

          {history && history.length > 0 && (
            <div className="timeline">
              <div className="timeline-label">Custody Timeline</div>
              {history.map((evt, i) => (
                <div key={i} className="timeline-event">
                  <div className="tl-dot" style={{background: STATUS_COLORS[evt.status]}}/>
                  <div className="tl-content">
                    <div className="tl-status">{STATUS_NAMES[evt.status]}</div>
                    <div className="tl-location">{evt.location}</div>
                    <div className="tl-time">{new Date(Number(evt.timestamp)*1000).toLocaleString()}</div>
                    <div className="tl-actor mono">{evt.actor.slice(0,8)}…</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="qr-section">
            <div className="detail-label" style={{marginBottom:8}}>QR Code (consumer scan)</div>
            <QRCode value={`${window.location.origin}?verify=${batch.batchId}`} size={100} />
          </div>
        </div>
      )}
    </div>
  );
}

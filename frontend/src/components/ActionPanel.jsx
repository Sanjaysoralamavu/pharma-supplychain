import { useState } from "react";
import toast from "react-hot-toast";
import { ROLES } from "../utils/constants";

export default function ActionPanel({ contract, role, isAdmin, onRefresh }) {
  const [loading, setLoading] = useState(false);

  // Register Batch form
  const [regForm, setRegForm] = useState({ batchId:"", drugName:"", ndcCode:"", expiryDate:"", ipfsCertCID:"" });

  // Transfer form
  const [txForm, setTxForm] = useState({ batchId:"", to:"", location:"" });

  // Recall form
  const [rcForm, setRcForm] = useState({ batchId:"", reason:"" });

  // Dispense form
  const [dispForm, setDispForm] = useState({ batchId:"" });

  // Assign role form
  const [roleForm, setRoleForm] = useState({ address:"", role:"1" });

  const run = async (label, fn) => {
    setLoading(true);
    const t = toast.loading(label + "…");
    try {
      const tx = await fn();
      await tx.wait();
      toast.success("Done!", { id: t });
      onRefresh();
    } catch (e) {
      toast.error(e.reason || e.message?.slice(0,60) || "Error", { id: t });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="action-panel">

      {/* ── Register Batch ── */}
      {(role === ROLES.Manufacturer || true) && (
        <section className="action-section">
          <h3 className="section-title">Register Drug Batch</h3>
          <div className="form-grid">
            {[
              ["Batch ID", "batchId", "BATCH-2024-001"],
              ["Drug Name", "drugName", "Amoxicillin 500mg"],
              ["NDC Code", "ndcCode", "0069-0020-01"],
              ["IPFS Cert CID", "ipfsCertCID", "Qm… (optional)"],
            ].map(([label, key, ph]) => (
              <label key={key} className="form-label">
                {label}
                <input className="form-input" placeholder={ph}
                  value={regForm[key]}
                  onChange={e => setRegForm(f => ({...f, [key]: e.target.value}))} />
              </label>
            ))}
            <label className="form-label">
              Expiry Date
              <input type="date" className="form-input"
                value={regForm.expiryDate}
                onChange={e => setRegForm(f => ({...f, expiryDate: e.target.value}))} />
            </label>
          </div>
          <button className="btn-action" disabled={loading} onClick={() => run("Registering batch", () => {
            const expiry = Math.floor(new Date(regForm.expiryDate).getTime() / 1000);
            return contract.registerBatch(regForm.batchId, regForm.drugName, regForm.ndcCode, expiry, regForm.ipfsCertCID);
          })}>Register Batch</button>
        </section>
      )}

      {/* ── Transfer Custody ── */}
      {(role === ROLES.Manufacturer || role === ROLES.Distributor || role === ROLES.Pharmacy) && (
        <section className="action-section">
          <h3 className="section-title">Transfer Custody</h3>
          <div className="form-grid">
            {[
              ["Batch ID", "batchId", "BATCH-2024-001"],
              ["Recipient Address", "to", "0x…"],
              ["Location", "location", "Warehouse B, Chicago"],
            ].map(([label, key, ph]) => (
              <label key={key} className="form-label">
                {label}
                <input className="form-input" placeholder={ph}
                  value={txForm[key]}
                  onChange={e => setTxForm(f => ({...f, [key]: e.target.value}))} />
              </label>
            ))}
          </div>
          <button className="btn-action" disabled={loading} onClick={() =>
            run("Transferring custody", () => contract.transferCustody(txForm.batchId, txForm.to, txForm.location))
          }>Transfer</button>
        </section>
      )}

      {/* ── Mark Dispensed ── */}
      {role === ROLES.Pharmacy && (
        <section className="action-section">
          <h3 className="section-title">Mark Dispensed</h3>
          <label className="form-label">
            Batch ID
            <input className="form-input" placeholder="BATCH-2024-001"
              value={dispForm.batchId}
              onChange={e => setDispForm({batchId: e.target.value})} />
          </label>
          <button className="btn-action" disabled={loading} onClick={() =>
            run("Marking dispensed", () => contract.markDispensed(dispForm.batchId))
          }>Mark Dispensed</button>
        </section>
      )}

      {/* ── Recall ── */}
      {role === ROLES.Regulator && (
        <section className="action-section recall-section">
          <h3 className="section-title">⚠ Recall Batch</h3>
          <div className="form-grid">
            <label className="form-label">
              Batch ID
              <input className="form-input" placeholder="BATCH-2024-001"
                value={rcForm.batchId}
                onChange={e => setRcForm(f => ({...f, batchId: e.target.value}))} />
            </label>
            <label className="form-label">
              Reason
              <input className="form-input" placeholder="Contamination detected…"
                value={rcForm.reason}
                onChange={e => setRcForm(f => ({...f, reason: e.target.value}))} />
            </label>
          </div>
          <button className="btn-action btn-danger" disabled={loading} onClick={() =>
            run("Recalling batch", () => contract.recallBatch(rcForm.batchId, rcForm.reason))
          }>Issue Recall</button>
        </section>
      )}

      {/* ── Assign Role (Admin) ── */}
      {isAdmin && (
        <section className="action-section">
          <h3 className="section-title">Assign Role</h3>
          <div className="form-grid">
            <label className="form-label">
              Address
              <input className="form-input" placeholder="0x…"
                value={roleForm.address}
                onChange={e => setRoleForm(f => ({...f, address: e.target.value}))} />
            </label>
            <label className="form-label">
              Role
              <select className="form-input" value={roleForm.role}
                onChange={e => setRoleForm(f => ({...f, role: e.target.value}))}>
                <option value="1">Manufacturer</option>
                <option value="2">Distributor</option>
                <option value="3">Pharmacy</option>
                <option value="4">Regulator</option>
              </select>
            </label>
          </div>
          <button className="btn-action" disabled={loading} onClick={() =>
            run("Assigning role", () => contract.assignRole(roleForm.address, Number(roleForm.role)))
          }>Assign Role</button>
        </section>
      )}

      {role === 0 && !isAdmin && (
        <div className="no-role-msg">
          Your wallet has no role yet. Contact the admin to get assigned a role.
        </div>
      )}
    </div>
  );
}

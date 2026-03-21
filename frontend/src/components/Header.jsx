import { ROLE_NAMES } from "../utils/constants";

export default function Header({ account, role, isAdmin, connecting, onConnect }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">⬡</span>
          <div>
            <div className="logo-title">PharmaChain</div>
            <div className="logo-sub">Ethereum · Sepolia</div>
          </div>
        </div>
        <div className="header-right">
          {account ? (
            <div className="account-pill">
              <span className={`role-badge role-${role}`}>{isAdmin ? "Admin" : ROLE_NAMES[role]}</span>
              <span className="account-addr">{account.slice(0,6)}…{account.slice(-4)}</span>
            </div>
          ) : (
            <button className="btn-connect" onClick={onConnect} disabled={connecting}>
              {connecting ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

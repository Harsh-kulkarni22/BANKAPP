import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Wallet,
  Landmark,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft
} from 'lucide-react';
import { useEffect, useState } from 'react';
import './Dashboard.css';

const API_BASE = '/api';

export default function Dashboard() {
  const { userData } = useOutletContext();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function fetchTxs() {
      try {
        const res = await fetch(`${API_BASE}/transactions`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          // just show top 5 in UI
          setTransactions(data.transactions.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchTxs();
  }, []);

  return (
    <div className="dashboard-content">
      <h1 className="page-title">Account Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper wallet">
            <Wallet size={24} color="#60a5fa" />
          </div>
          <div className="stat-info">
            <span>CURRENT BALANCE</span>
            <h3>₹{Number(userData?.balance || 0).toFixed(2)}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bank">
            <Landmark size={24} color="#34d399" />
          </div>
          <div className="stat-info">
            <span>ACCOUNT NUMBER</span>
            <h3>{userData?.account_number || 'N/A'}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper card">
            <CreditCard size={24} color="#fbbf24" />
          </div>
          <div className="stat-info">
            <span>IFSC CODE</span>
            <h3>{userData?.ifsc || 'SBIN0001234'}</h3>
          </div>
        </div>
      </div>

      <div className="section-container">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="quick-action-btn" onClick={() => navigate('/deposit')}>
            <ArrowDownCircle size={18} />
            Deposit Funds
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/withdraw')}>
            <ArrowUpCircle size={18} />
            Withdraw Funds
          </button>
          <button className="quick-action-btn transfer" onClick={() => navigate('/transfer')}>
            <ArrowRightLeft size={18} />
            Transfer Money
          </button>
        </div>
      </div>

      <div className="section-container transactions-section">
        <div className="section-header">
          <h2 className="section-title">Recent Transactions</h2>
          <button className="view-all-btn" onClick={() => navigate('/transactions')}>View All</button>
        </div>

        <div className="table-responsive">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>DESCRIPTION</th>
                <th>TYPE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td>{tx.description}</td>
                    <td className={`tx-type ${tx.type.toLowerCase()}`}>{tx.type}</td>
                    <td className="tx-amount">₹{Number(tx.amount).toFixed(2)}</td>
                    <td>
                      <span className="tx-status">{tx.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">No transactions yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

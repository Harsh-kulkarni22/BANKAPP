import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import './Dashboard.css'; /* Reuse dashboard styles for tables */

const API_BASE = '/api';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchTxs() {
            try {
                const res = await fetch(`${API_BASE}/transactions`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setTransactions(data.transactions);
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchTxs();
    }, []);

    return (
        <div className="dashboard-content">
            <div className="section-container transactions-section" style={{ marginTop: '0' }}>
                <div className="section-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={20} />
                        All Transactions
                    </h2>
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

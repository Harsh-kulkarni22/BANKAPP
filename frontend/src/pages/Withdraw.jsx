import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ArrowUpCircle } from 'lucide-react';
import './ActionPage.css';

const API_BASE = '/api';

export default function Withdraw() {
    const { userData } = useOutletContext();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        if (Number(amount) > 100000) {
            setError('Maximum withdrawal allowed is ₹1,00,000.');
            return;
        }

        if (Number(amount) > Number(userData?.balance)) {
            setError('Insufficient funds.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/withdraw`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: Number(amount), description }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Withdrawal failed');
            }

            setSuccess('Withdrawal successful!');
            setAmount('');
            setDescription('');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="action-page-content">
            <div className="action-card">
                <div className="action-card-header spread">
                    <div className="headline">
                        <ArrowUpCircle size={20} className="icon-red" />
                        <h3>Withdraw Funds</h3>
                    </div>
                    <div className="balance-info">
                        Balance: ₹{Number(userData?.balance || 0).toFixed(2)}
                    </div>
                </div>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                <form onSubmit={handleWithdraw} className="action-form">
                    <div className="form-group">
                        <label>Amount (₹)</label>
                        <input
                            type="number"
                            placeholder="Enter amount to withdraw"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                        <span className="help-text">Maximum withdrawal: ₹1,00,000 per transaction</span>
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g., ATM withdrawal"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="action-buttons">
                        <button type="submit" className="submit-btn red" disabled={loading}>
                            {loading ? 'Processing...' : 'Withdraw Now'}
                        </button>
                        <button type="button" className="cancel-btn" onClick={() => navigate('/dashboard')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

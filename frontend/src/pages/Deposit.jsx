import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ArrowDownCircle } from 'lucide-react';
import './ActionPage.css';

const API_BASE = '/api';

export default function Deposit() {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleDeposit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        if (Number(amount) > 1000000) {
            setError('Maximum deposit allowed is ₹10,00,000.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/deposit`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: Number(amount), description }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Deposit failed');
            }

            setSuccess('Deposit successful!');
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
                <div className="action-card-header">
                    <ArrowDownCircle size={20} className="icon-blue" />
                    <h3>Deposit Funds</h3>
                </div>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                <form onSubmit={handleDeposit} className="action-form">
                    <div className="form-group">
                        <label>Amount (₹)</label>
                        <input
                            type="number"
                            placeholder="Enter amount to deposit"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                        <span className="help-text">Maximum deposit: ₹10,00,000 per transaction</span>
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g., Cash deposit"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="action-buttons">
                        <button type="submit" className="submit-btn blue" disabled={loading}>
                            {loading ? 'Processing...' : 'Deposit Now'}
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

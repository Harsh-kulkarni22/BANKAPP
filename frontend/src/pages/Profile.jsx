import { useOutletContext } from 'react-router-dom';
import { User, Mail, Landmark, CreditCard, ShieldCheck, CalendarDays } from 'lucide-react';
import './Profile.css';

export default function Profile() {
    const { userData } = useOutletContext();

    const formattedDate = userData?.created_at
        ? new Date(userData.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        : 'Recently';

    const balanceNumber = Number(userData?.balance || 0);

    return (
        <div className="profile-container">
            <h1 className="page-title">My Profile</h1>

            <div className="profile-grid">
                {/* Left Side: Avatar Card */}
                <div className="profile-card avatar-card">
                    <div className="avatar-circle">
                        <User size={64} className="avatar-icon" />
                    </div>
                    <h2 className="avatar-name">{userData?.username || 'User'}</h2>
                    <p className="avatar-email">{userData?.email || 'N/A'}</p>
                    <span className="user-badge">USER</span>
                </div>

                {/* Right Side: Information Card */}
                <div className="profile-card details-card">
                    <h3 className="details-header">Account Information</h3>

                    <div className="details-list">
                        <div className="detail-row">
                            <div className="detail-label">
                                <User size={18} /> Full Name
                            </div>
                            <div className="detail-value">{userData?.username || 'N/A'}</div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <Mail size={18} /> Email Address
                            </div>
                            <div className="detail-value">{userData?.email || 'N/A'}</div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <Landmark size={18} /> Account Number
                            </div>
                            <div className="detail-value font-mono">{userData?.account_number || 'N/A'}</div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <CreditCard size={18} /> IFSC Code
                            </div>
                            <div className="detail-value font-bold">{userData?.ifsc || 'MONY0001234'}</div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <ShieldCheck size={18} /> Account Status
                            </div>
                            <div className="detail-value">
                                <span className="status-badge active">Active</span>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <CalendarDays size={18} /> Member Since
                            </div>
                            <div className="detail-value">{formattedDate}</div>
                        </div>
                    </div>

                    <div className="profile-balance">
                        <span>Current Balance</span>
                        <h4>₹{balanceNumber.toFixed(2)}</h4>
                    </div>
                </div>
            </div>
        </div>
    );
}

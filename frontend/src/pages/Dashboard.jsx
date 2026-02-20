import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const API_BASE = '/api';

function Dashboard() {
  const location = useLocation();
  const fromLogin = location.state?.fromLogin || false;
  const initialUsername = location.state?.username || '';

  const [userData, setUserData] = useState({ id: '...', username: initialUsername, email: '...' });
  const [balance, setBalance] = useState(null);
  const [balanceError, setBalanceError] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        const response = await fetch(`${API_BASE}/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.status === 401) {
          if (!cancelled) {
            setIsAuthenticated(false);
            setAuthChecked(true);
          }
          return;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (!cancelled) {
            setIsAuthenticated(false);
            setAuthChecked(true);
          }
          return;
        }

        if (!cancelled) {
          setUserData({ id: data.id, username: data.username, email: data.email });
          setIsAuthenticated(true);
          setAuthChecked(true);
        }
      } catch (err) {
        if (!cancelled) {
          setIsAuthenticated(false);
          setAuthChecked(true);
        }
      } finally {
        if (!cancelled) {
          setLoadingUser(false);
        }
      }
    }

    if (fromLogin) {
      setIsAuthenticated(true);
      setAuthChecked(true);
      fetchUser();
    } else {
      fetchUser();
    }

    return () => {
      cancelled = true;
    };
  }, [fromLogin]);

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [authChecked, isAuthenticated, navigate]);

  const handleCheckBalance = async () => {
    setBalanceError('');
    try {
      const response = await fetch(`${API_BASE}/balance`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setBalanceError(data.message || 'Could not fetch balance');
        setBalance(null);
        return;
      }

      setBalance(data.balance);
    } catch (err) {
      setBalanceError('Network error while fetching balance');
      setBalance(null);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/', { replace: true });
    } catch (err) {
      navigate('/', { replace: true });
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loadingUser && !isAuthenticated) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading securely...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">

        {/* Sidebar / Account Info Column */}
        <aside className="dashboard-sidebar">
          <div className="profile-section">
            <div className="profile-avatar">
              {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 className="profile-name">{userData.username || 'User'}</h2>
            <p className="profile-role">Premium Member</p>
          </div>

          <div className="account-details">
            <div className="detail-item">
              <span className="detail-label">Account ID</span>
              <span className="detail-value">#{String(userData.id).padStart(6, '0')}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{userData.email || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className="detail-value status-active">Active</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
            disabled={logoutLoading}
          >
            {logoutLoading ? 'Logging out...' : 'Logout securely'}
          </button>
        </aside>

        {/* Main Content Column */}
        <main className="dashboard-main">
          <header className="main-header">
            <h1 className="welcome-title">Good to see you, {userData.username}!</h1>
            <p className="welcome-subtitle">Manage your finances efficiently from your simulated dashboard.</p>
          </header>

          <div className="action-cards-grid">
            <div className="action-card primary-action">
              <div className="card-icon balance-icon">💰</div>
              <h3>Current Balance</h3>
              <p>Check your latest available simulated funds.</p>

              {balance !== null && !balanceError ? (
                <div className="balance-amount animate-pop">
                  ${Number(balance).toFixed(2)}
                </div>
              ) : (
                <button
                  type="button"
                  className="action-btn"
                  onClick={handleCheckBalance}
                >
                  Check Balance
                </button>
              )}

              {balanceError && (
                <div className="dashboard-error">{balanceError}</div>
              )}
            </div>

            <div className="action-card secondary-action">
              <div className="card-icon transfer-icon">💸</div>
              <h3>Quick Transfer</h3>
              <p>Send simulated money to other accounts instantly.</p>
              <button
                type="button"
                className="action-btn outline-btn"
                disabled
              >
                Feature Coming Soon
              </button>
            </div>
          </div>

          <div className="recent-activity-placeholder">
            <h3>Recent Activity</h3>
            <div className="empty-state">
              <p>No transactions yet. Check your balance to get started.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

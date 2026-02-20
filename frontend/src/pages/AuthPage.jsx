import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

const API_BASE = '/api';

function AuthPage() {
  const [mode, setMode] = useState('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    if (nextMode === 'login') {
      setSuccess('');
    }
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // #region agent log
      console.log('[AuthPage] Submitting login', {
        username: loginUsername,
      });
      // #endregion agent log

      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // #region agent log
      console.log('[AuthPage] Login success', {
        status: response.status,
        body: data,
      });
      // #endregion agent log

      navigate('/dashboard', {
        replace: true,
        state: {
          fromLogin: true,
          username: loginUsername,
        },
      });
    } catch (err) {
      // #region agent log
      console.log('[AuthPage] Login network error', {
        name: err?.name,
        message: err?.message,
      });
      // #endregion agent log
      setError('Network error during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupChange = (event) => {
    const { name, value } = event.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Password and Confirm Password must match.');
      return;
    }

    setLoading(true);

    try {
      // #region agent log
      fetch('http://127.0.0.1:7389/ingest/f2a30d99-8cdc-4359-8b1b-d333569b609a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': 'b85dfe',
        },
        body: JSON.stringify({
          sessionId: 'b85dfe',
          runId: 'pre-fix',
          hypothesisId: 'H1',
          location: 'AuthPage.jsx:signup:beforeFetch',
          message: 'Signup fetch about to send',
          data: {
            apiBase: API_BASE,
            hasPassword: Boolean(signupData.password),
            hasConfirmPassword: Boolean(signupData.confirmPassword),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log

      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: signupData.username,
          email: signupData.email,
          phone: signupData.phone,
          password: signupData.password,
          confirmPassword: signupData.confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || 'Signup failed');
        return;
      }

      setSuccess('Signup successful. Please log in.');
      setSignupData({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
      setMode('login');
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7389/ingest/f2a30d99-8cdc-4359-8b1b-d333569b609a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': 'b85dfe',
        },
        body: JSON.stringify({
          sessionId: 'b85dfe',
          runId: 'pre-fix',
          hypothesisId: 'H2',
          location: 'AuthPage.jsx:signup:catch',
          message: 'Signup fetch threw error',
          data: {
            name: err?.name,
            message: err?.message,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log
      setError('Network error during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Banking Simulation</h1>
        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'toggle-btn active' : 'toggle-btn'}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'toggle-btn active' : 'toggle-btn'}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="auth-alert error">{error}</div>}
        {success && <div className="auth-alert success">{success}</div>}

        {mode === 'login' ? (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label htmlFor="signup-username">Username</label>
              <input
                id="signup-username"
                name="username"
                type="text"
                value={signupData.username}
                onChange={handleSignupChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                value={signupData.email}
                onChange={handleSignupChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-phone">Phone</label>
              <input
                id="signup-phone"
                name="phone"
                type="tel"
                value={signupData.phone}
                onChange={handleSignupChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                value={signupData.password}
                onChange={handleSignupChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type="password"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                required
              />
            </div>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage;


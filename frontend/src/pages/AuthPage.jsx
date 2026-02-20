import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import './AuthPage.css';

const API_BASE = '/api';

function AuthPage() {
  const [mode, setMode] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
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
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      navigate('/dashboard', {
        replace: true,
        state: {
          fromLogin: true,
          username: data.username || loginEmail,
        },
      });
    } catch (err) {
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
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: signupData.username,
          email: signupData.email,
          password: signupData.password,
          confirmPassword: signupData.confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || 'Signup failed');
        return;
      }

      setSuccess('Signup successful. Please sign in.');
      setSignupData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      setMode('login');
    } catch (err) {
      setError('Network error during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-bg">
            <Landmark size={28} color="#1d4ed8" />
          </div>
          <h1>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p>
            {mode === 'login'
              ? 'Sign in to your MONEY BANK account'
              : 'Register for MONEY BANK Internet Banking'}
          </p>
        </div>

        {error && <div className="auth-alert error">{error}</div>}
        {success && <div className="auth-alert success">{success}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                placeholder="@gmail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <p className="auth-footer">
              Don't have an account?{' '}
              <span onClick={() => switchMode('signup')} className="auth-link">
                Register
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="signup-username">Full Name</label>
              <input
                id="signup-username"
                name="username"
                type="text"
                placeholder="Enter your full name"
                value={signupData.username}
                onChange={handleSignupChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-email">Email Address</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={signupData.email}
                onChange={handleSignupChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                placeholder="Create a password (min 6 chars)"
                value={signupData.password}
                onChange={handleSignupChange}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            <p className="auth-footer">
              Already have an account?{' '}
              <span onClick={() => switchMode('login')} className="auth-link">
                Sign In
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage;

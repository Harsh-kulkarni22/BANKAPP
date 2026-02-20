import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Deposit from './pages/Deposit.jsx';
import Withdraw from './pages/Withdraw.jsx';
import Transactions from './pages/Transactions.jsx';
import Profile from './pages/Profile.jsx';
import Layout from './components/Layout.jsx';

const PlaceholderPage = ({ title }) => (
  <div className="dashboard-content">
    <div className="section-container" style={{ textAlign: 'center', padding: '100px 0' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{title}</h2>
      <p style={{ color: 'rgba(255,255,255,0.6)' }}>This feature is currently under development.</p>
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transfer" element={<PlaceholderPage title="Transfer Funds" />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

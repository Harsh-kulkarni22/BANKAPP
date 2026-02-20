import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Building2,
    LayoutDashboard,
    ArrowDownCircle,
    ArrowUpCircle,
    ArrowRightLeft,
    Clock,
    User,
    ChevronDown,
    LogOut
} from 'lucide-react';
import { useEffect, useState } from 'react';
import './Layout.css';

const API_BASE = '/api';

export default function Layout() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch(`${API_BASE}/me`, {
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Not authenticated');
                }
                const data = await response.json();
                setUserData(data);
            } catch (err) {
                navigate('/', { replace: true });
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
            navigate('/', { replace: true });
        } catch (err) {
            navigate('/', { replace: true });
        }
    };

    if (loading) return null; // or a spinner

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Deposit', path: '/deposit', icon: ArrowDownCircle },
        { name: 'Withdraw', path: '/withdraw', icon: ArrowUpCircle },
        { name: 'Transfer', path: '/transfer', icon: ArrowRightLeft },
        { name: 'Transactions', path: '/transactions', icon: Clock },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <div className="layout-wrapper">
            <header className="top-header">
                <div className="header-brand">
                    <div className="brand-logo">
                        <Building2 size={24} color="#1d4ed8" />
                    </div>
                    <div className="brand-text">
                        <h2>MONEY BANK</h2>
                        <span>INTERNET BANKING</span>
                    </div>
                </div>

                <div className="header-user">
                    <div
                        className="user-dropdown-toggle"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <span className="user-name">{userData?.username || 'User'}</span>
                        <ChevronDown size={18} />
                    </div>

                    {showDropdown && (
                        <div className="user-dropdown-menu">
                            <button onClick={handleLogout} className="dropdown-item logout">
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="main-container">
                <aside className="sidebar">
                    <nav className="sidebar-nav">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.name}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                    onClick={() => navigate(item.path)}
                                >
                                    <Icon size={20} />
                                    <span>{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <main className="content-area">
                    <Outlet context={{ userData }} />
                </main>
            </div>
        </div>
    );
}

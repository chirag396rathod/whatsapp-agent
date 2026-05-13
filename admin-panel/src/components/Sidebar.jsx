import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('client');
        navigate('/login');
    };

    return (
        <div className="full-sidebar" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            minHeight: '100vh',
            padding: '1.5rem',
            boxSizing: 'border-box'
        }}>
            <div className="sidebar-brand" style={{ marginBottom: '2.5rem', color: 'var(--primary)', fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
                Chat Agent
            </div>

            <div className="sidebar-section" style={{ flex: 1 }}>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                    <span>📊</span> Dashboard
                </NavLink>
                <NavLink to="/customers" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                    <span>👥</span> Customers
                </NavLink>
                <NavLink to="/documents" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                    <span>📄</span> Documents
                </NavLink>
                <NavLink to="/activity" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                    <span>🕙</span> Message History
                </NavLink>
                <NavLink to="/plans" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                    <span>💳</span> Plans & Billing
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                    <span>⚙️</span> Settings
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                    <span>👤</span> Profile
                </NavLink>
            </div>

            <div className="sidebar-footer" style={{ 
                marginTop: 'auto', 
                borderTop: '1px solid var(--border-color)', 
                padding: '1.5rem 0'
            }}>
                <button 
                    onClick={handleLogout} 
                    className="sidebar-nav-link"
                    style={{ 
                        width: '100%', 
                        background: 'none', 
                        border: 'none', 
                        color: '#e63946',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontWeight: '600',
                        justifyContent: 'flex-start',
                        borderRadius: '8px'
                    }}
                    onMouseOver={(e) => { 
                        e.currentTarget.style.background = 'rgba(230, 57, 70, 0.08)'; 
                    }}
                    onMouseOut={(e) => { 
                        e.currentTarget.style.background = 'none'; 
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

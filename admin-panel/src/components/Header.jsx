import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ client }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('client');
        navigate('/login');
    };

    return (
        <header className="top-header">
            <div className="header-info" style={{ width: '100%', justifyContent: 'flex-end', display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: 'auto', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>👋</span>
                    Hi, {client?.client_name || 'Business'}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button 
                        onClick={() => navigate('/plans')}
                        className="animate-upgrade-btn"
                        style={{
                            background: 'white',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary)',
                            padding: '0.4rem 1.2rem',
                            borderRadius: '20px',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            letterSpacing: '0.8px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'var(--primary)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = 'var(--primary)';
                        }}
                    >
                        UPGRADE PLAN
                    </button>
                    <div className="avatar-circle">
                        {client?.client_name?.substring(0, 2).toUpperCase() || 'SX'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

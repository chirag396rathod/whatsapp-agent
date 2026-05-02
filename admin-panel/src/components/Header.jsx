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
            <div className="header-info" style={{ width: '100%', justifyContent: 'flex-end' }}>
                <div style={{ marginRight: 'auto', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>👋</span>
                    Hi, {client?.client_name || 'Business'}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                        <div className="avatar-circle">
                            {client?.client_name?.substring(0, 2).toUpperCase() || 'SX'}
                        </div>
                        <button 
                            onClick={handleLogout} 
                            style={{ 
                                background: 'transparent', 
                                border: '1px solid #e63946', 
                                color: '#e63946', 
                                padding: '0.4rem 0.8rem', 
                                borderRadius: '6px', 
                                fontSize: '0.8rem', 
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.target.style.background = '#e63946'; e.target.style.color = 'white'; }}
                            onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#e63946'; }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

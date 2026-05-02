import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="full-sidebar">
            <div className="sidebar-brand" style={{ marginBottom: '2rem', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '800' }}>
                SolExpert
            </div>

            <div className="sidebar-section">
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
                <NavLink to="/settings" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                    <span>⚙️</span> Settings
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => isActive ? 'sidebar-nav-link active' : 'sidebar-nav-link'}>
                    <span>👤</span> Profile
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api';

const Profile = () => {
    const { client } = useOutletContext();
    const [pwdData, setPwdData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handlePwdChange = (e) => {
        setPwdData({ ...pwdData, [e.target.name]: e.target.value });
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (pwdData.newPassword !== pwdData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            await api.post('/auth/reset-password', {
                email: client.email,
                oldPassword: pwdData.oldPassword,
                newPassword: pwdData.newPassword
            });
            setMessage('Password updated successfully!');
            setPwdData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Error updating password');
        }
    };

    if (!client) return <div className="empty-state">Loading profile data...</div>;

    return (
        <div style={{ maxWidth: '1000px' }}>
            {/* Business Profile Section */}
            <div className="report-section">
                <div className="section-header">
                    <span>👤</span> Business Profile
                </div>
                
                <div className="dash-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '24px' }}>
                    <div className="profile-card-header"></div>
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar">
                            {client.client_name?.substring(0, 1).toUpperCase()}
                        </div>
                        <div className="profile-name-section" style={{ paddingBottom: '1rem' }}>
                            <h1>{client.client_name}</h1>
                            <p style={{ margin: '8px 0', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                <span style={{ opacity: 0.7 }}>✉️</span> {client.email}
                                <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
                                <span className="badge badge-success" style={{ padding: '0.2rem 0.6rem', fontSize: '0.65rem' }}>
                                    {client.status?.toUpperCase() || 'ACTIVE'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div style={{ padding: '0 2.5rem 2.5rem' }}>
                        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                            <div className="profile-stat-box">
                                <div className="profile-stat-icon">📞</div>
                                <p style={{ fontWeight: '700', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>
                                    Support Number
                                </p>
                                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>{client.phone_number}</p>
                            </div>
                            <div className="profile-stat-box">
                                <div className="profile-stat-icon">💰</div>
                                <p style={{ fontWeight: '700', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>
                                    Wallet Balance
                                </p>
                                <p style={{ margin: 0, fontSize: '2rem', color: 'var(--primary)', fontWeight: '900' }}>${client.recharge || '0.00'}</p>
                            </div>
                            <div className="profile-stat-box">
                                <div className="profile-stat-icon">📅</div>
                                <p style={{ fontWeight: '700', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>
                                    Member Since
                                </p>
                                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>{new Date(client.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="report-section" style={{ marginTop: '3rem' }}>
                <div className="section-header">
                    <span>🔒</span> Security & Password
                </div>
                <div className="dash-card" style={{ maxWidth: '600px' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Update your account password to ensure your CRM remains secure.</p>
                    
                    {message && (
                        <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(0, 128, 105, 0.1)', color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            {message}
                        </div>
                    )}
                    
                    {error && (
                        <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(230, 57, 70, 0.1)', color: '#e63946', marginBottom: '1.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="oldPassword"
                                value={pwdData.oldPassword}
                                onChange={handlePwdChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={pwdData.newPassword}
                                onChange={handlePwdChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={pwdData.confirmPassword}
                                onChange={handlePwdChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className="save-btn" style={{ width: '100%' }}>
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;

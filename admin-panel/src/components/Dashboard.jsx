import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import api from '../api';
import { formatDateTime, timeAgo } from '../utils/dateUtils';

const Dashboard = () => {
    const { client } = useOutletContext();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ 
        totalMessages: 0, 
        customers: 0, 
        activities: [] 
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [customersRes, activityRes] = await Promise.all([
                    api.get('/data/customers'),
                    api.get('/data/activity')
                ]);
                
                setStats({
                    customers: customersRes.data.length,
                    totalMessages: activityRes.data.length,
                    activities: activityRes.data
                });
            } catch (err) {
                console.error('Error fetching dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const renderSkeletons = () => (
        <div className="card-grid">
            {[1, 2, 3].map(i => (
                <div key={i} className="dash-card skeleton-card skeleton"></div>
            ))}
        </div>
    );

    return (
        <div>
            {/* Promo Banner */}
            <div 
                className="animate-promo-banner"
                style={{
                    background: 'linear-gradient(90deg, #00A884 0%, #008069 50%, #00A884 100%)',
                    borderRadius: '16px',
                    padding: '1.5rem 2rem',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 128, 105, 0.3)'
                }}
            >
                <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Unlock Full AI Automation 🚀
                    </h3>
                    <p style={{ margin: '0 0 0.8rem 0', opacity: 0.9, fontSize: '0.95rem' }}>
                        Upgrade to Pro to train the AI on your documents and get a ₹2000 usage wallet.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', fontWeight: '600' }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>🎁 7-Day Free Trial</span>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>🤝 Free Onboarding Support</span>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/plans')}
                    style={{
                        background: 'white',
                        color: 'var(--primary)',
                        border: 'none',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '12px',
                        fontWeight: '800',
                        fontSize: '1rem',
                        fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s',
                        letterSpacing: '0.5px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    View Plans
                </button>
            </div>

            <div className="report-section">
                <div className="section-header">
                    <span>🟢</span> WhatsApp Performance Overview
                </div>
                {loading ? renderSkeletons() : (
                    <div className="card-grid">
                        <div className="dash-card">
                            <div className="card-icon-box">📊</div>
                            <div className="card-label">Activities This Month</div>
                            <div className="card-subtext">Total interactions processed by the AI</div>
                            <div className="card-value">{stats.totalMessages}<span>/∞</span></div>
                            <div className="card-subtext" style={{ marginTop: 'auto' }}>Logs recorded</div>
                        </div>
                        <div className="dash-card">
                            <div className="card-icon-box">👥</div>
                            <div className="card-label">Active Customers</div>
                            <div className="card-subtext">Unique users engaged with your bot</div>
                            <div className="card-value">{stats.customers}</div>
                            <div className="card-subtext" style={{ marginTop: 'auto' }}>Users</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="report-section">
                <div className="section-header">
                    <span>📝</span> Recent Activity Summary
                </div>
                {loading ? renderSkeletons() : (
                    <div className="card-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '120px', position: 'relative' }}>
                            <div className="card-subtext" style={{ marginBottom: '0.5rem' }}>Wallet Balance</div>
                            <div className="card-value" style={{ fontSize: '1.8rem', margin: 0 }}>₹{client?.recharge || '0.00'}</div>
                            <button 
                                onClick={() => navigate('/plans')}
                                style={{
                                    position: 'absolute',
                                    right: '1.5rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'rgba(0,128,105,0.1)',
                                    color: 'var(--primary)',
                                    border: '1px solid rgba(0,128,105,0.2)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Top-up
                            </button>
                        </div>
                        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '120px' }}>
                            <div className="card-subtext" style={{ marginBottom: '0.5rem' }}>Status</div>
                            <div className="card-value" style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: 0 }}>{client?.status?.toUpperCase() || 'ACTIVE'}</div>
                        </div>
                        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '120px' }}>
                            <div className="card-subtext" style={{ marginBottom: '0.5rem' }}>WBI Status</div>
                            <div className="card-value" style={{ fontSize: '1.8rem', color: client?.wbi ? 'var(--primary)' : 'var(--error)', margin: 0 }}>
                                {client?.wbi ? 'CONFIGURED' : 'PENDING'}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="report-section" style={{ marginTop: '2rem' }}>
                <div className="section-header">🕙 Recent Logs</div>
                {loading ? (
                    <div className="dash-card skeleton skeleton-card" style={{ height: '300px' }}></div>
                ) : stats.activities.length === 0 ? (
                    <div className="empty-state-card">
                        <div className="empty-state-icon">📝</div>
                        <p className="empty-state-title">No Activities Found</p>
                        <p className="empty-state-text">Once your WhatsApp bot starts interacting with customers, logs will appear here.</p>
                    </div>
                ) : (
                    <div className="dash-card" style={{ padding: 0 }}>
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th className="log-type-cell">Type</th>
                                    <th>Description</th>
                                    <th className="log-time-cell">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.activities.slice(0, 5).map(log => (
                                    <tr key={log.id}>
                                        <td className="log-type-cell">
                                            <span className={`badge ${log.type === 'incoming' ? 'badge-incoming' : 'badge-outgoing'}`}>
                                                {log.type === 'incoming' ? '📥 Incoming' : '📤 Outgoing'}
                                            </span>
                                        </td>
                                        <td className="log-desc-text">
                                            {log.message || log.description || 'System interaction'}
                                        </td>
                                        <td className="log-time-cell" style={{ verticalAlign: 'top', textAlign: 'right', minWidth: '120px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                                {log.cost > 0 && (
                                                    <div style={{
                                                        background: 'rgba(16, 185, 129, 0.1)',
                                                        color: '#059669',
                                                        border: '1px solid rgba(16, 185, 129, 0.2)',
                                                        padding: '3px 6px',
                                                        borderRadius: '4px',
                                                        fontWeight: '700',
                                                        fontSize: '0.65rem',
                                                        fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        ₹{parseFloat(log.cost).toFixed(5)}
                                                    </div>
                                                )}
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600' }}>
                                                    {timeAgo(log.created_at)}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

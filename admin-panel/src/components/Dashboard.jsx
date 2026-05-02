import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
    const { client } = useOutletContext();
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
                        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '120px' }}>
                            <div className="card-subtext" style={{ marginBottom: '0.5rem' }}>Wallet Balance</div>
                            <div className="card-value" style={{ fontSize: '1.8rem', margin: 0 }}>${client?.recharge || '0.00'}</div>
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
                        <table style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.activities.slice(0, 5).map(log => (
                                    <tr key={log.id}>
                                        <td style={{ padding: '0.8rem 1rem' }}>
                                            <span className={`badge ${log.type === 'incoming' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                                                {log.type?.toUpperCase() || 'EVENT'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.8rem 1rem', color: 'var(--text-main)', fontWeight: '500' }}>
                                            {log.message || log.description || 'System interaction'}
                                        </td>
                                        <td style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {new Date(log.created_at).toLocaleTimeString()}
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

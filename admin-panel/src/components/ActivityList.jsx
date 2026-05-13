import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { formatDateTime, timeAgo } from '../utils/dateUtils';

const ActivityList = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialPhone = queryParams.get('phone') || '';

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [phoneFilter, setPhoneFilter] = useState(initialPhone);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await api.get('/data/activity');
                setActivities(res.data);
            } catch (err) {
                console.error('Error fetching activity', err);
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, []);

    const filteredActivities = activities.filter(log => 
        !phoneFilter || log.customer_phone?.includes(phoneFilter)
    );

    if (loading) {
        return (
            <div>
                <h2>Message History</h2>
                <div className="dash-card skeleton skeleton-card" style={{ height: '500px' }}></div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Message History</h2>
                <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Track all system events and AI interactions with your customers.
                </p>
            </div>

            <div className="search-container">
                <span className="search-icon">🔍</span>
                <input 
                    type="text" 
                    placeholder="Search logs by customer phone number..." 
                    className="search-input-field"
                    value={phoneFilter}
                    onChange={(e) => setPhoneFilter(e.target.value)}
                />
            </div>
            
            {filteredActivities.length === 0 ? (
                <div className="empty-state-card">
                    <div className="empty-state-icon">🕙</div>
                    <p className="empty-state-title">No Activity Logged Yet</p>
                    <p className="empty-state-text">Once your WhatsApp bot starts processing messages and interacting with users, detailed logs will appear here.</p>
                </div>
            ) : (
                <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', tableLayout: 'fixed' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '90px' }}>Type</th>
                                <th style={{ width: '120px' }}>Customer</th>
                                <th>Description</th>
                                <th style={{ width: '120px' }}>Model</th>
                                <th style={{ width: '100px' }}>Usage</th>
                                <th style={{ width: '90px' }}>Cost</th>
                                <th style={{ width: '150px' }}>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredActivities.map(log => (
                                <tr key={log.id}>
                                    <td style={{ verticalAlign: 'top' }}>
                                        <span className={`badge ${log.type === 'incoming' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.6rem', padding: '0.2rem 0.4rem' }}>
                                            {log.type?.toUpperCase() || 'EVENT'}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.8rem', verticalAlign: 'top' }}>
                                        {log.customer_phone}
                                    </td>
                                    <td style={{ color: 'var(--text-main)', fontWeight: '500', lineHeight: '1.4', verticalAlign: 'top', paddingRight: '1rem', fontSize: '0.85rem', wordBreak: 'break-word' }}>
                                        {log.message || log.description}
                                    </td>
                                    <td style={{ verticalAlign: 'top' }}>
                                        {log.model ? (
                                            <div style={{ 
                                                background: 'rgba(59, 130, 246, 0.08)',
                                                color: '#2563eb',
                                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                fontSize: '0.65rem',
                                                fontWeight: '700',
                                                letterSpacing: '0.3px',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                <span style={{ fontSize: '0.8rem' }}>🧠</span> 
                                                {log.model.split('/').pop()}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td style={{ verticalAlign: 'top' }}>
                                        {log.input_tokens ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.75rem' }}>
                                                    <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>▲</span>
                                                    <span style={{ fontWeight: '600' }}>{log.input_tokens}</span>
                                                    <span style={{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.5px' }}>IN</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.75rem' }}>
                                                    <span style={{ color: '#0ea5e9', fontSize: '0.65rem' }}>▼</span>
                                                    <span style={{ fontWeight: '600', color: '#0ea5e9' }}>{log.output_tokens}</span>
                                                    <span style={{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.5px' }}>OUT</span>
                                                </div>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td style={{ verticalAlign: 'top' }}>
                                        {log.cost ? (
                                            <div style={{
                                                display: 'inline-block',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                color: '#059669',
                                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontWeight: '700',
                                                fontSize: '0.7rem',
                                                fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
                                                letterSpacing: '0.5px'
                                            }}>
                                                ₹{parseFloat(log.cost).toFixed(5)}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                            {timeAgo(log.created_at)}
                                        </div>
                                        <div style={{ opacity: 0.8, fontSize: '0.7rem' }}>
                                            {formatDateTime(log.created_at, 'DD MMM, hh:mm A')}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ActivityList;

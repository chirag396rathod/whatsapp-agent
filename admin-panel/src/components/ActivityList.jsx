import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';

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
                <div className="dash-card" style={{ padding: 0 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Customer</th>
                                <th>Description</th>
                                <th>Timestamp</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredActivities.map(log => (
                                <tr key={log.id}>
                                    <td>
                                        <span className={`badge ${log.type === 'incoming' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                                            {log.type || 'EVENT'}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{log.customer_phone}</td>
                                    <td style={{ color: 'var(--text-main)', fontWeight: '500' }}>{log.message || log.description}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td>
                                        <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '700' }}>● SUCCESS</span>
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

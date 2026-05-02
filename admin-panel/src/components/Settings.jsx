import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';

const Settings = () => {
    const [settings, setSettings] = useState({
        client_name: '',
        phone_number: '',
        wbi: '',
        auth_token: '',
        pin_id: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [showToken, setShowToken] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/data/profile');
                setSettings(res.data);
            } catch (err) {
                console.error('Error fetching settings', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/data/profile/update', settings);
            toast.success('Settings updated successfully!');
        } catch (err) {
            console.error('Update Error:', err.response?.data);
            const errorMsg = err.response?.data?.error || 'Error updating settings';
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="empty-state">Loading settings...</div>;

    return (
        <div>
            <h2>System Settings</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Configure your CRM and WhatsApp integration credentials.</p>
            
            <div className="auth-card" style={{ maxWidth: '1000px', margin: '0' }}>
                {message && (
                    <div style={{ 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        background: message.includes('Error') ? 'rgba(230, 57, 70, 0.1)' : 'rgba(0, 128, 105, 0.1)',
                        color: message.includes('Error') ? '#e63946' : '#008069',
                        marginBottom: '2rem',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>
                        {message}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="card-grid" style={{ marginBottom: '2rem' }}>
                        <div className="form-group">
                            <label>Business Name</label>
                            <input
                                type="text"
                                name="client_name"
                                value={settings.client_name}
                                onChange={handleChange}
                                placeholder="e.g. SolExpert AI"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Support Phone Number</label>
                            <input
                                type="text"
                                name="phone_number"
                                value={settings.phone_number}
                                onChange={handleChange}
                                placeholder="+1 234 567 890"
                                required
                            />
                        </div>
                    </div>

                    <div className="card-grid" style={{ marginBottom: '2rem' }}>
                        <div className="form-group">
                            <label>WhatsApp Business ID (WBI)</label>
                            <input
                                type="text"
                                name="wbi"
                                value={settings.wbi || ''}
                                onChange={handleChange}
                                placeholder="Enter your WBI"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone ID (Pin ID)</label>
                            <input
                                type="text"
                                name="pin_id"
                                value={settings.pin_id || ''}
                                onChange={handleChange}
                                placeholder="Enter your Phone ID"
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                        <label>WhatsApp Auth Token</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showToken ? 'text' : 'password'}
                                name="auth_token"
                                value={settings.auth_token || ''}
                                onChange={handleChange}
                                placeholder="Paste your long-lived access token here"
                                style={{ paddingRight: '3.5rem' }}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowToken(!showToken)}
                                style={{
                                    position: 'absolute',
                                    right: '0.5rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    padding: '0.5rem',
                                    color: 'var(--text-secondary)'
                                }}
                            >
                                {showToken ? '👁️' : '🙈'}
                            </button>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', marginTop: '1rem' }}>
                        <button type="submit" className="save-btn" style={{ padding: '1rem 3rem', fontSize: '1rem' }} disabled={saving}>
                            {saving ? 'Saving...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;

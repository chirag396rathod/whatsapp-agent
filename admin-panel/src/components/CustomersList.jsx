import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from '../api';
import ChatWindow from './ChatWindow';
import { formatDateTime, timeAgo } from '../utils/dateUtils';

const CustomersList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const { client } = useOutletContext();

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await api.get('/data/customers');
                setCustomers(res.data);
            } catch (err) {
                console.error('Error fetching customers', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const refreshCustomers = async () => {
        try {
            const res = await api.get('/data/customers');
            setCustomers(res.data);
        } catch (err) {
            console.error('Error refreshing customers', err);
        }
    };

    const filteredCustomers = customers.filter(customer => 
        (customer.name || 'Anonymous User').toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone_number.includes(searchTerm)
    );

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allPhones = filteredCustomers.map(c => c.phone_number);
            setSelectedRows(new Set(allPhones));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (phone) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(phone)) {
            newSelected.delete(phone);
        } else {
            newSelected.add(phone);
        }
        setSelectedRows(newSelected);
    };

    const handleInsertBusinessCard = () => {
        if (!client) return;
        const cardText = `*${client.client_name || 'Business Name'}*\n📞 Support: ${client.phone_number || 'N/A'}\n✉️ Email: ${client.email || 'N/A'}\n\n_We are here to help!_`;
        setMessageText(prev => prev ? prev + '\n\n' + cardText : cardText);
    };

    const handleSendBulkMessage = async () => {
        if (!messageText.trim()) {
            alert('Please enter a message to send.');
            return;
        }

        setSending(true);
        let successCount = 0;
        let failCount = 0;

        const phonesArray = Array.from(selectedRows);

        for (const phone of phonesArray) {
            try {
                await api.post('/data/send-message', { phone, message: messageText });
                successCount++;
            } catch (err) {
                console.error(`Failed to send to ${phone}`, err);
                failCount++;
            }
        }

        setSending(false);
        setIsMessageModalOpen(false);
        setMessageText('');
        setSelectedRows(new Set());
        
        alert(`Broadcast complete! Sent: ${successCount}, Failed: ${failCount}`);
    };

    if (loading) {
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div className="skeleton" style={{ width: '300px', height: '2rem' }}></div>
                    <div className="skeleton" style={{ width: '150px', height: '2.5rem' }}></div>
                </div>
                <div className="dash-card skeleton skeleton-card" style={{ height: '500px' }}></div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Customers</h2>
                    <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        View and manage all customers who have interacted with your WhatsApp bot.
                    </p>
                </div>
                
                {selectedRows.size > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--white)', padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                        <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{selectedRows.size} selected</span>
                        <button 
                            className="save-btn" 
                            style={{ padding: '0.6rem 1.2rem', margin: 0, display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem' }}
                            onClick={() => setIsMessageModalOpen(true)}
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                            Send Message
                        </button>
                    </div>
                )}
            </div>

            <div className="search-container">
                <span className="search-icon">🔍</span>
                <input 
                    type="text" 
                    placeholder="Search by name or phone number..." 
                    className="search-input-field"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredCustomers.length === 0 ? (
                <div className="empty-state-card">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{searchTerm ? '🔎' : '👥'}</div>
                    <p className="empty-state-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                        {searchTerm ? 'No matches found' : 'No Customers Yet'}
                    </p>
                    <p className="empty-state-text">
                        {searchTerm ? `We couldn't find any customers matching "${searchTerm}"` : 'Your customer list will grow automatically as users send messages to your WhatsApp business number.'}
                    </p>
                </div>
            ) : (
                <div className="dash-card" style={{ padding: 0 }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '40px', textAlign: 'center' }}>
                                    <input 
                                        type="checkbox" 
                                        onChange={handleSelectAll}
                                        checked={filteredCustomers.length > 0 && selectedRows.size === filteredCustomers.length}
                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                    />
                                </th>
                                <th>Name</th>
                                <th>Phone Number</th>
                                <th>Last Active</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id} style={{ background: selectedRows.has(customer.phone_number) ? 'rgba(0, 128, 105, 0.05)' : 'transparent' }}>
                                    <td style={{ textAlign: 'center' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedRows.has(customer.phone_number)}
                                            onChange={() => handleSelectRow(customer.phone_number)}
                                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                        />
                                    </td>
                                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                        {customer.name || 'Anonymous User'}
                                    </td>
                                    <td>{customer.phone_number}</td>
                                    <td>{timeAgo(customer.last_interaction)}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button 
                                            className="badge badge-success" 
                                            style={{ border: 'none', cursor: 'pointer', padding: '0.5rem 1rem' }}
                                            onClick={() => setSelectedCustomer(customer)}
                                        >
                                            View Chat
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedCustomer && (
                <ChatWindow 
                    customer={selectedCustomer} 
                    client={client}
                    onClose={() => {
                        setSelectedCustomer(null);
                        refreshCustomers();
                    }} 
                />
            )}

            {/* Broadcast Message Modal */}
            {isMessageModalOpen && (
                <div className="chat-window-overlay" onClick={() => !sending && setIsMessageModalOpen(false)}>
                    <div 
                        className="auth-card" 
                        onClick={e => e.stopPropagation()} 
                        style={{ margin: 'auto', maxWidth: '600px', width: '90%', animation: 'fadeIn 0.3s' }}
                    >
                        <h2 style={{ textAlign: 'left', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                            Broadcast Message
                        </h2>
                        
                        <div className="form-group">
                            <label>Sending to {selectedRows.size} customer(s)</label>
                            <div style={{ 
                                display: 'flex', gap: '8px', flexWrap: 'wrap', 
                                maxHeight: '80px', overflowY: 'auto', marginBottom: '1rem',
                                padding: '10px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)'
                            }}>
                                {Array.from(selectedRows).map(phone => (
                                    <span key={phone} className="badge badge-primary">{phone}</span>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ margin: 0 }}>Message Content (Supports WhatsApp Formatting)</label>
                                <button 
                                    onClick={handleInsertBusinessCard}
                                    style={{ 
                                        background: 'var(--white)', 
                                        color: 'var(--text-secondary)', 
                                        border: '1px solid var(--border-color)', 
                                        borderRadius: '6px', 
                                        padding: '0.4rem 0.8rem', 
                                        fontSize: '0.75rem', 
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    + Insert Business Card
                                </button>
                            </div>
                            <textarea 
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Type your message here... E.g. *Hello!* Here is our business info card."
                                style={{ minHeight: '150px' }}
                            ></textarea>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                Tip: Use *bold*, _italic_, ~strikethrough~
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button 
                                className="badge badge-error" 
                                style={{ border: 'none', cursor: 'pointer', padding: '0.8rem 1.5rem', fontSize: '0.95rem' }}
                                onClick={() => setIsMessageModalOpen(false)}
                                disabled={sending}
                            >
                                Cancel
                            </button>
                            <button 
                                className="save-btn" 
                                style={{ margin: 0, display: 'flex', gap: '8px', alignItems: 'center' }}
                                onClick={handleSendBulkMessage}
                                disabled={sending || !messageText.trim()}
                            >
                                {sending ? 'Sending...' : (
                                    <>
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                        </svg>
                                        Send Message
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersList;

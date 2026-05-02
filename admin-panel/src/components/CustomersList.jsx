import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CustomersList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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

    const filteredCustomers = customers.filter(customer => 
        (customer.name || 'Anonymous User').toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone_number.includes(searchTerm)
    );

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Customers</h2>
                    <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        View and manage all customers who have interacted with your WhatsApp bot.
                    </p>
                </div>
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
                                <th>Name</th>
                                <th>Phone Number</th>
                                <th>Last Active</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id}>
                                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                        {customer.name || 'Anonymous User'}
                                    </td>
                                    <td>{customer.phone_number}</td>
                                    <td>{new Date(customer.last_interaction).toLocaleDateString()}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button 
                                            className="badge badge-success" 
                                            style={{ border: 'none', cursor: 'pointer', padding: '0.5rem 1rem' }}
                                            onClick={() => navigate(`/activity?phone=${customer.phone_number}`)}
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
        </div>
    );
};

export default CustomersList;

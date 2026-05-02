import React, { useEffect, useState } from 'react';
import api from '../api';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await api.get('/data/documents');
                setDocuments(res.data);
            } catch (err) {
                console.error('Error fetching documents', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, []);

    const filteredDocs = documents.filter(doc => 
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUploadClick = () => {
        setIsUploading(true);
        // Simulate a small delay for upload
        setTimeout(() => {
            setIsUploading(false);
            alert('File upload feature will be connected to your cloud storage soon!');
        }, 1500);
    };

    if (loading) {
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div className="skeleton" style={{ width: '300px', height: '2rem' }}></div>
                    <div className="skeleton" style={{ width: '150px', height: '2.5rem' }}></div>
                </div>
                <div className="dash-card skeleton skeleton-card" style={{ height: '400px' }}></div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Knowledge Base</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Manage training data for your AI assistant
                    </p>
                </div>
                <button 
                    className="add-account-btn" 
                    style={{ width: 'auto', padding: '0.8rem 2rem', margin: 0 }}
                    onClick={handleUploadClick}
                    disabled={isUploading}
                >
                    {isUploading ? '⌛ Uploading...' : '📤 Upload New'}
                </button>
            </div>

            <div className="dash-card" style={{ padding: '1.5rem', marginBottom: '2rem', background: '#f8f9fa', border: 'none' }}>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search documents by name..." 
                        style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredDocs.length === 0 ? (
                <div className="empty-state-card">
                    <div className="empty-state-icon">{searchTerm ? '🔎' : '📄'}</div>
                    <p className="empty-state-title">{searchTerm ? 'No matches found' : 'No Documents Uploaded'}</p>
                    <p className="empty-state-text">
                        {searchTerm ? `We couldn't find any documents matching "${searchTerm}"` : 'Upload PDFs or text files to train your AI assistant on your business information.'}
                    </p>
                    {!searchTerm && (
                        <button className="add-account-btn" style={{ marginTop: '1rem', width: 'auto', padding: '0.8rem 2rem' }} onClick={handleUploadClick}>
                            + Upload First Document
                        </button>
                    )}
                </div>
            ) : (
                <div className="dash-card" style={{ padding: 0 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Document Name</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Uploaded On</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocs.map(doc => (
                                <tr key={doc.id}>
                                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '1.2rem' }}>📄</span>
                                            {doc.filename}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>
                                            {doc.filename.split('.').pop()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Indexed</span>
                                    </td>
                                    <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            <button className="upgrade-btn" style={{ padding: '0.4rem', borderRadius: '4px' }} title="Download">💾</button>
                                            <button className="upgrade-btn" style={{ padding: '0.4rem', borderRadius: '4px', color: '#e63946' }} title="Delete">🗑️</button>
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

export default Documents;

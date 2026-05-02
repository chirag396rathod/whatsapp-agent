import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';

const DocumentsList = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const fileInputRefJson = useRef(null);
    const fileInputRefDocx = useRef(null);
    const navigate = useNavigate();

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

    const filteredDocs = documents.filter(doc => {
        const title = doc.doc_json?.title || 'Unnamed Knowledge Base';
        return title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleFileChange = (e, type) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            setIsUploading(true);
            setShowUploadMenu(false);

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    let doc_json = null;
                    
                    if (type === 'json') {
                        doc_json = JSON.parse(event.target.result);
                    } else {
                        // DOCX processing would go here
                        toast.error('DOCX processing not implemented yet');
                        setIsUploading(false);
                        return;
                    }

                    const res = await api.post('/data/documents', { doc_json });
                    setDocuments(prev => [res.data, ...prev]);
                    toast.success(`${type.toUpperCase()} file "${file.name}" uploaded and indexed!`);
                } catch (err) {
                    console.error('Upload Error:', err);
                    toast.error('Failed to process or upload file');
                } finally {
                    setIsUploading(false);
                    // Reset input
                    e.target.value = '';
                }
            };

            if (type === 'json') {
                reader.readAsText(file);
            } else {
                // For docx we might need binary read, but for now placeholder
                reader.readAsArrayBuffer(file);
            }
        }
    };

    if (loading) {
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div className="skeleton" style={{ width: '300px', height: '2rem' }}></div>
                    <div className="skeleton" style={{ width: '150px', height: '2.5rem' }}></div>
                </div>
                <div className="dash-card skeleton skeleton-card" style={{ height: '400px' }}></div>
            </div>
        );
    }

    return (
        <div>
            <input 
                type="file" 
                ref={fileInputRefJson} 
                style={{ display: 'none' }} 
                onChange={(e) => handleFileChange(e, 'json')}
                accept=".json"
            />
            <input 
                type="file" 
                ref={fileInputRefDocx} 
                style={{ display: 'none' }} 
                onChange={(e) => handleFileChange(e, 'docx')}
                accept=".docx"
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Knowledge Base</h2>
                    <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Manage training data for your AI assistant (RAG)
                    </p>
                </div>
                <div style={{ position: 'relative' }}>
                    <button 
                        className="save-btn" 
                        style={{ margin: 0, padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => setShowUploadMenu(!showUploadMenu)}
                        disabled={isUploading}
                    >
                        {isUploading ? '⌛' : '📤'} {isUploading ? 'Uploading...' : 'Upload New'}
                    </button>
                    
                    {showUploadMenu && (
                        <div style={{ 
                            position: 'absolute', 
                            top: '100%', 
                            right: 0, 
                            marginTop: '8px', 
                            background: 'white', 
                            borderRadius: '8px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
                            border: '1px solid #eee',
                            zIndex: 1000,
                            width: '180px',
                            overflow: 'hidden'
                        }}>
                            <button 
                                onClick={() => fileInputRefJson.current.click()}
                                style={{ width: '100%', padding: '12px 16px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}
                                onMouseOver={(e) => e.target.style.background = '#f9f9f9'}
                                onMouseOut={(e) => e.target.style.background = 'none'}
                            >
                                <span>📄</span> Upload JSON
                            </button>
                            <button 
                                onClick={() => fileInputRefDocx.current.click()}
                                style={{ width: '100%', padding: '12px 16px', textAlign: 'left', border: 'none', borderTop: '1px solid #eee', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}
                                onMouseOver={(e) => e.target.style.background = '#f9f9f9'}
                                onMouseOut={(e) => e.target.style.background = 'none'}
                            >
                                <span>📝</span> Upload DOCX
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="search-container">
                <span className="search-icon">🔍</span>
                <input 
                    type="text" 
                    placeholder="Search your training documents..." 
                    className="search-input-field"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredDocs.length === 0 ? (
                <div className="empty-state-card">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{searchTerm ? '🔎' : '📄'}</div>
                    <h3 className="empty-state-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                        {searchTerm ? 'No results found' : 'No Documents Uploaded'}
                    </h3>
                    <p className="empty-state-text" style={{ marginBottom: '2rem' }}>
                        {searchTerm ? `We couldn't find any documents matching "${searchTerm}". Try a different name.` : 'Train your AI bot by uploading your business documents, FAQs, and product guides.'}
                    </p>
                    {!searchTerm && (
                        <button className="save-btn" style={{ margin: '0 auto' }} onClick={() => setShowUploadMenu(true)}>
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
                                            <span style={{ fontSize: '1.2rem' }}>📁</span>
                                            {doc.doc_json?.title || 'Unnamed Knowledge Base'}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>
                                            {doc.doc_json?.document_type || 'JSON'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Indexed</span>
                                    </td>
                                    <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            <button 
                                                className="upgrade-btn" 
                                                style={{ padding: '0.4rem', borderRadius: '4px' }} 
                                                title="Edit Visual Flow"
                                                onClick={() => navigate(`/documents/edit/${doc.doc_id}`)}
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                className="upgrade-btn" 
                                                style={{ padding: '0.4rem', borderRadius: '4px', color: '#e63946' }} 
                                                title="Delete"
                                                onClick={() => {
                                                    setDocumentToDelete(doc);
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Confirmation Modal */}
            {showDeleteModal && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(0,0,0,0.5)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 2000 
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>Delete Document?</h3>
                        <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.5' }}>
                            Are you sure you want to delete <strong>{documentToDelete?.doc_json?.title}</strong>? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                onClick={() => setShowDeleteModal(false)} 
                                style={{ flex: 1, padding: '0.8rem', border: '1px solid #ddd', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={async () => {
                                    try {
                                        await api.delete(`/data/documents/${documentToDelete.doc_id}`);
                                        setDocuments(prev => prev.filter(d => d.doc_id !== documentToDelete.doc_id));
                                        toast.success('Document removed');
                                    } catch (err) {
                                        toast.error('Failed to remove document');
                                    } finally {
                                        setShowDeleteModal(false);
                                        setDocumentToDelete(null);
                                    }
                                }} 
                                style={{ flex: 1, padding: '0.8rem', border: 'none', background: '#e63946', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsList;

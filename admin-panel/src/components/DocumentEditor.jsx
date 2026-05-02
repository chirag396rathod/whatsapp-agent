import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
    addEdge, 
    Background, 
    Controls, 
    applyEdgeChanges, 
    applyNodeChanges,
    MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';

const DocumentEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [documentData, setDocumentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Transform JSON tree to Flow nodes and edges
    const transformData = useCallback((data) => {
        const flowNodes = [];
        const flowEdges = [];
        let yOffset = 0;

        const traverse = (item, parentId = null, x = 0, level = 0) => {
            const nodeId = item.id || `node-${Math.random().toString(36).substr(2, 9)}`;
            
            // Format content for display
            let displayContent = '';
            if (item.content) {
                displayContent = Array.isArray(item.content) ? item.content.join(', ') : item.content;
            }

            flowNodes.push({
                id: nodeId,
                data: { 
                    label: (
                        <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px', borderBottom: displayContent ? '1px solid rgba(0,0,0,0.05)' : 'none', paddingBottom: displayContent ? '4px' : 0 }}>
                                {item.title}
                            </div>
                            {displayContent && (
                                <div style={{ fontSize: '0.75rem', color: level === 0 ? 'rgba(255,255,255,0.9)' : '#666', lineHeight: 1.4, maxHeight: '60px', overflow: 'hidden' }}>
                                    {displayContent}
                                </div>
                            )}
                        </div>
                    ),
                    title: item.title,
                    content: displayContent,
                    original: item 
                },
                position: { x: x, y: yOffset },
                style: { 
                    background: level === 0 ? '#008069' : level === 1 ? '#e6f3f0' : '#fff',
                    color: level === 0 ? '#fff' : '#333',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px',
                    width: 250,
                    fontSize: '0.9rem',
                    textAlign: 'left'
                }
            });

            if (parentId) {
                flowEdges.push({
                    id: `e-${parentId}-${nodeId}`,
                    source: parentId,
                    target: nodeId,
                    animated: true,
                    style: { stroke: '#008069' }
                });
            }

            yOffset += 180; // Increased spacing for content

            if (item.children && Array.isArray(item.children)) {
                item.children.forEach((child, index) => {
                    traverse(child, nodeId, x + 300, level + 1);
                });
            }
        };

        traverse(data);
        return { flowNodes, flowEdges };
    }, []);

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const res = await api.get('/data/documents');
                const doc = res.data.find(d => d.doc_id === id);
                if (doc) {
                    setDocumentData(doc.doc_json);
                    const { flowNodes, flowEdges } = transformData(doc.doc_json);
                    setNodes(flowNodes);
                    setEdges(flowEdges);
                }
            } catch (err) {
                console.error('Error fetching document', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();
    }, [id, transformData]);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    const onNodeClick = (event, node) => {
        setSelectedNode(node);
    };

    const handleUpdateNode = () => {
        if (!selectedNode) return;

        // Recursive function to update title and content in the JSON tree
        const updateInTree = (item) => {
            if (item.id === selectedNode.id || (item.title === selectedNode.data.title && !item.id)) {
                return { 
                    ...item, 
                    title: selectedNode.data.title,
                    content: selectedNode.data.content 
                };
            }
            if (item.children) {
                return {
                    ...item,
                    children: item.children.map(updateInTree)
                };
            }
            return item;
        };

        const updatedData = updateInTree(documentData);
        setDocumentData(updatedData);
        
        // Update nodes locally with the new visual label
        setNodes(nds => nds.map(n => {
            if (n.id === selectedNode.id) {
                return { 
                    ...n, 
                    data: { 
                        ...n.data, 
                        title: selectedNode.data.title,
                        content: selectedNode.data.content,
                        label: (
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px', borderBottom: selectedNode.data.content ? '1px solid rgba(0,0,0,0.05)' : 'none', paddingBottom: selectedNode.data.content ? '4px' : 0 }}>
                                    {selectedNode.data.title}
                                </div>
                                {selectedNode.data.content && (
                                    <div style={{ fontSize: '0.75rem', color: n.style.background === '#008069' ? 'rgba(255,255,255,0.9)' : '#666', lineHeight: 1.4, maxHeight: '60px', overflow: 'hidden' }}>
                                        {selectedNode.data.content}
                                    </div>
                                )}
                            </div>
                        )
                    } 
                };
            }
            return n;
        }));

        setSelectedNode(null);
    };

    const handleDeleteNode = () => {
        if (!selectedNode) return;

        // Recursive function to remove node from JSON tree
        const deleteFromTree = (item) => {
            if (item.children) {
                const filteredChildren = item.children.filter(child => child.id !== selectedNode.id);
                if (filteredChildren.length !== item.children.length) {
                    return { ...item, children: filteredChildren };
                }
                return {
                    ...item,
                    children: item.children.map(deleteFromTree)
                };
            }
            return item;
        };

        const updatedData = deleteFromTree(documentData);
        setDocumentData(updatedData);

        // Update Flow UI
        setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
        setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
        
        setSelectedNode(null);
        setShowDeleteModal(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/data/documents/${id}`, { doc_json: documentData });
            toast.success('Knowledge Base updated successfully!');
        } catch (err) {
            console.error('Error saving document', err);
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handlePermanentDelete = async () => {
        try {
            await api.delete(`/data/documents/${id}`);
            toast.success('Document deleted');
            navigate('/documents');
        } catch (err) {
            console.error('Error deleting document', err);
            toast.error('Failed to delete document');
        }
    };

    if (loading) return <div className="empty-state">Loading visual editor...</div>;

    return (
        <div style={{ height: 'calc(100vh - 120px)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', background: '#fff', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0 }}>{documentData?.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Click a node to edit or delete its title</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/documents')} className="badge" style={{ cursor: 'pointer', border: '1px solid #ddd' }}>Back</button>
                    <button onClick={() => setShowDeleteModal(true)} className="badge badge-error" style={{ cursor: 'pointer', border: 'none', background: '#f8d7da', color: '#721c24' }}>Delete Document</button>
                    <button onClick={handleSave} className="save-btn" disabled={saving} style={{ padding: '0.5rem 1.5rem' }}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div style={{ flex: 1 }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    fitView
                >
                    <Background color="#aaa" gap={16} />
                    <Controls />
                    <MiniMap />
                </ReactFlow>
            </div>

            {/* Edit Sidebar/Modal */}
            {selectedNode && (
                <div style={{ 
                    position: 'absolute', 
                    right: '20px', 
                    top: '80px', 
                    width: '300px', 
                    background: 'white', 
                    padding: '20px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)', 
                    borderRadius: '12px',
                    zIndex: 1000,
                    border: '1px solid var(--border-color)'
                }}>
                    <h4 style={{ marginTop: 0 }}>Edit Section</h4>
                    <div className="form-group">
                        <label>Title</label>
                        <input 
                            type="text" 
                            value={selectedNode.data.title} 
                            onChange={(e) => setSelectedNode({
                                ...selectedNode,
                                data: { ...selectedNode.data, title: e.target.value }
                            })}
                        />
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Content</label>
                        <textarea 
                            rows="4"
                            value={selectedNode.data.content} 
                            onChange={(e) => setSelectedNode({
                                ...selectedNode,
                                data: { ...selectedNode.data, content: e.target.value }
                            })}
                            style={{ width: '100%', borderRadius: '6px', border: '1px solid #ddd', padding: '8px', fontSize: '0.85rem' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                        <button className="save-btn" onClick={handleUpdateNode} style={{ flex: 1, padding: '0.5rem' }}>Update</button>
                        <button onClick={handleDeleteNode} style={{ flex: 1, padding: '0.5rem', background: '#fff', border: '1px solid #e63946', color: '#e63946', borderRadius: '6px', cursor: 'pointer' }}>Remove</button>
                    </div>
                    <button onClick={() => setSelectedNode(null)} style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>Cancel</button>
                </div>
            )}

            {/* Confirmation Modal for Permanent Delete */}
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
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <h3>Delete Knowledge Base?</h3>
                        <p style={{ color: '#666', marginBottom: '2rem' }}>This will permanently remove the entire knowledge base. This action cannot be undone.</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #ddd', background: '#fff', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handlePermanentDelete} style={{ flex: 1, padding: '0.8rem', border: 'none', background: '#e63946', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentEditor;

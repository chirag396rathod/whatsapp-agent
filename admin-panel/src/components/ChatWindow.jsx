import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import moment from 'moment-timezone';
import { formatDateTime, timeAgo } from '../utils/dateUtils';

const safeParse = (data) => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
};

/**
 * Converts WhatsApp-style markdown to safe HTML for display in the CRM chat.
 * Handles: *bold*, _italic_, ~strikethrough~, newlines, and bullet lists.
 */
const formatWhatsAppMessage = (text) => {
    if (!text) return '';
    let html = text
        // Escape any real HTML to prevent XSS
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // *bold*
        .replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>')
        // _italic_
        .replace(/_(.*?)_/g, '<em>$1</em>')
        // ~strikethrough~
        .replace(/~(.*?)~/g, '<del>$1</del>')
        // ```code```
        .replace(/```([\s\S]*?)```/g, '<code>$1</code>')
        // Bullet lines starting with - or •
        .replace(/^[\-•]\s+(.+)$/gm, '<li>$1</li>')
        // Newlines → <br>
        .replace(/\n/g, '<br />');

    // Wrap consecutive <li> blocks in a <ul>
    html = html.replace(/(<li>.*?<\/li>)(<br \/>)?/g, '$1');
    if (html.includes('<li>')) {
        html = html.replace(/(<li>(?:.*?<br \/>)*.*?<\/li>)+/g, '<ul style="margin:4px 0 4px 16px;padding:0;">$&</ul>');
    }

    return html;
};

const ChatWindow = ({ customer, onClose, client }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [conclusion, setConclusion] = useState(safeParse(customer.conclusion));
    const [conclusionGeneratedAt, setConclusionGeneratedAt] = useState(null);
    const [loadingConclusion, setLoadingConclusion] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const res = await api.get(`/data/customers/${customer.phone_number}`);
                console.log('Latest customer data received:', res.data);
                if (res.data.conclusion) {
                    setConclusion(safeParse(res.data.conclusion));
                }
            } catch (err) {
                console.error('Error fetching latest customer data:', err);
            }
        };

        if (customer) {
            fetchCustomerData();
        }
    }, [customer.phone_number]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                // Fetch all activity and filter by phone
                const res = await api.get('/data/activity');
                const customerMessages = res.data
                    .filter(log => log.customer_phone === customer.phone_number)
                    .sort((a, b) => moment(a.created_at).valueOf() - moment(b.created_at).valueOf());
                setMessages(customerMessages);
            } catch (err) {
                console.error('Error fetching messages:', err);
            } finally {
                setLoading(false);
                setTimeout(scrollToBottom, 100);
            }
        };

        if (customer) {
            fetchMessages();
            // Slow down refresh to every 15 seconds to avoid excessive API calls
            const interval = setInterval(fetchMessages, 15000);
            return () => clearInterval(interval);
        }
    }, [customer]);

    useEffect(scrollToBottom, [messages]);

    const formatTime = (dateString) => {
        return formatDateTime(dateString, 'hh:mm A');
    };

    const fetchConclusion = async () => {
        setLoadingConclusion(true);
        try {
            const res = await api.post('/data/conclusion', {
                phone: customer.phone_number
            });
            console.log('Conclusion generated:', res.data);
            setConclusion(safeParse(res.data));
            setConclusionGeneratedAt(new Date()); // capture exact time of generation
        } catch (err) {
            console.error('Error fetching conclusion:', err);
            alert('Failed to get conclusion. Please try again.');
        } finally {
            setLoadingConclusion(false);
        }
    };

    const handleInsertBusinessCard = () => {
        if (!client) return;
        const cardText = `*${client.client_name || 'Business Name'}*\n📞 Support: ${client.phone_number || 'N/A'}\n✉️ Email: ${client.email || 'N/A'}\n\n_We are here to help!_`;
        setNewMessage(prev => prev ? prev + '\n\n' + cardText : cardText);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        setSendingMessage(true);
        try {
            await api.post('/data/send-message', {
                phone: customer.phone_number,
                message: newMessage
            });
            setNewMessage('');
            // Fetch messages immediately to show the new one
            const res = await api.get('/data/activity');
            const customerMessages = res.data
                .filter(log => log.customer_phone === customer.phone_number)
                .sort((a, b) => moment(a.created_at).valueOf() - moment(b.created_at).valueOf());
            setMessages(customerMessages);
            setTimeout(scrollToBottom, 100);
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Failed to send message. Check console for details.');
        } finally {
            setSendingMessage(false);
        }
    };

    const groupMessagesByDate = (msgs) => {
        const groups = {};
        msgs.forEach(msg => {
            const date = formatDateTime(msg.created_at, 'DD MMM YYYY');
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    };

    if (!customer) return null;

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <div className="chat-window-overlay" onClick={onClose}>
            <div className="chat-window-container" onClick={e => e.stopPropagation()}>
                <div className="chat-header">
                    <div className="chat-header-info">
                        <button className="chat-close-btn" style={{ marginRight: '10px' }} onClick={onClose}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                            </svg>
                        </button>
                        <div className="chat-avatar" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' }}>
                            {(customer.name || customer.phone_number || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ marginLeft: '5px' }}>
                            <h3 className="chat-name">{customer.name || 'Anonymous User'}</h3>
                            <p className="chat-status">
                                <span style={{ color: '#00a884', fontSize: '0.7rem' }}>●</span> Active {timeAgo(customer.last_interaction)}
                            </p>
                        </div>
                    </div>
                    <button 
                        className="chat-conclusion-btn" 
                        onClick={fetchConclusion}
                        disabled={loadingConclusion}
                    >
                        {loadingConclusion ? 'Generating...' : '✨ Latest Conclusion'}
                    </button>
                </div>

                <div className="chat-messages">
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', background: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
                            <div className="skeleton" style={{ width: '100px', height: '20px' }}></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                            <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</span>
                            <p>No conversation history yet</p>
                        </div>
                    ) : (
                        Object.keys(groupedMessages).map(date => (
                            <React.Fragment key={date}>
                                <div className="chat-date-separator">{date}</div>
                                {groupedMessages[date].map(msg => (
                                    <div 
                                        key={msg.id} 
                                        className={`message-bubble ${msg.type === 'incoming' ? 'message-incoming' : 'message-outgoing'}`}
                                    >
                                        <span className="message-type-tag">
                                            {msg.type === 'incoming' ? 'User' : 'System/AI'}
                                        </span>
                                        {msg.type === 'incoming' ? (
                                            // User messages: plain text
                                            <span>{msg.message || msg.description}</span>
                                        ) : (
                                            // System/AI messages: render WhatsApp markdown as HTML
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: formatWhatsAppMessage(msg.message || msg.description)
                                                }}
                                            />
                                        )}
                                        <span className="message-time">{formatTime(msg.created_at)}</span>
                                    </div>
                                ))}
                            </React.Fragment>
                        ))
                    )}
                    
                    {conclusion && (() => {
                        const toTime   = conclusionGeneratedAt || new Date();
                        const fromTime = new Date(toTime.getTime() - 24 * 60 * 60 * 1000);
                        const fmt = (d) => d.toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', hour12: true
                        });
                        return (
                            <div className="conclusion-card" style={{ marginTop: '2rem' }}>
                                <div className="conclusion-title">
                                    💡 <span>AI Chat Summary</span>
                                </div>
                                {/* Time range badge */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: 'rgba(0,168,132,0.08)', border: '1px solid rgba(0,168,132,0.2)',
                                    borderRadius: '8px', padding: '6px 10px', marginBottom: '12px',
                                    fontSize: '0.72rem', color: 'var(--text-secondary)', flexWrap: 'wrap'
                                }}>
                                    <span>🕐</span>
                                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>From:</span>
                                    <span>{fmt(fromTime)}</span>
                                    <span style={{ color: 'var(--text-secondary)', margin: '0 2px' }}>→</span>
                                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>To:</span>
                                    <span>{fmt(toTime)}</span>
                                </div>
                                <div className="conclusion-section">
                                    <div className="conclusion-label">User's Questions</div>
                                    <div className="conclusion-text">{conclusion.userAsks}</div>
                                </div>
                                <div className="conclusion-section">
                                    <div className="conclusion-label">AI's Solutions</div>
                                    <div className="conclusion-text">{conclusion.aiSolutions}</div>
                                </div>
                                <button
                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}
                                    onClick={() => { setConclusion(null); setConclusionGeneratedAt(null); }}
                                >
                                    Dismiss
                                </button>
                            </div>
                        );
                    })()}
                    
                    <div ref={messagesEndRef} />
                </div>
                
                <div style={{
                    padding: '0.5rem 1.5rem',
                    background: 'var(--white)',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <button 
                        onClick={handleInsertBusinessCard}
                        style={{ 
                            background: 'var(--white)', 
                            color: 'var(--text-secondary)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '6px', 
                            padding: '0.3rem 0.6rem', 
                            fontSize: '0.7rem', 
                            cursor: 'pointer',
                            fontWeight: '600',
                            marginLeft: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        + Insert Business Card
                    </button>
                </div>
                <div style={{
                    padding: '0.5rem 1.5rem 1rem',
                    background: 'var(--white)',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-end'
                }}>
                    <textarea 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Type a manual message... (Shift+Enter for new line)"
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '24px',
                            resize: 'none',
                            maxHeight: '120px',
                            minHeight: '45px',
                            fontFamily: 'inherit',
                            fontSize: '0.95rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                        rows={newMessage.split('\n').length > 1 ? Math.min(newMessage.split('\n').length, 4) : 1}
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={sendingMessage || !newMessage.trim()}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: sendingMessage || !newMessage.trim() ? 'not-allowed' : 'pointer',
                            opacity: sendingMessage || !newMessage.trim() ? 0.6 : 1,
                            transition: 'all 0.2s',
                            flexShrink: 0
                        }}
                    >
                        {sendingMessage ? (
                            <div className="skeleton" style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                        ) : (
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;

import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';

const CheckIcon = () => (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <rect width="20" height="20" rx="10" fill="rgba(0, 128, 105, 0.15)"/>
        <path d="M14.6666 6.5L8.24992 12.9167L5.33325 10" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const GreyCheckIcon = () => (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <rect width="20" height="20" rx="10" fill="rgba(100, 116, 139, 0.1)"/>
        <path d="M14.6666 6.5L8.24992 12.9167L5.33325 10" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const FeatureCard = ({ icon, title, desc }) => (
    <div style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '1rem', flex: '1', minWidth: '250px' }}>
        <div style={{ fontSize: '2rem', background: 'rgba(0,128,105,0.08)', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>{icon}</div>
        <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>{title}</h4>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>{desc}</p>
    </div>
);

const Plans = () => {
    const { refreshProfile } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const res = await api.post('/data/subscribe');
            if (res.data.success) {
                toast.success(res.data.message);
                await refreshProfile();
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Subscription error:', err);
            toast.error(err.response?.data?.error || 'Failed to process subscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem 1rem 5rem', maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* Marketing Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ display: 'inline-block', background: 'rgba(0,128,105,0.1)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', marginBottom: '1.5rem', letterSpacing: '0.5px' }}>
                    🚀 AUTOMATE YOUR BUSINESS 24/7
                </div>
                <h1 style={{ 
                    margin: '0 0 1.5rem 0', 
                    fontSize: '3.2rem', 
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-1.5px',
                    lineHeight: '1.2'
                }}>
                    Stop answering the same<br/>questions over and over.
                </h1>
                <p style={{ margin: '0 auto', color: '#475569', fontSize: '1.2rem', maxWidth: '700px', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    Turn your WhatsApp into a sales and support machine. Let our AI instantly handle customer inquiries while you focus on closing deals and growing your business.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontWeight: '600', color: 'var(--primary)', fontSize: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>✅ 7-Day Free Trial</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>✅ Free Onboarding Support</span>
                </div>
            </div>

            {/* Pricing Section */}
            <div style={{ 
                display: 'flex', 
                gap: '2.5rem', 
                justifyContent: 'center', 
                alignItems: 'stretch',
                maxWidth: '900px',
                margin: '0 auto 5rem'
            }}>
                {/* Pro Plan */}
                <div style={{ 
                    flex: '1',
                    width: '50%',
                    background: '#ffffff',
                    padding: '3rem 2.5rem',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: '2px solid var(--primary)',
                    boxShadow: '0 20px 40px -15px rgba(0, 128, 105, 0.15)',
                    transform: 'scale(1.02)',
                    zIndex: 10
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '-14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #00A884, var(--primary))',
                        color: 'white',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        letterSpacing: '1px',
                        boxShadow: '0 4px 12px rgba(0, 128, 105, 0.3)'
                    }}>
                        RECOMMENDED
                    </div>
                    
                    <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem', color: 'var(--text-main)', fontWeight: '700' }}>Pro Automation</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', minHeight: '40px' }}>
                        Everything you need to automate support and capture leads on WhatsApp.
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '2.5rem' }}>
                        <span style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1' }}>₹3000</span>
                        <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>/month</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '3rem', flexGrow: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(0,128,105,0.05)', padding: '10px', borderRadius: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🎁</span>
                            <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1rem' }}>7-Day Free Trial & Setup Support</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <CheckIcon />
                            <span style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '1rem' }}>₹2000 Usage Wallet Included</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <CheckIcon />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Full AI Chat Automation (24/7)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <CheckIcon />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Train AI on your own Documents</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <CheckIcon />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Expert 1-on-1 Onboarding Support</span>
                        </div>
                    </div>

                    <button 
                        style={{ 
                            width: '100%', 
                            padding: '1.1rem', 
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #00A884, var(--primary))',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            boxShadow: '0 8px 20px -6px rgba(0, 128, 105, 0.4)',
                            transition: 'all 0.2s ease',
                            opacity: loading ? 0.7 : 1
                        }}
                        onMouseOver={(e) => {
                            if(!loading) e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                            if(!loading) e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        onClick={handleSubscribe}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Upgrade Now'}
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                        Cancel anytime. No hidden fees.
                    </div>
                </div>

                {/* Custom Plan */}
                <div style={{ 
                    flex: '1',
                    width: '50%',
                    background: '#f8fafc',
                    padding: '3rem 2.5rem',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem', color: 'var(--text-main)', fontWeight: '700' }}>Enterprise</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', minHeight: '40px' }}>
                        For agencies and high-volume businesses needing custom solutions.
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '2.5rem' }}>
                        <span style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1' }}>Custom</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '3rem', flexGrow: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <GreyCheckIcon />
                            <span style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '1rem' }}>Everything in Pro</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <GreyCheckIcon />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Custom AI Model Fine-tuning</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <GreyCheckIcon />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Unlimited Knowledge Base Size</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <GreyCheckIcon />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>API Access & Webhooks</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <GreyCheckIcon />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Priority 24/7 SLA Support</span>
                        </div>
                    </div>

                    <a 
                        href="mailto:support@solexpert.in?subject=Enterprise Plan Inquiry"
                        style={{ 
                            display: 'block', 
                            textAlign: 'center', 
                            width: '100%', 
                            padding: '1.1rem', 
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            background: 'transparent',
                            color: 'var(--text-main)',
                            border: '2px solid #cbd5e1',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            boxSizing: 'border-box'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#94a3b8';
                            e.currentTarget.style.background = '#f1f5f9';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        Contact Sales
                    </a>
                </div>
            </div>

            {/* Value Proposition / Benefits Section */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Why Upgrade to Pro?</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Join the businesses saving hundreds of hours every month.</p>
                
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', textAlign: 'left' }}>
                    <FeatureCard 
                        icon="⏰" 
                        title="Instant Responses" 
                        desc="Never make a customer wait. The AI replies in seconds, 24/7, even on weekends and holidays."
                    />
                    <FeatureCard 
                        icon="🧠" 
                        title="Smart Memory" 
                        desc="Unlike dumb chatbots, our AI understands context, remembers the conversation, and sounds completely human."
                    />
                    <FeatureCard 
                        icon="💰" 
                        title="Reduce Costs" 
                        desc="Handling 1,000 queries with AI costs pennies compared to hiring a massive customer support team."
                    />
                </div>
            </div>
            
            <div style={{ 
                textAlign: 'center', 
                color: '#64748b', 
                background: '#f1f5f9',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                fontSize: '0.9rem',
                fontWeight: '500'
            }}>
                <span style={{ marginRight: '8px' }}>💡</span>
                AI Usage Costs are deducted from your Wallet Balance at ₹840 per 1M tokens (approx $10 USD markup).
            </div>
        </div>
    );
};

export default Plans;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('error') === 'expired') {
            toast.error('Token is not valid. Please login again.', { id: 'session-expired' });
            // Clean up the URL
            navigate('/login', { replace: true });
        }
    }, [location, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('client', JSON.stringify(res.data.client));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p>Login to manage your WhatsApp bot</p>
                {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@company.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="add-account-btn" style={{ width: '100%', marginTop: '1rem' }}>
                        Sign In
                    </button>
                </form>
                <div className="auth-footer">
                    New to SolExpert? <Link to="/register">Create an account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet, Navigate } from 'react-router-dom';
import api from '../api';

const Layout = () => {
    const [client, setClient] = useState(() => {
        const saved = localStorage.getItem('client');
        return saved ? JSON.parse(saved) : null;
    });
    const token = localStorage.getItem('token');
    
    useEffect(() => {
        if (token) {
            api.get('/data/profile')
                .then(res => {
                    setClient(res.data);
                    localStorage.setItem('client', JSON.stringify(res.data));
                })
                .catch(err => console.error(err));
        }
    }, [token]);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-wrapper">
                <Header client={client} />
                <main className="content-body">
                    <Outlet context={{ client }} />
                </main>
            </div>
        </div>
    );
};

export default Layout;

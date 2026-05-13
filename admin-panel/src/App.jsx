import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import CustomersList from './components/CustomersList';
import DocumentsList from './components/DocumentsList';
import DocumentEditor from './components/DocumentEditor';
import ActivityList from './components/ActivityList';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Plans from './components/Plans';
import { Toaster } from 'react-hot-toast';
import './index.css';

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<CustomersList />} />
          <Route path="/documents" element={<DocumentsList />} />
          <Route path="/documents/edit/:id" element={<DocumentEditor />} />
          <Route path="/activity" element={<ActivityList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/plans" element={<Plans />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

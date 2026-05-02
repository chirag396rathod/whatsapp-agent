const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../authMiddleware');

// @route   GET api/data/customers
// @desc    Get all customers for the logged in client
router.get('/customers', authMiddleware, async (req, res) => {
    try {
        const customers = await pool.query(
            'SELECT * FROM customers WHERE client_id = $1 ORDER BY created_at DESC',
            [req.client.client_id]
        );
        res.json(customers.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/data/activity
// @desc    Get all activity logs for the logged in client
router.get('/activity', authMiddleware, async (req, res) => {
    try {
        const activity = await pool.query(
            'SELECT * FROM activity WHERE client_id = $1 ORDER BY created_at DESC',
            [req.client.client_id]
        );
        res.json(activity.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/data/documents
// @desc    Get all documents for the logged in client
router.get('/documents', authMiddleware, async (req, res) => {
    try {
        const documents = await pool.query(
            'SELECT * FROM documents WHERE client_id = $1 ORDER BY created_at DESC',
            [req.client.client_id]
        );
        res.json(documents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/data/profile
// @desc    Get current client profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const client = await pool.query(
            'SELECT client_id, client_name, email, phone_number, wbi, recharge, status, auth_token, pin_id, created_at FROM clients WHERE client_id = $1',
            [req.client.client_id]
        );
        res.json(client.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/data/profile/update
// @desc    Update client profile/settings
router.post('/profile/update', authMiddleware, async (req, res) => {
    const { client_name, phone_number, wbi, auth_token, pin_id } = req.body;
    
    if (!req.client || !req.client.client_id) {
        return res.status(401).json({ error: 'User context missing' });
    }

    try {
        const query = `
            UPDATE clients 
            SET client_name = $1, 
                phone_number = $2, 
                wbi = $3, 
                auth_token = $4, 
                pin_id = $5 
            WHERE client_id = $6 
            RETURNING *`;
            
        const values = [
            client_name || null, 
            phone_number || null, 
            wbi || null, 
            auth_token || null, 
            pin_id || null, 
            req.client.client_id
        ];

        const updatedClient = await pool.query(query, values);

        if (updatedClient.rows.length === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }

        res.json(updatedClient.rows[0]);
    } catch (err) {
        console.error('Update Profile Error:', err.message);
        res.status(500).json({ error: 'Failed to update profile: ' + err.message });
    }
});

// @route   POST api/data/documents
// @desc    Create a new document
router.post('/documents', authMiddleware, async (req, res) => {
    const { doc_json } = req.body;
    try {
        const newDoc = await pool.query(
            'INSERT INTO documents (client_id, doc_json) VALUES ($1, $2) RETURNING *',
            [req.client.client_id, JSON.stringify(doc_json)]
        );
        res.json(newDoc.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/data/documents/:id
// @desc    Update a document JSON
router.put('/documents/:id', authMiddleware, async (req, res) => {
    const { doc_json } = req.body;
    try {
        const updatedDoc = await pool.query(
            'UPDATE documents SET doc_json = $1 WHERE doc_id = $2 AND client_id = $3 RETURNING *',
            [JSON.stringify(doc_json), req.params.id, req.client.client_id]
        );
        
        if (updatedDoc.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        
        res.json(updatedDoc.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/data/documents/:id
// @desc    Delete a document
router.delete('/documents/:id', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM documents WHERE doc_id = $1 AND client_id = $2 RETURNING *',
            [req.params.id, req.client.client_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        
        res.json({ message: 'Document deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

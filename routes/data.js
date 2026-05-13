const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../authMiddleware');
const sendMessage = require('../services/whatsappService');
const { getChatSummary } = require('../services/conclusionService');

// @route   GET api/data/customers
// @desc    Get all customers for the logged in client
router.get('/customers', authMiddleware, async (req, res) => {
    try {
        const customers = await pool.query(
            'SELECT *, conclusion FROM customers WHERE client_id = $1 ORDER BY created_at DESC',
            [req.client.client_id]
        );
        res.json(customers.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/data/customers/:phone
// @desc    Get a single customer by phone number
router.get('/customers/:phone', authMiddleware, async (req, res) => {
    try {
        const customer = await pool.query(
            'SELECT *, conclusion FROM customers WHERE client_id = $1 AND phone_number = $2',
            [req.client.client_id, req.params.phone]
        );
        
        if (customer.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json(customer.rows[0]);
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

// @route   POST api/data/send-message
// @desc    Send a WhatsApp message to a customer
router.post('/send-message', authMiddleware, async (req, res) => {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
        return res.status(400).json({ error: 'Phone and message are required' });
    }

    try {
        // Get client credentials
        const clientRes = await pool.query(
            'SELECT auth_token, pin_id, client_id FROM clients WHERE client_id = $1',
            [req.client.client_id]
        );

        if (clientRes.rows.length === 0) {
            return res.status(404).json({ error: 'Client credentials not found' });
        }

        const client = clientRes.rows[0];
        const credentials = {
            accessToken: client.auth_token,
            phoneId: client.pin_id,
            clientId: client.client_id
        };

        // Send message via WhatsApp service
        await sendMessage(phone, message, credentials);

        res.json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        console.error('Send Message Error:', err.message);
        res.status(500).json({ error: 'Failed to send message: ' + err.message });
    }
});

// @route   POST api/data/conclusion
// @desc    Get AI conclusion of the last 24h chat
router.post('/conclusion', authMiddleware, async (req, res) => {
    const { phone } = req.body;
    
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    try {
        // Fetch activity logs for the last 24 hours for this customer
        const activityRes = await pool.query(
            `SELECT * FROM activity 
             WHERE client_id = $1 
             AND customer_phone = $2 
             AND created_at > NOW() - INTERVAL '24 hours'
             ORDER BY created_at ASC`,
            [req.client.client_id, phone]
        );

        const summary = await getChatSummary(activityRes.rows, req.client.client_id);

        // Save conclusion to database
        const updateRes = await pool.query(
            'UPDATE customers SET conclusion = $1 WHERE client_id = $2 AND phone_number = $3',
            [JSON.stringify(summary), req.client.client_id, phone]
        );
        
        console.log(`Conclusion generated and saved for ${phone}. Rows affected: ${updateRes.rowCount}`);

        res.json(summary);
    } catch (err) {
        console.error('Conclusion Error:', err.message);
        res.status(500).json({ error: 'Failed to generate conclusion' });
    }
});

// @route   POST api/data/subscribe
// @desc    Subscribe to Pro plan and add balance
router.post('/subscribe', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'UPDATE clients SET plan_id = 1, recharge = recharge + 2000 WHERE client_id = $1 RETURNING recharge, plan_id',
            [req.client.client_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        res.json({ success: true, message: 'Subscribed to Pro Plan! ₹2000 added to wallet.', client: result.rows[0] });
    } catch (err) {
        console.error('Subscribe Error:', err.message);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

module.exports = router;

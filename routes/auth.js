const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// @route   POST api/auth/register
// @desc    Register a client
router.post('/register', async (req, res) => {
    const { client_name, email, password, phone_number, wbi } = req.body;

    try {
        let client = await pool.query('SELECT * FROM clients WHERE email = $1', [email]);
        if (client.rows.length > 0) {
            return res.status(400).json({ error: 'Client already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newClient = await pool.query(
            'INSERT INTO clients (client_name, email, password, phone_number, wbi) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [client_name, email, hashedPassword, phone_number, wbi]
        );

        const payload = {
            client_id: newClient.rows[0].client_id,
            email: newClient.rows[0].email
        };

        jwt.sign(
            payload,
            process.env.APP_SECRATE || 'secret',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, client: newClient.rows[0] });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate client & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let client = await pool.query('SELECT * FROM clients WHERE email = $1', [email]);
        if (client.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, client.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        const payload = {
            client_id: client.rows[0].client_id,
            email: client.rows[0].email
        };

        jwt.sign(
            payload,
            process.env.APP_SECRATE || 'secret',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, client: client.rows[0] });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/reset-password
// @desc    Reset client password
router.post('/reset-password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    try {
        let client = await pool.query('SELECT * FROM clients WHERE email = $1', [email]);
        if (client.rows.length === 0) {
            return res.status(400).json({ error: 'Client not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, client.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid old password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        await pool.query(
            'UPDATE clients SET password = $1 WHERE email = $2',
            [hashedNewPassword, email]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

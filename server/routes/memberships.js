const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Process membership payment
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, membership_type, payment_id } = req.body;

    if (!email || !password || !membership_type) {
      return res.status(400).json({ error: 'Email, password, and membership type are required' });
    }

    // Check if user exists
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with membership
    const [result] = await db.execute(
      'INSERT INTO users (email, password, name, membership_type, membership_status) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, name, membership_type, 'active']
    );

    // Create order record
    const registrationFee = membership_type === 'family' ? 30 : 10;
    await db.execute(
      'INSERT INTO orders (user_id, total_amount, status, payment_method, payment_id) VALUES (?, ?, ?, ?, ?)',
      [result.insertId, registrationFee, 'paid', 'credit_card', payment_id || 'pending']
    );

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: result.insertId, email, role: 'member' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Membership registration successful',
      token,
      user: {
        id: result.insertId,
        email,
        name,
        membership_type,
        membership_status: 'active'
      }
    });
  } catch (error) {
    console.error('Membership registration error:', error);
    res.status(500).json({ error: 'Membership registration failed' });
  }
});

// Get membership info
router.get('/info', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const [users] = await db.execute(
      'SELECT id, email, name, membership_type, membership_status, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;

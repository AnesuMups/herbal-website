const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { sendWhatsAppMessage } = require('../services/whatsapp');

// Create consultation
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      age,
      medical_history,
      infection_details,
      was_chronic,
      current_condition,
      other_treatment
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !age) {
      return res.status(400).json({ error: 'Name, email, phone, and age are required' });
    }

    if (age < 18 || age > 80) {
      return res.status(400).json({ error: 'Age must be between 18 and 80' });
    }

    // Get user_id if logged in
    let userId = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.userId;
      } catch (e) {
        // Token invalid, continue as guest
      }
    }

    // Insert consultation
    const [result] = await db.execute(
      `INSERT INTO consultations 
      (user_id, name, email, phone, age, medical_history, infection_details, was_chronic, current_condition, other_treatment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, email, phone, age, medical_history, infection_details, was_chronic ? 1 : 0, current_condition, other_treatment]
    );

    // Send WhatsApp notification
    try {
      await sendWhatsAppMessage(
        phone,
        `Thank you ${name}! Your consultation request has been received. We will review your medical history and get back to you soon.`
      );
      await db.execute(
        'UPDATE consultations SET whatsapp_sent = TRUE WHERE id = ?',
        [result.insertId]
      );
    } catch (whatsappError) {
      console.error('WhatsApp error:', whatsappError);
      // Don't fail the request if WhatsApp fails
    }

    res.status(201).json({
      message: 'Consultation submitted successfully',
      consultationId: result.insertId
    });
  } catch (error) {
    console.error('Consultation error:', error);
    res.status(500).json({ error: 'Failed to submit consultation' });
  }
});

// Get all consultations (admin only)
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const [users] = await db.execute('SELECT role FROM users WHERE id = ?', [decoded.userId]);
    if (!users || users.length === 0 || !['admin', 'demo_steward', 'demo_loans'].includes(users[0].role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const [consultations] = await db.execute(
      'SELECT * FROM consultations ORDER BY created_at DESC'
    );

    res.json(consultations);
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

// Get consultation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [consultations] = await db.execute(
      'SELECT * FROM consultations WHERE id = ?',
      [id]
    );

    if (!consultations || consultations.length === 0) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    res.json(consultations[0]);
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({ error: 'Failed to fetch consultation' });
  }
});

// Update consultation status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const [users] = await db.execute('SELECT role FROM users WHERE id = ?', [decoded.userId]);
    if (!users || users.length === 0 || !['admin', 'demo_steward', 'demo_loans'].includes(users[0].role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await db.execute(
      'UPDATE consultations SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;

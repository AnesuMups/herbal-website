const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware to check admin access
const checkAdmin = async (req, res, next) => {
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

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get dashboard stats
router.get('/dashboard', checkAdmin, async (req, res) => {
  try {
    const [consultations] = await db.execute('SELECT COUNT(*) as total FROM consultations');
    const [pendingConsultations] = await db.execute('SELECT COUNT(*) as total FROM consultations WHERE status = "pending"');
    const [members] = await db.execute('SELECT COUNT(*) as total FROM users WHERE role = "member"');
    const [testimonials] = await db.execute('SELECT COUNT(*) as total FROM testimonials');
    const [orders] = await db.execute('SELECT COUNT(*) as total FROM orders');

    res.json({
      consultations: consultations[0].total,
      pendingConsultations: pendingConsultations[0].total,
      members: members[0].total,
      testimonials: testimonials[0].total,
      orders: orders[0].total
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Create treatment record
const upload = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/treatments';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const multerUpload = multer({ storage: upload, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/treatment-records', checkAdmin, multerUpload.array('images', 10), async (req, res) => {
  try {
    const { consultation_id, treatment_plan, notes, outcome } = req.body;

    const imageUrls = req.files ? req.files.map(file => `/uploads/treatments/${file.filename}`) : [];

    const [result] =       await db.execute(
        'INSERT INTO treatment_records (consultation_id, treatment_plan, images, notes, outcome) VALUES (?, ?, ?, ?, ?)',
        [consultation_id, treatment_plan, imageUrls.length > 0 ? JSON.stringify(imageUrls) : null, notes, outcome]
      );

    res.status(201).json({
      message: 'Treatment record created successfully',
      recordId: result.insertId
    });
  } catch (error) {
    console.error('Create treatment record error:', error);
    res.status(500).json({ error: 'Failed to create treatment record' });
  }
});

// Get treatment records
router.get('/treatment-records', checkAdmin, async (req, res) => {
  try {
    const { consultation_id } = req.query;
    let query = 'SELECT * FROM treatment_records';
    const params = [];

    if (consultation_id) {
      query += ' WHERE consultation_id = ?';
      params.push(consultation_id);
    }

    query += ' ORDER BY created_at DESC';

    const [records] = await db.execute(query, params);
    res.json(records);
  } catch (error) {
    console.error('Get treatment records error:', error);
    res.status(500).json({ error: 'Failed to fetch treatment records' });
  }
});

// Get reports
router.get('/reports', checkAdmin, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let consultationQuery = 'SELECT * FROM consultations WHERE 1=1';
    const params = [];

    if (start_date) {
      consultationQuery += ' AND created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      consultationQuery += ' AND created_at <= ?';
      params.push(end_date);
    }

    consultationQuery += ' ORDER BY created_at DESC';

    const [consultations] = await db.execute(consultationQuery, params);
    const [orders] = await db.execute('SELECT * FROM orders ORDER BY created_at DESC');
    const [testimonials] = await db.execute('SELECT * FROM testimonials ORDER BY created_at DESC');

    res.json({
      consultations,
      orders,
      testimonials
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

module.exports = router;

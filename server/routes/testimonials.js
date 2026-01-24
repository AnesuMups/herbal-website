const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/testimonials';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all approved testimonials
router.get('/', async (req, res) => {
  try {
      const [testimonials] = await db.execute(
        'SELECT * FROM testimonials WHERE approved = 1 ORDER BY created_at DESC'
      );
    res.json(testimonials);
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Create testimonial
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { name, testimonial, rating, consultation_id, treatment_details } = req.body;
    
    let userId = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.userId;
      } catch (e) {
        // Continue without user
      }
    }

    const imageUrls = req.files ? req.files.map(file => `/uploads/testimonials/${file.filename}`) : [];

    const [result] =       await db.execute(
        'INSERT INTO testimonials (user_id, consultation_id, name, testimonial, rating, images, treatment_details, approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, consultation_id || null, name, testimonial, rating || null, JSON.stringify(imageUrls), treatment_details || null, 0]
      );

    res.status(201).json({
      message: 'Testimonial submitted successfully',
      testimonialId: result.insertId
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ error: 'Failed to submit testimonial' });
  }
});

// Approve/reject testimonial (admin only)
router.patch('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

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
      'UPDATE testimonials SET approved = ? WHERE id = ?',
      [approved ? 1 : 0, id]
    );

    res.json({ message: 'Testimonial updated successfully' });
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// Get all testimonials for admin
router.get('/admin/all', async (req, res) => {
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

    const [testimonials] = await db.execute(
      'SELECT * FROM testimonials ORDER BY created_at DESC'
    );
    res.json(testimonials);
  } catch (error) {
    console.error('Get all testimonials error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

module.exports = router;

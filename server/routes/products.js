const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, kit_type } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (kit_type) {
      query += ' AND kit_type = ?';
      params.push(kit_type);
    }

    query += ' ORDER BY category, kit_type';

    const [products] = await db.execute(query, params);
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [products] = await db.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(products[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (admin only)
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const [users] = await db.execute('SELECT role FROM users WHERE id = ?', [decoded.userId]);
    if (!users || users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, description, category, price, kit_type, stock, image_url } = req.body;

    const [result] = await db.execute(
      'INSERT INTO products (name, description, category, price, kit_type, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, category, price, kit_type, stock || 0, image_url]
    );

    res.status(201).json({
      message: 'Product created successfully',
      productId: result.insertId
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

module.exports = router;

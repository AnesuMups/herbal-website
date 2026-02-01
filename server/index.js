const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/products', require('./routes/products'));
app.use('/api/memberships', require('./routes/memberships'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/whatsapp', require('./routes/whatsapp'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

async function startServer() {
  try {
    await db.ready;
    console.log('Database ready');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

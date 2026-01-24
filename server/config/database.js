const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

// Ensure database file exists
if (!fs.existsSync(dbPath)) {
  const db = new Database(dbPath);
  db.close();
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Wrapper to make it compatible with async/await style (MySQL-like interface)
const dbWrapper = {
  execute: async (query, params = []) => {
    try {
      const trimmedQuery = query.trim().toUpperCase();
      if (trimmedQuery.startsWith('SELECT')) {
        const stmt = db.prepare(query);
        const rows = stmt.all(params);
        return [rows];
      } else if (trimmedQuery.startsWith('INSERT')) {
        const stmt = db.prepare(query);
        const result = stmt.run(params);
        return [{ insertId: result.lastInsertRowid, affectedRows: result.changes }];
      } else {
        const stmt = db.prepare(query);
        const result = stmt.run(params);
        return [{ insertId: result.lastInsertRowid || null, affectedRows: result.changes }];
      }
    } catch (error) {
      throw error;
    }
  },
  get: async (query, params = []) => {
    try {
      const stmt = db.prepare(query);
      return stmt.get(params);
    } catch (error) {
      throw error;
    }
  },
  all: async (query, params = []) => {
    try {
      const stmt = db.prepare(query);
      return stmt.all(params);
    } catch (error) {
      throw error;
    }
  },
  run: async (query, params = []) => {
    try {
      const stmt = db.prepare(query);
      return stmt.run(params);
    } catch (error) {
      throw error;
    }
  }
};

// Initialize database schema
function initializeDatabase() {
  const schema = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'member' CHECK(role IN ('admin', 'member', 'demo_steward', 'demo_loans')),
      membership_type TEXT CHECK(membership_type IN ('individual', 'family')),
      membership_status TEXT DEFAULT 'inactive' CHECK(membership_status IN ('active', 'inactive', 'expired')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Consultations table
    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      age INTEGER NOT NULL CHECK (age >= 18 AND age <= 80),
      medical_history TEXT,
      infection_details TEXT,
      was_chronic INTEGER DEFAULT 0,
      current_condition TEXT,
      other_treatment TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'in_progress', 'completed')),
      whatsapp_sent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL CHECK(category IN ('renal', 'prostate_cancer')),
      price REAL NOT NULL,
      kit_type TEXT NOT NULL CHECK(kit_type IN ('individual', 'family')),
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Orders table
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
      payment_method TEXT,
      payment_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Order items table
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Testimonials table
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      consultation_id INTEGER,
      name TEXT NOT NULL,
      testimonial TEXT NOT NULL,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      images TEXT,
      treatment_details TEXT,
      approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE SET NULL
    );

    -- Treatment records table
    CREATE TABLE IF NOT EXISTS treatment_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      consultation_id INTEGER NOT NULL,
      treatment_plan TEXT,
      images TEXT,
      notes TEXT,
      outcome TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE
    );

    -- Create trigger for updated_at
    CREATE TRIGGER IF NOT EXISTS update_users_timestamp AFTER UPDATE ON users
    BEGIN
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_consultations_timestamp AFTER UPDATE ON consultations
    BEGIN
      UPDATE consultations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_products_timestamp AFTER UPDATE ON products
    BEGIN
      UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_orders_timestamp AFTER UPDATE ON orders
    BEGIN
      UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_testimonials_timestamp AFTER UPDATE ON testimonials
    BEGIN
      UPDATE testimonials SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_treatment_records_timestamp AFTER UPDATE ON treatment_records
    BEGIN
      UPDATE treatment_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `;

  db.exec(schema);

  // Insert demo accounts if they don't exist
  const bcrypt = require('bcryptjs');
  const demoPassword = bcrypt.hashSync('demo123', 10);
  
  const checkSteward = db.prepare('SELECT id FROM users WHERE email = ?').get('steward@demo.com');
  if (!checkSteward) {
    db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
      .run('steward@demo.com', demoPassword, 'Demo Steward', 'demo_steward');
  }

  const checkLoans = db.prepare('SELECT id FROM users WHERE email = ?').get('loans@demo.com');
  if (!checkLoans) {
    db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
      .run('loans@demo.com', demoPassword, 'Demo Loans', 'demo_loans');
  }

  // Insert sample products if they don't exist
  const checkProducts = db.prepare('SELECT id FROM products').get();
  if (!checkProducts) {
    const insertProduct = db.prepare('INSERT INTO products (name, description, category, price, kit_type, stock) VALUES (?, ?, ?, ?, ?, ?)');
    insertProduct.run('Renal Individual Kit', 'Herbal treatment kit for renal issues - Individual', 'renal', 10.00, 'individual', 100);
    insertProduct.run('Renal Family Kit', 'Herbal treatment kit for renal issues - Family', 'renal', 30.00, 'family', 100);
    insertProduct.run('Prostate Cancer Individual Kit', 'Herbal treatment kit for prostate cancer - Individual', 'prostate_cancer', 10.00, 'individual', 100);
    insertProduct.run('Prostate Cancer Family Kit', 'Herbal treatment kit for prostate cancer - Family', 'prostate_cancer', 30.00, 'family', 100);
  }

  console.log('Database initialized successfully');
}

// Initialize on module load
initializeDatabase();

module.exports = dbWrapper;

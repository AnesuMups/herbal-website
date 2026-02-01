const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

dotenv.config();

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.TURSO_DATABASE_URL ||
  process.env.DB_PATH ||
  'file:./database.sqlite';
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;

const client = createClient({
  url: dbUrl,
  authToken: authToken || undefined
});

// Wrapper to make it compatible with async/await style (MySQL-like interface)
const dbWrapper = {
  execute: async (query, params = []) => {
    const trimmedQuery = query.trim().toUpperCase();
    const result = await client.execute({ sql: query, args: params });

    if (trimmedQuery.startsWith('SELECT')) {
      return [result.rows];
    }

    const insertId = result.lastInsertRowid ? Number(result.lastInsertRowid) : null;
    return [{ insertId, affectedRows: result.rowsAffected ?? 0 }];
  }
};

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'member' CHECK(role IN ('admin', 'member', 'demo_steward', 'demo_loans')),
    membership_type TEXT CHECK(membership_type IN ('individual', 'family')),
    membership_status TEXT DEFAULT 'inactive' CHECK(membership_status IN ('active', 'inactive', 'expired')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS consultations (
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
  )`,
  `CREATE TABLE IF NOT EXISTS products (
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
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
    payment_method TEXT,
    payment_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS testimonials (
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
  )`,
  `CREATE TABLE IF NOT EXISTS treatment_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultation_id INTEGER NOT NULL,
    treatment_plan TEXT,
    images TEXT,
    notes TEXT,
    outcome TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE
  )`,
  `CREATE TRIGGER IF NOT EXISTS update_users_timestamp AFTER UPDATE ON users
    BEGIN
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END`,
  `CREATE TRIGGER IF NOT EXISTS update_consultations_timestamp AFTER UPDATE ON consultations
    BEGIN
      UPDATE consultations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END`,
  `CREATE TRIGGER IF NOT EXISTS update_products_timestamp AFTER UPDATE ON products
    BEGIN
      UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END`,
  `CREATE TRIGGER IF NOT EXISTS update_orders_timestamp AFTER UPDATE ON orders
    BEGIN
      UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END`,
  `CREATE TRIGGER IF NOT EXISTS update_testimonials_timestamp AFTER UPDATE ON testimonials
    BEGIN
      UPDATE testimonials SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END`,
  `CREATE TRIGGER IF NOT EXISTS update_treatment_records_timestamp AFTER UPDATE ON treatment_records
    BEGIN
      UPDATE treatment_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END`
];

async function initializeDatabase() {
  for (const statement of schemaStatements) {
    await client.execute({ sql: statement });
  }

  // Insert demo accounts if they don't exist
  const bcrypt = require('bcryptjs');
  const demoPassword = bcrypt.hashSync('demo123', 10);

  const [stewardRows] = await dbWrapper.execute(
    'SELECT id FROM users WHERE email = ?',
    ['steward@demo.com']
  );
  if (!stewardRows || stewardRows.length === 0) {
    await dbWrapper.execute(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['steward@demo.com', demoPassword, 'Demo Steward', 'demo_steward']
    );
  }

  const [loansRows] = await dbWrapper.execute(
    'SELECT id FROM users WHERE email = ?',
    ['loans@demo.com']
  );
  if (!loansRows || loansRows.length === 0) {
    await dbWrapper.execute(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['loans@demo.com', demoPassword, 'Demo Loans', 'demo_loans']
    );
  }

  const [productRows] = await dbWrapper.execute('SELECT id FROM products');
  if (!productRows || productRows.length === 0) {
    await dbWrapper.execute(
      'INSERT INTO products (name, description, category, price, kit_type, stock) VALUES (?, ?, ?, ?, ?, ?)',
      ['Renal Individual Kit', 'Herbal treatment kit for renal issues - Individual', 'renal', 10.0, 'individual', 100]
    );
    await dbWrapper.execute(
      'INSERT INTO products (name, description, category, price, kit_type, stock) VALUES (?, ?, ?, ?, ?, ?)',
      ['Renal Family Kit', 'Herbal treatment kit for renal issues - Family', 'renal', 30.0, 'family', 100]
    );
    await dbWrapper.execute(
      'INSERT INTO products (name, description, category, price, kit_type, stock) VALUES (?, ?, ?, ?, ?, ?)',
      ['Prostate Cancer Individual Kit', 'Herbal treatment kit for prostate cancer - Individual', 'prostate_cancer', 10.0, 'individual', 100]
    );
    await dbWrapper.execute(
      'INSERT INTO products (name, description, category, price, kit_type, stock) VALUES (?, ?, ?, ?, ?, ?)',
      ['Prostate Cancer Family Kit', 'Herbal treatment kit for prostate cancer - Family', 'prostate_cancer', 30.0, 'family', 100]
    );
  }

  console.log('Database initialized successfully');
}

dbWrapper.ready = initializeDatabase().catch((error) => {
  console.error('Database initialization failed:', error);
  throw error;
});

module.exports = dbWrapper;

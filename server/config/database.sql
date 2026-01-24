-- Create database
CREATE DATABASE IF NOT EXISTS herbal_website;
USE herbal_website;

-- Users table (for admin and members)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role ENUM('admin', 'member', 'demo_steward', 'demo_loans') DEFAULT 'member',
  membership_type ENUM('individual', 'family') NULL,
  membership_status ENUM('active', 'inactive', 'expired') DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  age INT NOT NULL CHECK (age >= 18 AND age <= 80),
  medical_history TEXT,
  infection_details TEXT,
  was_chronic BOOLEAN DEFAULT FALSE,
  current_condition TEXT,
  other_treatment TEXT,
  status ENUM('pending', 'reviewed', 'in_progress', 'completed') DEFAULT 'pending',
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM('renal', 'prostate_cancer') NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  kit_type ENUM('individual', 'family') NOT NULL,
  image_url VARCHAR(500),
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  consultation_id INT NULL,
  name VARCHAR(255) NOT NULL,
  testimonial TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  images JSON,
  treatment_details TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE SET NULL
);

-- Treatment records table
CREATE TABLE IF NOT EXISTS treatment_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  consultation_id INT NOT NULL,
  treatment_plan TEXT,
  images JSON,
  notes TEXT,
  outcome TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE
);

-- Insert demo accounts
INSERT INTO users (email, password, name, role) VALUES
('steward@demo.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqO', 'Demo Steward', 'demo_steward'),
('loans@demo.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqO', 'Demo Loans', 'demo_loans')
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample products
INSERT INTO products (name, description, category, price, kit_type, stock) VALUES
('Renal Individual Kit', 'Herbal treatment kit for renal issues - Individual', 'renal', 10.00, 'individual', 100),
('Renal Family Kit', 'Herbal treatment kit for renal issues - Family', 'renal', 30.00, 'family', 100),
('Prostate Cancer Individual Kit', 'Herbal treatment kit for prostate cancer - Individual', 'prostate_cancer', 10.00, 'individual', 100),
('Prostate Cancer Family Kit', 'Herbal treatment kit for prostate cancer - Family', 'prostate_cancer', 30.00, 'family', 100)
ON DUPLICATE KEY UPDATE name=name;

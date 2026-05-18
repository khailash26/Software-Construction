-- Create Database
CREATE DATABASE IF NOT EXISTS novamart;
USE novamart;

-- Dropping existing tables for reset during development
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nova_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart Table
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    points_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Seed Data: Generic Professional Retail Products
INSERT INTO products (name, price, image_url, category, description, rating, stock) VALUES
('X-Pro Laptop 15" 16GB RAM, 512GB SSD', 1299.99, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600&auto=format&fit=crop', 'electronics', 'High performance laptop for professionals. Fast, reliable, and features a stunning display.', 4.8, 150),
('NovaPhone ProMax 128GB - Space Gray', 899.00, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop', 'electronics', 'The latest flagship smartphone with a triple camera system and all-day battery life.', 4.6, 300),
('Wireless Noise-Cancelling Headphones', 249.50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop', 'electronics', 'Industry-leading noise cancellation. Crystal clear audio with deep bass.', 4.7, 450),
('Men''s Classic Chronograph Watch', 185.00, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop', 'fashion', 'An elegant stainless steel watch suitable for all occasions. Water resistant.', 4.5, 80),
('Smart Home Security Hub + Camera', 199.99, 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600&auto=format&fit=crop', 'home', 'Monitor your home from anywhere. 1080p HD camera with motion detection.', 4.4, 200),
('Ergonomic Office Chair', 159.99, 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=600&auto=format&fit=crop', 'furniture', 'Comfortable mesh office chair with lumbar support and adjustable armrests.', 4.6, 60),
('Ultra HD 4K Smart TV - 55 Inch', 499.00, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=600&auto=format&fit=crop', 'electronics', 'Stunning 4K resolution with built-in streaming apps and cinematic sound.', 4.8, 45),
('Women''s Premium Crossbody Bag', 89.00, 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600&auto=format&fit=crop', 'fashion', 'Genuine leather crossbody bag with adjustable strap and interior pockets.', 4.5, 120),
('Coffee Maker with Grinder', 129.50, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=600&auto=format&fit=crop', 'appliances', 'Start your morning right. Features programmable timer and burr grinder.', 4.7, 95),
('Wireless Gaming Mouse', 59.99, 'https://images.unsplash.com/photo-1527814050087-379381547996?q=80&w=600&auto=format&fit=crop', 'electronics', 'High precision 16K DPI tracking with customizable RGB lighting and side buttons.', 4.8, 300);

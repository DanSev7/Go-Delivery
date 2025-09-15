-- Sample data for testing
-- Run this after creating the main database schema

-- Insert sample admin user (password is 'Admin123!')
-- You can use this to test admin login
INSERT INTO Users (name, email, password, role, phone_number, address) VALUES 
('Admin User', 'admin@fooddelivery.com', '$2b$10$8K8K8K8K8K8K8K8K8K8K8O.K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'admin', '+1234567890', '123 Admin Street');

-- Insert sample restaurant manager (password is 'Manager123!')
INSERT INTO Users (name, email, password, role, phone_number, address) VALUES 
('Restaurant Manager', 'manager@restaurant.com', '$2b$10$8K8K8K8K8K8K8K8K8K8K8O.K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'restaurant_manager', '+1234567891', '456 Manager Avenue');

-- Insert sample customer
INSERT INTO Users (name, email, password, role, phone_number, address) VALUES 
('John Customer', 'customer@email.com', '$2b$10$8K8K8K8K8K8K8K8K8K8K8O.K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'customer', '+1234567892', '789 Customer Road');

-- Insert sample rider
INSERT INTO Users (name, email, password, role, phone_number, address) VALUES 
('Mike Rider', 'rider@delivery.com', '$2b$10$8K8K8K8K8K8K8K8K8K8K8O.K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'rider', '+1234567893', '321 Rider Lane');

-- Note: The password hashes above are placeholders. 
-- In production, use proper bcrypt hashing for actual passwords.
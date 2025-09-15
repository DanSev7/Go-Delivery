-- Food Delivery Backend Database Schema
-- This file contains the complete table schema for the Final_Backend project

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'restaurant_manager', 'rider', 'admin')),
    phone_number VARCHAR(20),
    address TEXT,
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Categories table
CREATE TABLE Categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Restaurants table
CREATE TABLE Restaurants (
    restaurant_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    phone_number VARCHAR(20),
    image TEXT,
    logo TEXT,
    opening_hours JSONB, -- Store opening hours as JSON (e.g., {"monday": "9:00-22:00", "tuesday": "9:00-22:00"})
    average_delivery_time INTEGER, -- in minutes
    manager_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    category VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Branches table (referenced in branchesController)
CREATE TABLE Branches (
    branch_id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create MenuItems table
CREATE TABLE MenuItems (
    menu_item_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    restaurant_id INTEGER NOT NULL REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE,
    description TEXT,
    image TEXT,
    category VARCHAR(255),
    availability_status BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Riders table
CREATE TABLE Riders (
    rider_id INTEGER PRIMARY KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    vehicle_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
    location TEXT,
    current_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders table
CREATE TABLE Orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    restaurant_id INTEGER NOT NULL REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE,
    rider_id INTEGER REFERENCES Riders(rider_id) ON DELETE SET NULL,
    total_price DECIMAL(10,2) NOT NULL,
    order_status VARCHAR(50) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    delivery_address TEXT NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create OrderItems table
CREATE TABLE OrderItems (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
    menu_item_id INTEGER NOT NULL REFERENCES MenuItems(menu_item_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL, -- price at the time of order
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create RatingsAndReviews table
CREATE TABLE RatingsAndReviews (
    review_id SERIAL PRIMARY KEY,
    menu_item_id INTEGER REFERENCES MenuItems(menu_item_id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    rider_id INTEGER REFERENCES Riders(rider_id) ON DELETE SET NULL,
    restaurant_id INTEGER REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_restaurants_manager_id ON Restaurants(manager_id);
CREATE INDEX idx_menuitems_restaurant_id ON MenuItems(restaurant_id);
CREATE INDEX idx_orders_customer_id ON Orders(customer_id);
CREATE INDEX idx_orders_restaurant_id ON Orders(restaurant_id);
CREATE INDEX idx_orders_rider_id ON Orders(rider_id);
CREATE INDEX idx_orders_status ON Orders(order_status);
CREATE INDEX idx_orderitems_order_id ON OrderItems(order_id);
CREATE INDEX idx_orderitems_menu_item_id ON OrderItems(menu_item_id);
CREATE INDEX idx_reviews_restaurant_id ON RatingsAndReviews(restaurant_id);
CREATE INDEX idx_reviews_menu_item_id ON RatingsAndReviews(menu_item_id);
CREATE INDEX idx_reviews_rider_id ON RatingsAndReviews(rider_id);

-- Create triggers to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON Users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON Categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON Restaurants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON Branches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menuitems_updated_at BEFORE UPDATE ON MenuItems 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_riders_updated_at BEFORE UPDATE ON Riders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON Orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orderitems_updated_at BEFORE UPDATE ON OrderItems 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON RatingsAndReviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for categories (optional)
INSERT INTO Categories (name, image) VALUES 
('Pizza', 'pizza.jpg'),
('Burgers', 'burger.jpg'),
('Asian', 'asian.jpg'),
('Desserts', 'dessert.jpg'),
('Beverages', 'drinks.jpg');

-- Comments explaining the schema design
/*
Schema Design Notes:

1. Users Table:
   - Central table for all user types (customers, restaurant managers, riders, admins)
   - Role-based authentication using the 'role' field
   - Supports profile pictures and contact information

2. Restaurants Table:
   - Each restaurant is managed by a user with 'restaurant_manager' role
   - Opening hours stored as JSONB for flexibility
   - Rating calculated from reviews and updated via triggers

3. MenuItems Table:
   - Belongs to a restaurant
   - Has availability status for inventory management
   - Rating calculated from customer reviews

4. Orders Table:
   - Links customers, restaurants, and riders
   - Tracks order status through the delivery lifecycle
   - Includes delivery fee and address information

5. OrderItems Table:
   - Junction table between Orders and MenuItems
   - Stores quantity and price at time of order (for price history)

6. Riders Table:
   - Extends Users table for rider-specific information
   - Tracks vehicle type, status, and location

7. RatingsAndReviews Table:
   - Flexible review system supporting reviews for restaurants, menu items, and riders
   - Rating constraint ensures values between 1-5

8. Relationships:
   - One-to-many: User -> Restaurants (manager)
   - One-to-many: Restaurant -> MenuItems
   - One-to-many: User -> Orders (customer)
   - One-to-many: Restaurant -> Orders
   - One-to-many: Rider -> Orders
   - Many-to-many: Orders <-> MenuItems (via OrderItems)

9. Performance Optimizations:
   - Indexes on frequently queried columns
   - Automatic timestamp updates via triggers
   - Proper foreign key constraints with cascading deletes
*/
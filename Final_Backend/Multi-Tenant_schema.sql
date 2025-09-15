CREATE TABLE Tenants (
    tenant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'pizzahut', 'kfc'
    custom_domain VARCHAR(255), -- e.g., 'orders.pizzahut.com'
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'trial')),
    
    -- Branding & Customization
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#007bff',
    secondary_color VARCHAR(7) DEFAULT '#6c757d',
    theme_config JSONB DEFAULT '{}',
    
    -- Business Information
    business_type VARCHAR(100) DEFAULT 'food_delivery',
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    business_address TEXT,
    
    -- Subscription & Billing
    subscription_plan VARCHAR(50) DEFAULT 'starter' CHECK (subscription_plan IN ('trial', 'starter', 'professional', 'enterprise')),
    billing_customer_id VARCHAR(255), -- Chapa customer ID
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'trialing')),
    trial_ends_at TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    
    -- Platform Settings
    max_restaurants INTEGER DEFAULT 1,
    max_orders_per_month INTEGER DEFAULT 1000,
    max_riders INTEGER DEFAULT 10,
    features JSONB DEFAULT '{"real_time_tracking": true, "analytics": false, "api_access": false}',
    
    -- Compliance & Security
    data_retention_days INTEGER DEFAULT 365,
    encryption_enabled BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES Users(user_id)
);

CREATE TABLE UserTenants (
    user_tenant_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    
    tenant_role VARCHAR(50) NOT NULL CHECK (tenant_role IN ('tenant_admin', 'manager', 'staff', 'viewer')),
    permissions JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    invited_by INTEGER,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, tenant_id)
);

CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'restaurant_manager', 'rider', 'admin', 'platform_admin')),
    phone_number VARCHAR(20),
    address TEXT,
    profile_picture TEXT,
    
    -- SaaS Enhancement Fields
    is_platform_admin BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Restaurants (
    restaurant_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    phone_number VARCHAR(20),
    image TEXT,
    logo TEXT,
    opening_hours JSONB,
    average_delivery_time INTEGER,
    manager_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    category VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Branches (
    branch_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    restaurant_id INTEGER NOT NULL REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MenuItems (
    menu_item_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
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

CREATE TABLE Orders (
    order_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
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

CREATE TABLE OrderItems (
    order_item_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    order_id INTEGER NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
    menu_item_id INTEGER NOT NULL REFERENCES MenuItems(menu_item_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Riders (
    rider_id INTEGER PRIMARY KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    vehicle_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
    location TEXT,
    current_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Categories (
    category_id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    image TEXT,
    is_global BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RatingsAndReviews (
    review_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES MenuItems(menu_item_id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    rider_id INTEGER REFERENCES Riders(rider_id) ON DELETE SET NULL,
    restaurant_id INTEGER REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE SubscriptionPlans (
    plan_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'ETB',
    max_restaurants INTEGER NOT NULL DEFAULT 1,
    max_orders_per_month INTEGER NOT NULL DEFAULT 1000,
    max_riders INTEGER NOT NULL DEFAULT 10,
    max_menu_items INTEGER NOT NULL DEFAULT 100,
    max_storage_gb INTEGER NOT NULL DEFAULT 5,
    features JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'hidden')),
    is_trial BOOLEAN DEFAULT false,
    trial_duration_days INTEGER DEFAULT 14,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TenantBilling (
    billing_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    billing_email VARCHAR(255) NOT NULL,
    billing_name VARCHAR(255) NOT NULL,
    billing_address JSONB,
    tax_id VARCHAR(100),
    payment_method VARCHAR(50) DEFAULT 'chapa',
    chapa_customer_id VARCHAR(255),
    default_payment_source_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id)
);


CREATE TABLE TenantSubscriptions (
    subscription_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES SubscriptionPlans(plan_id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing', 'incomplete')),
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'yearly')),
    chapa_subscription_id VARCHAR(255),
    chapa_customer_id VARCHAR(255),
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TenantInvoices (
    invoice_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES TenantSubscriptions(subscription_id),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    chapa_invoice_id VARCHAR(255),
    chapa_payment_link TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TenantAuditLogs (
    log_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES Users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    endpoint VARCHAR(255),
    http_method VARCHAR(10),
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE TenantFeatureFlags (
    flag_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    config JSONB DEFAULT '{}',
    rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    user_segments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, feature_key)
);

-- =============================================================================
-- ESSENTIAL PERFORMANCE INDEXES
-- =============================================================================

-- Tenant-aware indexes for all tenant-scoped tables
CREATE INDEX idx_restaurants_tenant_id ON Restaurants(tenant_id);
CREATE INDEX idx_branches_tenant_id ON Branches(tenant_id);
CREATE INDEX idx_menuitems_tenant_id ON MenuItems(tenant_id);
CREATE INDEX idx_orders_tenant_id ON Orders(tenant_id);
CREATE INDEX idx_orderitems_tenant_id ON OrderItems(tenant_id);
CREATE INDEX idx_riders_tenant_id ON Riders(tenant_id);
CREATE INDEX idx_reviews_tenant_id ON RatingsAndReviews(tenant_id);
CREATE INDEX idx_categories_tenant_id ON Categories(tenant_id);

-- Core tenant system indexes
CREATE INDEX idx_tenants_subdomain ON Tenants(subdomain);
CREATE INDEX idx_tenants_status ON Tenants(status);
CREATE INDEX idx_tenants_subscription_plan ON Tenants(subscription_plan);
CREATE INDEX idx_user_tenants_user_id ON UserTenants(user_id);
CREATE INDEX idx_user_tenants_tenant_id ON UserTenants(tenant_id);
CREATE INDEX idx_user_tenants_role ON UserTenants(tenant_role);

-- Composite indexes for common queries
CREATE INDEX idx_restaurants_tenant_manager ON Restaurants(tenant_id, manager_id);
CREATE INDEX idx_orders_tenant_status ON Orders(tenant_id, order_status);
CREATE INDEX idx_orders_tenant_customer ON Orders(tenant_id, customer_id);
CREATE INDEX idx_menuitems_tenant_restaurant ON MenuItems(tenant_id, restaurant_id);

-- Billing system indexes
CREATE INDEX idx_tenant_subscriptions_tenant_id ON TenantSubscriptions(tenant_id);
CREATE INDEX idx_tenant_subscriptions_status ON TenantSubscriptions(status);
CREATE INDEX idx_tenant_invoices_tenant_id ON TenantInvoices(tenant_id);
CREATE INDEX idx_audit_logs_tenant_id ON TenantAuditLogs(tenant_id);
CREATE INDEX idx_feature_flags_tenant_id ON TenantFeatureFlags(tenant_id);

-- User system indexes
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_users_status ON Users(status);

-- =============================================================================
-- AUTOMATIC UPDATE TRIGGERS
-- =============================================================================

-- Create trigger function for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON Tenants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tenants_updated_at 
    BEFORE UPDATE ON UserTenants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON Users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at 
    BEFORE UPDATE ON Restaurants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at 
    BEFORE UPDATE ON Branches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menuitems_updated_at 
    BEFORE UPDATE ON MenuItems 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON Orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orderitems_updated_at 
    BEFORE UPDATE ON OrderItems 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_riders_updated_at 
    BEFORE UPDATE ON Riders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON Categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON RatingsAndReviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON SubscriptionPlans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_billing_updated_at 
    BEFORE UPDATE ON TenantBilling 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_subscriptions_updated_at 
    BEFORE UPDATE ON TenantSubscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_invoices_updated_at 
    BEFORE UPDATE ON TenantInvoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_feature_flags_updated_at 
    BEFORE UPDATE ON TenantFeatureFlags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- DEFAULT SUBSCRIPTION PLANS
-- =============================================================================

INSERT INTO SubscriptionPlans (name, display_name, description, price_monthly, price_yearly, max_restaurants, max_orders_per_month, max_riders, max_menu_items, features) VALUES 

-- Trial Plan
('trial', 'Free Trial', '14-day free trial with full access', 0.00, 0.00, 1, 100, 3, 50, 
 '{
   "real_time_tracking": true, 
   "analytics": false, 
   "api_access": false, 
   "custom_branding": false, 
   "priority_support": false
 }'),

-- Starter Plan
('starter', 'Starter', 'Perfect for small restaurants getting started', 999.00, 9990.00, 1, 1000, 5, 100,
 '{
   "real_time_tracking": true, 
   "analytics": true, 
   "api_access": false, 
   "custom_branding": false, 
   "priority_support": false
 }'),

-- Professional Plan  
('professional', 'Professional', 'Advanced features for growing businesses', 2999.00, 29990.00, 3, 5000, 15, 300,
 '{
   "real_time_tracking": true, 
   "analytics": true, 
   "api_access": true, 
   "custom_branding": true, 
   "priority_support": false
 }'),

-- Enterprise Plan
('enterprise', 'Enterprise', 'Full-featured solution for large operations', 9999.00, 99990.00, -1, -1, -1, -1,
 '{
   "real_time_tracking": true, 
   "analytics": true, 
   "api_access": true, 
   "custom_branding": true, 
   "priority_support": true, 
   "white_label": true
 }');

-- =============================================================================
-- ENABLE UUID EXTENSION
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- SCHEMA DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE Tenants IS 'Core tenant table for multi-tenancy. Each tenant represents a separate food delivery business.';
COMMENT ON TABLE UserTenants IS 'Many-to-many relationship between users and tenants with tenant-specific roles.';
COMMENT ON TABLE SubscriptionPlans IS 'Available subscription plans with features and limits.';
COMMENT ON TABLE TenantSubscriptions IS 'Active subscriptions linking tenants to their current plans.';
COMMENT ON TABLE TenantAuditLogs IS 'Comprehensive audit trail for all tenant actions for compliance and debugging.';
COMMENT ON TABLE TenantFeatureFlags IS 'Feature flag system for gradual rollouts and plan-based feature restrictions.';

COMMENT ON COLUMN Tenants.subdomain IS 'Unique subdomain for tenant (e.g., tenant.fooddelivery.com)';
COMMENT ON COLUMN Tenants.features IS 'JSON object containing enabled features based on subscription plan';
COMMENT ON COLUMN UserTenants.tenant_role IS 'Role within the specific tenant (independent of global user role)';
COMMENT ON COLUMN SubscriptionPlans.features IS 'JSON object defining which features are included in this plan';
COMMENT ON COLUMN TenantAuditLogs.action IS 'Action performed (create_order, update_menu, etc.)';
COMMENT ON COLUMN TenantFeatureFlags.rollout_percentage IS 'Percentage of users who see this feature (for gradual rollouts)';
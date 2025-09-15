-- Multi-Tenant SaaS Food Delivery Platform Schema
-- Migration 001: Create multi-tenant foundation with billing support
-- =====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. TENANTS CORE TABLES
-- =============================================================================

-- Create Tenants table (central to multi-tenancy)
CREATE TABLE Tenants (
    tenant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'pizzahut', 'kfc'
    custom_domain VARCHAR(255), -- e.g., 'orders.pizzahut.com'
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'trial')),
    
    -- Branding & Customization
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#007bff', -- Hex color codes
    secondary_color VARCHAR(7) DEFAULT '#6c757d',
    theme_config JSONB DEFAULT '{}', -- Custom CSS/theme settings
    
    -- Business Information
    business_type VARCHAR(100) DEFAULT 'food_delivery',
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    business_address TEXT,
    
    -- Subscription & Billing
    subscription_plan VARCHAR(50) DEFAULT 'starter' CHECK (subscription_plan IN ('trial', 'starter', 'professional', 'enterprise')),
    billing_customer_id VARCHAR(255), -- Chapa/Stripe customer ID
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'trialing')),
    trial_ends_at TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    
    -- Platform Settings
    max_restaurants INTEGER DEFAULT 1, -- Plan-based limits
    max_orders_per_month INTEGER DEFAULT 1000,
    max_riders INTEGER DEFAULT 10,
    features JSONB DEFAULT '{"real_time_tracking": true, "analytics": false, "api_access": false}',
    
    -- Compliance & Security
    data_retention_days INTEGER DEFAULT 365,
    encryption_enabled BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER, -- Will reference Users after migration
    
    -- Constraints
    CONSTRAINT valid_subdomain CHECK (subdomain ~ '^[a-z0-9-]{3,}$')
);

-- Create UserTenants join table (many-to-many with roles)
CREATE TABLE UserTenants (
    user_tenant_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- Will add FK constraint after Users migration
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    
    -- Tenant-specific role (different from global role)
    tenant_role VARCHAR(50) NOT NULL CHECK (tenant_role IN ('tenant_admin', 'manager', 'staff', 'viewer')),
    
    -- Permissions within tenant
    permissions JSONB DEFAULT '{}', -- Custom permissions object
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    invited_by INTEGER, -- User who invited this user to tenant
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint: user can only have one role per tenant
    UNIQUE(user_id, tenant_id)
);

-- =============================================================================
-- 2. SUBSCRIPTION PLANS CONFIGURATION
-- =============================================================================

CREATE TABLE SubscriptionPlans (
    plan_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Pricing
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'ETB',
    
    -- Limits
    max_restaurants INTEGER NOT NULL DEFAULT 1,
    max_orders_per_month INTEGER NOT NULL DEFAULT 1000,
    max_riders INTEGER NOT NULL DEFAULT 10,
    max_menu_items INTEGER NOT NULL DEFAULT 100,
    max_storage_gb INTEGER NOT NULL DEFAULT 5,
    
    -- Features
    features JSONB NOT NULL DEFAULT '{}',
    
    -- Plan status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'hidden')),
    is_trial BOOLEAN DEFAULT false,
    trial_duration_days INTEGER DEFAULT 14,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 3. BILLING & PAYMENTS
-- =============================================================================

CREATE TABLE TenantBilling (
    billing_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    
    -- Billing Information
    billing_email VARCHAR(255) NOT NULL,
    billing_name VARCHAR(255) NOT NULL,
    billing_address JSONB, -- Full address object
    tax_id VARCHAR(100), -- VAT/Tax ID
    
    -- Payment Method (Chapa specific)
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
    
    -- Subscription Details
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing', 'incomplete')),
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    
    -- Billing
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'yearly')),
    
    -- Chapa Integration
    chapa_subscription_id VARCHAR(255),
    chapa_customer_id VARCHAR(255),
    
    -- Trial
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    
    -- Cancellation
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
    
    -- Invoice Details
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    
    -- Amounts
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    
    -- Dates
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    
    -- Chapa Integration
    chapa_invoice_id VARCHAR(255),
    chapa_payment_link TEXT,
    
    -- Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 4. AUDIT LOGGING FOR SAAS
-- =============================================================================

CREATE TABLE TenantAuditLogs (
    log_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    user_id INTEGER, -- Will add FK constraint after Users migration
    
    -- Action Details
    action VARCHAR(100) NOT NULL, -- 'create_order', 'update_menu', 'login', etc.
    resource_type VARCHAR(50) NOT NULL, -- 'order', 'menu_item', 'user', etc.
    resource_id VARCHAR(100), -- ID of the affected resource
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    endpoint VARCHAR(255),
    http_method VARCHAR(10),
    
    -- Changes (for update actions)
    old_values JSONB,
    new_values JSONB,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 5. FEATURE FLAGS & CONFIGURATION
-- =============================================================================

CREATE TABLE TenantFeatureFlags (
    flag_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES Tenants(tenant_id) ON DELETE CASCADE,
    
    feature_key VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    config JSONB DEFAULT '{}',
    
    -- Rollout control
    rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    user_segments JSONB DEFAULT '[]', -- Array of user segments this applies to
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, feature_key)
);

-- =============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- =============================================================================

-- Tenants indexes
CREATE INDEX idx_tenants_subdomain ON Tenants(subdomain);
CREATE INDEX idx_tenants_status ON Tenants(status);
CREATE INDEX idx_tenants_subscription_plan ON Tenants(subscription_plan);
CREATE INDEX idx_tenants_created_at ON Tenants(created_at);

-- UserTenants indexes
CREATE INDEX idx_user_tenants_user_id ON UserTenants(user_id);
CREATE INDEX idx_user_tenants_tenant_id ON UserTenants(tenant_id);
CREATE INDEX idx_user_tenants_role ON UserTenants(tenant_role);
CREATE INDEX idx_user_tenants_status ON UserTenants(status);

-- Billing indexes
CREATE INDEX idx_tenant_subscriptions_tenant_id ON TenantSubscriptions(tenant_id);
CREATE INDEX idx_tenant_subscriptions_status ON TenantSubscriptions(status);
CREATE INDEX idx_tenant_subscriptions_period_end ON TenantSubscriptions(current_period_end);

-- Audit log indexes
CREATE INDEX idx_audit_logs_tenant_id ON TenantAuditLogs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON TenantAuditLogs(user_id);
CREATE INDEX idx_audit_logs_action ON TenantAuditLogs(action);
CREATE INDEX idx_audit_logs_created_at ON TenantAuditLogs(created_at);

-- Feature flags indexes
CREATE INDEX idx_feature_flags_tenant_id ON TenantFeatureFlags(tenant_id);
CREATE INDEX idx_feature_flags_feature_key ON TenantFeatureFlags(feature_key);

-- =============================================================================
-- 7. TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Create trigger function for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to new tables
CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON Tenants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tenants_updated_at 
    BEFORE UPDATE ON UserTenants 
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
-- 8. INSERT DEFAULT SUBSCRIPTION PLANS
-- =============================================================================

INSERT INTO SubscriptionPlans (name, display_name, description, price_monthly, price_yearly, max_restaurants, max_orders_per_month, max_riders, max_menu_items, features) VALUES 

-- Trial Plan
('trial', 'Free Trial', '14-day free trial with full access', 0.00, 0.00, 1, 100, 3, 50, 
 '{"real_time_tracking": true, "analytics": false, "api_access": false, "custom_branding": false, "priority_support": false}'),

-- Starter Plan
('starter', 'Starter', 'Perfect for small restaurants getting started', 999.00, 9990.00, 1, 1000, 5, 100,
 '{"real_time_tracking": true, "analytics": true, "api_access": false, "custom_branding": false, "priority_support": false}'),

-- Professional Plan  
('professional', 'Professional', 'Advanced features for growing businesses', 2999.00, 29990.00, 3, 5000, 15, 300,
 '{"real_time_tracking": true, "analytics": true, "api_access": true, "custom_branding": true, "priority_support": false}'),

-- Enterprise Plan
('enterprise', 'Enterprise', 'Full-featured solution for large operations', 9999.00, 99990.00, -1, -1, -1, -1,
 '{"real_time_tracking": true, "analytics": true, "api_access": true, "custom_branding": true, "priority_support": true, "white_label": true}');

-- =============================================================================
-- 9. COMMENTS & DOCUMENTATION
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
-- Multi-Tenant Migration 002: Add tenant_id to existing tables
-- Safe migration script to add multi-tenancy to existing Food Delivery schema
-- ============================================================================

-- =============================================================================
-- MIGRATION SAFETY CHECKLIST
-- =============================================================================
/*
BEFORE RUNNING THIS MIGRATION:
1. ✅ Take a complete database backup
2. ✅ Run this migration in a test environment first
3. ✅ Ensure no active transactions are running
4. ✅ Schedule maintenance window for production
5. ✅ Have rollback script ready (003_rollback_tenant_migration.sql)

ESTIMATED DOWNTIME: 2-5 minutes for small datasets, longer for large datasets
*/

-- =============================================================================
-- 1. MODIFY EXISTING USERS TABLE FOR ENHANCED SAAS SUPPORT
-- =============================================================================

-- Add new columns to Users table for SaaS features
ALTER TABLE Users ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN DEFAULT false;
ALTER TABLE Users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE Users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
ALTER TABLE Users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE Users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;
ALTER TABLE Users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE Users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'));
ALTER TABLE Users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update role constraints to include new tenant-admin role
ALTER TABLE Users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE Users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('customer', 'restaurant_manager', 'rider', 'admin', 'platform_admin'));

-- =============================================================================
-- 2. ADD TENANT_ID TO ALL TENANT-SCOPED TABLES
-- =============================================================================

-- Add tenant_id to Restaurants table
ALTER TABLE Restaurants ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to Branches table  
ALTER TABLE Branches ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to MenuItems table
ALTER TABLE MenuItems ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to Orders table
ALTER TABLE Orders ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to OrderItems table (inherits from Orders)
ALTER TABLE OrderItems ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to Riders table
ALTER TABLE Riders ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to RatingsAndReviews table
ALTER TABLE RatingsAndReviews ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Categories can be global or tenant-specific
ALTER TABLE Categories ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE Categories ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT true;

-- =============================================================================
-- 3. CREATE A DEFAULT TENANT FOR EXISTING DATA
-- =============================================================================

-- Create a default tenant for all existing data
INSERT INTO Tenants (
    tenant_id,
    name,
    subdomain,
    status,
    contact_email,
    subscription_plan,
    subscription_status,
    max_restaurants,
    max_orders_per_month,
    max_riders,
    features,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Default Tenant (Migration)',
    'default',
    'active',
    'admin@fooddelivery.com',
    'enterprise',
    'active',
    -1, -- Unlimited
    -1, -- Unlimited
    -1, -- Unlimited
    '{"real_time_tracking": true, "analytics": true, "api_access": true, "custom_branding": true, "priority_support": true}',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (tenant_id) DO NOTHING;

-- =============================================================================
-- 4. POPULATE TENANT_ID FOR EXISTING DATA
-- =============================================================================

-- Update all existing Restaurants to belong to default tenant
UPDATE Restaurants 
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

-- Update Branches based on their restaurant's tenant
UPDATE Branches 
SET tenant_id = (
    SELECT r.tenant_id 
    FROM Restaurants r 
    WHERE r.restaurant_id = Branches.restaurant_id
)
WHERE tenant_id IS NULL;

-- Update MenuItems based on their restaurant's tenant
UPDATE MenuItems 
SET tenant_id = (
    SELECT r.tenant_id 
    FROM Restaurants r 
    WHERE r.restaurant_id = MenuItems.restaurant_id
)
WHERE tenant_id IS NULL;

-- Update Orders based on their restaurant's tenant
UPDATE Orders 
SET tenant_id = (
    SELECT r.tenant_id 
    FROM Restaurants r 
    WHERE r.restaurant_id = Orders.restaurant_id
)
WHERE tenant_id IS NULL;

-- Update OrderItems based on their order's tenant
UPDATE OrderItems 
SET tenant_id = (
    SELECT o.tenant_id 
    FROM Orders o 
    WHERE o.order_id = OrderItems.order_id
)
WHERE tenant_id IS NULL;

-- Update Riders to belong to default tenant (they can serve multiple tenants later)
UPDATE Riders 
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

-- Update RatingsAndReviews based on the restaurant being reviewed
UPDATE RatingsAndReviews 
SET tenant_id = (
    SELECT r.tenant_id 
    FROM Restaurants r 
    WHERE r.restaurant_id = RatingsAndReviews.restaurant_id
)
WHERE tenant_id IS NULL;

-- Keep existing categories as global
UPDATE Categories 
SET tenant_id = NULL, is_global = true
WHERE tenant_id IS NULL;

-- =============================================================================
-- 5. ADD FOREIGN KEY CONSTRAINTS
-- =============================================================================

-- Add foreign key constraints to new tenant_id columns
ALTER TABLE Restaurants 
ADD CONSTRAINT fk_restaurants_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE;

ALTER TABLE Branches 
ADD CONSTRAINT fk_branches_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE;

ALTER TABLE MenuItems 
ADD CONSTRAINT fk_menuitems_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE;

ALTER TABLE Orders 
ADD CONSTRAINT fk_orders_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE;

ALTER TABLE OrderItems 
ADD CONSTRAINT fk_orderitems_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE;

ALTER TABLE Riders 
ADD CONSTRAINT fk_riders_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE;

ALTER TABLE RatingsAndReviews 
ADD CONSTRAINT fk_reviews_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE;

ALTER TABLE Categories 
ADD CONSTRAINT fk_categories_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES Tenants(tenant_id) ON DELETE CASCADE;

-- =============================================================================
-- 6. ADD FOREIGN KEY FOR USER-TENANT RELATIONSHIPS
-- =============================================================================

-- Add foreign key constraint from UserTenants to Users
ALTER TABLE UserTenants 
ADD CONSTRAINT fk_user_tenants_user_id 
FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE;

-- Add foreign key constraint from TenantAuditLogs to Users
ALTER TABLE TenantAuditLogs 
ADD CONSTRAINT fk_audit_logs_user_id 
FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL;

-- Add created_by foreign key to Tenants
ALTER TABLE Tenants 
ADD CONSTRAINT fk_tenants_created_by 
FOREIGN KEY (created_by) REFERENCES Users(user_id) ON DELETE SET NULL;

-- =============================================================================
-- 7. CREATE TENANT-AWARE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Critical indexes for tenant-scoped queries
CREATE INDEX idx_restaurants_tenant_id ON Restaurants(tenant_id);
CREATE INDEX idx_branches_tenant_id ON Branches(tenant_id);
CREATE INDEX idx_menuitems_tenant_id ON MenuItems(tenant_id);
CREATE INDEX idx_orders_tenant_id ON Orders(tenant_id);
CREATE INDEX idx_orderitems_tenant_id ON OrderItems(tenant_id);
CREATE INDEX idx_riders_tenant_id ON Riders(tenant_id);
CREATE INDEX idx_reviews_tenant_id ON RatingsAndReviews(tenant_id);
CREATE INDEX idx_categories_tenant_id ON Categories(tenant_id);

-- Composite indexes for common queries
CREATE INDEX idx_restaurants_tenant_manager ON Restaurants(tenant_id, manager_id);
CREATE INDEX idx_orders_tenant_status ON Orders(tenant_id, order_status);
CREATE INDEX idx_orders_tenant_customer ON Orders(tenant_id, customer_id);
CREATE INDEX idx_menuitems_tenant_restaurant ON MenuItems(tenant_id, restaurant_id);

-- =============================================================================
-- 8. ADD NOT NULL CONSTRAINTS (after data population)
-- =============================================================================

-- Make tenant_id NOT NULL for tables that must be tenant-scoped
ALTER TABLE Restaurants ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE Branches ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE MenuItems ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE Orders ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE OrderItems ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE Riders ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE RatingsAndReviews ALTER COLUMN tenant_id SET NOT NULL;

-- Categories can be global, so tenant_id can be null

-- =============================================================================
-- 9. CREATE DEFAULT PLATFORM ADMIN USER
-- =============================================================================

-- Create a platform admin user if it doesn't exist
INSERT INTO Users (
    name,
    email,
    password,
    role,
    is_platform_admin,
    email_verified,
    status,
    created_at,
    updated_at
) VALUES (
    'Platform Administrator',
    'platform@fooddelivery.com',
    '$2b$10$8K8K8K8K8K8K8K8K8K8K8O.K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', -- Change this password!
    'platform_admin',
    true,
    true,
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 10. CREATE DEFAULT USER-TENANT RELATIONSHIPS
-- =============================================================================

-- Assign existing restaurant managers to the default tenant
INSERT INTO UserTenants (user_id, tenant_id, tenant_role, status)
SELECT 
    u.user_id,
    '00000000-0000-0000-0000-000000000001',
    'tenant_admin',
    'active'
FROM Users u
WHERE u.role = 'restaurant_manager'
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- Assign existing admin users as tenant admins
INSERT INTO UserTenants (user_id, tenant_id, tenant_role, status)
SELECT 
    u.user_id,
    '00000000-0000-0000-0000-000000000001',
    'tenant_admin',
    'active'
FROM Users u
WHERE u.role = 'admin' AND NOT u.is_platform_admin
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- =============================================================================
-- 11. VALIDATION QUERIES (Run to verify migration success)
-- =============================================================================

/*
-- Verify all tables have tenant_id populated
SELECT 
    'Restaurants' as table_name,
    COUNT(*) as total_rows,
    COUNT(tenant_id) as rows_with_tenant_id
FROM Restaurants
UNION ALL
SELECT 
    'Orders',
    COUNT(*),
    COUNT(tenant_id)
FROM Orders
UNION ALL
SELECT 
    'MenuItems',
    COUNT(*),
    COUNT(tenant_id)
FROM MenuItems;

-- Verify foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('restaurants', 'orders', 'menuitems', 'branches', 'riders')
    AND kcu.column_name = 'tenant_id';
*/

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log migration completion
INSERT INTO TenantAuditLogs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    metadata
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'database_migration',
    'system',
    'migration_002',
    '{"migration": "002_add_tenant_id_to_existing_tables", "status": "completed", "timestamp": "' || CURRENT_TIMESTAMP || '"}'
);

-- Print success message
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'MIGRATION 002 COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '✅ Added tenant_id columns to all relevant tables';
    RAISE NOTICE '✅ Created default tenant for existing data';
    RAISE NOTICE '✅ Populated tenant_id for all existing records';
    RAISE NOTICE '✅ Added foreign key constraints';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '✅ Created platform admin user';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Update your application code to use tenant-aware queries';
    RAISE NOTICE '2. Test the application with the new schema';
    RAISE NOTICE '3. Change the platform admin password';
    RAISE NOTICE '4. Run migration 003 to create tenant context middleware';
    RAISE NOTICE '=============================================================================';
END
$$;
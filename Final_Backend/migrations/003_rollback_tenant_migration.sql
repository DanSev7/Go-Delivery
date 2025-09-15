-- Rollback Migration: Remove multi-tenant changes
-- ============================================================================
-- WARNING: This script will remove all multi-tenant functionality and data!
-- Only use this if you need to completely rollback the multi-tenant migration.
-- ============================================================================

-- =============================================================================
-- ROLLBACK SAFETY CHECKLIST
-- =============================================================================
/*
BEFORE RUNNING THIS ROLLBACK:
1. ✅ Take a complete database backup
2. ✅ Confirm you want to lose all tenant data
3. ✅ Stop all application services
4. ✅ Run in test environment first

WARNING: This will permanently delete:
- All tenant configurations
- All subscription data
- All billing information
- All audit logs
- All feature flag configurations

ORIGINAL DATA WILL BE PRESERVED:
- Users, Restaurants, Orders, MenuItems etc. will remain
- Only tenant-specific columns will be removed
*/

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'STARTING MULTI-TENANT ROLLBACK MIGRATION';
    RAISE NOTICE '=============================================================================';
END
$$;

-- =============================================================================
-- 1. REMOVE FOREIGN KEY CONSTRAINTS
-- =============================================================================

-- Remove tenant_id foreign keys
ALTER TABLE Restaurants DROP CONSTRAINT IF EXISTS fk_restaurants_tenant_id;
ALTER TABLE Branches DROP CONSTRAINT IF EXISTS fk_branches_tenant_id;
ALTER TABLE MenuItems DROP CONSTRAINT IF EXISTS fk_menuitems_tenant_id;
ALTER TABLE Orders DROP CONSTRAINT IF EXISTS fk_orders_tenant_id;
ALTER TABLE OrderItems DROP CONSTRAINT IF EXISTS fk_orderitems_tenant_id;
ALTER TABLE Riders DROP CONSTRAINT IF EXISTS fk_riders_tenant_id;
ALTER TABLE RatingsAndReviews DROP CONSTRAINT IF EXISTS fk_reviews_tenant_id;
ALTER TABLE Categories DROP CONSTRAINT IF EXISTS fk_categories_tenant_id;

-- Remove user-tenant relationship constraints
ALTER TABLE UserTenants DROP CONSTRAINT IF EXISTS fk_user_tenants_user_id;
ALTER TABLE TenantAuditLogs DROP CONSTRAINT IF EXISTS fk_audit_logs_user_id;
ALTER TABLE Tenants DROP CONSTRAINT IF EXISTS fk_tenants_created_by;

-- =============================================================================
-- 2. DROP TENANT-AWARE INDEXES
-- =============================================================================

-- Drop tenant-specific indexes
DROP INDEX IF EXISTS idx_restaurants_tenant_id;
DROP INDEX IF EXISTS idx_branches_tenant_id;
DROP INDEX IF EXISTS idx_menuitems_tenant_id;
DROP INDEX IF EXISTS idx_orders_tenant_id;
DROP INDEX IF EXISTS idx_orderitems_tenant_id;
DROP INDEX IF EXISTS idx_riders_tenant_id;
DROP INDEX IF EXISTS idx_reviews_tenant_id;
DROP INDEX IF EXISTS idx_categories_tenant_id;

-- Drop composite indexes
DROP INDEX IF EXISTS idx_restaurants_tenant_manager;
DROP INDEX IF EXISTS idx_orders_tenant_status;
DROP INDEX IF EXISTS idx_orders_tenant_customer;
DROP INDEX IF EXISTS idx_menuitems_tenant_restaurant;

-- =============================================================================
-- 3. REMOVE TENANT_ID COLUMNS FROM EXISTING TABLES
-- =============================================================================

-- Remove tenant_id columns
ALTER TABLE Restaurants DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE Branches DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE MenuItems DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE Orders DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE OrderItems DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE Riders DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE RatingsAndReviews DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE Categories DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE Categories DROP COLUMN IF EXISTS is_global;

-- =============================================================================
-- 4. RESTORE ORIGINAL USERS TABLE
-- =============================================================================

-- Remove SaaS-specific columns from Users table
ALTER TABLE Users DROP COLUMN IF EXISTS is_platform_admin;
ALTER TABLE Users DROP COLUMN IF EXISTS email_verified;
ALTER TABLE Users DROP COLUMN IF EXISTS email_verification_token;
ALTER TABLE Users DROP COLUMN IF EXISTS password_reset_token;
ALTER TABLE Users DROP COLUMN IF EXISTS password_reset_expires;
ALTER TABLE Users DROP COLUMN IF EXISTS last_login;
ALTER TABLE Users DROP COLUMN IF EXISTS status;
ALTER TABLE Users DROP COLUMN IF EXISTS metadata;

-- Restore original role constraint
ALTER TABLE Users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE Users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('customer', 'restaurant_manager', 'rider', 'admin'));

-- =============================================================================
-- 5. DROP ALL SAAS TABLES
-- =============================================================================

-- Drop tables in correct order (due to foreign key dependencies)
DROP TABLE IF EXISTS TenantFeatureFlags CASCADE;
DROP TABLE IF EXISTS TenantAuditLogs CASCADE;
DROP TABLE IF EXISTS TenantInvoices CASCADE;
DROP TABLE IF EXISTS TenantSubscriptions CASCADE;
DROP TABLE IF EXISTS TenantBilling CASCADE;
DROP TABLE IF EXISTS SubscriptionPlans CASCADE;
DROP TABLE IF EXISTS UserTenants CASCADE;
DROP TABLE IF EXISTS Tenants CASCADE;

-- =============================================================================
-- 6. CLEAN UP USERS CREATED FOR SAAS
-- =============================================================================

-- Remove platform admin users (be careful with this!)
-- DELETE FROM Users WHERE role = 'platform_admin' OR email = 'platform@fooddelivery.com';

-- Note: Commented out for safety. Uncomment if you want to remove platform admin users.

-- =============================================================================
-- 7. VERIFICATION QUERIES
-- =============================================================================

-- Verify tables are back to original state
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    -- Check if tenant tables still exist
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '❌ Tenants table still exists!';
    ELSE
        RAISE NOTICE '✅ Tenants table successfully removed';
    END IF;
    
    -- Check if tenant_id columns still exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'restaurants' 
        AND column_name = 'tenant_id'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '❌ tenant_id column still exists in restaurants table!';
    ELSE
        RAISE NOTICE '✅ tenant_id column successfully removed from restaurants table';
    END IF;
END
$$;

-- =============================================================================
-- ROLLBACK COMPLETE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'MULTI-TENANT ROLLBACK COMPLETED';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '✅ Removed all tenant_id columns';
    RAISE NOTICE '✅ Dropped all SaaS-specific tables';
    RAISE NOTICE '✅ Restored original Users table structure';
    RAISE NOTICE '✅ Removed all tenant-related constraints and indexes';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Your database has been restored to the original single-tenant state.';
    RAISE NOTICE 'You can now use your application as it was before the migration.';
    RAISE NOTICE '=============================================================================';
END
$$;
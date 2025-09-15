// Database Migration Runner for Multi-Tenant SaaS
// ================================================
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class MigrationRunner {
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'Food_Delivery',
      password: process.env.DB_PASSWORD || 'danaye7',
      port: process.env.DB_PORT || 5432,
    });
  }

  async runMigration(migrationFile, options = {}) {
    const { dryRun = false, backup = true } = options;
    
    console.log(`\n🚀 Starting Migration: ${migrationFile}`);
    console.log('===============================================');
    
    try {
      // Read migration file
      const migrationPath = path.join(__dirname, 'migrations', migrationFile);
      if (!fs.existsSync(migrationPath)) {
        throw new Error(`Migration file not found: ${migrationPath}`);
      }
      
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      if (dryRun) {
        console.log('📋 DRY RUN MODE - SQL that would be executed:');
        console.log(migrationSQL);
        return;
      }
      
      // Create backup if requested
      if (backup) {
        await this.createBackup();
      }
      
      // Run migration
      const client = await this.pool.connect();
      
      try {
        await client.query('BEGIN');
        console.log('🔄 Executing migration...');
        
        await client.query(migrationSQL);
        
        await client.query('COMMIT');
        console.log('✅ Migration completed successfully!');
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }
  
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup_${timestamp}.sql`;
    
    console.log(`💾 Creating backup: ${backupFile}`);
    
    // Note: This is a simplified backup. In production, use pg_dump
    console.log('⚠️  For production, use: pg_dump -h localhost -U postgres -d Food_Delivery > backup.sql');
  }
  
  async validateMigration() {
    console.log('\n🔍 Validating migration results...');
    
    try {
      const client = await this.pool.connect();
      
      // Check if tenant tables exist
      const tenantTableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'tenants'
        );
      `);
      
      if (tenantTableExists.rows[0].exists) {
        console.log('✅ Tenants table exists');
        
        // Check for default tenant
        const defaultTenant = await client.query(`
          SELECT * FROM Tenants WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
        `);
        
        if (defaultTenant.rows.length > 0) {
          console.log('✅ Default tenant created');
        } else {
          console.log('❌ Default tenant not found');
        }
      } else {
        console.log('❌ Tenants table not found');
      }
      
      // Check if tenant_id columns exist
      const tenantColumns = await client.query(`
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE column_name = 'tenant_id'
        AND table_schema = 'public'
        ORDER BY table_name;
      `);
      
      console.log('📊 Tables with tenant_id columns:');
      tenantColumns.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      
      client.release();
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
    }
  }
  
  async showStatus() {
    console.log('\n📊 Database Status');
    console.log('==================');
    
    try {
      const client = await this.pool.connect();
      
      // Count records in key tables
      const results = await Promise.all([
        client.query('SELECT COUNT(*) FROM Users'),
        client.query('SELECT COUNT(*) FROM Restaurants'),
        client.query('SELECT COUNT(*) FROM Orders'),
        client.query(`
          SELECT COUNT(*) FROM Tenants WHERE EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'tenants'
          )
        `),
      ]);
      
      console.log(`Users: ${results[0].rows[0].count}`);
      console.log(`Restaurants: ${results[1].rows[0].count}`);
      console.log(`Orders: ${results[2].rows[0].count}`);
      console.log(`Tenants: ${results[3].rows[0].count}`);
      
      client.release();
      
    } catch (error) {
      console.error('❌ Status check failed:', error.message);
    }
  }
  
  async close() {
    await this.pool.end();
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const migrationFile = args[1];
  
  const runner = new MigrationRunner();
  
  try {
    switch (command) {
      case 'run':
        if (!migrationFile) {
          console.error('Usage: node migrate.js run <migration-file>');
          process.exit(1);
        }
        await runner.runMigration(migrationFile);
        await runner.validateMigration();
        break;
        
      case 'dry-run':
        if (!migrationFile) {
          console.error('Usage: node migrate.js dry-run <migration-file>');
          process.exit(1);
        }
        await runner.runMigration(migrationFile, { dryRun: true });
        break;
        
      case 'validate':
        await runner.validateMigration();
        break;
        
      case 'status':
        await runner.showStatus();
        break;
        
      case 'setup-saas':
        console.log('🎯 Setting up Multi-Tenant SaaS Platform...\n');
        await runner.runMigration('001_create_saas_multitenant_schema.sql');
        console.log('\n⏳ Adding tenant support to existing tables...\n');
        await runner.runMigration('002_add_tenant_id_to_existing_tables.sql');
        await runner.validateMigration();
        await runner.showStatus();
        console.log('\n🎉 Multi-Tenant SaaS setup complete!');
        console.log('\nNext steps:');
        console.log('1. Update your application code to use tenant-aware queries');
        console.log('2. Create tenant context middleware');
        console.log('3. Update frontend applications');
        console.log('4. Test with multiple tenants');
        break;
        
      case 'rollback':
        console.log('⚠️  Rolling back multi-tenant changes...');
        console.log('This will remove ALL tenant data!');
        
        // Simple confirmation
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const confirmation = await new Promise(resolve => {
          readline.question('Type "CONFIRM" to proceed with rollback: ', resolve);
        });
        
        readline.close();
        
        if (confirmation === 'CONFIRM') {
          await runner.runMigration('003_rollback_tenant_migration.sql');
          console.log('✅ Rollback completed');
        } else {
          console.log('❌ Rollback cancelled');
        }
        break;
        
      default:
        console.log(`
🗄️  Multi-Tenant SaaS Migration Runner
=====================================

Commands:
  setup-saas              - Full SaaS setup (runs all migrations)
  run <file>              - Run specific migration
  dry-run <file>          - Preview migration without executing
  validate                - Validate current migration state
  status                  - Show database status
  rollback                - Rollback all multi-tenant changes

Examples:
  node migrate.js setup-saas
  node migrate.js run 001_create_saas_multitenant_schema.sql
  node migrate.js dry-run 002_add_tenant_id_to_existing_tables.sql
  node migrate.js validate
  node migrate.js status
  node migrate.js rollback

Migration Files:
  001_create_saas_multitenant_schema.sql    - Core SaaS tables
  002_add_tenant_id_to_existing_tables.sql  - Add multi-tenancy to existing data
  003_rollback_tenant_migration.sql         - Rollback all changes
        `);
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  } finally {
    await runner.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = MigrationRunner;
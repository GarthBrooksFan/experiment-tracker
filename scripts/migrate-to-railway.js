#!/usr/bin/env node

/**
 * Railway Migration Script
 * 
 * This script helps migrate your data from SQLite to PostgreSQL for Railway deployment.
 * 
 * Usage:
 * 1. First, ensure your local SQLite database has the data you want to migrate
 * 2. Set up your Railway PostgreSQL database and get the DATABASE_URL
 * 3. Run: node scripts/migrate-to-railway.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function exportSQLiteData() {
  console.log('🔄 Exporting data from SQLite...');
  
  // Connect to SQLite database
  const sqlitePrisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./prisma/dev.db'
      }
    }
  });

  try {
    // Export all data
    const users = await sqlitePrisma.user.findMany();
    const researchers = await sqlitePrisma.researcher.findMany();
    const experiments = await sqlitePrisma.experiment.findMany();
    const resources = await sqlitePrisma.resource.findMany();
    const experimentLogs = await sqlitePrisma.experimentLog.findMany();
    const tags = await sqlitePrisma.tag.findMany();
    const resourceAllocations = await sqlitePrisma.resourceAllocation.findMany();

    const exportData = {
      users,
      researchers,
      experiments,
      resources,
      experimentLogs,
      tags,
      resourceAllocations,
      exportedAt: new Date().toISOString()
    };

    // Save to JSON file
    const exportPath = path.join(__dirname, '../data-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Data exported to ${exportPath}`);
    console.log(`📊 Exported ${users.length} users, ${experiments.length} experiments, ${resources.length} resources`);
    
    return exportData;
  } catch (error) {
    console.error('❌ Error exporting SQLite data:', error);
    throw error;
  } finally {
    await sqlitePrisma.$disconnect();
  }
}

async function importToPostgreSQL(data) {
  console.log('🔄 Importing data to PostgreSQL...');
  
  // Connect to PostgreSQL database (use Railway DATABASE_URL)
  const postgresPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    // Import in correct order (respecting foreign key constraints)
    
    // 1. Users first (no dependencies)
    for (const user of data.users) {
      await postgresPrisma.user.create({ data: user });
    }
    console.log(`✅ Imported ${data.users.length} users`);

    // 2. Researchers (no dependencies)
    for (const researcher of data.researchers) {
      await postgresPrisma.researcher.create({ data: researcher });
    }
    console.log(`✅ Imported ${data.researchers.length} researchers`);

    // 3. Resources (no dependencies)
    for (const resource of data.resources) {
      await postgresPrisma.resource.create({ data: resource });
    }
    console.log(`✅ Imported ${data.resources.length} resources`);

    // 4. Experiments (no dependencies)
    for (const experiment of data.experiments) {
      await postgresPrisma.experiment.create({ data: experiment });
    }
    console.log(`✅ Imported ${data.experiments.length} experiments`);

    // 5. Tags (no dependencies)
    for (const tag of data.tags) {
      await postgresPrisma.tag.create({ data: tag });
    }
    console.log(`✅ Imported ${data.tags.length} tags`);

    // 6. Experiment logs (depends on experiments)
    for (const log of data.experimentLogs) {
      await postgresPrisma.experimentLog.create({ data: log });
    }
    console.log(`✅ Imported ${data.experimentLogs.length} experiment logs`);

    // 7. Resource allocations (depends on resources and experiments)
    for (const allocation of data.resourceAllocations) {
      await postgresPrisma.resourceAllocation.create({ data: allocation });
    }
    console.log(`✅ Imported ${data.resourceAllocations.length} resource allocations`);

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error importing to PostgreSQL:', error);
    throw error;
  } finally {
    await postgresPrisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 Starting Railway Migration...\n');
  
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('sqlite')) {
    console.error('❌ Please set DATABASE_URL environment variable to your Railway PostgreSQL URL');
    process.exit(1);
  }

  try {
    // Step 1: Export from SQLite
    const data = await exportSQLiteData();
    
    console.log('\n');
    
    // Step 2: Import to PostgreSQL
    await importToPostgreSQL(data);
    
    console.log('\n✅ Migration completed! Your data is now in Railway PostgreSQL.');
    console.log('🔥 You can now deploy your app to Railway!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  main();
} 
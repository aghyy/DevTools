/**
 * Migration script to update the activity.type ENUM to include 'favorite' and 'codeSnippet'
 * 
 * Run with: node scripts/update-activity-enum.js
 */

const { Sequelize } = require('sequelize');
const config = require('../config/database').development;

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: false
  }
);

async function updateActivityTypeEnum() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Starting migration: Update activity.type ENUM...');

    // PostgreSQL syntax to update ENUM type
    await sequelize.query(`
      -- Create a new type with the additional values
      CREATE TYPE "enum_activities_type_new" AS ENUM ('tool', 'bookmark', 'favorite', 'codeSnippet');
      
      -- Update the table to use the new type
      ALTER TABLE activities 
        ALTER COLUMN type TYPE "enum_activities_type_new" 
        USING type::text::"enum_activities_type_new";
      
      -- Drop the old type
      DROP TYPE "enum_activities_type";
      
      -- Rename the new type to the original name
      ALTER TYPE "enum_activities_type_new" RENAME TO "enum_activities_type";
    `, { transaction });

    await transaction.commit();
    console.log('Migration completed successfully!');
  } catch (error) {
    await transaction.rollback();
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

updateActivityTypeEnum(); 
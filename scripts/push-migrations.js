#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 1,
});

const migrationsDir = path.join(__dirname, '../supabase/migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

async function executeSql(sql) {
  const client = await pool.connect();
  try {
    await client.query(sql);
  } finally {
    client.release();
  }
}

async function runMigrations() {
  console.log(`Found ${migrationFiles.length} migration files`);

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`Applying migration: ${file}`);
    try {
      await executeSql(sql);
      console.log(`✓ ${file} applied successfully`);
    } catch (error) {
      console.error(`✗ Error applying ${file}:`);
      console.error(error.message);
      await pool.end();
      process.exit(1);
    }
  }

  console.log('\n✓ All migrations applied successfully');
  await pool.end();
}

runMigrations();

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applyMigration() {
  const client = await pool.connect();
  try {
    await client.query("ALTER TABLE gad7_response ALTER COLUMN impairment_score DROP NOT NULL;");
    console.log("✓ Migration applied: made impairment_score nullable");
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration();

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres:Spandanagokul@143@db.wvgbyxwlxcetayjqenjc.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to database.");

    // Run 000003
    const sql3 = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '20240820000003_trending_computation.sql'), 'utf8');
    console.log("Running migration 3...");
    await client.query(sql3);
    console.log("Migration 3 successful.");

    // Run 000004
    const sql4 = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '20240820000004_cron_schedule.sql'), 'utf8');
    console.log("Running migration 4...");
    await client.query(sql4);
    console.log("Migration 4 successful.");

    // Optionally insert into supabase_migrations if we want to be clean, but not strictly necessary.

  } catch (err) {
    console.error("Error running migrations:", err);
  } finally {
    await client.end();
  }
}

run();

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres:Spandanagokul@143@db.wvgbyxwlxcetayjqenjc.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to database.");

    // Run 20240820000004_daily_metrics_aggregation.sql
    const sqlFile = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '20240820000004_daily_metrics_aggregation.sql'), 'utf8');
    console.log("Running migration...");
    await client.query(sqlFile);
    console.log("Migration successful. Backfill and cron schedule complete!");

  } catch (err) {
    console.error("Error running migrations:", err);
  } finally {
    await client.end();
  }
}

run();

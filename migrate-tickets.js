require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Spandanagokul@143@db.wvgbyxwlxcetayjqenjc.supabase.co:5432/postgres';

async function migrate() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    console.log("1. Creating support_tickets table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log("2. Enabling RLS on support_tickets...");
    await client.query(`ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;`);

    console.log("3. Creating Policies for support_tickets...");
    // Users can insert their own tickets
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Users can insert their own tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    // Users can read their own tickets
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Users can view their own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    // Admins can read all tickets
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Admins can view all tickets" ON support_tickets FOR SELECT USING (
          EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    // Admins can update tickets (e.g. resolve them)
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Admins can update tickets" ON support_tickets FOR UPDATE USING (
          EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    console.log("4. Updating profiles table...");
    await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS last_notification_read_at TIMESTAMPTZ DEFAULT NOW();
    `);

    console.log("5. Enabling Realtime on prompts table...");
    // Check if 'prompts' is already in the 'supabase_realtime' publication
    // Actually, simpler to just add it if not exists.
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' AND tablename = 'prompts'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE prompts;
        END IF;
      END $$;
    `);

    console.log("6. Reloading Schema Cache...");
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    
    console.log("Migration Complete!");

  } catch (err) {
    console.error('Migration Failed:', err);
  } finally {
    await client.end();
  }
}

migrate();

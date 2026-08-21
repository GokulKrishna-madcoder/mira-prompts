const { Client } = require('pg')

const connectionString = 'postgresql://postgres:Spandanagokul@143@db.wvgbyxwlxcetayjqenjc.supabase.co:5432/postgres'

const client = new Client({
  connectionString,
})

async function migrate() {
  try {
    await client.connect()
    
    // Add subscription_tier to profiles
    await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'none';
    `)
    console.log('Added subscription_tier to profiles table.')

    // Create payment_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        razorpay_payment_id TEXT UNIQUE,
        type TEXT,
        status TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    console.log('Created payment_history table.')

    // Enable RLS for payment_history
    await client.query(`
      ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
    `)
    
    console.log('Migration successful.')

  } catch (err) {
    console.error('Error executing migration', err)
  } finally {
    await client.end()
  }
}

migrate()

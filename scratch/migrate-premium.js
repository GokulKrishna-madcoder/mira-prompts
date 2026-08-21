const { Client } = require('pg')

const connectionString = 'postgresql://postgres:Spandanagokul@143@db.wvgbyxwlxcetayjqenjc.supabase.co:5432/postgres'

const client = new Client({
  connectionString,
})

async function migrate() {
  try {
    await client.connect()
    
    // Add is_premium to prompts
    await client.query(`
      ALTER TABLE prompts 
      ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
    `)
    console.log('Added is_premium to prompts table.')

    // Add Razorpay columns to profiles
    await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none';
    `)
    console.log('Added Razorpay columns to profiles table.')

  } catch (err) {
    console.error('Error executing migration', err)
  } finally {
    await client.end()
  }
}

migrate()

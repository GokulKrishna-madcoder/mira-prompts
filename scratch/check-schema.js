const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkSchema() {
  const { data: prompts, error: pErr } = await supabase.from('prompts').select('*').limit(1)
  console.log('Prompts Table:', Object.keys(prompts?.[0] || {}))
  
  const { data: profiles, error: prErr } = await supabase.from('profiles').select('*').limit(1)
  if (prErr) {
    console.log('Profiles table error:', prErr.message)
  } else {
    console.log('Profiles Table:', Object.keys(profiles?.[0] || {}))
  }
}

checkSchema()

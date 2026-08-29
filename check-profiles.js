const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function test() {
  const { data: profiles, error } = await supabase.from('profiles').select('id, display_name, username')
  console.log('Profiles:', profiles)
  const { data: prompts } = await supabase.from('prompts').select('id, title, created_by, status')
  console.log('Prompts created_by:', prompts.map(p => ({ title: p.title, created_by: p.created_by, status: p.status })))
}
test()

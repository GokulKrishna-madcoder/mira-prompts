const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function test() {
  const { data, error } = await supabase
    .from('prompts')
    .select('id, title, slug, image_url, prompt, status, created_at, created_by, variant_type, profiles:created_by(display_name, username)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Found:', data.length)
  }
}
test()

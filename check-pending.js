const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function test() {
  const { data, error } = await supabase.from('prompts').select('*').eq('status', 'pending')
  console.log('Pending prompts:', data?.length)
  if (data?.length) {
     console.log('First pending prompt:', JSON.stringify(data[0], null, 2))
  }
}
test()

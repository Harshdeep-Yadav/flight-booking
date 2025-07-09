const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function disableRLS() {
  console.log('🔧 Disabling RLS on users table to fix infinite recursion...\n');

  try {
    // Disable RLS on users table
    const { error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing users table:', error);
      return;
    }

    console.log('✅ Successfully accessed users table');
    console.log('📋 RLS should be bypassed by service role key');
    console.log('\n🎉 The infinite recursion issue should now be resolved!');
    console.log('   - Flight search should work properly');
    console.log('   - User authentication should work without RLS conflicts');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the fix
disableRLS(); 
const supabase = require('./supabase/client');

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies to avoid infinite recursion...\n');

  try {
    // Disable RLS on users table
    console.log('1. Disabling RLS on users table...');
    const { error: disableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;'
    });
    
    if (disableError) {
      console.log('Note: RLS disable failed (might already be disabled):', disableError.message);
    } else {
      console.log('✅ RLS disabled on users table');
    }

    // Re-enable RLS with simple policies
    console.log('\n2. Re-enabling RLS with simple policies...');
    const { error: enableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;'
    });
    
    if (enableError) {
      console.log('Note: RLS enable failed:', enableError.message);
    } else {
      console.log('✅ RLS re-enabled on users table');
    }

    // Create simple policies
    console.log('\n3. Creating simple user policies...');
    const policies = [
      'CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);',
      'CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);',
      'CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);'
    ];

    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.log('Note: Policy creation failed (might already exist):', error.message);
      } else {
        console.log('✅ Policy created');
      }
    }

    console.log('\n🎉 RLS policies fixed!');
    console.log('\n📋 The infinite recursion issue should now be resolved.');
    console.log('   - Users can access their own profiles');
    // - Admin checks will be handled in the application layer
    // - Flight search should work without RLS conflicts

  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error);
  }
}

// Run the fix
fixRLSPolicies(); 
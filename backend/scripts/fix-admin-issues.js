const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAdminIssues() {
  try {
    console.log('🔧 Fixing admin issues...\n');

    // 1. Add missing columns to profiles table
    console.log('1. Adding missing columns to profiles table...');
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      `
    });

    if (alterError) {
      console.log('⚠️  Could not add columns via RPC, trying direct SQL...');
      // Try alternative approach
      console.log('Please run the following SQL in your Supabase dashboard:');
      console.log(`
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      `);
    } else {
      console.log('✅ Added missing columns to profiles table');
    }

    // 2. Create profiles for existing users
    console.log('\n2. Creating profiles for existing users...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
    } else {
      console.log(`Found ${users.length} users`);
      
      for (const user of users) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            address: 'Sample Address',
            payment_info: { method: 'credit_card' },
            loyalty_points: 0,
            preferences: { notifications: true, newsletter: false }
          });

        if (profileError && !profileError.message.includes('duplicate key')) {
          console.log(`⚠️  Error creating profile for user ${user.id}:`, profileError.message);
        }
      }
      console.log('✅ Created profiles for existing users');
    }

    // 3. Test admin stats endpoint
    console.log('\n3. Testing admin stats endpoint...');
    
    try {
      const response = await fetch(`${process.env.API_URL || 'http://localhost:3001'}/admin/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'test-token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Admin stats endpoint working');
        console.log('Stats:', {
          totalBookings: data.totalBookings,
          totalRevenue: data.totalRevenue,
          flightsToday: data.flightsToday,
          totalUsers: data.totalUsers
        });
      } else {
        console.log('⚠️  Admin stats endpoint returned:', response.status);
      }
    } catch (error) {
      console.log('⚠️  Could not test admin stats endpoint:', error.message);
    }

    console.log('\n🎉 Admin issues fix completed!');
    console.log('\nNext steps:');
    console.log('1. Start your backend server');
    console.log('2. Start your frontend application');
    console.log('3. Login as admin user');
    console.log('4. Navigate to /admin page');

  } catch (error) {
    console.error('❌ Error fixing admin issues:', error);
  }
}

// Run the fix
fixAdminIssues(); 
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // First, create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@flightbooking.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        full_name: 'System Admin'
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('Auth user created:', authData.user.id);

    // Then, create the user profile in our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: 'admin@flightbooking.com',
        full_name: 'System Admin',
        role: 'admin'
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user profile:', userError);
      return;
    }

    console.log('Admin user created successfully!');
    console.log('Email: admin@flightbooking.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('User ID:', userData.id);

  } catch (error) {
    console.error('Error in createAdminUser:', error);
  }
}

// Run the function
createAdminUser(); 
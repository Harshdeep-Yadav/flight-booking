const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminUser() {
  try {
    console.log('👤 Creating admin user...\n');

    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    const adminName = 'Admin User';

    // Check if admin user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', adminEmail)
      .single();

    if (existingUser) {
      console.log('⚠️  Admin user already exists:');
      console.log('Email:', existingUser.email);
      console.log('Role:', existingUser.role);
      
      // Update role to admin if not already
      if (existingUser.role !== 'admin') {
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', existingUser.id);

        if (updateError) {
          console.log('❌ Failed to update user role:', updateError.message);
        } else {
          console.log('✅ Updated user role to admin');
        }
      }
      
      return;
    }

    // Create admin user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminName
      }
    });

    if (authError) {
      console.log('❌ Failed to create admin user in auth:', authError.message);
      return;
    }

    const userId = authData.user.id;

    // Create user in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: adminEmail,
        full_name: adminName,
        role: 'admin',
        phone: '+1234567890'
      })
      .select()
      .single();

    if (userError) {
      console.log('❌ Failed to create user in users table:', userError.message);
      return;
    }

    // Create profile for admin user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        address: 'Admin Address',
        payment_info: { method: 'credit_card' },
        loyalty_points: 1000,
        preferences: { notifications: true, newsletter: true }
      });

    if (profileError && !profileError.message.includes('duplicate key')) {
      console.log('⚠️  Failed to create profile:', profileError.message);
    }

    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role: admin');
    console.log('User ID:', userId);

    console.log('\nYou can now login with:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Run the script
createAdminUser(); 
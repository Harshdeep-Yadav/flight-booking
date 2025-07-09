const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Frontend Environment...\n');

// Check if .env.local already exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Do you want to overwrite it? (y/N)');
  process.stdin.once('data', (data) => {
    const answer = data.toString().trim().toLowerCase();
    if (answer === 'y' || answer === 'yes') {
      createEnvFile();
    } else {
      console.log('❌ Setup cancelled. .env.local was not modified.');
      process.exit(0);
    }
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  const envContent = `# Frontend Environment Configuration
# Generated automatically by setup-env.js

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# Supabase Configuration (if using client-side Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://khynwzlcxqeafiiychqc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeW53emxjeHFlYWZpaXljaHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NjcwMDUsImV4cCI6MjA2NzQ0MzAwNX0.tjQCYjnSYzejKiGnfQD_1pbNK0ALMdHeoH12VMuAJjM

# Application Configuration
NEXT_PUBLIC_APP_NAME=Flight Booking App
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_SSE=true

# Development Configuration
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=debug
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local created successfully!');
    console.log('\n📋 Environment variables configured:');
    console.log('   • API URL: http://localhost:4000');
    console.log('   • Supabase: Configured with project credentials');
    console.log('   • Offline Mode: Enabled');
    console.log('   • PWA Support: Enabled');
    console.log('   • SSE: Enabled');
    console.log('   • Debug Mode: Enabled');
    
    console.log('\n🔧 Next steps:');
    console.log('   1. Make sure your backend server is running on port 4000');
    console.log('   2. Run: npm install (if not already done)');
    console.log('   3. Run: npm run dev');
    console.log('   4. Open: http://localhost:3000');
    
    console.log('\n⚠️  Important Notes:');
    console.log('   • Update NEXT_PUBLIC_API_URL if your backend runs on a different port');
    console.log('   • For production, change NEXT_PUBLIC_API_URL to your production backend URL');
    console.log('   • Set NEXT_PUBLIC_DEBUG_MODE=false for production');
    
  } catch (error) {
    console.error('❌ Error creating .env.local:', error.message);
    process.exit(1);
  }
} 
# Frontend Environment Setup Guide

This guide will help you set up the frontend environment for the Flight Booking application.

## 🚀 Quick Setup

### Option 1: Automatic Setup (Recommended)
```bash
cd frontend
node setup-env.js
npm install
npm run dev
```

### Option 2: Manual Setup
```bash
cd frontend
cp env.example .env.local
# Edit .env.local with your configuration
npm install
npm run dev
```

## 📋 Prerequisites

Before setting up the frontend, ensure you have:

- ✅ **Node.js** (v18 or higher)
- ✅ **npm** or **yarn**
- ✅ **Backend server** running on port 4000
- ✅ **Supabase project** configured

## 🔧 Environment Configuration

### 1. Create Environment File

Create a `.env.local` file in the frontend directory:

```bash
cd frontend
touch .env.local
```

### 2. Configure Environment Variables

Add the following variables to your `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# Supabase Configuration
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
```

## 🔍 Environment Variables Explained

### API Configuration
- `NEXT_PUBLIC_API_URL`: URL of your backend server
  - **Development**: `http://localhost:4000`
  - **Production**: `https://your-backend-domain.com`

### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Application Configuration
- `NEXT_PUBLIC_APP_NAME`: Application name displayed in UI
- `NEXT_PUBLIC_APP_VERSION`: Application version

### Feature Flags
- `NEXT_PUBLIC_ENABLE_OFFLINE_MODE`: Enable/disable offline functionality
- `NEXT_PUBLIC_ENABLE_PWA`: Enable/disable PWA features
- `NEXT_PUBLIC_ENABLE_SSE`: Enable/disable Server-Sent Events

### Development Configuration
- `NEXT_PUBLIC_DEBUG_MODE`: Enable/disable debug logging
- `NEXT_PUBLIC_LOG_LEVEL`: Logging level (debug, info, warn, error)

## 🛠️ Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Verify Installation
```bash
npm run build
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access Application
Open your browser and navigate to: `http://localhost:3000`

## 🔧 Configuration for Different Environments

### Development Environment
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

### Production Environment
```env
NEXT_PUBLIC_API_URL=https://your-production-backend.com
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_LOG_LEVEL=error
```

### Staging Environment
```env
NEXT_PUBLIC_API_URL=https://your-staging-backend.com
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=info
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Backend Connection Error
**Error**: `Failed to fetch from API`
**Solution**: 
- Ensure backend server is running on port 4000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS configuration in backend

#### 2. Supabase Connection Error
**Error**: `Supabase client error`
**Solution**:
- Verify Supabase URL and key in `.env.local`
- Check Supabase project status
- Ensure RLS policies are configured

#### 3. Build Errors
**Error**: `Module not found`
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 4. Port Already in Use
**Error**: `Port 3000 is already in use`
**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use a different port
npm run dev -- -p 3001
```

### Environment File Issues

#### Missing .env.local
```bash
# Create the file
touch .env.local
# Copy from example
cp env.example .env.local
```

#### Invalid Environment Variables
- Ensure all variables start with `NEXT_PUBLIC_`
- Check for typos in variable names
- Verify no spaces around `=` sign

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate Supabase keys regularly

### API Security
- Use HTTPS in production
- Implement proper CORS policies
- Validate all API responses

## 📱 PWA Configuration

### Service Worker
The service worker is automatically registered when the app loads.

### Manifest
PWA manifest is configured in `public/manifest.json`.

### Offline Support
IndexedDB is used for offline data persistence.

## 🧪 Testing the Setup

### 1. Check Backend Connection
```bash
curl http://localhost:4000/health
```

### 2. Test Frontend
- Open `http://localhost:3000`
- Try to register/login
- Search for flights
- Check if offline mode works

### 3. Verify Features
- ✅ Authentication works
- ✅ Flight search works
- ✅ Booking system works
- ✅ Admin dashboard accessible (if admin user)
- ✅ Offline functionality works

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Check the backend setup guide
4. Review the console for error messages
5. Check the network tab for API errors

## 🔄 Updates

To update the environment configuration:

1. Stop the development server
2. Update `.env.local`
3. Restart the development server
4. Clear browser cache if needed

---

**Note**: This setup guide assumes you have already set up the backend server. If not, please refer to the backend README for backend setup instructions. 
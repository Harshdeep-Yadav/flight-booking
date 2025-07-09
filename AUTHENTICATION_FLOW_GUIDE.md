# Complete Authentication Flow Guide

## Overview
This guide explains the complete authentication flow implemented in the Flight Booking System, including role-based navigation and functionality.

## 🔐 Authentication Flow

### 1. User Registration
- **Endpoint**: `POST /users/register`
- **Flow**: 
  1. User fills registration form with email, password, and full name
  2. Backend creates user in Supabase Auth and custom users table
  3. User is automatically signed in after successful registration
  4. **Redirect**: User is redirected to `/search` page (for regular users) or `/admin` (for admin users)

### 2. User Login
- **Endpoint**: `POST /users/login`
- **Flow**:
  1. User enters email and password
  2. Backend authenticates with Supabase
  3. Returns user data and session tokens
  4. **Redirect**: Based on user role:
     - Regular users → `/search`
     - Admin users → `/admin`

### 3. User Logout
- **Flow**:
  1. Clears local storage tokens
  2. Resets authentication state
  3. **Redirect**: User is redirected to home page (`/`)

## 🎯 Role-Based Navigation

### Navigation Bar Behavior

#### For Unauthenticated Users:
- Home
- Search
- Sign In

#### For Authenticated Regular Users:
- Home
- Search
- Profile
- Sign Out

#### For Authenticated Admin Users:
- Home
- Search
- Profile
- **Admin** (Admin Dashboard)
- Sign Out

## 🛡️ Protected Routes

### 1. Search Page (`/search`)
- **Protection**: Requires authentication
- **Component**: `ProtectedRoute`
- **Access**: All authenticated users
- **Functionality**: Search and book flights

### 2. Profile Page (`/profile`)
- **Protection**: Requires authentication
- **Component**: `ProtectedRoute`
- **Access**: All authenticated users
- **Functionality**: View/edit profile, booking history

### 3. Admin Page (`/admin`)
- **Protection**: Requires admin role
- **Component**: `ProtectedRoute requiredRole="admin"`
- **Access**: Admin users only
- **Functionality**: Admin dashboard, manage flights, view stats

## 🔄 Automatic Redirects

### After Registration:
```javascript
// User is automatically signed in and redirected
if (data.user.role === 'admin') {
  router.push('/admin');
} else {
  router.push('/search');
}
```

### After Login:
```javascript
// Redirect based on user role
if (data.user.role === 'admin') {
  router.push('/admin');
} else {
  router.push('/search');
}
```

### After Logout:
```javascript
// Redirect to home page
router.push('/');
```

### Auth Page Protection:
```javascript
// If user is already authenticated, redirect based on role
if (user) {
  if (user.role === 'admin') {
    router.push('/admin');
  } else {
    router.push('/search');
  }
}
```

## 🎨 UI/UX Features

### Loading States
- Authentication loading spinners
- Smooth transitions between states
- Proper error handling and user feedback

### Role-Based UI Elements
- Admin button only shows for admin users
- Booking functionality only available to authenticated users
- Different navigation options based on authentication status

### Error Handling
- Clear error messages for authentication failures
- Rate limit handling for registration
- Network error handling

## 🔧 Technical Implementation

### AuthProvider Features
- Session persistence using localStorage
- Automatic token refresh
- Role-based redirects
- Loading states management

### ProtectedRoute Component
- Route-level authentication guards
- Role-based access control
- Automatic redirects for unauthorized access
- Loading states during authentication checks

### API Integration
- Centralized API service with axios
- Automatic token injection in requests
- Error handling and retry logic

## 🧪 Testing

### Test Scripts Available:
1. `test-complete-auth-flow.js` - Comprehensive authentication flow testing
2. `test-registration.js` - Registration testing
3. `test-auth.js` - Login/logout testing

### Test Scenarios:
- User registration and automatic sign-in
- Login with different user roles
- Protected route access
- Admin-only functionality
- Logout and session clearing

## 🚀 Getting Started

### 1. Start the Backend:
```bash
cd backend
npm start
```

### 2. Start the Frontend:
```bash
cd frontend
npm run dev
```

### 3. Test the Flow:
```bash
node test-complete-auth-flow.js
```

## 📋 User Journey Examples

### Regular User Journey:
1. Visit home page → See "Sign In" button
2. Click "Sign In" → Redirected to auth page
3. Register new account → Automatically signed in and redirected to search page
4. Search flights → Can book flights (authenticated)
5. View profile → See booking history
6. Sign out → Redirected to home page

### Admin User Journey:
1. Visit home page → See "Sign In" button
2. Login with admin credentials → Redirected to admin dashboard
3. Access admin features → Manage flights, view stats
4. Navigate to search → Can also book flights
5. Sign out → Redirected to home page

## 🔒 Security Features

- JWT token-based authentication
- Role-based access control
- Protected API endpoints
- Session management
- Automatic token refresh
- Secure logout (token clearing)

## 🎯 Key Benefits

1. **Seamless UX**: Automatic sign-in after registration
2. **Role-Based Access**: Different experiences for users and admins
3. **Protected Routes**: Secure access to sensitive pages
4. **Automatic Redirects**: Smart navigation based on user state
5. **Persistent Sessions**: Users stay logged in across browser sessions
6. **Clear Error Handling**: User-friendly error messages 
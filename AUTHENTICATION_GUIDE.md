# 🔐 Authentication Integration Guide

This guide covers the complete authentication system integration between the frontend and backend.

## 📋 Overview

The authentication system uses:
- **Backend**: Node.js/Express with Supabase Auth
- **Frontend**: React/Next.js with centralized API service
- **Token Management**: JWT tokens with automatic refresh handling
- **Error Handling**: Comprehensive error responses and user feedback

## 🏗️ Architecture

```
Frontend (Next.js) ←→ Backend API (Express) ←→ Supabase Auth
     ↓                      ↓                      ↓
  AuthProvider         Auth Middleware        JWT Tokens
  API Service          User Controllers       User Profiles
  Token Storage        Route Protection       Database
```

## 🔧 Backend Authentication

### 1. User Registration (`POST /users/register`)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

### 2. User Login (`POST /users/login`)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_at": 1704067200
  }
}
```

### 3. Get Profile (`GET /users/profile`)

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Response:**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z",
    "profile": {
      "address": "123 Main St",
      "preferences": {}
    }
  }
}
```

### 4. Update Profile (`PUT /users/profile`)

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "full_name": "Updated Name",
  "phone": "+1234567890",
  "address": "456 New St",
  "preferences": {
    "newsletter": true
  }
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "full_name": "Updated Name",
    "phone": "+1234567890",
    "role": "user",
    "profile": {
      "address": "456 New St",
      "preferences": {
        "newsletter": true
      }
    }
  }
}
```

## 🎨 Frontend Authentication

### 1. AuthProvider Setup

The `AuthProvider` manages authentication state and provides methods for:
- User registration and login
- Token storage and management
- Profile updates
- Session persistence

```typescript
// Usage in components
import { useAuth } from '../app/AuthProvider';

const MyComponent = () => {
  const { user, signIn, signUp, signOut, loading } = useAuth();
  
  // Component logic
};
```

### 2. API Service Integration

The centralized API service (`src/services/api.ts`) provides:
- Automatic token injection in requests
- 401 error handling with automatic logout
- Request/response interceptors
- Consistent error handling

```typescript
import api from '../services/api';

// All requests automatically include auth token
const response = await api.get('/users/profile');
const booking = await api.post('/bookings', bookingData);
```

### 3. Protected Routes

Routes that require authentication automatically redirect to login:

```typescript
// In components
const { user, loading } = useAuth();

if (loading) return <div>Loading...</div>;
if (!user) return <div>Please log in</div>;

// Protected content
```

## 🧪 Testing Authentication

### Backend Tests

Run the backend authentication test:

```bash
cd backend
node test-auth.js
```

### Frontend Tests

1. Open `frontend/test-auth.html` in a browser
2. Click "Run Complete Test Suite"
3. Verify all tests pass

### Manual Testing

1. **Start both servers:**
   ```bash
   # Backend (Terminal 1)
   cd backend && npm start
   
   # Frontend (Terminal 2)
   cd frontend && npm run dev
   ```

2. **Test Registration:**
   - Go to `http://localhost:3001/auth`
   - Register a new user
   - Verify successful registration

3. **Test Login:**
   - Login with registered credentials
   - Verify token storage and user state

4. **Test Protected Routes:**
   - Access `/profile` or `/admin`
   - Verify authentication required

5. **Test Token Expiry:**
   - Wait for token expiry or manually clear token
   - Verify automatic redirect to login

## 🔒 Security Features

### 1. Token Management
- JWT tokens with expiration
- Automatic token refresh
- Secure token storage in localStorage
- Automatic logout on token expiry

### 2. Error Handling
- Comprehensive error responses
- User-friendly error messages
- Automatic retry mechanisms
- Graceful degradation

### 3. Route Protection
- Middleware-based authentication
- Role-based access control
- Automatic redirects for unauthenticated users

### 4. Input Validation
- Server-side validation
- Client-side validation
- SQL injection prevention
- XSS protection

## 🚀 Deployment Considerations

### Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://flight-booking-zeez.onrender.com
```

**Backend (.env):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
```

### CORS Configuration

Ensure backend CORS is configured for frontend domain:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
```

### HTTPS in Production

- Use HTTPS for all API calls
- Secure cookie settings
- CSP headers
- HSTS headers

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Check backend CORS configuration
   - Verify frontend URL in backend settings

2. **Token Issues:**
   - Clear localStorage and re-login
   - Check token expiration
   - Verify token format

3. **API Connection:**
   - Verify backend is running on port 4000
   - Check network connectivity
   - Verify API endpoints

4. **Database Issues:**
   - Check Supabase connection
   - Verify database schema
   - Check user table permissions

### Debug Mode

Enable debug logging:

```javascript
// Backend
console.log('Auth debug:', { user, token });

// Frontend
console.log('Auth state:', { user, session, loading });
```

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [JWT Token Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practices-security.html)

---

**✅ Authentication Integration Complete!**

The authentication system is now fully integrated and ready for production use. All endpoints are tested, error handling is comprehensive, and security best practices are implemented. 
# Flight Booking System Setup Guide

## Backend Setup

### 1. Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin User Configuration
ADMIN_EMAIL=admin@flightbooking.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=System Admin

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
```

### 2. Database Setup
1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `backend/supabase/schema.sql` in your Supabase SQL editor
3. Copy your project URL and service role key to the `.env` file

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Create Admin User
```bash
cd backend
node scripts/createAdmin.js
```

This will create an admin user with:
- Email: admin@flightbooking.com
- Password: admin123
- Role: admin

### 5. Start Backend Server
```bash
cd backend
npm start
```

The backend will run on http://localhost:3000

## Frontend Setup

### 1. Environment Variables
Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Start Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend will run on http://localhost:3001

## API Endpoints

### Authentication
- `POST /users/register` - Register new user
- `POST /users/login` - Login user
- `GET /users/profile` - Get user profile (authenticated)
- `PUT /users/profile` - Update user profile (authenticated)

### Flights
- `GET /flights` - Get all flights (public)
- `GET /flights/:id` - Get specific flight (public)

### Bookings
- `GET /bookings` - Get user bookings (authenticated)
- `POST /bookings` - Create booking (authenticated)
- `PUT /bookings/:id` - Update booking (authenticated)
- `DELETE /bookings/:id` - Cancel booking (authenticated)

### Admin (Admin only)
- `GET /admin/stats` - Get admin statistics
- `GET /admin/flights` - Get all flights for management
- `POST /admin/flights` - Create new flight
- `PUT /admin/flights/:id` - Update flight
- `DELETE /admin/flights/:id` - Delete flight
- `GET /admin/bookings` - Get all bookings
- `PUT /admin/bookings/:id` - Update booking status
- `GET /admin/users` - Get all users

### SSE (Server-Sent Events)
- `GET /sse/flight-status` - Real-time flight status updates

## User Roles

### Regular User
- Can search for flights
- Can book flights
- Can view their bookings
- Can update their profile
- Cannot access admin features

### Admin User
- All regular user permissions
- Can manage flights (CRUD operations)
- Can view all bookings
- Can update booking statuses
- Can view all users
- Can access admin dashboard

## Testing the Connection

### 1. Test Backend
```bash
curl http://localhost:3000/
# Should return: {"message":"Flight Booking API","version":"1.0.0"}
```

### 2. Test Frontend
1. Open http://localhost:3001
2. Register a new user or login with admin credentials
3. Test search functionality
4. Test booking a flight
5. If admin, test admin dashboard

### 3. Test Admin Access
1. Login with admin credentials (admin@flightbooking.com / admin123)
2. Navigate to /admin
3. You should see the admin dashboard with statistics
4. Test creating, editing, and deleting flights
5. Test managing bookings

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure CORS_ORIGIN in backend .env matches frontend URL
2. **Authentication Errors**: Check Supabase credentials and ensure schema is properly set up
3. **Database Errors**: Verify the SQL schema has been executed in Supabase
4. **Port Conflicts**: Ensure ports 3000 (backend) and 3001 (frontend) are available

### Admin Role Issues

If admin user doesn't have proper permissions:

1. Check the user's role in Supabase:
```sql
SELECT id, email, role FROM users WHERE email = 'admin@flightbooking.com';
```

2. Update role manually if needed:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@flightbooking.com';
```

3. Re-run the admin creation script:
```bash
node scripts/createAdmin.js
```

## Security Notes

1. Never commit `.env` files to version control
2. Use strong passwords for admin accounts
3. Regularly rotate Supabase keys
4. Enable Row Level Security (RLS) in Supabase
5. Validate all user inputs on both frontend and backend

## Production Deployment

1. Set NODE_ENV=production
2. Use HTTPS in production
3. Set up proper CORS origins
4. Use environment-specific Supabase projects
5. Set up monitoring and logging
6. Configure proper backup strategies 
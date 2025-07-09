# Flight Booking Backend

A robust Node.js/Express backend for the Flight Booking application with Supabase integration, authentication, and comprehensive API endpoints.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Flight Management**: CRUD operations for flights with search and filtering
- **Booking System**: Complete booking workflow with email notifications
- **User Management**: User registration, profiles, and admin management
- **Real-time Updates**: Server-Sent Events (SSE) for flight status updates
- **Database Integration**: Supabase PostgreSQL with Row Level Security (RLS)
- **Email Notifications**: Automated booking confirmations and updates
- **Admin Dashboard**: Comprehensive admin interface for flight and user management

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project
- SMTP service for email notifications

## 🛠️ Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=4000
   NODE_ENV=development

   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key

   # Email Configuration (for notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Database Setup**
   - Run the SQL schema in your Supabase SQL editor:
   ```sql
   -- Copy and run the contents of supabase/schema.sql
   ```
   - Apply RLS policies:
   ```sql
   -- Copy and run the contents of supabase/check-flight-rls.sql
   ```

5. **Create Admin User**
   ```bash
   node scripts/createAdmin.js
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### With Docker
```bash
docker-compose up
```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/users/register`
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "1234567890"
}
```

#### POST `/users/login`
Login user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Flight Endpoints

#### GET `/flights/search`
Search for flights with filters
```
Query Parameters:
- origin (optional)
- destination (optional)
- departure_date (required)
- return_date (optional)
- adults (required)
- children (optional)
- infants (optional)
- cabin_class (optional)
```

#### GET `/flights`
Get all flights (admin only)

#### POST `/flights`
Create new flight (admin only)

#### PUT `/flights/:id`
Update flight (admin only)

#### DELETE `/flights/:id`
Delete flight (admin only)

### Booking Endpoints

#### POST `/bookings`
Create a new booking
```json
{
  "flight_id": "flight_id",
  "passenger_info": [...],
  "passenger_count": 1,
  "total_price": 299.99
}
```

#### GET `/bookings/user`
Get user's bookings

#### PUT `/bookings/:id`
Update booking

#### PUT `/bookings/:id/cancel`
Cancel booking

### Admin Endpoints

#### GET `/admin/stats`
Get dashboard statistics

#### GET `/admin/flights`
Get paginated flights with search

#### GET `/admin/bookings`
Get paginated bookings

#### GET `/admin/users`
Get paginated users

## 🗄️ Database Schema

### Tables
- **users**: User accounts and profiles
- **flights**: Flight information and availability
- **bookings**: Booking records and passenger info
- **profiles**: Extended user profile data

### Key Relationships
- Users can have multiple bookings
- Flights can have multiple bookings
- Bookings link users to flights

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin and user roles
- **Row Level Security (RLS)**: Database-level security policies
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Cross-origin request handling
- **Rate Limiting**: API request rate limiting

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Files
- `tests/adminController.test.js` - Admin functionality tests
- `tests/setup.js` - Test setup and utilities

### Manual Testing Scripts
- `test-auth.js` - Authentication flow testing
- `test-flight-search.js` - Flight search testing
- `test-booking-history.js` - Booking functionality testing
- `test-admin-pagination.js` - Admin pagination testing

## 📁 Project Structure

```
backend/
├── controllers/          # Route controllers
│   ├── adminController.js
│   ├── bookingsController.js
│   ├── flightsController.js
│   ├── usersController.js
│   └── emailController.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   ├── adminOnly.js
│   └── errorHandler.js
├── routes/              # API routes
│   ├── admin.js
│   ├── bookings.js
│   ├── flights.js
│   └── users.js
├── supabase/            # Database files
│   ├── schema.sql
│   └── client.js
├── scripts/             # Utility scripts
│   └── createAdmin.js
├── tests/               # Test files
├── app.js              # Express app setup
└── package.json
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment mode
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `JWT_SECRET`: JWT signing secret
- `EMAIL_HOST`: SMTP host for emails
- `EMAIL_PORT`: SMTP port
- `EMAIL_USER`: SMTP username
- `EMAIL_PASS`: SMTP password
- `CORS_ORIGIN`: Allowed CORS origin

### Database Configuration
- PostgreSQL via Supabase
- Row Level Security (RLS) enabled
- Connection pooling
- Automatic migrations

## 🚀 Deployment

### Docker Deployment
```bash
# Build image
docker build -t flight-booking-backend .

# Run container
docker run -p 4000:4000 flight-booking-backend
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=4000
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
JWT_SECRET=your_production_jwt_secret
EMAIL_HOST=your_production_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_production_email
EMAIL_PASS=your_production_email_password
CORS_ORIGIN=https://your-frontend-domain.com
```

## 📝 Development Guidelines

### Code Style
- Use ES6+ features
- Follow Express.js best practices
- Implement proper error handling
- Add comprehensive logging

### API Design
- RESTful endpoints
- Consistent response formats
- Proper HTTP status codes
- Input validation

### Security
- Validate all inputs
- Sanitize user data
- Use parameterized queries
- Implement rate limiting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information 
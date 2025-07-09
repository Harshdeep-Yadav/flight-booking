# Flight Booking System

A full-stack web application for flight booking with real-time updates, offline support, and comprehensive admin features.

## 🚀 Features

### User Features
- **Authentication**: Supabase Auth with user profile management
- **Flight Search**: Advanced search with filters (origin, destination, date, passengers, cabin class)
- **Booking Management**: Create, modify, and cancel bookings with passenger information
- **Real-time Updates**: Server-Sent Events (SSE) for live flight status updates
- **Offline Support**: IndexedDB for offline data persistence and caching
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Admin Features
- **Dashboard**: Real-time statistics and analytics
- **Flight Management**: CRUD operations for flights
- **Booking Oversight**: View and manage all bookings
- **User Management**: Monitor and manage user accounts
- **Role-based Access**: Secure admin-only routes

### Technical Features
- **Performance**: Web Workers for CPU-intensive operations
- **Real-time**: SSE for live updates
- **Offline**: IndexedDB caching and offline functionality
- **Testing**: Comprehensive unit and integration tests
- **Documentation**: Swagger API documentation
- **Deployment**: Docker containerization

## 🏗️ Architecture

### Frontend (Next.js + TypeScript)
```
frontend/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # Reusable UI components
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── indexedDb/          # IndexedDB implementation
│   ├── services/           # API service layer
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── workers/            # Web Workers for performance
```

### Backend (Node.js + Express)
```
backend/
├── controllers/            # Business logic controllers
├── middleware/             # Express middleware
├── routes/                 # API route definitions
├── supabase/              # Supabase configuration
├── tests/                 # Unit and integration tests
└── swagger.js             # API documentation
```

### Database (Supabase)
- **Authentication**: User management and JWT tokens
- **Database**: PostgreSQL with real-time subscriptions
- **Storage**: File storage for documents
- **Edge Functions**: Serverless functions for business logic

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Forms**: React Hook Form with Yup validation
- **Icons**: React Icons
- **Database**: IndexedDB for offline storage
- **Workers**: Web Workers for performance

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Server-Sent Events (SSE)
- **Email**: Nodemailer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

### DevOps
- **Containerization**: Docker + Docker Compose
- **Deployment**: Cloud-ready configuration
- **Monitoring**: Health checks and logging

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for containerized deployment)
- Supabase account and project

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd flight-booking-system
```

### 2. Environment Setup

#### Backend Environment
Create `.env` file in `backend/`:
```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

#### Frontend Environment
Create `.env.local` file in `frontend/`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Database Setup

#### Supabase Tables
Run these SQL commands in your Supabase SQL editor:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flights table
CREATE TABLE flights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flight_number TEXT NOT NULL,
  airline TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  available_seats INTEGER NOT NULL,
  cabin_class TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  flight_id UUID REFERENCES flights(id),
  passenger_count INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  passenger_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view flights" ON flights
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage flights" ON flights
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookings" ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

### 4. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 5. Run Development Servers

#### Backend
```bash
cd backend
npm start
```
Backend will be available at `http://localhost:3000`

#### Frontend
```bash
cd frontend
npm run dev
```
Frontend will be available at `http://localhost:3001`

### 6. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down
```

### Individual Containers
```bash
# Backend
cd backend
docker build -t flight-booking-backend .
docker run -p 3000:3000 flight-booking-backend

# Frontend
cd frontend
docker build -t flight-booking-frontend .
docker run -p 3001:3000 flight-booking-frontend
```

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📚 API Documentation

The API documentation is available at `/api-docs` when the backend is running. It includes:

- **Authentication**: JWT token-based authentication
- **Flights**: CRUD operations for flight management
- **Bookings**: Booking creation, modification, and cancellation
- **Users**: User profile management
- **Admin**: Admin-only endpoints for system management
- **SSE**: Real-time flight status updates

## 🔧 Configuration

### Environment Variables

#### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `SUPABASE_URL` | Supabase project URL | Required |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Required |
| `EMAIL_HOST` | SMTP host for emails | Required |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | Required |
| `EMAIL_PASS` | SMTP password | Required |

#### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Required |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000` |

## 🚀 Deployment

### Cloud Deployment Options

#### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Railway (Backend)
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

#### AWS/GCP/Azure
Use the provided Docker configuration for containerized deployment on any cloud platform.

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure email service
- [ ] Set up monitoring and logging
- [ ] Configure CDN for static assets
- [ ] Set up backup strategy
- [ ] Configure rate limiting
- [ ] Set up error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/api-docs`
- Review the test files for usage examples

## 🔄 Changelog

### Version 1.0.0
- Initial release with full flight booking functionality
- Real-time updates via SSE
- Offline support with IndexedDB
- Comprehensive admin dashboard
- Complete test coverage
- Docker deployment support "# flight-booking" 
"# flight-booking" 
"# flight-booking" 

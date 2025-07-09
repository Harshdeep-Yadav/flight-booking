# System Architecture

## Overview

The Flight Booking System is a modern, full-stack web application built with a microservices-inspired architecture that leverages the power of Supabase for backend services while maintaining custom business logic in a Node.js API.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Web Browser   │  │   Mobile Web    │  │   PWA Support   │ │
│  │   (React/TS)    │  │   (Responsive)  │  │   (Offline)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Next.js App   │  │   IndexedDB     │  │   Web Workers   │ │
│  │   (App Router)  │  │   (Offline DB)  │  │   (Performance) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Tailwind CSS  │  │   React Hooks   │  │   SSE Client    │ │
│  │   (Styling)     │  │   (State Mgmt)  │  │   (Real-time)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Express.js    │  │   CORS          │  │   Rate Limiting │ │
│  │   (API Server)  │  │   (Security)    │  │   (Protection)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   JWT Auth      │  │   Swagger Docs  │  │   Error Handler │ │
│  │   (Middleware)  │  │   (API Docs)    │  │   (Logging)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Controllers   │  │   Middleware    │  │   Services      │ │
│  │   (CRUD Ops)    │  │   (Validation)  │  │   (Business)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   SSE Server    │  │   Email Service │  │   Admin Logic   │ │
│  │   (Real-time)   │  │   (Notifications)│  │   (Management)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Supabase      │  │   PostgreSQL    │  │   Row Level     │ │
│  │   (Backend)     │  │   (Database)    │  │   Security      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Auth Service  │  │   Storage       │  │   Real-time     │ │
│  │   (JWT Tokens)  │  │   (Files)       │  │   Subscriptions │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── auth/              # Authentication pages
│   ├── search/            # Flight search pages
│   ├── admin/             # Admin dashboard pages
│   └── profile/           # User profile pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   ├── useFlightWorker.ts # Web Worker hook
│   └── useSSE.ts         # SSE hook
├── context/              # React Context providers
│   └── AuthProvider.tsx  # Authentication context
├── services/             # API service layer
│   ├── api.ts           # API client
│   └── supabase.ts      # Supabase client
├── indexedDb/            # IndexedDB implementation
│   └── database.ts      # Database operations
├── workers/              # Web Workers
│   └── flightWorker.ts  # Flight processing worker
├── types/                # TypeScript definitions
└── utils/                # Utility functions
```

### Backend Components

```
backend/
├── app.js                # Express application setup
├── bin/www               # Server startup script
├── routes/               # API route definitions
│   ├── index.js         # Health check routes
│   ├── flights.js       # Flight management routes
│   ├── bookings.js      # Booking management routes
│   ├── users.js         # User management routes
│   ├── admin.js         # Admin routes
│   └── sse.js           # SSE routes
├── controllers/          # Business logic controllers
│   ├── flightsController.js
│   ├── bookingsController.js
│   ├── adminController.js
│   ├── emailController.js
│   └── sseController.js
├── middleware/           # Express middleware
│   ├── auth.js          # Authentication middleware
│   ├── adminOnly.js     # Admin authorization
│   ├── errorHandler.js  # Error handling
│   └── logger.js        # Request logging
├── supabase/            # Supabase configuration
├── tests/               # Unit and integration tests
├── swagger.js           # API documentation
└── Dockerfile           # Container configuration
```

## Data Flow

### 1. User Authentication Flow
```
User → Frontend → Supabase Auth → JWT Token → Backend API
```

### 2. Flight Search Flow
```
User Input → Frontend → Web Worker → IndexedDB Cache → Backend API → Supabase → Results
```

### 3. Booking Flow
```
User Selection → Frontend → Backend API → Supabase → Email Service → Confirmation
```

### 4. Real-time Updates Flow
```
Supabase Changes → Backend SSE → Frontend → UI Updates
```

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication via Supabase
- **Row Level Security**: Database-level access control
- **Role-based Access**: User and admin role separation
- **CORS Protection**: Cross-origin request security

### Data Protection
- **Input Validation**: Server-side validation with Yup
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **XSS Protection**: Content Security Policy headers
- **Rate Limiting**: API request throttling

## Performance Architecture

### Frontend Performance
- **Code Splitting**: Next.js automatic code splitting
- **Web Workers**: CPU-intensive operations offloaded
- **IndexedDB Caching**: Offline data persistence
- **SSR/SSG**: Server-side rendering for SEO

### Backend Performance
- **Connection Pooling**: Database connection management
- **Caching**: Redis-like caching strategies
- **Load Balancing**: Horizontal scaling ready
- **Compression**: Response compression

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: No session state in backend
- **Database Scaling**: Supabase handles database scaling
- **CDN Ready**: Static assets optimized for CDN
- **Microservices Ready**: Modular architecture

### Vertical Scaling
- **Resource Optimization**: Efficient memory usage
- **Connection Management**: Proper connection pooling
- **Caching Strategy**: Multi-level caching
- **Monitoring**: Health checks and metrics

## Deployment Architecture

### Development Environment
```
Local Development → Docker Compose → Local Services
```

### Production Environment
```
Load Balancer → Multiple API Instances → Supabase → CDN
```

### Container Strategy
- **Multi-stage Builds**: Optimized Docker images
- **Health Checks**: Application health monitoring
- **Environment Variables**: Secure configuration management
- **Logging**: Centralized log management

## Monitoring & Observability

### Application Monitoring
- **Health Endpoints**: `/health` for service status
- **Error Tracking**: Comprehensive error handling
- **Performance Metrics**: Response time monitoring
- **User Analytics**: Usage pattern tracking

### Infrastructure Monitoring
- **Container Health**: Docker health checks
- **Database Monitoring**: Supabase dashboard
- **API Metrics**: Request/response monitoring
- **Real-time Alerts**: System status notifications

## Disaster Recovery

### Backup Strategy
- **Database Backups**: Supabase automatic backups
- **Code Versioning**: Git-based version control
- **Configuration Management**: Environment-based configs
- **Documentation**: Comprehensive system docs

### Recovery Procedures
- **Rollback Strategy**: Version-based rollbacks
- **Data Recovery**: Point-in-time recovery
- **Service Restoration**: Automated recovery scripts
- **Communication Plan**: Stakeholder notification process 
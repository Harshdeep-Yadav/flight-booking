# Flight Booking Frontend

A modern, responsive React/Next.js frontend for the Flight Booking application with real-time features, offline support, and an intuitive user interface.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with glassmorphism effects
- **Real-time Updates**: Server-Sent Events for live flight status updates
- **Offline Support**: IndexedDB caching for flight search results
- **Authentication**: Secure login/registration with role-based navigation
- **Flight Search**: Advanced search with filters and real-time results
- **Booking System**: Complete booking workflow with passenger management
- **Admin Dashboard**: Comprehensive admin interface for flight management
- **PWA Support**: Progressive Web App with offline capabilities
- **Responsive Design**: Mobile-first approach with desktop optimization

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend server running (see backend README)

## 🛠️ Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the frontend directory:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=https://flight-booking-zeez.onrender.com
   
   # Supabase Configuration (if using client-side Supabase)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Access the application at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

### With Docker
```bash
docker build -t flight-booking-frontend .
docker run -p 3000:3000 flight-booking-frontend
```

## 📱 Pages & Features

### Public Pages
- **Home** (`/`): Landing page with hero section
- **Authentication** (`/auth`): Login and registration forms
- **Search** (`/search`): Flight search with filters and results

### Protected Pages
- **Profile** (`/profile`): User profile and booking history
- **Admin Dashboard** (`/admin`): Admin-only flight and user management

## 🎨 UI Components

### Core Components
- **Navigation**: Responsive navbar with role-based links
- **FlightSearch**: Advanced search form with filters
- **FlightList**: Flight results with booking functionality
- **BookingModal**: Passenger information collection
- **AdminDashboard**: Comprehensive admin interface

### UI Elements
- **Button**: Reusable button component with variants
- **Input**: Form input with validation
- **Modal**: Overlay dialogs for forms and confirmations
- **Loader**: Loading spinners and states

## 🔧 Key Features Implementation

### Authentication Flow
```typescript
// Automatic role-based navigation
- Registration → Auto-login → Search page
- Login → Role-based navigation (admin/user)
- Protected routes with automatic redirects
```

### Flight Search
```typescript
// Advanced search with filters
- Origin/Destination search
- Date-based search
- Passenger count and cabin class
- Real-time results with caching
```

### Offline Support
```typescript
// IndexedDB integration
- Flight search result caching
- Offline data persistence
- Automatic sync when online
- Visual offline indicators
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js 13+ app directory
│   │   ├── admin/          # Admin pages
│   │   ├── auth/           # Authentication pages
│   │   ├── profile/        # User profile pages
│   │   ├── search/         # Flight search pages
│   │   ├── AuthProvider.tsx # Authentication context
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # Reusable components
│   │   ├── admin/          # Admin-specific components
│   │   ├── auth/           # Authentication components
│   │   ├── bookings/       # Booking components
│   │   ├── flights/        # Flight-related components
│   │   ├── profile/        # Profile components
│   │   └── ui/             # Generic UI components
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Authentication hook
│   │   ├── useFlights.ts   # Flight data hook
│   │   ├── useBookings.ts  # Booking management hook
│   │   └── useSSE.ts       # Server-Sent Events hook
│   ├── services/           # API services
│   │   └── api.ts          # Axios configuration
│   ├── types/              # TypeScript type definitions
│   │   ├── flight.ts       # Flight-related types
│   │   ├── booking.ts      # Booking-related types
│   │   └── user.ts         # User-related types
│   ├── utils/              # Utility functions
│   │   └── validation.ts   # Form validation
│   └── indexedDb/          # IndexedDB implementation
│       └── database.ts     # Database operations
├── public/                 # Static assets
│   ├── sw.js              # Service Worker
│   ├── offline.html       # Offline page
│   └── manifest.json      # PWA manifest
├── package.json
└── next.config.ts
```

## 🎯 Component Architecture

### Authentication Provider
```typescript
// Context-based authentication
- User state management
- Token handling
- Role-based navigation
- Automatic redirects
```

### Flight Search Hook
```typescript
// Data management with caching
- API integration
- IndexedDB caching
- Offline support
- Real-time updates
```

### Booking System
```typescript
// Complete booking workflow
- Passenger information collection
- Flight selection
- Booking confirmation
- Email notifications
```

## 🔒 Security Features

- **Protected Routes**: Role-based access control
- **Token Management**: Secure JWT handling
- **Input Validation**: Client-side form validation
- **CORS Handling**: Proper cross-origin requests
- **XSS Protection**: Sanitized user inputs

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Design System
- **Colors**: Blue gradient theme with glassmorphism
- **Typography**: Inter font family
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable with consistent styling

## 🚀 Performance Optimization

### Code Splitting
- Route-based code splitting
- Component lazy loading
- Dynamic imports for heavy components

### Caching Strategy
- IndexedDB for offline data
- Service Worker for static assets
- API response caching
- Image optimization

### Bundle Optimization
- Tree shaking
- Minification
- Compression
- CDN integration

## 🧪 Testing

### Manual Testing
```bash
# Test authentication flow
npm run test:auth

# Test flight search
npm run test:search

# Test booking flow
npm run test:booking
```

### Test Scripts
- `test-auth.js` - Authentication testing
- `test-flight-search.js` - Search functionality
- `test-booking-history.js` - Booking system
- `test-indexeddb.js` - Offline functionality

## 🔧 Development Guidelines

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Component-based architecture

### State Management
- React Context for global state
- Local state for component-specific data
- Custom hooks for reusable logic

### API Integration
- Axios for HTTP requests
- Centralized API configuration
- Error handling and retry logic
- Request/response interceptors

## 📦 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Build
```bash
docker build -t flight-booking-frontend .
docker run -p 3000:3000 flight-booking-frontend
```

### Environment Variables
```env
# Development
NEXT_PUBLIC_API_URL=https://flight-booking-zeez.onrender.com

# Production
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

## 🎨 UI/UX Features

### Visual Design
- **Glassmorphism**: Modern glass-like effects
- **Gradients**: Beautiful color transitions
- **Animations**: Smooth transitions and micro-interactions
- **Icons**: Consistent iconography with React Icons

### User Experience
- **Loading States**: Clear feedback during operations
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Confirmation messages
- **Offline Indicators**: Clear offline status display

## 📱 PWA Features

### Service Worker
- Offline caching
- Background sync
- Push notifications
- App-like experience

### Manifest
- App installation
- Splash screen
- Theme colors
- Icons and branding

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Workflow
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information
- Check the backend README for API documentation

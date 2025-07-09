-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles (extended info)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    address TEXT,
    payment_info JSONB,
    loyalty_points INT DEFAULT 0,
    preferences JSONB DEFAULT '{}'
);

-- Flights table with all required fields
CREATE TABLE IF NOT EXISTS public.flights (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_number VARCHAR(20) NOT NULL,
    airline VARCHAR(100) NOT NULL,
    origin VARCHAR(3) NOT NULL,
    destination VARCHAR(3) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTERVAL GENERATED ALWAYS AS (arrival_time - departure_time) STORED,
    cabin_class VARCHAR(20) NOT NULL CHECK (cabin_class IN ('Economy', 'Premium Economy', 'Business', 'First')),
    price NUMERIC(10,2) NOT NULL,
    available_seats INT NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'boarding', 'in_flight', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table with passenger information
CREATE TABLE IF NOT EXISTS public.bookings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    flight_id uuid REFERENCES public.flights(id) ON DELETE CASCADE,
    return_flight_id uuid REFERENCES public.flights(id) ON DELETE SET NULL,
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    total_price NUMERIC(10,2) NOT NULL,
    passenger_count INT NOT NULL,
    passenger_info JSONB NOT NULL, -- Stores array of passenger details
    trip_type VARCHAR(10) DEFAULT 'one-way' CHECK (trip_type IN ('one-way', 'round-trip')),
    e_ticket_url TEXT,
    payment_id uuid,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Passenger details for bookings
CREATE TABLE IF NOT EXISTS public.passengers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
    passenger_type VARCHAR(10) NOT NULL CHECK (passenger_type IN ('adult', 'child', 'infant')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    passport_number VARCHAR(50),
    seat_number VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Flights policies (public read, admin write)
CREATE POLICY "Anyone can view flights" ON public.flights
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify flights" ON public.flights
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON public.bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Passengers policies
CREATE POLICY "Users can view own passengers" ON public.passengers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE bookings.id = passengers.booking_id 
            AND bookings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create passengers for own bookings" ON public.passengers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE bookings.id = passengers.booking_id 
            AND bookings.user_id = auth.uid()
        )
    );

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flights_origin_destination ON public.flights(origin, destination);
CREATE INDEX IF NOT EXISTS idx_flights_departure_time ON public.flights(departure_time);
CREATE INDEX IF NOT EXISTS idx_flights_cabin_class ON public.flights(cabin_class);
CREATE INDEX IF NOT EXISTS idx_flights_airline ON public.flights(airline);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_flight_id ON public.bookings(flight_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_passengers_booking_id ON public.passengers(booking_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON public.flights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically calculate duration
CREATE OR REPLACE FUNCTION calculate_flight_duration()
RETURNS TRIGGER AS $$
BEGIN
    NEW.duration = NEW.arrival_time - NEW.departure_time;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to calculate duration
CREATE TRIGGER calculate_duration_trigger
    BEFORE INSERT OR UPDATE ON public.flights
    FOR EACH ROW
    EXECUTE FUNCTION calculate_flight_duration();

-- Sample data for testing (optional)
-- INSERT INTO public.flights (flight_number, airline, origin, destination, departure_time, arrival_time, cabin_class, price, available_seats) VALUES
-- ('AA101', 'American Airlines', 'JFK', 'LAX', '2024-01-15 10:00:00+00', '2024-01-15 13:30:00+00', 'Economy', 299.99, 150),
-- ('UA202', 'United Airlines', 'LAX', 'JFK', '2024-01-15 14:00:00+00', '2024-01-15 21:30:00+00', 'Business', 899.99, 20); 
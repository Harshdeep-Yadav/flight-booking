-- Check current RLS policies on flights table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'flights';

-- Check if RLS is enabled on flights table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'flights';

-- Drop any problematic RLS policies on flights table that might block service role
DROP POLICY IF EXISTS "Enable read access for all users" ON flights;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON flights;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON flights;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON flights;

-- Create new RLS policies that allow service role full access
CREATE POLICY "Service role full access" ON flights
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policy for authenticated users to read flights
CREATE POLICY "Authenticated users can read flights" ON flights
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for authenticated users to update flights (for booking process)
CREATE POLICY "Authenticated users can update flights" ON flights
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy for service role to manage bookings
CREATE POLICY "Service role full access to bookings" ON bookings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policy for users to manage their own bookings
CREATE POLICY "Users can manage their own bookings" ON bookings
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy for users to read their own bookings
CREATE POLICY "Users can read their own bookings" ON bookings
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('flights', 'bookings')
ORDER BY tablename, policyname; 
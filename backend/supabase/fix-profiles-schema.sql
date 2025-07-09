-- Fix profiles table schema
-- Add missing created_at column to profiles table

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create trigger for updated_at on profiles table
CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some sample profile data if profiles table is empty
INSERT INTO public.profiles (id, address, payment_info, loyalty_points, preferences)
SELECT 
    u.id,
    'Sample Address',
    '{"method": "credit_card"}',
    0,
    '{"notifications": true, "newsletter": false}'
FROM public.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
LIMIT 10;

-- Verify the fix
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position; 
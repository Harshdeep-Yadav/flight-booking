import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabaseUrl = "https://khynwzlcxqeafiiychqc.supabase.co" as string;
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeW53emxjeHFlYWZpaXljaHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NjcwMDUsImV4cCI6MjA2NzQ0MzAwNX0.tjQCYjnSYzejKiGnfQD_1pbNK0ALMdHeoH12VMuAJjM" as string;


export const supabase = createClient(supabaseUrl, supabaseAnonKey); 

import { createClient } from '@supabase/supabase-js';

// Access Environment Variables (Vite uses import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // We log a warning instead of throwing an error so the app doesn't crash during development
    console.warn('Missing Supabase Environment Variables. Auth will not work.');
}

// Create and export the Supabase Client
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase URL and key from the existing configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jzghxlwpdzrpnlhrgocu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z2h4bHdwZHpycG5saHJnb2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NzkwNTcsImV4cCI6MjA1NjI1NTA1N30.e-iAoV1wGmVP5Har_nQppqjDmGijUXAU-hfAKNVyaX0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
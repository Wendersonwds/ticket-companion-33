import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://epigksdmmxgeyelqcnjc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwaWdrc2RtbXhnZXllbHFjbmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4ODE1MjQsImV4cCI6MjA5MjQ1NzUyNH0.my3ZU6tluT7PVszSkub9Elmc7SMK9E-hc3w8Jv_doNk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

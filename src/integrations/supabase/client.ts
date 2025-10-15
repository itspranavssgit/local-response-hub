import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://knlgpgqloblcxsaomptc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubGdwZ3Fsb2JsY3hzYW9tcHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDEyNjEsImV4cCI6MjA3NjA3NzI2MX0.qztxtG0z1RqlIbV8g7PXoY9Kk2rQqvJQPxT4VYjX1eg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

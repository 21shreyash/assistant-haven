// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rlnvlwyamjrsvkndgswt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbnZsd3lhbWpyc3ZrbmRnc3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4OTM3NTcsImV4cCI6MjA1NzQ2OTc1N30.QbG-9J6skqFDfj9iqNvlgOD-DsDujxYnHpR5CM3rwG0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
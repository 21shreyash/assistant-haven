
import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Use the auto-generated Supabase client from the integration
export const supabase = supabaseClient;

export type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  content: string;
  role: 'assistant' | 'user';
  created_at: string;
};


import { createClient } from '@supabase/supabase-js';

// These are public keys that can be exposed in the client
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

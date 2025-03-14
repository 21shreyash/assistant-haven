
import { createClient } from '@supabase/supabase-js'
import { supabase as supabaseClient } from '@/integrations/supabase/client'

// Use the client imported from integrations instead of creating a new one
export const supabase = supabaseClient

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
}

export interface CalendarToken {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

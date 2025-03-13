
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import { decode } from "https://deno.land/std@0.218.0/encoding/base64.ts";

// Configuration and environment variables
const CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
const REDIRECT_URI = Deno.env.get("GOOGLE_REDIRECT_URI") || "";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to generate an OAuth URL
function getAuthUrl(state: string) {
  const scope = encodeURIComponent("https://www.googleapis.com/auth/calendar");
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}&access_type=offline&state=${state}&prompt=consent`;
}

// Function to extract date and time from text using regex
function extractDateTime(text: string): { date: string | null, time: string | null } {
  // Simple regex for date patterns like "tomorrow", "next Tuesday", "May 20", etc.
  const datePatterns = {
    tomorrow: /\btomorrow\b/i,
    dayOfWeek: /\b(next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    monthDay: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?\b/i,
    numericDate: /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/
  };

  // Simple regex for time patterns like "3pm", "15:00", "at 3", etc.
  const timePatterns = {
    standard: /\b(at\s+)?(\d{1,2})(:\d{2})?\s*(am|pm)\b/i,
    military: /\b(at\s+)?(\d{1,2})(:\d{2})\b/i
  };

  let date = null;
  let time = null;

  // Check for date patterns
  for (const [type, pattern] of Object.entries(datePatterns)) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match) {
        date = match[0];
        break;
      }
    }
  }

  // Check for time patterns
  for (const [type, pattern] of Object.entries(timePatterns)) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match) {
        time = match[0];
        break;
      }
    }
  }

  return { date, time };
}

// Function to extract event title from message
function extractEventTitle(text: string): string {
  // Simple approach: Look for phrases like "meeting with", "call with", "appointment for"
  const eventPhrases = [
    /\bmeeting\s+(?:with|about)\s+([^.,]+)/i,
    /\bcall\s+(?:with|about)\s+([^.,]+)/i,
    /\bappointment\s+(?:with|for)\s+([^.,]+)/i,
    /\bschedule\s+(?:a|an)\s+([^.,]+)/i,
    /\badd\s+(?:a|an)\s+([^.,]+)\s+to\s+(?:my|the)\s+calendar\b/i
  ];

  for (const pattern of eventPhrases) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Fallback to generic title
  return "New Event";
}

// Function to get access token from authorization code
async function getAccessToken(code: string) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get access token: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

// Function to create an event in Google Calendar
async function createCalendarEvent(accessToken: string, eventDetails: any) {
  const { title, date, time } = eventDetails;
  
  // Create a basic event object
  // In a production app, you would need more sophisticated date/time parsing
  let startDateTime = new Date();
  let endDateTime = new Date();
  
  // Add 1 day if "tomorrow" is specified
  if (date && date.toLowerCase().includes("tomorrow")) {
    startDateTime.setDate(startDateTime.getDate() + 1);
    endDateTime.setDate(endDateTime.getDate() + 1);
  }
  
  // Set the time if specified (simplified)
  if (time) {
    const hourMatch = time.match(/(\d{1,2})/);
    if (hourMatch) {
      let hour = parseInt(hourMatch[1]);
      
      // Handle AM/PM
      if (time.toLowerCase().includes("pm") && hour < 12) {
        hour += 12;
      }
      
      startDateTime.setHours(hour, 0, 0);
      endDateTime.setHours(hour + 1, 0, 0);
    }
  }
  
  const event = {
    summary: title,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'UTC' // Should be user's timezone in production
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'UTC' // Should be user's timezone in production
    }
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create event: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

// Create Supabase client
const supabaseClient = (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false }
  });
};

// Save tokens to the user's metadata
async function saveTokensForUser(supabase: any, userId: string, tokens: any) {
  const { error } = await supabase.from('user_calendar_tokens')
    .upsert({ 
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    });

  if (error) throw error;
}

// Get tokens for a user
async function getTokensForUser(supabase: any, userId: string) {
  const { data, error } = await supabase.from('user_calendar_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Refresh the access token if expired
async function refreshAccessToken(refreshToken: string) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to refresh token: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Initialize the Supabase client
    let supabase;
    try {
      supabase = supabaseClient(req);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle OAuth callback
    if (path === 'callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      
      if (!code) {
        return new Response(JSON.stringify({ error: 'No authorization code provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Verify state matches the user ID (to prevent CSRF)
      if (state !== user.id) {
        return new Response(JSON.stringify({ error: 'Invalid state parameter' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Exchange code for tokens
      const tokens = await getAccessToken(code);
      
      // Save tokens to user's metadata
      await saveTokensForUser(supabase, user.id, tokens);

      // Redirect back to the app
      return new Response(null, {
        status: 303,
        headers: { 
          ...corsHeaders, 
          Location: `${url.origin}/chat?calendar_connected=success`
        }
      });
    }
    
    // Handle auth URL generation
    if (path === 'auth') {
      const authUrl = getAuthUrl(user.id);
      return new Response(JSON.stringify({ url: authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle adding events
    if (path === 'addevent' && req.method === 'POST') {
      // Parse the request body
      const { message } = await req.json();
      
      if (!message) {
        return new Response(JSON.stringify({ error: 'No message provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Extract event details
      const { date, time } = extractDateTime(message);
      const title = extractEventTitle(message);

      // Get user's tokens
      let tokens;
      try {
        tokens = await getTokensForUser(supabase, user.id);
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: 'Not connected to Google Calendar',
          requiresAuth: true,
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check if token has expired and refresh if needed
      let accessToken = tokens.access_token;
      if (new Date(tokens.expires_at) < new Date()) {
        const newTokens = await refreshAccessToken(tokens.refresh_token);
        await saveTokensForUser(supabase, user.id, {
          ...newTokens,
          refresh_token: tokens.refresh_token
        });
        accessToken = newTokens.access_token;
      }

      // Create the calendar event
      const event = await createCalendarEvent(accessToken, { title, date, time });

      return new Response(JSON.stringify({
        success: true,
        event: {
          id: event.id,
          title,
          date,
          time,
          htmlLink: event.htmlLink
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle checking connection status
    if (path === 'status') {
      try {
        await getTokensForUser(supabase, user.id);
        return new Response(JSON.stringify({ connected: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ connected: false }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Default response for unknown paths
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in calendar function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

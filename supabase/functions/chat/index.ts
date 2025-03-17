
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { messages, skillMetadata } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages are required and must be an array');
    }

    // Ensure we're focusing on the latest message in context
    console.log(`Processing ${messages.length} messages. Latest: "${messages[messages.length - 1]?.content || 'none'}"`);

    // Customize system prompt based on skill metadata if provided
    let systemPrompt = 'Be precise and concise. Always respond to the most recent user message.';
    
    if (skillMetadata) {
      // Add skill-specific instructions to the system prompt
      systemPrompt += ` You are specifically responding about ${skillMetadata.domain}.`;
      
      if (skillMetadata.constraints) {
        systemPrompt += ` ${skillMetadata.constraints}`;
      }
    }

    // Add system message if not already present
    let messagePayload = [...messages];
    if (messages.length === 0 || messages[0].role !== 'system') {
      messagePayload = [{ role: 'system', content: systemPrompt }, ...messages];
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messagePayload,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Failed to get response from OpenAI');
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({
      content: data.choices[0].message.content,
      role: 'assistant'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

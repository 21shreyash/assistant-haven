
import { registerSkill, Skill, SkillContext, SkillResult } from "./types";
import { supabase } from "@/lib/supabase";

const CalendarSkill: Skill = {
  id: "calendar",
  name: "Google Calendar Integration",
  description: "Allows you to add events to your Google Calendar",
  patterns: [
    /schedule/i,
    /meeting/i,
    /appointment/i,
    /calendar/i,
    /remind/i,
    /event/i,
    /tomorrow/i,
    /next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
  ],
  
  canHandle: (message: string, context: SkillContext) => {
    // Check if the message contains calendar-related keywords
    const hasCalendarIntent = CalendarSkill.patterns.some(pattern => pattern.test(message));
    
    // Also check for time patterns to confirm it's a scheduling request
    const hasTimePattern = /\b(\d{1,2})(:\d{2})?\s*(am|pm|o'clock)\b/i.test(message) ||
                          /\b(morning|afternoon|evening|night)\b/i.test(message);
    
    const canHandle = hasCalendarIntent && hasTimePattern;
    
    // Add debug logging
    console.log(`CalendarSkill.canHandle() - Message: "${message}"`);
    console.log(`CalendarSkill.canHandle() - hasCalendarIntent: ${hasCalendarIntent}`);
    console.log(`CalendarSkill.canHandle() - hasTimePattern: ${hasTimePattern}`);
    console.log(`CalendarSkill.canHandle() - Final result: ${canHandle}`);
    
    return canHandle;
  },
  
  execute: async (message: string, context: SkillContext): Promise<SkillResult> => {
    console.log(`CalendarSkill.execute() - Starting execution for message: "${message}"`);
    
    try {
      // Check if user is logged in with Google (this is a server-side check)
      console.log("CalendarSkill - Checking connection status");
      const { data: statusData, error: statusError } = await supabase.functions.invoke('calendar/status');
      
      if (statusError) {
        console.error("CalendarSkill - Status check error:", statusError);
        throw new Error(`Calendar status check failed: ${statusError.message}`);
      }
      
      console.log("CalendarSkill - Connection status:", statusData);
      
      // If not connected, guide the user to connect
      if (!statusData.connected) {
        console.log("CalendarSkill - User not connected, getting auth URL");
        // Get auth URL
        const { data: authData, error: authError } = await supabase.functions.invoke('calendar/auth');
        
        if (authError) {
          console.error("CalendarSkill - Auth URL error:", authError);
          throw new Error(`Failed to get auth URL: ${authError.message}`);
        }
        
        console.log("CalendarSkill - Returning auth prompt with URL:", authData.url);
        
        // Check if the user is authenticated with Google but missing calendar scope
        const { data: userData } = await supabase.auth.getUser();
        const isGoogleUser = userData?.user?.app_metadata?.provider === 'google';
        
        let content = `I'd like to add this event to your calendar, but you need to connect to Google Calendar first. [Click here to connect](${authData.url})`;
        
        if (isGoogleUser) {
          content = `I need additional permissions to access your Google Calendar. [Click here to grant calendar access](${authData.url})`;
        }
        
        return {
          content,
          role: 'assistant',
          metadata: {
            skillId: CalendarSkill.id,
            requiresAuth: true,
            authUrl: authData.url
          }
        };
      }
      
      // User is connected, try to add the event
      console.log("CalendarSkill - User connected, adding event");
      const { data, error } = await supabase.functions.invoke('calendar/addevent', {
        body: { message }
      });
      
      if (error) {
        console.error("CalendarSkill - Add event error:", error);
        console.error("Error details:", error.message, error.stack);
        
        // Check if we need authentication
        if (error.message.includes('authentication') || (data && data.requiresAuth)) {
          console.log("CalendarSkill - Auth required, getting auth URL");
          const { data: authData, error: authError } = await supabase.functions.invoke('calendar/auth');
          
          if (authError) {
            console.error("CalendarSkill - Auth URL error during reconnect:", authError);
            throw new Error(`Failed to get auth URL for reconnection: ${authError.message}`);
          }
          
          console.log("CalendarSkill - Returning reconnect prompt with URL:", authData.url);
          
          return {
            content: `I need to reconnect to your Google Calendar. [Click here to reconnect](${authData.url})`,
            role: 'assistant',
            metadata: {
              skillId: CalendarSkill.id,
              requiresAuth: true,
              authUrl: authData.url
            }
          };
        }
        throw new Error(`Calendar event creation failed: ${error.message}`);
      }
      
      // Event added successfully
      console.log("CalendarSkill - Event added successfully:", data);
      
      return {
        content: `I've added the event "${data.event.title}" to your calendar${data.event.date ? ` on ${data.event.date}` : ""}${data.event.time ? ` at ${data.event.time}` : ""}. [View in Google Calendar](${data.event.htmlLink})`,
        role: 'assistant',
        metadata: {
          skillId: CalendarSkill.id,
          event: data.event
        }
      };
    } catch (error: any) {
      console.error("Calendar skill error:", error);
      return {
        content: `I had trouble adding that to your calendar: ${error.message}. Please try again with more specific details like "Schedule a meeting with John tomorrow at 3pm."`,
        role: 'assistant',
        metadata: {
          skillId: CalendarSkill.id,
          error: error.message
        }
      };
    }
  }
};

// Register the skill
registerSkill(CalendarSkill);

export default CalendarSkill;


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
  
  canHandle: (message: string) => {
    // Check if the message contains calendar-related keywords
    const hasCalendarIntent = CalendarSkill.patterns.some(pattern => pattern.test(message));
    
    // Also check for time patterns to confirm it's a scheduling request
    const hasTimePattern = /\b(\d{1,2})(:\d{2})?\s*(am|pm|o'clock)\b/i.test(message) ||
                          /\b(morning|afternoon|evening|night)\b/i.test(message);
    
    return hasCalendarIntent && hasTimePattern;
  },
  
  execute: async (message: string, context: SkillContext): Promise<SkillResult> => {
    try {
      // First, check if user is connected to Google Calendar
      const { data: statusData, error: statusError } = await supabase.functions.invoke('calendar/status');
      
      if (statusError) throw new Error(statusError.message);
      
      // If not connected, guide the user to connect
      if (!statusData.connected) {
        // Get auth URL
        const { data: authData, error: authError } = await supabase.functions.invoke('calendar/auth');
        
        if (authError) throw new Error(authError.message);
        
        return {
          content: `I'd like to add this event to your calendar, but you need to connect to Google Calendar first. [Click here to connect](${authData.url})`,
          role: 'assistant',
          metadata: {
            skillId: CalendarSkill.id,
            requiresAuth: true,
            authUrl: authData.url
          }
        };
      }
      
      // User is connected, try to add the event
      const { data, error } = await supabase.functions.invoke('calendar/addevent', {
        body: { message }
      });
      
      if (error) {
        // Check if we need authentication
        if (error.message.includes('authentication') || (data && data.requiresAuth)) {
          const { data: authData } = await supabase.functions.invoke('calendar/auth');
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
        throw new Error(error.message);
      }
      
      // Event added successfully
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
        role: 'assistant'
      };
    }
  }
};

// Register the skill
registerSkill(CalendarSkill);

export default CalendarSkill;


import { registerSkill, Skill, SkillContext, SkillResult } from "./types";
import { supabase } from "@/lib/supabase";

const ConversationSkill: Skill = {
  id: "conversation",
  name: "General Conversation",
  description: "Handles general conversation with the AI assistant",
  patterns: [/.*/], // Matches any message as fallback
  
  canHandle: () => true, // This is the fallback skill, so it handles everything
  
  execute: async (message: string, context: SkillContext): Promise<SkillResult> => {
    try {
      // Format messages for the API
      const messageHistory = context.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages: messageHistory },
      });
      
      if (error) throw error;
      
      return {
        content: data.content,
        role: 'assistant'
      };
    } catch (error: any) {
      console.error("Error in conversation skill:", error);
      return {
        content: "I'm sorry, I had trouble processing that. Please try again.",
        role: 'assistant'
      };
    }
  }
};

// Register the skill
registerSkill(ConversationSkill);

export default ConversationSkill;

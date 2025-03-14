
import { ChatMessage } from "@/lib/supabase";
import { findSkillForMessage, SkillContext, SkillResult, SKILLS_REGISTRY } from "./types";

// Import all skills to ensure they're registered
import "./conversationSkill";
import "./weatherSkill";
import "./calculatorSkill";
import "./calendarSkill";

export async function processMessage(
  userMessage: string,
  messageHistory: ChatMessage[],
  userId: string
): Promise<SkillResult> {
  const context: SkillContext = {
    messages: messageHistory,
    userId
  };

  console.log(`Processing message: "${userMessage}"`);
  
  // Find the appropriate skill
  const skill = findSkillForMessage(userMessage, context);
  
  if (!skill) {
    // Log the fallback to conversation
    console.log(`No specific skill found for message: "${userMessage}". Using fallback conversation skill.`);
    
    // Fallback to default conversation if no skill is found
    const conversationSkill = SKILLS_REGISTRY["conversation"];
    return await conversationSkill.execute(userMessage, context);
  }
  
  // Execute the selected skill
  console.log(`Using skill: ${skill.name} (${skill.id})`);
  
  try {
    const result = await skill.execute(userMessage, context);
    
    // Add skillId to the metadata if not present
    if (result && !result.metadata?.skillId) {
      result.metadata = {
        ...(result.metadata || {}),
        skillId: skill.id
      };
    }
    
    return result;
  } catch (error) {
    console.error(`Error executing skill ${skill.id}:`, error);
    // Fall back to conversation on error
    console.log(`Falling back to conversation skill due to error`);
    const conversationSkill = SKILLS_REGISTRY["conversation"];
    return await conversationSkill.execute(userMessage, context);
  }
}

export function getAllSkills() {
  return Object.values(SKILLS_REGISTRY);
}

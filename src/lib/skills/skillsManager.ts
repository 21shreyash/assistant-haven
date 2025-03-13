
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

  // Find the appropriate skill
  const skill = findSkillForMessage(userMessage, context);
  
  if (!skill) {
    // Fallback to default conversation if no skill is found
    const conversationSkill = SKILLS_REGISTRY["conversation"];
    return await conversationSkill.execute(userMessage, context);
  }
  
  // Execute the selected skill
  console.log(`Using skill: ${skill.name} (${skill.id})`);
  return await skill.execute(userMessage, context);
}

export function getAllSkills() {
  return Object.values(SKILLS_REGISTRY);
}

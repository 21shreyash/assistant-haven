
import { ChatMessage } from "@/lib/supabase";

export interface SkillContext {
  messages: ChatMessage[];
  userId: string;
}

export interface SkillResult {
  content: string;
  role: 'assistant';
  metadata?: Record<string, any>;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  patterns: RegExp[];
  canHandle: (message: string, context: SkillContext) => boolean;
  execute: (message: string, context: SkillContext) => Promise<SkillResult>;
}

export const SKILLS_REGISTRY: Record<string, Skill> = {};

export function registerSkill(skill: Skill): void {
  console.log(`Registering skill: ${skill.name} (${skill.id})`);
  SKILLS_REGISTRY[skill.id] = skill;
}

export function findSkillForMessage(message: string, context: SkillContext): Skill | null {
  console.log(`Finding skill for message: "${message}"`);
  
  let matchedSkill: Skill | null = null;
  
  for (const skillId in SKILLS_REGISTRY) {
    const skill = SKILLS_REGISTRY[skillId];
    const canHandle = skill.canHandle(message, context);
    
    console.log(`Skill ${skill.id} canHandle result: ${canHandle}`);
    
    if (canHandle) {
      // Skip the conversation skill if we've found another matching skill
      if (skillId === "conversation" && matchedSkill) {
        continue;
      }
      
      // If we already matched a skill, prioritize non-conversation skills
      if (!matchedSkill || (matchedSkill.id === "conversation" && skillId !== "conversation")) {
        matchedSkill = skill;
        console.log(`Selected skill: ${skill.id}`);
      }
    }
  }
  
  return matchedSkill;
}


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
  SKILLS_REGISTRY[skill.id] = skill;
}

export function findSkillForMessage(message: string, context: SkillContext): Skill | null {
  for (const skillId in SKILLS_REGISTRY) {
    const skill = SKILLS_REGISTRY[skillId];
    if (skill.canHandle(message, context)) {
      return skill;
    }
  }
  return null;
}

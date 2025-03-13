
import { registerSkill, Skill, SkillContext, SkillResult } from "./types";

const WeatherSkill: Skill = {
  id: "weather",
  name: "Weather Information",
  description: "Provides information about weather",
  patterns: [
    /weather/i,
    /temperature/i,
    /forecast/i,
    /rain/i,
    /snow/i,
    /sunny/i,
    /cloudy/i,
    /humidity/i
  ],
  
  canHandle: (message: string) => {
    // Check if the message contains weather-related keywords
    return WeatherSkill.patterns.some(pattern => pattern.test(message));
  },
  
  execute: async (message: string): Promise<SkillResult> => {
    // This is a mock implementation
    // In a real app, you would call a weather API
    return {
      content: "I'm sorry, I don't have access to real-time weather data at the moment. In a production environment, this skill would connect to a weather API to provide accurate forecasts.",
      role: 'assistant',
      metadata: {
        skillId: WeatherSkill.id,
        mockData: true
      }
    };
  }
};

// Register the skill
registerSkill(WeatherSkill);

export default WeatherSkill;

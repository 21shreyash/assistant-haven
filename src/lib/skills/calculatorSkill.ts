
import { registerSkill, Skill, SkillResult } from "./types";

const CalculatorSkill: Skill = {
  id: "calculator",
  name: "Calculator",
  description: "Performs mathematical calculations",
  patterns: [
    /calculate/i,
    /\d+\s*[\+\-\*\/]\s*\d+/,
    /what is\s+\d+\s*[\+\-\*\/]\s*\d+/i,
    /compute/i,
    /math/i,
    /equation/i,
    /solve/i
  ],
  
  canHandle: (message: string) => {
    // Check if the message contains calculator-related keywords or patterns
    return CalculatorSkill.patterns.some(pattern => pattern.test(message));
  },
  
  execute: async (message: string): Promise<SkillResult> => {
    try {
      // Extract mathematical expression using regex
      const expressionMatch = message.match(/\d+\s*[\+\-\*\/]\s*\d+/);
      
      if (expressionMatch) {
        const expression = expressionMatch[0];
        // Using Function constructor to evaluate mathematical expression
        // Note: In a production app, you'd want a safer math evaluation library
        const result = new Function(`return ${expression}`)();
        
        return {
          content: `The result of ${expression} is ${result}`,
          role: 'assistant',
          metadata: {
            skillId: CalculatorSkill.id,
            expression,
            result
          }
        };
      }
      
      return {
        content: "I detected a calculation request, but couldn't find a valid expression. Please provide a calculation in the format of number operator number (e.g., 2 + 2).",
        role: 'assistant'
      };
    } catch (error) {
      console.error("Calculator skill error:", error);
      return {
        content: "I had trouble performing that calculation. Please try a different format.",
        role: 'assistant'
      };
    }
  }
};

// Register the skill
registerSkill(CalculatorSkill);

export default CalculatorSkill;

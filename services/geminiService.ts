
import { GoogleGenAI } from "@google/genai";
import { EVALUATOR_SYSTEM_INSTRUCTION, MODIFIER_SYSTEM_INSTRUCTION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const model = 'gemini-2.5-flash';

/**
 * Performs a two-step process to enhance a raw prompt.
 * 1. Evaluates the prompt using a detailed rubric.
 * 2. Modifies the prompt based on the evaluation report.
 * @param rawPrompt The user-submitted prompt to enhance.
 * @returns The enhanced prompt string.
 */
export async function enhancePrompt(rawPrompt: string): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  if (!rawPrompt.trim()) {
    throw new Error("Prompt cannot be empty.");
  }

  try {
    // Step 1: Evaluate the raw prompt
    const evaluationResponse = await ai.models.generateContent({
      model,
      contents: `Please evaluate the following prompt:\n\`\`\`\n${rawPrompt}\n\`\`\``,
      config: {
        systemInstruction: EVALUATOR_SYSTEM_INSTRUCTION,
      },
    });
    const evaluationReport = evaluationResponse.text;
    
    // Step 2: Modify the prompt based on the evaluation
    const modificationResponse = await ai.models.generateContent({
        model,
        contents: `Based on the following evaluation report:\n\n---\n${evaluationReport}\n---\n\nPlease revise the following original prompt:\n\`\`\`\n${rawPrompt}\n\`\`\``,
        config: {
            systemInstruction: MODIFIER_SYSTEM_INSTRUCTION,
        },
    });

    const modifiedText = modificationResponse.text;

    // The modifier is instructed to return the prompt in a ``` block. Let's extract it.
    const match = modifiedText.match(/```(?:.*\n)?([\s\S]+?)```/);
    if (match && match[1]) {
        return match[1].trim();
    }
    
    // Fallback to returning the whole text if parsing fails
    return modifiedText.trim();

  } catch (error) {
    console.error("Error enhancing prompt:", error);
    // It's better to throw a more user-friendly error message.
    if (error instanceof Error) {
        if(error.message.includes('API key not valid')) {
            throw new Error("Invalid API Key. Please check your configuration.");
        }
        throw new Error(`An error occurred while communicating with the Gemini API: ${error.message}`);
    }
    throw new Error("An unknown error occurred during prompt enhancement.");
  }
}

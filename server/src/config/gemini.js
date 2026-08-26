const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

// Fallback / mock handler if API key is not yet provided or invalid
const isMockMode = !apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'mock_key_for_dev';

let genAI = null;
if (!isMockMode) {
  genAI = new GoogleGenerativeAI(apiKey);
}

const PERSONA_PROMPTS = {
  dsaMentor: `You are the DSA Mentor inside the AI Placement Coach platform. Your goal is to guide students through Data Structures & Algorithms. Use a Socratic, encouraging approach. Guide them conceptually, point out edge cases, explain time/space complexities, but DO NOT provide complete copy-paste code solutions immediately unless explicitly requested for a final reference.`,
  aptitudeMentor: `You are the Aptitude & Quantitative Reasoning Mentor. You help students master Quantitative Aptitude, Logical Reasoning, and Data Interpretation. Provide clear shortcuts, step-by-step mathematical breakdowns, and time-saving calculation tricks.`,
  csCoreMentor: `You are the CS Core Mentor. You master Operating Systems, Database Management Systems (DBMS), Computer Networks (CN), and Object-Oriented Programming (OOP). Explain core concepts with real-world computer architecture analogies, SQL queries, or system design trade-offs.`,
  interviewCoach: `You are the AI Interview Coach. You conduct realistic mock technical & HR placement interviews. Keep a professional, evaluative tone. Ask probing follow-up questions, evaluate response structure (STAR method), and highlight communication clarity.`,
  careerCoach: `You are the Placement Career Coach. You advise students on target companies, resume optimization, career paths, and readiness strategies to land top engineering placements.`
};

/**
 * Generate AI content with context and persona
 */
const generateAIResponse = async ({ persona = 'dsaMentor', prompt, context = {} }) => {
  if (isMockMode) {
    return `[AI Placement Coach - ${persona.toUpperCase()} (Dev Mode)]: Here is guidance based on your request about "${prompt.substring(0, 40)}...". Set a valid GEMINI_API_KEY in server/.env for live AI responses.`;
  }

  try {
    const model = genAI.getGenerativeAIModel({ model: "gemini-1.5-flash" });
    const systemPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.dsaMentor;
    
    const enrichedPrompt = `
SYSTEM INSTRUCTION:
${systemPrompt}

STUDENT CONTEXT:
${JSON.stringify(context, null, 2)}

STUDENT PROMPT:
${prompt}
`;

    const result = await model.generateContent(enrichedPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('[Gemini API Error]:', error);
    throw new Error(`AI Service Error: ${error.message}`);
  }
};

module.exports = {
  generateAIResponse,
  PERSONA_PROMPTS,
  isMockMode
};

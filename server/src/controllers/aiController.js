import { generateAIResponse } from '../services/ai/geminiClient.js';
import { PERSONA_PROMPTS } from '../services/ai/promptTemplates.js';
import LearnerProfile from '../models/LearnerProfile.js';

export const chatWithCoach = async (req, res) => {
  try {
    const { persona, userMessage, conversationHistory } = req.body;
    const userId = req.user._id;

    const profile = await LearnerProfile.findOne({ userId });
    const selectedPersona = persona || 'DSA Mentor';
    const systemPrompt = PERSONA_PROMPTS[selectedPersona] || PERSONA_PROMPTS['DSA Mentor'];

    const responseText = await generateAIResponse({
      persona: selectedPersona,
      systemPrompt,
      userPrompt: userMessage,
      contextData: {
        userName: req.user.name,
        targetRole: req.user.targetRole,
        targetCompanies: req.user.targetCompanies,
        mastery: profile ? { dsa: profile.dsaMastery, aptitude: profile.aptitudeMastery, csCore: profile.csCoreMastery } : {},
        conversationHistory
      }
    });

    res.json({
      success: true,
      data: {
        speaker: 'ai',
        persona: selectedPersona,
        message: responseText,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

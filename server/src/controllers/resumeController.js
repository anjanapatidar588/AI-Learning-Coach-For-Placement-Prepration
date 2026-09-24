import ResumeAnalysis from '../models/ResumeAnalysis.js';
import { generateAIResponse } from '../services/ai/geminiClient.js';
import { PERSONA_PROMPTS } from '../services/ai/promptTemplates.js';

export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    const userId = req.user._id;

    const analysisPrompt = `Analyze the following resume text for the role of "${targetRole || req.user.targetRole}".
Resume Content:
${resumeText || 'Sample Resume: Full Stack Developer with React, Node.js, Express, MongoDB, Data Structures, Algorithms experience.'}`;

    const aiFeedback = await generateAIResponse({
      persona: 'Career Coach',
      systemPrompt: PERSONA_PROMPTS['Career Coach'],
      userPrompt: analysisPrompt,
      contextData: { targetRole: targetRole || req.user.targetRole }
    });

    const analysis = {
      atsScore: 78,
      extractedSkills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Data Structures', 'REST APIs', 'Git'],
      missingKeywords: ['Docker', 'Kubernetes', 'Redis Caching', 'CI/CD Pipelines', 'System Design'],
      formattingFeedback: 'Clean single-column structure. Convert bullet points to Action Verb + Task + Quantified Impact.',
      recommendedActionItems: [
        'Add specific metric impact to project descriptions (e.g., "Reduced page load time by 40%")',
        'Include a dedicated Skills section categorized by Languages, Frameworks, and Tools',
        'Add System Design & Caching keywords to pass ATS automated filters for SDE roles'
      ],
      summary: aiFeedback
    };

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

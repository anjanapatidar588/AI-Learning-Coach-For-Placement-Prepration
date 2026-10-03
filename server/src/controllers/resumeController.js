import ResumeAnalysis from '../models/ResumeAnalysis.js';
import { generateAIResponse } from '../services/ai/geminiClient.js';
import { PERSONA_PROMPTS } from '../services/ai/promptTemplates.js';

export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    const userId = req.user._id || req.user.userId;

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ success: false, message: 'Resume text is required for analysis.' });
    }

    const role = targetRole || req.user.targetRole || 'Software Engineer';

    const analysisPrompt = `Analyze the following resume text for the target role of "${role}".

Resume Text:
${resumeText}

Calculate an ATS match score (0-100), extract relevant technical skills present in the text, identify key missing keywords for a top ${role} candidate, provide clear formatting feedback, and recommend 3 actionable improvement items.

Return JSON strictly matching this exact schema with no markdown code blocks:
{
  "atsScore": <number 0-100>,
  "extractedSkills": ["<skill1>", "<skill2>"],
  "missingKeywords": ["<keyword1>", "<keyword2>"],
  "formattingFeedback": "<feedback paragraph>",
  "recommendedActionItems": ["<action 1>", "<action 2>", "<action 3>"]
}`;

    const rawAiResponse = await generateAIResponse({
      persona: 'Career Coach',
      systemPrompt: 'You are an expert ATS Resume Analyzer. Always output valid JSON strictly matching the requested format.',
      userPrompt: analysisPrompt,
      contextData: { targetRole: role }
    });

    let analysisObj = null;
    try {
      const cleanJson = rawAiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      analysisObj = JSON.parse(cleanJson);
    } catch {
      // Deterministic fallback from keyword matching if AI returns unparseable JSON
      const lower = resumeText.toLowerCase();
      const techKeywords = ['react', 'node', 'javascript', 'python', 'java', 'c++', 'sql', 'mongodb', 'express', 'git', 'dsa', 'algorithms', 'aws', 'docker', 'system design'];
      const foundSkills = techKeywords.filter(k => lower.includes(k)).map(s => s.toUpperCase());
      const missing = techKeywords.filter(k => !lower.includes(k)).map(s => s.toUpperCase()).slice(0, 5);
      const calculatedScore = Math.min(95, Math.max(30, foundSkills.length * 8));

      analysisObj = {
        atsScore: calculatedScore,
        extractedSkills: foundSkills.length > 0 ? foundSkills : ['General Engineering'],
        missingKeywords: missing,
        formattingFeedback: 'Ensure clear section headings (Experience, Projects, Education, Skills) and quantify achievements with measurable metrics.',
        recommendedActionItems: [
          'Add quantifiable impact metrics to experience bullet points (e.g. "Improved query performance by 35%")',
          'Incorporate relevant industry keywords to improve automated ATS parsing',
          'Organize technical skills into distinct categories (Languages, Frameworks, Tools)'
        ]
      };
    }

    // Persist analysis to MongoDB
    const savedDoc = await ResumeAnalysis.create({
      userId,
      atsScore: Math.min(100, Math.max(0, Number(analysisObj.atsScore) || 50)),
      extractedSkills: Array.isArray(analysisObj.extractedSkills) ? analysisObj.extractedSkills : [],
      missingKeywords: Array.isArray(analysisObj.missingKeywords) ? analysisObj.missingKeywords : [],
      formattingFeedback: analysisObj.formattingFeedback || 'Clean resume structure.',
      recommendedActionItems: Array.isArray(analysisObj.recommendedActionItems) ? analysisObj.recommendedActionItems : []
    });

    res.json({
      success: true,
      data: {
        _id: savedDoc._id,
        atsScore: savedDoc.atsScore,
        extractedSkills: savedDoc.extractedSkills,
        missingKeywords: savedDoc.missingKeywords,
        formattingFeedback: savedDoc.formattingFeedback,
        recommendedActionItems: savedDoc.recommendedActionItems,
        createdAt: savedDoc.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


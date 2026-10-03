import MockInterviewSession from '../models/MockInterviewSession.js';
import { generateAIResponse } from '../services/ai/geminiClient.js';
import { PERSONA_PROMPTS } from '../services/ai/promptTemplates.js';

export const startInterview = async (req, res) => {
  try {
    const { roleType, companyContext } = req.body;
    const userId = req.user._id || req.user.userId;

    const initialAiMessage = `Hello ${req.user.name || 'Learner'}! Welcome to your technical mock interview for ${roleType || 'Software Engineer'}. To start off, could you briefly introduce yourself and highlight a challenging technical project you built recently?`;

    const session = await MockInterviewSession.create({
      userId,
      roleType: roleType || 'Software Engineer',
      companyContext: companyContext || 'General Technical Interview',
      transcript: [
        {
          speaker: 'ai',
          message: initialAiMessage,
          timestamp: new Date()
        }
      ]
    });

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitInterviewTurn = async (req, res) => {
  try {
    const { sessionId, userMessage } = req.body;
    const userId = req.user._id || req.user.userId;

    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    let session = null;
    if (sessionId && /^[0-9a-fA-F]{24}$/.test(sessionId)) {
      session = await MockInterviewSession.findOne({ _id: sessionId, userId });
    }

    const transcriptHistory = session ? session.transcript.map(t => `${t.speaker.toUpperCase()}: ${t.message}`).join('\n') : '';

    const aiMessage = await generateAIResponse({
      persona: 'Interview Coach',
      systemPrompt: PERSONA_PROMPTS['Interview Coach'] || 'You are an expert technical interviewer assessing candidates for software engineering roles.',
      userPrompt: `Candidate's response: "${userMessage}".\n\nContinue the interview dynamically by acknowledging key points, asking a relevant follow-up or next technical question. Keep your response concise, professional, and encouraging (2-4 sentences max).`,
      contextData: { transcriptHistory, role: req.user.targetRole || session?.roleType }
    });

    const userEntry = { speaker: 'student', message: userMessage, timestamp: new Date() };
    const aiEntry = { speaker: 'ai', message: aiMessage, timestamp: new Date() };

    if (session) {
      session.transcript.push(userEntry);
      session.transcript.push(aiEntry);
      await session.save();
    }

    res.json({
      success: true,
      data: aiEntry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const finishInterview = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id || req.user.userId;

    let session = null;
    if (sessionId && /^[0-9a-fA-F]{24}$/.test(sessionId)) {
      session = await MockInterviewSession.findOne({ _id: sessionId, userId });
    }

    const transcriptText = session ? session.transcript.map(t => `${t.speaker.toUpperCase()}: ${t.message}`).join('\n') : '';

    const evalPrompt = `Evaluate this complete technical mock interview transcript for candidate "${req.user.name || 'Learner'}" applying for "${session?.roleType || 'Software Engineer'}".

Transcript:
${transcriptText || 'No transcript available.'}

Return JSON strictly matching this structure:
{
  "technicalScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "problemSolvingScore": <number 0-100>,
  "overallScore": <number 0-100>,
  "detailedFeedback": "<detailed feedback paragraph>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}`;

    const rawAiEval = await generateAIResponse({
      persona: 'Interview Coach',
      systemPrompt: 'You are an expert interview evaluator. Always output valid JSON with no markdown wrapping.',
      userPrompt: evalPrompt,
      contextData: { role: session?.roleType }
    });

    let evaluation = null;
    try {
      const cleanJson = rawAiEval.replace(/```json/g, '').replace(/```/g, '').trim();
      evaluation = JSON.parse(cleanJson);
    } catch {
      // Deterministic calculation from transcript metrics if JSON parse fails
      const wordCount = transcriptText.split(/\s+/).length;
      const baseScore = Math.min(90, Math.max(50, Math.round(wordCount / 5)));
      evaluation = {
        technicalScore: baseScore,
        communicationScore: Math.min(100, baseScore + 5),
        problemSolvingScore: Math.max(40, baseScore - 5),
        overallScore: baseScore,
        detailedFeedback: rawAiEval || 'Completed interview session.',
        strengths: ['Active participation', 'Clear communication'],
        improvements: ['Elaborate further on system constraints and edge cases']
      };
    }

    if (session) {
      session.evaluation = evaluation;
      await session.save();
    }

    res.json({ success: true, evaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


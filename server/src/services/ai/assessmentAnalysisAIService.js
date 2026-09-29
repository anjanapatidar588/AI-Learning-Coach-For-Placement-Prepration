import { generateAIResponse } from './geminiClient.js';

/**
 * Server-side AI Assessment Analysis using Gemini.
 * Sanitizes input data to ensure no credentials, tokens, solution codes, or hidden answers leak.
 * Provides a deterministic fallback if Gemini fails or is unavailable.
 *
 * @param {object} analysisContext
 * @returns {Promise<{ data: object, isFallback: boolean }>}
 */
export const generateAIAssessmentAnalysis = async ({
  subjectPerformance,
  topicPerformance,
  difficultyPerformance,
  strongTopics = [],
  weakTopics = [],
  knowledgeGaps = [],
  targetRole = 'Software Development Engineer',
  graduationYear,
  targetDate,
  dailyPreparationTime
}) => {
  // 1. Construct safe payload (strictly filter out sensitive details)
  const safeContext = {
    subjectPerformance,
    topicPerformanceSummary: (topicPerformance || []).map(t => ({
      topicName: t.topicName,
      subject: t.subject,
      accuracy: t.accuracy,
      classification: t.classification,
      priority: t.priority
    })),
    difficultyPerformance,
    strongTopics: strongTopics.map(s => ({ topicName: s.topicName, subject: s.subject, accuracy: s.accuracy })),
    weakTopics: weakTopics.map(w => ({ topicName: w.topicName, subject: w.subject, accuracy: w.accuracy, priority: w.priority })),
    knowledgeGapSummary: knowledgeGaps.map(g => ({ gapType: g.gapType, topicName: g.topicName, evidence: g.evidence })),
    studentProfile: {
      targetRole: targetRole || 'Software Development Engineer',
      graduationYear: graduationYear || 'Not specified',
      targetDate: targetDate ? new Date(targetDate).toISOString().split('T')[0] : 'Flexible',
      dailyPreparationTime: dailyPreparationTime || '1-2 hours'
    }
  };

  const systemPrompt = `You are an expert AI Learning Coach specializing in Technical Placement Preparation.
Analyze the provided objective assessment performance data for a student targeting a ${safeContext.studentProfile.targetRole} role.
Produce a constructive, structured qualitative performance breakdown and roadmap suggestions.

CRITICAL INSTRUCTIONS:
1. You MUST return ONLY valid JSON in the EXACT format specified below.
2. Do NOT invent scores, percentages, correct answer counts, or assessment metrics. Use ONLY the supplied metrics.
3. Keep feedback encouraging, actionable, and tailored to placement interview readiness.

REQUIRED JSON FORMAT:
{
  "summary": "Brief 2-3 sentence overview of the student's performance and placement readiness.",
  "strengths": ["Clear strength bullet point 1", "Clear strength bullet point 2"],
  "weakAreas": ["Weakness bullet point 1 with actionable guidance", "Weakness bullet point 2"],
  "learningPriorities": ["Top priority 1", "Top priority 2"],
  "explanations": ["Detailed explanation of why specific topics were weak and how to address them"],
  "suggestedFocus": "Recommended focus area for today's study session."
}`;

  const userPrompt = `Generate a qualitative assessment analysis based on the attached context data.`;

  try {
    const rawAiResponse = await generateAIResponse({
      persona: 'Career Coach',
      systemPrompt,
      userPrompt,
      contextData: safeContext,
      failIfUnavailable: false
    });

    if (rawAiResponse && typeof rawAiResponse === 'string') {
      // Attempt JSON parsing (strip potential markdown code blocks ```json ... ```)
      const cleanedText = rawAiResponse
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleanedText);

      // Validate required keys
      if (
        parsed &&
        typeof parsed.summary === 'string' &&
        Array.isArray(parsed.strengths) &&
        Array.isArray(parsed.weakAreas) &&
        Array.isArray(parsed.learningPriorities)
      ) {
        return {
          data: {
            summary: parsed.summary,
            strengths: parsed.strengths.map(String),
            weakAreas: parsed.weakAreas.map(String),
            learningPriorities: parsed.learningPriorities.map(String),
            explanations: Array.isArray(parsed.explanations) ? parsed.explanations.map(String) : [],
            suggestedFocus: parsed.suggestedFocus || 'Focus on your highest priority weak topic.'
          },
          isFallback: false
        };
      }
    }
  } catch (err) {
    console.warn('[AIAssessmentAnalysis] AI generation error, using fallback:', err.message);
  }

  // 2. Deterministic Fallback if AI fails or returns non-JSON
  return {
    data: createDeterministicFallbackAnalysis(safeContext),
    isFallback: true
  };
};

/**
 * Creates a helpful deterministic qualitative analysis when AI service is unavailable.
 */
const createDeterministicFallbackAnalysis = (context) => {
  const strongNames = context.strongTopics.map(s => s.topicName);
  const weakNames = context.weakTopics.map(w => w.topicName);
  const targetRole = context.studentProfile.targetRole;

  let summary = `Your performance analysis is complete for your target role of ${targetRole}.`;
  if (strongNames.length > 0) {
    summary += ` You demonstrated solid understanding in ${strongNames.join(', ')}.`;
  }
  if (weakNames.length > 0) {
    summary += ` Focused improvement is recommended in ${weakNames.join(', ')} to boost placement readiness.`;
  }

  const strengths = strongNames.length > 0
    ? strongNames.map(name => `Demonstrated good objective accuracy in ${name}.`)
    : ['Completed assessment attempt across multiple core placement subjects.'];

  const weakAreas = weakNames.length > 0
    ? weakNames.map(name => `${name}: Practice fundamental problem patterns to build consistency.`)
    : ['Overall attempt volume can be expanded with additional practice questions.'];

  const learningPriorities = weakNames.length > 0
    ? weakNames.slice(0, 3).map(name => `Prioritize practice problems in ${name}`)
    : ['Maintain daily practice streak across DSA and CS Core topics.'];

  const explanations = (context.knowledgeGapSummary || []).map(
    g => `${g.gapType} identified in ${g.topicName}: ${g.evidence}`
  );

  const suggestedFocus = weakNames.length > 0
    ? `Focus on reviewing concepts and solving practice questions in ${weakNames[0]}.`
    : 'Continue to the next recommended node in your personalized roadmap.';

  return {
    summary,
    strengths,
    weakAreas,
    learningPriorities,
    explanations,
    suggestedFocus
  };
};

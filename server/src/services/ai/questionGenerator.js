import { generateAIResponse } from './geminiClient.js';
import Topic from '../../models/Topic.js';

/**
 * Validates a single AI-generated question structure.
 * Returns { valid: boolean, error?: string }
 */
export const validateGeneratedQuestion = (q) => {
  if (!q || typeof q !== 'object') {
    return { valid: false, error: 'Question is not a valid object' };
  }

  if (!q.title || typeof q.title !== 'string' || q.title.trim().length < 3) {
    return { valid: false, error: 'Question title is missing or too short' };
  }

  if (!q.problemStatement || typeof q.problemStatement !== 'string' || q.problemStatement.trim().length < 5) {
    return { valid: false, error: 'Problem statement is missing or too short' };
  }

  if (!q.difficulty || !['Easy', 'Medium', 'Hard'].includes(q.difficulty)) {
    return { valid: false, error: `Invalid difficulty: ${q.difficulty}` };
  }

  const type = (q.type || 'mcq').toLowerCase();
  if (!['mcq', 'coding'].includes(type)) {
    return { valid: false, error: `Invalid question type: ${q.type}` };
  }

  if (type === 'mcq') {
    const opts = q.options || q.mcqOptions;
    if (!Array.isArray(opts) || opts.length < 2) {
      return { valid: false, error: 'MCQ question must have at least 2 options' };
    }

    const texts = new Set();
    let correctCount = 0;

    for (const opt of opts) {
      const txt = (opt.text || opt.optionText || opt.textValue || '').toString().trim();
      if (!txt) {
        return { valid: false, error: 'MCQ option text cannot be empty' };
      }
      if (texts.has(txt.toLowerCase())) {
        return { valid: false, error: `Duplicate option text found: "${txt}"` };
      }
      texts.add(txt.toLowerCase());

      if (opt.isCorrect === true || opt.correct === true) {
        correctCount++;
      }
    }

    if (correctCount === 0 && q.correctOption !== undefined) {
      const idx = Number(q.correctOption);
      if (!isNaN(idx) && opts[idx]) {
        opts[idx].isCorrect = true;
        correctCount = 1;
      }
    }

    if (correctCount !== 1) {
      return { valid: false, error: `MCQ question must have exactly one correct option (found ${correctCount})` };
    }
  }

  return { valid: true };
};

/**
 * Generates questions using server-side Gemini based on an AssessmentBlueprint.
 * Strictly validates output and throws clean errors on AI/Gemini failure (no fake questions).
 */
export const generateQuestionsFromBlueprint = async (blueprint) => {
  const { title, subjects = [], selectedTopics = [], topicDistribution = [], questionCount, difficulty, questionTypes = ['mcq'] } = blueprint;

  // Build subject/topic context
  let topicsListText = '';
  if (selectedTopics && selectedTopics.length > 0) {
    topicsListText = `Selected Topics: ${selectedTopics.join(', ')}`;
  } else if (Array.isArray(topicDistribution) && topicDistribution.length > 0) {
    topicsListText = `Topics & Subjects: ${topicDistribution.map(t => `${t.topicName} (${t.category})`).join(', ')}`;
  } else if (subjects && subjects.length > 0) {
    topicsListText = `Subjects: ${subjects.join(', ')}`;
  } else {
    topicsListText = 'Subjects: DSA, Aptitude, Computer Science';
  }

  const systemPrompt = `You are an expert computer science and placement assessment author.
Your task is to generate technical assessment questions adhering strictly to the provided blueprint specifications.

CRITICAL FORMAT REQUIREMENT:
You MUST return ONLY valid JSON matching this exact structure (no markdown fences, no explanatory text outside JSON):
{
  "questions": [
    {
      "title": "Short descriptive title",
      "topicName": "Arrays",
      "category": "dsa",
      "difficulty": "Medium",
      "type": "mcq",
      "problemStatement": "Clear problem statement text...",
      "options": [
        { "optionId": "A", "text": "Option A text", "isCorrect": false },
        { "optionId": "B", "text": "Option B text", "isCorrect": true },
        { "optionId": "C", "text": "Option C text", "isCorrect": false },
        { "optionId": "D", "text": "Option D text", "isCorrect": false }
      ],
      "explanation": "Detailed step-by-step solution explanation"
    }
  ]
}`;

  const userPrompt = `Generate exactly ${questionCount} questions for the assessment: "${title}".

Coverage Specifications:
- ${topicsListText}
- Target Difficulty: ${difficulty || 'Medium'}
- Question Types: ${questionTypes.join(', ')}
- Allowed Categories: dsa, aptitude, cs_core, oops, dbms, os, cn

REQUIREMENTS:
1. Each MCQ question MUST have exactly 4 distinct options with exactly one correct option (isCorrect: true).
2. Category must be mapped to one of: dsa, aptitude, cs_core.
3. Difficulty must be one of: Easy, Medium, Hard.
4. Total questions in returned array MUST equal exactly ${questionCount}.
5. Every question must directly relate to the specified topics/subjects.`;

  let aiRawResponse = '';
  try {
    aiRawResponse = await generateAIResponse({
      persona: 'DSA Mentor',
      systemPrompt,
      userPrompt,
      contextData: { blueprintId: blueprint._id },
      failIfUnavailable: true
    });
  } catch (err) {
    throw new Error(`AI question generation service unavailable: ${err.message || 'Please try again.'}`);
  }

  if (!aiRawResponse || typeof aiRawResponse !== 'string') {
    throw new Error('AI question generation failed: Empty response from AI model. Please try again.');
  }

  // Extract JSON from potential code fences
  let jsonString = aiRawResponse.trim();
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonString = jsonMatch[1].trim();
  }

  let parsedData = null;
  try {
    parsedData = JSON.parse(jsonString);
  } catch (parseErr) {
    throw new Error('AI question generation failed: Malformed JSON output from AI. Please try again.');
  }

  if (!parsedData || !Array.isArray(parsedData.questions)) {
    throw new Error('AI question generation failed: Output JSON missing "questions" array. Please try again.');
  }

  const rawQuestions = parsedData.questions;

  if (rawQuestions.length !== Number(questionCount)) {
    throw new Error(`AI question generation count mismatch: Requested ${questionCount} questions, but AI returned ${rawQuestions.length}. Please try again.`);
  }

  // Validate each question strictly
  const validatedQuestions = [];
  for (let i = 0; i < rawQuestions.length; i++) {
    const q = rawQuestions[i];
    const validation = validateGeneratedQuestion(q);
    if (!validation.valid) {
      throw new Error(`AI Question validation failed at index ${i}: ${validation.error}. Please try again.`);
    }

    const type = (q.type || 'mcq').toLowerCase();
    const opts = (q.options || q.mcqOptions || []).map((o, optIdx) => ({
      optionId: o.optionId || String.fromCharCode(65 + optIdx),
      optionText: (o.text || o.optionText || '').trim(),
      text: (o.text || o.optionText || '').trim(),
      isCorrect: Boolean(o.isCorrect || o.correct)
    }));

    validatedQuestions.push({
      title: q.title.trim(),
      topicName: q.topicName || 'General',
      category: ['aptitude', 'cs_core', 'oops', 'dbms', 'os', 'cn'].includes((q.category || '').toLowerCase()) ? q.category.toLowerCase() : 'dsa',
      difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium'),
      type,
      problemStatement: q.problemStatement.trim(),
      mcqOptions: opts,
      explanation: (q.explanation || '').trim()
    });
  }

  return validatedQuestions;
};


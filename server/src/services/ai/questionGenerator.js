import { generateAIResponse } from './geminiClient.js';
import Topic from '../../models/Topic.js';

/**
 * Validates a single AI-generated question structure.
 * Returns { valid: boolean, error?: string }
 */
export const validateGeneratedQuestion = (q) => {
  if (!q || typeof q !== 'object') {
    return { valid: false, error: 'Question is not an object' };
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
 */
export const generateQuestionsFromBlueprint = async (blueprint) => {
  const { title, subjects, topicDistribution, questionCount, difficultyDistribution, questionTypes } = blueprint;

  const distributionText = Array.isArray(topicDistribution) && topicDistribution.length > 0
    ? topicDistribution.map(t => `- Topic: "${t.topicName}" (${t.category}), Count: ${t.questionCount}, Difficulty: ${t.difficulty}`).join('\n')
    : `- Generate ${questionCount} questions across subjects: ${subjects.join(', ')}`;

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
      "difficulty": "Easy",
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

Question & Topic Blueprint Distribution:
${distributionText}

Target Question Types: ${questionTypes.join(', ')}
Allowed Categories: dsa, aptitude, cs_core, oops, dbms, os, cn

REQUIREMENTS:
1. Each MCQ question MUST have exactly 4 distinct options with exactly one correct option (isCorrect: true).
2. Category must be mapped to one of: dsa, aptitude, cs_core.
3. Difficulty must be one of: Easy, Medium, Hard.
4. Total questions in returned array MUST equal ${questionCount}.`;

  const aiRawResponse = await generateAIResponse({
    persona: 'DSA Mentor',
    systemPrompt,
    userPrompt,
    contextData: { blueprintId: blueprint._id },
    failIfUnavailable: false
  });

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
    // If JSON parse fails, attempt clean fallback generation matching blueprint specs
    parsedData = buildSimulatedQuestions(blueprint);
  }

  if (!parsedData || !Array.isArray(parsedData.questions)) {
    parsedData = buildSimulatedQuestions(blueprint);
  }

  const rawQuestions = parsedData.questions;

  if (rawQuestions.length !== questionCount) {
    // Adjust count to match exact blueprint question count
    if (rawQuestions.length < questionCount) {
      const simulated = buildSimulatedQuestions(blueprint);
      rawQuestions.push(...simulated.questions.slice(0, questionCount - rawQuestions.length));
    } else {
      rawQuestions.length = questionCount;
    }
  }

  // Validate each question strictly
  const validatedQuestions = [];
  for (let i = 0; i < rawQuestions.length; i++) {
    const q = rawQuestions[i];
    const validation = validateGeneratedQuestion(q);
    if (!validation.valid) {
      throw new Error(`AI Question validation failed at index ${i}: ${validation.error}`);
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
      category: ['aptitude', 'cs_core'].includes((q.category || '').toLowerCase()) ? q.category.toLowerCase() : 'dsa',
      difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Medium',
      type,
      problemStatement: q.problemStatement.trim(),
      mcqOptions: opts,
      explanation: (q.explanation || '').trim()
    });
  }

  return validatedQuestions;
};

/**
 * Fallback simulation generator when real AI is offline or returns unparseable text.
 */
const buildSimulatedQuestions = (blueprint) => {
  const { topicDistribution, questionCount, subjects } = blueprint;
  const questions = [];

  const topicsToUse = Array.isArray(topicDistribution) && topicDistribution.length > 0
    ? topicDistribution
    : [{ topicName: 'Arrays & Two Pointers', category: 'dsa', questionCount, difficulty: 'Medium' }];

  let qIndex = 1;
  for (const dist of topicsToUse) {
    const count = dist.questionCount || 1;
    for (let i = 0; i < count; i++) {
      if (questions.length >= questionCount) break;

      questions.push({
        title: `${dist.topicName} Assessment Question ${i + 1}`,
        topicName: dist.topicName,
        category: dist.category || 'dsa',
        difficulty: dist.difficulty || 'Medium',
        type: 'mcq',
        problemStatement: `What is the optimal time complexity to solve ${dist.topicName} pattern problems efficiently?`,
        options: [
          { optionId: 'A', text: 'O(N^2) brute force traversal', isCorrect: false },
          { optionId: 'B', text: 'O(N log N) using sorting', isCorrect: false },
          { optionId: 'C', text: 'O(N) time with optimal space', isCorrect: true },
          { optionId: 'D', text: 'O(2^N) exponential branching', isCorrect: false }
        ],
        explanation: `Optimal solution uses two pointers or a hash table to achieve O(N) linear time complexity.`
      });
      qIndex++;
    }
  }

  // Ensure total count matches questionCount
  while (questions.length < questionCount) {
    const idx = questions.length + 1;
    questions.push({
      title: `Placement Practice Question ${idx}`,
      topicName: 'Core Technical Concepts',
      category: 'dsa',
      difficulty: 'Medium',
      type: 'mcq',
      problemStatement: `Which data structure provides O(1) average time complexity for key-value lookups?`,
      options: [
        { optionId: 'A', text: 'Binary Search Tree', isCorrect: false },
        { optionId: 'B', text: 'Hash Table / Map', isCorrect: true },
        { optionId: 'C', text: 'Linked List', isCorrect: false },
        { optionId: 'D', text: 'Max Heap', isCorrect: false }
      ],
      explanation: 'A Hash Table computes index using a hash function, allowing O(1) average lookup time.'
    });
  }

  return { questions: questions.slice(0, questionCount) };
};

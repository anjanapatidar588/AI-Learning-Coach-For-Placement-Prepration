import Question from '../models/Question.js';
import { detectQuestionPattern } from './patternRecognitionService.js';

/**
 * Strips sensitive answer keys, solution code, explanations, and hidden test cases.
 */
export const sanitizeQuestionForStudent = (questionDoc) => {
  if (!questionDoc) return null;
  const q = typeof questionDoc.toObject === 'function' ? questionDoc.toObject() : { ...questionDoc };

  const safeTestCases = (q.testCases || [])
    .filter(tc => !tc.isHidden)
    .map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput }));

  const safeMcqOptions = (q.mcqOptions || []).map(opt => ({
    optionId: opt.optionId || opt._id?.toString(),
    optionText: opt.optionText || opt.text || '',
    text: opt.text || opt.optionText || ''
  }));

  delete q.solutionCode;
  delete q.solutionExplanation;
  delete q.__v;

  return {
    _id: q._id,
    topicId: q.topicId,
    title: q.title,
    slug: q.slug,
    difficulty: q.difficulty || 'Medium',
    type: q.type || 'coding',
    category: q.category || 'dsa',
    pattern: q.pattern || 'TWO_POINTER',
    problemStatement: q.problemStatement,
    description: q.description || '',
    inputFormat: q.inputFormat || '',
    outputFormat: q.outputFormat || '',
    constraints: q.constraints || '',
    codeSnippets: q.codeSnippets || {},
    testCases: safeTestCases,
    mcqOptions: safeMcqOptions,
    hints: q.hints || []
  };
};

/**
 * Generates or retrieves a Same-Logic practice question reinforcing the same pattern.
 * @param {object|string} originalQuestionOrId 
 * @returns {Promise<{ question: object, pattern: string, reinforcementGoal: string }>}
 */
export const getSameLogicPractice = async (originalQuestionOrId) => {
  let originalQuestion = originalQuestionOrId;
  if (typeof originalQuestionOrId === 'string') {
    originalQuestion = await Question.findById(originalQuestionOrId).lean().catch(() => null);
  }

  if (!originalQuestion) {
    throw new Error('Original question not found');
  }

  const { pattern } = await detectQuestionPattern(originalQuestion);

  // Search DB for another question with matching pattern or topicId (excluding original)
  const candidate = await Question.findOne({
    _id: { $ne: originalQuestion._id },
    $or: [
      { pattern },
      { topicId: originalQuestion.topicId }
    ]
  }).lean();

  if (candidate) {
    return {
      question: sanitizeQuestionForStudent(candidate),
      pattern,
      reinforcementGoal: `Apply the ${pattern.replace(/_/g, ' ')} reasoning to a different problem statement.`
    };
  }

  // Fallback: Generate a structured same-logic variant
  const isMcq = originalQuestion.type === 'mcq' || (originalQuestion.mcqOptions && originalQuestion.mcqOptions.length > 0);
  const variantTitle = `${originalQuestion.title} (Same-Logic Reinforcement)`;
  const variantSlug = `${originalQuestion.slug}-samelogic-variant-${Date.now()}`;

  const generatedQuestionData = {
    _id: `samelogic-${originalQuestion._id}`,
    topicId: originalQuestion.topicId,
    title: variantTitle,
    slug: variantSlug,
    difficulty: originalQuestion.difficulty || 'Medium',
    type: originalQuestion.type || 'coding',
    category: originalQuestion.category || 'dsa',
    pattern,
    problemStatement: isMcq
      ? `Reinforcement Practice: Consider a scenario involving ${pattern.replace(/_/g, ' ')}. What is the core condition required to maintain optimality?`
      : `Given a set of input constraints, apply the ${pattern.replace(/_/g, ' ')} pattern to compute the optimal target result. Ensure your solution handles boundary cases cleanly.`,
    inputFormat: originalQuestion.inputFormat || 'Standard input format',
    outputFormat: originalQuestion.outputFormat || 'Standard output format',
    constraints: originalQuestion.constraints || 'Standard constraints',
    codeSnippets: originalQuestion.codeSnippets || {
      javascript: `// Same-Logic Practice for ${pattern}\nfunction solve(input) {\n    // Apply ${pattern} logic\n}`
    },
    testCases: (originalQuestion.testCases || []).filter(tc => !tc.isHidden),
    mcqOptions: (originalQuestion.mcqOptions || []).map(opt => ({
      optionId: opt.optionId,
      optionText: opt.optionText || opt.text,
      text: opt.text || opt.optionText
    })),
    hints: [`Focus on how ${pattern.replace(/_/g, ' ')} simplifies search space or computation.`]
  };

  return {
    question: sanitizeQuestionForStudent(generatedQuestionData),
    pattern,
    reinforcementGoal: `Master the core ${pattern.replace(/_/g, ' ')} invariant.`
  };
};

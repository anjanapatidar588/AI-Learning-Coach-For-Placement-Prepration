import Question from '../models/Question.js';
import { sanitizeQuestionForStudent } from './sameLogicPracticeService.js';
import { detectQuestionPattern } from './patternRecognitionService.js';

/**
 * Retrieves a Similar Question testing concept transfer to a slightly different context.
 * @param {object|string} originalQuestionOrId 
 * @param {string[]} [excludeIds=[]] 
 * @returns {Promise<{ question: object, concept: string, transferGoal: string }>}
 */
export const getSimilarQuestion = async (originalQuestionOrId, excludeIds = []) => {
  let originalQuestion = originalQuestionOrId;
  if (typeof originalQuestionOrId === 'string') {
    originalQuestion = await Question.findById(originalQuestionOrId).lean().catch(() => null);
  }

  if (!originalQuestion) {
    throw new Error('Original question not found');
  }

  const { pattern } = await detectQuestionPattern(originalQuestion);
  const excludeList = [originalQuestion._id, ...excludeIds];

  // Try finding in DB
  const candidate = await Question.findOne({
    _id: { $nin: excludeList },
    $or: [
      { topicId: originalQuestion.topicId },
      { pattern }
    ]
  }).lean();

  if (candidate) {
    return {
      question: sanitizeQuestionForStudent(candidate),
      concept: pattern,
      transferGoal: `Test whether you can transfer the ${pattern.replace(/_/g, ' ')} reasoning to a different context.`
    };
  }

  // Fallback: Generate a similar context variant
  const isMcq = originalQuestion.type === 'mcq' || (originalQuestion.mcqOptions && originalQuestion.mcqOptions.length > 0);
  const variantTitle = `${originalQuestion.title} (Context Transfer Variant)`;
  const variantSlug = `${originalQuestion.slug}-similar-variant-${Date.now()}`;

  const generatedQuestionData = {
    _id: `similar-${originalQuestion._id}`,
    topicId: originalQuestion.topicId,
    title: variantTitle,
    slug: variantSlug,
    difficulty: originalQuestion.difficulty || 'Medium',
    type: originalQuestion.type || 'coding',
    category: originalQuestion.category || 'dsa',
    pattern,
    problemStatement: isMcq
      ? `Concept Transfer Question: In a real-world system using ${pattern.replace(/_/g, ' ')}, how should you adapt the core logic when input size doubles?`
      : `Given a real-world scenario (e.g., streaming data or real-time processing), adapt your ${pattern.replace(/_/g, ' ')} solution to compute the result cleanly.`,
    inputFormat: originalQuestion.inputFormat || 'Standard input format',
    outputFormat: originalQuestion.outputFormat || 'Standard output format',
    constraints: originalQuestion.constraints || 'Standard constraints',
    codeSnippets: originalQuestion.codeSnippets || {
      javascript: `// Similar Question for ${pattern}\nfunction solveVariant(input) {\n    // Implement transfer logic\n}`
    },
    testCases: (originalQuestion.testCases || []).filter(tc => !tc.isHidden),
    mcqOptions: (originalQuestion.mcqOptions || []).map(opt => ({
      optionId: opt.optionId,
      optionText: opt.optionText || opt.text,
      text: opt.text || opt.optionText
    })),
    hints: [`Think about how the core ${pattern.replace(/_/g, ' ')} mechanism adapts to different data structures.`]
  };

  return {
    question: sanitizeQuestionForStudent(generatedQuestionData),
    concept: pattern,
    transferGoal: `Verify concept transfer capability for ${pattern.replace(/_/g, ' ')}.`
  };
};

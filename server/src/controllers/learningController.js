import mongoose from 'mongoose';
import Topic from '../models/Topic.js';
import Question from '../models/Question.js';
import TopicProgress from '../models/TopicProgress.js';
import Roadmap from '../models/Roadmap.js';
import AttemptTrack from '../models/AttemptTrack.js';
import ConfidenceCheck from '../models/ConfidenceCheck.js';
import { detectQuestionPattern } from '../services/patternRecognitionService.js';
import { getSameLogicPractice } from '../services/sameLogicPracticeService.js';
import { getSimilarQuestion } from '../services/similarQuestionService.js';

/**
 * Helper to build sensible structured fallback learning content if topic.learningContent is sparse.
 */
const ensureLearningContentDefaults = (topic) => {
  const obj = topic.toObject ? topic.toObject() : { ...topic };
  const content = obj.learningContent || {};

  const title = obj.title || 'Learning Topic';
  const subject = obj.subject || 'DSA';
  const category = obj.category || 'dsa';

  const defaultObjectives = [
    `Understand core principles and key mechanisms of ${title}`,
    `Analyze real-world placement applications and problem patterns`,
    `Master practical implementation details and edge cases`,
    `Apply concepts directly to solve interview-level practice questions`
  ];

  const defaultWhat = content.what || `${title} is a fundamental concept in ${subject} designed to optimize performance, manage complexity, and solve critical problem patterns efficiently.`;
  const defaultWhy = content.why || `Mastering ${title} is crucial for placement preparation because it frequently appears in technical interview rounds, online assessments, and system design evaluations.`;
  const defaultWhereWhen = content.whereWhen || `Used in real-world software applications, database query optimization, system design, and algorithmic problem-solving scenarios.`;
  const defaultExplanation = content.conceptExplanation || `${title} provides a systematic structure for handling data operations and computational logic. By understanding its underlying architecture, time/space complexity, and invariant properties, you can design efficient algorithms and reliable systems.`;

  // Syntax defaults
  const defaultSyntax = content.syntaxCode || {};
  if (category === 'dsa' && !defaultSyntax.javascript) {
    defaultSyntax.javascript = `// ${title} Basic Template\nfunction solve(input) {\n    // Implementation logic here\n    return input;\n}`;
    defaultSyntax.python = `# ${title} Basic Template\ndef solve(input):\n    # Implementation logic here\n    return input`;
    defaultSyntax.cpp = `// ${title} Basic Template\n#include <iostream>\nusing namespace std;\n\nvoid solve() {\n    // Implementation logic here\n}`;
    defaultSyntax.java = `// ${title} Basic Template\npublic class Solution {\n    public static void solve() {\n        // Implementation logic here\n    }\n}`;
  }

  // Example defaults
  let defaultExamples = content.examples || [];
  if (defaultExamples.length === 0) {
    defaultExamples = [{
      title: `${title} Standard Example`,
      problemStatement: `Demonstrate basic operation and step-by-step logic for ${title}.`,
      explanation: `Analyze input state, perform core operational steps, and compute the final output.`,
      input: `Sample Input: [10, 20, 30, 40]`,
      output: `Sample Output: Target Found / Processed Result`,
      steps: [
        { stepNumber: 1, label: 'Initialization', explanation: 'Set up pointers, variables, or state tracking structures.', state: { pointer: 0, status: 'Active' }, output: 'Started' },
        { stepNumber: 2, label: 'Execution Loop', explanation: 'Process target elements and update state based on condition.', state: { pointer: 1, status: 'Processing' }, output: 'In Progress' },
        { stepNumber: 3, label: 'Completion', explanation: 'Return computed answer or verified state.', state: { pointer: 2, status: 'Finished' }, output: 'Completed' }
      ]
    }];
  }

  // Edge cases defaults
  let defaultEdgeCases = content.edgeCases || [];
  if (defaultEdgeCases.length === 0) {
    defaultEdgeCases = [
      'Empty or null input collections',
      'Single-element inputs and boundary bounds',
      'Duplicate values or unexpected data types',
      'Large input sizes testing time & space limits'
    ];
  }

  // Visual diagram default
  let defaultVisual = content.visualDiagram || {};
  if (!defaultVisual.nodes || defaultVisual.nodes.length === 0) {
    if (subject.toUpperCase().includes('DBMS') || category === 'cs_core') {
      defaultVisual = {
        type: 'database',
        title: `${title} Conceptual Layout`,
        content: `Visual representation of ${title} data flow and table relationships.`,
        nodes: [
          { id: 'n1', label: 'Input Request / Query', type: 'source', details: 'Client application dispatching SQL query.' },
          { id: 'n2', label: `${title} Execution Engine`, type: 'process', details: 'Query optimizer executing plan.' },
          { id: 'n3', label: 'Result Set Table', type: 'output', details: 'Filtered rows returned to caller.' }
        ],
        edges: [
          { from: 'n1', to: 'n2', label: 'Execute' },
          { from: 'n2', to: 'n3', label: 'Returns' }
        ]
      };
    } else {
      defaultVisual = {
        type: 'flow',
        title: `${title} State Transition Flow`,
        content: `Step-by-step execution flow for ${title}.`,
        nodes: [
          { id: 'n1', label: 'Initial State', type: 'start', details: 'Setup initial parameters.' },
          { id: 'n2', label: 'Condition Evaluation', type: 'decision', details: 'Check target condition.' },
          { id: 'n3', label: 'Result State', type: 'end', details: 'Final computed answer.' }
        ],
        edges: [
          { from: 'n1', to: 'n2', label: 'Step 1' },
          { from: 'n2', to: 'n3', label: 'Step 2' }
        ]
      };
    }
  }

  return {
    ...obj,
    learningContent: {
      learningObjectives: content.learningObjectives && content.learningObjectives.length > 0 ? content.learningObjectives : defaultObjectives,
      conceptExplanation: defaultExplanation,
      what: defaultWhat,
      why: defaultWhy,
      whereWhen: defaultWhereWhen,
      examples: defaultExamples,
      edgeCases: defaultEdgeCases,
      visualDiagram: defaultVisual,
      syntaxCode: defaultSyntax,
      formula: content.formula || {},
      shortcut: content.shortcut || {},
      sqlExample: content.sqlExample || {},
      estimatedLearningTimeMinutes: content.estimatedLearningTimeMinutes || 30
    }
  };
};

/**
 * GET /api/v1/student/learning/topics/:topicId
 * Retrieves full topic learning content and current student learning status.
 */
export const getTopicLearningContent = async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user.userId;

    if (!topicId || !mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing topicId parameter'
      });
    }

    const topic = await Topic.findById(topicId).populate('prerequisites', 'title subject slug');
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Find or initialize TopicProgress
    let progress = await TopicProgress.findOne({ userId, topicId });
    if (!progress) {
      progress = await TopicProgress.create({
        userId,
        topicId,
        status: 'IN_PROGRESS',
        lastAccessedAt: new Date()
      });
    } else {
      if (progress.status === 'NOT_STARTED') {
        progress.status = 'IN_PROGRESS';
      }
      progress.lastAccessedAt = new Date();
      await progress.save();
    }

    // Sync in_progress status with Roadmap if node exists
    await Roadmap.updateOne(
      { userId, 'nodes.topicId': topicId, 'nodes.status': { $in: ['locked', 'NOT_STARTED'] } },
      { $set: { 'nodes.$.status': 'in_progress' } }
    ).catch(() => {});

    const enrichedTopic = ensureLearningContentDefaults(topic);

    return res.status(200).json({
      success: true,
      data: {
        topic: enrichedTopic,
        progress: {
          status: progress.status,
          completedAt: progress.completedAt || null,
          lastAccessedAt: progress.lastAccessedAt
        }
      }
    });
  } catch (error) {
    console.error('[LearningController] getTopicLearningContent error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving topic learning content'
    });
  }
};

/**
 * GET /api/v1/student/learning/topics/:topicId/practice
 * Retrieves safe practice questions for a learning topic.
 * EXCLUDES sensitive fields (solutionCode, solutionExplanation, hidden test cases, MCQ answer keys).
 */
export const getTopicPracticeQuestions = async (req, res) => {
  try {
    const { topicId } = req.params;

    if (!topicId || !mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing topicId parameter'
      });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Find questions by topicId or referenced in topic.learningContent
    const query = {
      $or: [
        { topicId },
        { _id: { $in: topic.learningContent?.practiceQuestionReferences || [] } }
      ]
    };

    const questions = await Question.find(query).lean();

    // Map to strip sensitive information
    const safeQuestions = questions.map(q => {
      const safeTestCases = (q.testCases || [])
        .filter(tc => !tc.isHidden)
        .map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput }));

      const safeMcqOptions = (q.mcqOptions || []).map(opt => ({
        optionId: opt.optionId || opt._id?.toString(),
        optionText: opt.optionText || opt.text || '',
        text: opt.text || opt.optionText || ''
      }));

      return {
        _id: q._id,
        topicId: q.topicId,
        title: q.title,
        slug: q.slug,
        difficulty: q.difficulty,
        type: q.type,
        category: q.category,
        pattern: q.pattern || 'OTHER',
        problemStatement: q.problemStatement,
        description: q.description || '',
        inputFormat: q.inputFormat || '',
        outputFormat: q.outputFormat || '',
        constraints: q.constraints || '',
        codeSnippets: q.codeSnippets || {},
        testCases: safeTestCases,
        mcqOptions: safeMcqOptions,
        hints: q.hints || [],
        companyTags: q.companyTags || []
      };
    });

    return res.status(200).json({
      success: true,
      data: safeQuestions
    });
  } catch (error) {
    console.error('[LearningController] getTopicPracticeQuestions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving practice questions'
    });
  }
};

/**
 * POST /api/v1/student/learning/topics/:topicId/complete
 * Marks topic learning as COMPLETED for current student and updates Roadmap node.
 */
export const markTopicLearningComplete = async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user.userId;

    if (!topicId || !mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing topicId parameter'
      });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Update or insert TopicProgress
    const progress = await TopicProgress.findOneAndUpdate(
      { userId, topicId },
      {
        $set: {
          status: 'COMPLETED',
          completedAt: new Date(),
          lastAccessedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    // Update corresponding roadmap node to completed if present
    await Roadmap.updateOne(
      { userId, 'nodes.topicId': topicId },
      { $set: { 'nodes.$.status': 'completed' } }
    ).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Topic learning marked as completed successfully',
      data: {
        topicId,
        status: progress.status,
        completedAt: progress.completedAt
      }
    });
  } catch (error) {
    console.error('[LearningController] markTopicLearningComplete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating topic completion status'
    });
  }
};

/**
 * POST /api/v1/student/confidence
 * Records self-reported confidence check (1-5 integer).
 */
export const recordStudentConfidence = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { topicId, questionId, attemptId, confidence, pattern } = req.body;

    // Validate confidence is integer in [1, 5]
    if (confidence === undefined || confidence === null || typeof confidence !== 'number' || !Number.isInteger(confidence) || confidence < 1 || confidence > 5) {
      return res.status(400).json({
        success: false,
        message: 'Confidence score must be an integer between 1 and 5'
      });
    }

    // Ownership check for attemptId if provided
    if (attemptId) {
      if (!mongoose.Types.ObjectId.isValid(attemptId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid attemptId format'
        });
      }
      const attempt = await AttemptTrack.findOne({ _id: attemptId, userId });
      if (!attempt) {
        return res.status(403).json({
          success: false,
          message: 'Attempt track record not found or belongs to another student'
        });
      }
    }

    // Validate topicId if provided
    if (topicId && !mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid topicId format'
      });
    }

    // Validate questionId if provided
    if (questionId && !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid questionId format'
      });
    }

    const confidenceDoc = await ConfidenceCheck.create({
      userId,
      topicId: topicId || null,
      questionId: questionId || null,
      attemptId: attemptId || null,
      confidence,
      pattern: pattern || null
    });

    return res.status(200).json({
      success: true,
      message: 'Confidence score recorded successfully',
      data: confidenceDoc
    });
  } catch (error) {
    console.error('[LearningController] recordStudentConfidence error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error recording confidence'
    });
  }
};

/**
 * POST /api/v1/student/learning/practice/intelligent-help
 * Returns pattern metadata, contextual hint, same-logic practice, or similar question.
 */
export const getIntelligentPracticeHelp = async (req, res) => {
  try {
    const { questionId, action } = req.body;

    if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing questionId parameter'
      });
    }

    const question = await Question.findById(questionId).populate('topicId');
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const patternInfo = await detectQuestionPattern(question);

    if (action === 'same-logic') {
      const sameLogicResult = await getSameLogicPractice(question);
      return res.status(200).json({
        success: true,
        data: {
          pattern: patternInfo.pattern,
          reasoning: patternInfo.reasoning,
          sameLogicPractice: sameLogicResult
        }
      });
    }

    if (action === 'similar') {
      const similarResult = await getSimilarQuestion(question);
      return res.status(200).json({
        success: true,
        data: {
          pattern: patternInfo.pattern,
          reasoning: patternInfo.reasoning,
          similarQuestion: similarResult
        }
      });
    }

    // Default: Contextual hint & pattern explanation
    const hintText = (question.hints && question.hints.length > 0)
      ? question.hints[0]
      : `Focus on how ${patternInfo.pattern.replace(/_/g, ' ')} reduces problem complexity.`;

    const explanationText = `This problem tests the ${patternInfo.pattern.replace(/_/g, ' ')} pattern. Identify the invariant condition and maintain state pointers or window bounds cleanly.`;

    return res.status(200).json({
      success: true,
      data: {
        pattern: patternInfo.pattern,
        confidence: patternInfo.confidence,
        hint: hintText,
        explanation: explanationText
      }
    });
  } catch (error) {
    console.error('[LearningController] getIntelligentPracticeHelp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating intelligent practice help'
    });
  }
};

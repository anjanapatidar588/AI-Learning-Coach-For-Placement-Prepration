import AssessmentBlueprint from '../models/AssessmentBlueprint.js';
import PublishedAssessment from '../models/PublishedAssessment.js';
import Question from '../models/Question.js';
import Topic from '../models/Topic.js';
import { generateQuestionsFromBlueprint } from '../services/ai/questionGenerator.js';

/**
 * GET /api/v1/admin/assessment-blueprints
 */
export const getAdminAssessmentBlueprints = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [blueprints, total] = await Promise.all([
      AssessmentBlueprint.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AssessmentBlueprint.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        blueprints,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/admin/assessment-blueprints/:blueprintId
 */
export const getAdminAssessmentBlueprintById = async (req, res) => {
  try {
    const { blueprintId } = req.params;
    const blueprint = await AssessmentBlueprint.findById(blueprintId)
      .populate('createdBy', 'name email')
      .populate('generatedQuestions');

    if (!blueprint) {
      return res.status(404).json({ success: false, message: 'Assessment Blueprint not found' });
    }

    res.json({ success: true, data: blueprint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/admin/assessment-blueprints
 */
export const createAdminAssessmentBlueprint = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required: User ID missing from context' });
    }

    const {
      title,
      description,
      subjects,
      topicDistribution,
      difficultyDistribution,
      questionCount,
      questionTypes,
      marksPerQuestion,
      totalMarks,
      durationMinutes,
      negativeMarking,
      negativeMarks,
      targetAudience,
      graduationYear
    } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Blueprint title is required' });
    }

    const qCount = Number(questionCount);
    if (!qCount || isNaN(qCount) || qCount < 1) {
      return res.status(400).json({ success: false, message: 'Question count must be at least 1' });
    }

    const duration = Number(durationMinutes) || 30;
    if (duration < 5) {
      return res.status(400).json({ success: false, message: 'Duration must be at least 5 minutes' });
    }

    const marks = Number(marksPerQuestion) || 1;
    if (marks < 1) {
      return res.status(400).json({ success: false, message: 'Marks per question must be at least 1' });
    }

    const allowedSubjects = ['dsa', 'aptitude', 'cs_core', 'oops', 'dbms', 'os', 'cn'];
    let validSubjects = Array.isArray(subjects) && subjects.length > 0
      ? subjects.filter(s => allowedSubjects.includes(s))
      : [];

    // Clean and validate topic distribution
    let cleanTopicDist = [];
    if (Array.isArray(topicDistribution) && topicDistribution.length > 0) {
      cleanTopicDist = topicDistribution.map(t => {
        const cat = allowedSubjects.includes(t.category) ? t.category : 'dsa';
        if (!validSubjects.includes(cat)) {
          validSubjects.push(cat);
        }
        return {
          topicName: (t.topicName || 'General Topic').trim(),
          category: cat,
          questionCount: Number(t.questionCount) || 1,
          difficulty: ['Easy', 'Medium', 'Hard'].includes(t.difficulty) ? t.difficulty : 'Medium'
        };
      });

      const sumCount = cleanTopicDist.reduce((acc, t) => acc + (Number(t.questionCount) || 0), 0);
      if (sumCount !== qCount) {
        return res.status(400).json({
          success: false,
          message: `Question distribution (${sumCount}) must equal blueprint question count (${qCount})`
        });
      }
    }

    if (validSubjects.length === 0) {
      validSubjects = ['dsa'];
    }

    const computedTotalMarks = Number(totalMarks) || (qCount * marks);

    // Compute difficulty distribution if not supplied
    let cleanDifficulty = difficultyDistribution;
    if (!cleanDifficulty || typeof cleanDifficulty !== 'object') {
      let easy = 0, medium = 0, hard = 0;
      cleanTopicDist.forEach(t => {
        const count = Number(t.questionCount) || 0;
        if (t.difficulty === 'Easy') easy += count;
        else if (t.difficulty === 'Hard') hard += count;
        else medium += count;
      });
      cleanDifficulty = { easy, medium, hard };
    }

    const blueprint = await AssessmentBlueprint.create({
      title: title.trim(),
      description: (description || '').trim(),
      subjects: validSubjects,
      topicDistribution: cleanTopicDist,
      difficultyDistribution: cleanDifficulty,
      questionCount: qCount,
      questionTypes: Array.isArray(questionTypes) && questionTypes.length > 0 ? questionTypes : ['mcq'],
      marksPerQuestion: marks,
      totalMarks: computedTotalMarks,
      durationMinutes: duration,
      negativeMarking: Boolean(negativeMarking),
      negativeMarks: negativeMarking ? (Number(negativeMarks) || 0) : 0,
      targetAudience: (targetAudience || 'All Students').trim(),
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      createdBy: userId,
      status: 'DRAFT'
    });

    return res.status(201).json({ success: true, data: blueprint });
  } catch (error) {
    console.error('[createAdminAssessmentBlueprint] Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/v1/admin/assessment-blueprints/:blueprintId
 */
export const updateAdminAssessmentBlueprint = async (req, res) => {
  try {
    const { blueprintId } = req.params;
    const blueprint = await AssessmentBlueprint.findById(blueprintId);

    if (!blueprint) {
      return res.status(404).json({ success: false, message: 'Assessment Blueprint not found' });
    }

    if (blueprint.status === 'PUBLISHED') {
      return res.status(400).json({ success: false, message: 'Cannot modify a PUBLISHED assessment blueprint. Create a new version instead.' });
    }

    const {
      title,
      description,
      subjects,
      topicDistribution,
      difficultyDistribution,
      questionCount,
      questionTypes,
      marksPerQuestion,
      totalMarks,
      durationMinutes,
      negativeMarking,
      negativeMarks,
      targetAudience,
      graduationYear
    } = req.body;

    if (title !== undefined) {
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Title cannot be empty' });
      }
      blueprint.title = title.trim();
    }

    if (description !== undefined) blueprint.description = String(description).trim();
    if (Array.isArray(subjects) && subjects.length > 0) blueprint.subjects = subjects;

    const newQCount = questionCount !== undefined ? Number(questionCount) : blueprint.questionCount;
    if (newQCount < 1) {
      return res.status(400).json({ success: false, message: 'questionCount must be at least 1' });
    }
    blueprint.questionCount = newQCount;

    const newTopics = topicDistribution !== undefined ? topicDistribution : blueprint.topicDistribution;
    if (Array.isArray(newTopics) && newTopics.length > 0) {
      const sumCount = newTopics.reduce((acc, t) => acc + (Number(t.questionCount) || 0), 0);
      if (sumCount !== newQCount) {
        return res.status(400).json({
          success: false,
          message: `Topic question count sum (${sumCount}) must equal blueprint question count (${newQCount})`
        });
      }
      blueprint.topicDistribution = newTopics;
    }

    if (difficultyDistribution) blueprint.difficultyDistribution = difficultyDistribution;
    if (Array.isArray(questionTypes) && questionTypes.length > 0) blueprint.questionTypes = questionTypes;
    if (marksPerQuestion !== undefined) blueprint.marksPerQuestion = Number(marksPerQuestion) || 1;
    if (totalMarks !== undefined) blueprint.totalMarks = Number(totalMarks);
    else blueprint.totalMarks = blueprint.questionCount * blueprint.marksPerQuestion;
    if (durationMinutes !== undefined) blueprint.durationMinutes = Number(durationMinutes);
    if (negativeMarking !== undefined) blueprint.negativeMarking = Boolean(negativeMarking);
    if (negativeMarks !== undefined) blueprint.negativeMarks = Number(negativeMarks);
    if (targetAudience !== undefined) blueprint.targetAudience = String(targetAudience).trim();
    if (graduationYear !== undefined) blueprint.graduationYear = Number(graduationYear);

    await blueprint.save();
    res.json({ success: true, data: blueprint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/v1/admin/assessment-blueprints/:blueprintId
 */
export const deleteAdminAssessmentBlueprint = async (req, res) => {
  try {
    const { blueprintId } = req.params;
    const blueprint = await AssessmentBlueprint.findById(blueprintId);

    if (!blueprint) {
      return res.status(404).json({ success: false, message: 'Assessment Blueprint not found' });
    }

    if (blueprint.status === 'PUBLISHED') {
      return res.status(400).json({ success: false, message: 'Cannot delete a PUBLISHED assessment blueprint' });
    }

    await AssessmentBlueprint.deleteOne({ _id: blueprintId });
    res.json({ success: true, message: 'Assessment Blueprint deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/admin/assessment-blueprints/:blueprintId/generate-questions
 */
export const generateBlueprintQuestions = async (req, res) => {
  try {
    const { blueprintId } = req.params;
    const blueprint = await AssessmentBlueprint.findById(blueprintId);

    if (!blueprint) {
      return res.status(404).json({ success: false, message: 'Assessment Blueprint not found' });
    }

    if (blueprint.status === 'PUBLISHED') {
      return res.status(400).json({ success: false, message: 'Cannot generate questions for an already PUBLISHED blueprint' });
    }

    blueprint.status = 'GENERATING';
    await blueprint.save();

    let generatedValidatedQuestions = [];
    try {
      generatedValidatedQuestions = await generateQuestionsFromBlueprint(blueprint);
    } catch (genError) {
      blueprint.status = 'DRAFT';
      await blueprint.save();
      return res.status(400).json({
        success: false,
        message: `AI Question Generation Failed: ${genError.message}`
      });
    }

    // Save generated questions to DB and associate with blueprint
    const savedQuestionIds = [];

    for (let i = 0; i < generatedValidatedQuestions.length; i++) {
      const qData = generatedValidatedQuestions[i];
      
      // Resolve or create Topic reference
      let topic = await Topic.findOne({
        title: { $regex: new RegExp(`^${qData.topicName.trim()}$`, 'i') }
      });

      if (!topic) {
        const slug = `${qData.category}-${qData.topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}-${i}`;
        topic = await Topic.create({
          category: qData.category,
          subject: blueprint.subjects[0] || 'Computer Science',
          title: qData.topicName,
          slug,
          difficulty: qData.difficulty
        }).catch(() => null);
      }

      const questionSlug = `bp-${blueprint._id}-${Date.now()}-${i}`;
      const newQuestion = await Question.create({
        topicId: topic ? topic._id : (await Topic.findOne({}))?._id,
        title: qData.title,
        slug: questionSlug,
        difficulty: qData.difficulty,
        type: qData.type,
        problemStatement: qData.problemStatement,
        mcqOptions: qData.mcqOptions,
        solutionExplanation: qData.explanation,
        hints: [qData.explanation].filter(Boolean)
      });

      savedQuestionIds.push(newQuestion._id);
    }

    blueprint.generatedQuestions = savedQuestionIds;
    blueprint.status = 'REVIEW';
    await blueprint.save();

    const populatedBlueprint = await AssessmentBlueprint.findById(blueprintId).populate('generatedQuestions');

    res.json({
      success: true,
      message: `Successfully generated and validated ${savedQuestionIds.length} questions`,
      data: populatedBlueprint
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/admin/assessment-blueprints/:blueprintId/questions
 */
export const getBlueprintQuestionsForReview = async (req, res) => {
  try {
    const { blueprintId } = req.params;
    const blueprint = await AssessmentBlueprint.findById(blueprintId).populate({
      path: 'generatedQuestions',
      populate: { path: 'topicId', select: 'title category subject' }
    });

    if (!blueprint) {
      return res.status(404).json({ success: false, message: 'Assessment Blueprint not found' });
    }

    res.json({
      success: true,
      data: {
        blueprintId: blueprint._id,
        status: blueprint.status,
        questions: blueprint.generatedQuestions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/v1/admin/assessment-blueprints/:blueprintId/questions/:questionId
 */
export const updateBlueprintQuestion = async (req, res) => {
  try {
    const { blueprintId, questionId } = req.params;
    const blueprint = await AssessmentBlueprint.findById(blueprintId);

    if (!blueprint) {
      return res.status(404).json({ success: false, message: 'Assessment Blueprint not found' });
    }

    if (blueprint.status === 'PUBLISHED') {
      return res.status(400).json({ success: false, message: 'Cannot edit questions of a PUBLISHED assessment' });
    }

    const { title, problemStatement, difficulty, mcqOptions, solutionExplanation } = req.body;
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (title !== undefined) question.title = String(title).trim();
    if (problemStatement !== undefined) question.problemStatement = String(problemStatement).trim();
    if (difficulty !== undefined && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      question.difficulty = difficulty;
    }
    if (solutionExplanation !== undefined) question.solutionExplanation = String(solutionExplanation).trim();

    if (Array.isArray(mcqOptions)) {
      question.mcqOptions = mcqOptions.map((opt, idx) => ({
        optionId: opt.optionId || String.fromCharCode(65 + idx),
        optionText: (opt.optionText || opt.text || '').trim(),
        text: (opt.text || opt.optionText || '').trim(),
        isCorrect: Boolean(opt.isCorrect)
      }));
    }

    await question.save();
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/admin/assessment-blueprints/:blueprintId/approve
 */
export const approveBlueprint = async (req, res) => {
  try {
    const { blueprintId } = req.params;
    const blueprint = await AssessmentBlueprint.findById(blueprintId);

    if (!blueprint) {
      return res.status(404).json({ success: false, message: 'Assessment Blueprint not found' });
    }

    if (!blueprint.generatedQuestions || blueprint.generatedQuestions.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot approve blueprint without generated questions' });
    }

    blueprint.status = 'APPROVED';
    await blueprint.save();

    res.json({ success: true, message: 'Blueprint approved successfully', data: blueprint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/admin/assessment-blueprints/:blueprintId/publish
 */
export const publishBlueprint = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { blueprintId } = req.params;
    const blueprint = await AssessmentBlueprint.findById(blueprintId).populate('generatedQuestions');

    if (!blueprint) {
      return res.status(404).json({ success: false, message: 'Assessment Blueprint not found' });
    }

    if (!blueprint.generatedQuestions || blueprint.generatedQuestions.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot publish blueprint without generated questions' });
    }

    // Verify all questions have valid content
    for (const q of blueprint.generatedQuestions) {
      if (!q.problemStatement || q.problemStatement.trim().length < 5) {
        return res.status(400).json({ success: false, message: `Question "${q.title}" contains invalid problem statement` });
      }
    }

    // Create PublishedAssessment document
    const questionsArray = blueprint.generatedQuestions.map((q, idx) => ({
      questionId: q._id,
      marks: blueprint.marksPerQuestion || 1,
      order: idx + 1
    }));

    const publishedAssessment = await PublishedAssessment.create({
      blueprintId: blueprint._id,
      title: blueprint.title,
      description: blueprint.description,
      version: blueprint.version || 1,
      status: 'PUBLISHED',
      durationMinutes: blueprint.durationMinutes,
      totalMarks: blueprint.totalMarks,
      marksPerQuestion: blueprint.marksPerQuestion,
      negativeMarking: blueprint.negativeMarking,
      negativeMarks: blueprint.negativeMarks,
      questionCount: blueprint.questionCount,
      subjects: blueprint.subjects,
      questions: questionsArray,
      createdBy: userId,
      publishedAt: new Date()
    });

    blueprint.status = 'PUBLISHED';
    await blueprint.save();

    res.json({
      success: true,
      message: 'Assessment published successfully',
      data: publishedAssessment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/admin/assessment-blueprints/:blueprintId/archive
 */
export const archiveBlueprint = async (req, res) => {
  try {
    const { blueprintId } = req.params;
    const blueprint = await AssessmentBlueprint.findById(blueprintId);

    if (!blueprint) {
      return res.status(404).json({ success: false, message: 'Assessment Blueprint not found' });
    }

    blueprint.status = 'ARCHIVED';
    await blueprint.save();

    await PublishedAssessment.updateMany({ blueprintId }, { status: 'ARCHIVED' });

    res.json({ success: true, message: 'Assessment archived successfully', data: blueprint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/admin/assessments/:blueprintId/unpublish
 */
export const unpublishBlueprint = async (req, res) => {
  try {
    const { blueprintId } = req.params;
    const blueprint = await AssessmentBlueprint.findById(blueprintId);

    if (!blueprint) {
      return res.status(404).json({ success: false, message: 'Assessment Blueprint not found' });
    }

    blueprint.status = 'APPROVED';
    await blueprint.save();

    await PublishedAssessment.updateMany({ blueprintId }, { status: 'DRAFT' });

    res.json({ success: true, message: 'Assessment unpublished successfully', data: blueprint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


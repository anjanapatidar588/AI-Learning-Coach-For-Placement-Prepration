import Topic from '../models/Topic.js';
import Question from '../models/Question.js';
import AttemptTrack from '../models/AttemptTrack.js';
import WeaknessAnalysis from '../models/WeaknessAnalysis.js';
import { generateAIResponse } from '../services/ai/geminiClient.js';
import { PERSONA_PROMPTS } from '../services/ai/promptTemplates.js';
import { executeCode } from '../services/codeExecutionService.js';

export const getDSATopics = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    // Fetch DSA topics
    const topics = await Topic.find({ category: 'dsa' }).sort({ order: 1 });
    
    // If no topics, return empty array immediately
    if (topics.length === 0) {
      return res.json({ success: true, data: { topics: [] } });
    }

    // Fetch user attempts for DSA
    const attempts = await AttemptTrack.find({ userId, category: 'dsa' }).populate('questionId');

    // Calculate progress per topic
    const progressMap = {};
    topics.forEach(topic => {
      progressMap[topic._id.toString()] = {
        totalAttempts: 0,
        passedAttempts: 0,
        accuracy: 0
      };
    });

    attempts.forEach(attempt => {
      if (attempt.questionId && attempt.questionId.topicId) {
        const tId = attempt.questionId.topicId.toString();
        if (progressMap[tId]) {
          progressMap[tId].totalAttempts++;
          if (attempt.status === 'Accepted') {
            progressMap[tId].passedAttempts++;
          }
        }
      }
    });

    // Format the response
    const topicsWithProgress = topics.map(topic => {
      const p = progressMap[topic._id.toString()];
      let accuracy = 0;
      if (p.totalAttempts > 0) {
        accuracy = Math.round((p.passedAttempts / p.totalAttempts) * 100);
      }
      return {
        ...topic.toObject(),
        progress: {
          totalAttempts: p.totalAttempts,
          passedAttempts: p.passedAttempts,
          accuracy
        }
      };
    });

    res.json({ success: true, data: { topics: topicsWithProgress } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDSAQuestions = async (req, res) => {
  try {
    const { topic, difficulty } = req.query;
    
    // First, find all DSA topics
    let topicQuery = { category: 'dsa' };
    
    if (topic) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(topic);
      if (isObjectId) {
        topicQuery._id = topic;
      } else {
        topicQuery.slug = topic;
      }
    }
    
    const dsaTopics = await Topic.find(topicQuery).select('_id');
    const dsaTopicIds = dsaTopics.map(t => t._id);
    
    if (dsaTopicIds.length === 0) {
      return res.json({ success: true, data: { questions: [] } });
    }
    
    const query = { topicId: { $in: dsaTopicIds } };
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    const questions = await Question.find(query)
      .select('title slug difficulty type companyTags topicId createdAt')
      .populate({
        path: 'topicId',
        select: 'title slug category subject'
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { questions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDSAQuestionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return res.status(400).json({ success: false, message: 'Slug is required' });
    }

    const question = await Question.findOne({ slug })
      .select('-solutionCode -solutionExplanation -mcqOptions -hints')
      .populate({
        path: 'topicId',
        select: 'title slug category subject'
      });

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Ensure it's a DSA question
    if (!question.topicId || question.topicId.category !== 'dsa') {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Strip hidden test cases
    const questionObj = question.toObject();
    if (questionObj.testCases && Array.isArray(questionObj.testCases)) {
      questionObj.testCases = questionObj.testCases.filter(tc => !tc.isHidden);
    }

    // Explicitly delete sensitive fields just to be absolutely certain
    delete questionObj.solutionCode;
    delete questionObj.solutionExplanation;
    delete questionObj.mcqOptions;
    delete questionObj.hints;

    res.json({ success: true, data: questionObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitDSACode = async (req, res) => {
  try {
    const { questionId, slug, code, language, timeSpentSeconds } = req.body;
    const userId = req.user.userId || req.user._id;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }

    const supportedLanguages = ['javascript', 'python', 'cpp', 'java'];
    if (!language || !supportedLanguages.includes(language.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Invalid or missing language' });
    }

    if (!questionId && !slug) {
      return res.status(400).json({ success: false, message: 'questionId or slug is required' });
    }

    let questionQuery = {};
    if (questionId) {
      questionQuery._id = questionId;
    } else {
      questionQuery.slug = slug;
    }

    const question = await Question.findOne(questionQuery).populate('topicId');
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (!question.topicId || question.topicId.category !== 'dsa') {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const testCases = question.testCases && question.testCases.length > 0 ? question.testCases : [];
    
    const executionResult = await executeCode({
      language: language.toLowerCase(),
      code,
      testCases
    });

    if (!executionResult.isAvailable) {
      return res.status(503).json({
        success: false,
        message: executionResult.message,
        data: {
          status: executionResult.status
        }
      });
    }

    const attempt = await AttemptTrack.create({
      userId,
      questionId: question._id,
      category: 'dsa',
      submittedCode: code,
      language: language.toLowerCase(),
      status: executionResult.status,
      passedTestCases: executionResult.passedTests,
      totalTestCases: executionResult.totalTests,
      timeSpentSeconds: timeSpentSeconds || 0
    });

    res.json({
      success: true,
      data: {
        status: executionResult.status,
        passedTestCases: executionResult.passedTests,
        totalTestCases: executionResult.totalTests,
        executionTimeMs: executionResult.executionTimeMs,
        memoryKb: executionResult.memoryKb,
        output: executionResult.output,
        error: executionResult.error,
        attemptId: attempt._id
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDSAAIHint = async (req, res) => {
  try {
    const { questionId, code, language, error: codeError, attemptId } = req.body;
    const userId = req.user.userId || req.user._id;

    if (!questionId) {
      return res.status(400).json({ success: false, message: 'questionId is required' });
    }

    const isQuestionIdValid = /^[0-9a-fA-F]{24}$/.test(questionId);
    if (!isQuestionIdValid) {
      return res.status(400).json({ success: false, message: 'Invalid questionId format' });
    }

    if (attemptId) {
      const isAttemptIdValid = /^[0-9a-fA-F]{24}$/.test(attemptId);
      if (!isAttemptIdValid) {
        return res.status(400).json({ success: false, message: 'Invalid attemptId format' });
      }
      const attempt = await AttemptTrack.findOne({ _id: attemptId, userId });
      if (!attempt) {
        return res.status(403).json({ success: false, message: 'Attempt not found or belongs to another user' });
      }
      if (attempt.questionId.toString() !== questionId) {
        return res.status(400).json({ success: false, message: 'attemptId does not match the provided questionId' });
      }
    }

    const question = await Question.findById(questionId).populate('topicId');
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    if (!question.topicId || question.topicId.category !== 'dsa') {
      return res.status(404).json({ success: false, message: 'Question not found or not a DSA question' });
    }

    const contextData = {
      problemTitle: question.title,
      problemStatement: question.description,
      inputFormat: question.inputFormat,
      outputFormat: question.outputFormat,
      constraints: question.constraints,
      difficulty: question.difficulty,
      topic: question.topicId.title,
      language: language || undefined,
      code: code || undefined,
      error: codeError || undefined,
    };

    let userPrompt = `The student is requesting a hint for the DSA problem "${question.title}".`;
    if (code) {
      userPrompt += `\n\nStudent Current Code (${language || 'unknown'}):\n${code}`;
    }
    if (codeError) {
      userPrompt += `\n\nError encountered:\n${codeError}`;
    }

    const hint = await generateAIResponse({
      persona: 'DSA Mentor',
      systemPrompt: "You are a DSA Mentor for a placement preparation platform. Give contextual hints that help the student discover the solution themselves. Do not provide the complete solution or full replacement code unless the system explicitly allows it. Prefer progressive hints and explain the relevant pattern or mistake.",
      userPrompt,
      contextData,
      failIfUnavailable: true
    });

    res.json({ success: true, data: { hint, mentor: 'DSA Mentor' } });
  } catch (error) {
    if (error.message === 'Gemini API is unavailable' || (error.message && error.message.includes('API key'))) {
      return res.status(503).json({ success: false, message: 'Gemini AI Service is currently unavailable' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

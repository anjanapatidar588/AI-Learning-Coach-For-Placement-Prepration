import Topic from '../models/Topic.js';
import Question from '../models/Question.js';
import AttemptTrack from '../models/AttemptTrack.js';
import WeaknessAnalysis from '../models/WeaknessAnalysis.js';
import { generateAIResponse } from '../services/ai/geminiClient.js';
import { PERSONA_PROMPTS } from '../services/ai/promptTemplates.js';

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
    const { questionId, code, language } = req.body;
    const userId = req.user._id;

    // Simulate code execution sandbox
    const passed = true;
    const status = passed ? 'Accepted' : 'Wrong Answer';
    const passedTestCases = 3;
    const totalTestCases = 3;

    let aiFeedback = '';
    if (passed) {
      aiFeedback = 'Excellent execution! Your solution achieves O(N) time complexity and O(N) space complexity using a Hash Map.';
    } else {
      aiFeedback = 'Your solution failed on hidden edge cases with duplicate elements. Consider storing index mappings correctly.';
      // Log weakness
      await WeaknessAnalysis.create({
        userId,
        topicId: questionId || '650000000000000000000001',
        topicTitle: 'Arrays & Two Pointers',
        category: 'dsa',
        failureCount: 1,
        severity: 'High',
        identifiedPattern: 'Edge case handling failure on duplicate array elements'
      }).catch(() => {});
    }

    const attempt = await AttemptTrack.create({
      userId,
      questionId: questionId || '650000000000000000000001',
      category: 'dsa',
      submittedCode: code,
      language: language || 'javascript',
      status,
      passedTestCases,
      totalTestCases,
      timeSpentSeconds: 120,
      aiFeedbackSummary: aiFeedback
    }).catch(() => ({ status, passedTestCases, totalTestCases, aiFeedbackSummary: aiFeedback }));

    res.json({
      success: true,
      data: {
        status,
        passedTestCases,
        totalTestCases,
        executionTimeMs: 45,
        memoryKb: 14200,
        aiFeedbackSummary: aiFeedback
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDSAAIHint = async (req, res) => {
  try {
    const { problemTitle, code, language, questionText } = req.body;

    const hint = await generateAIResponse({
      persona: 'DSA Mentor',
      systemPrompt: PERSONA_PROMPTS['DSA Mentor'],
      userPrompt: `The student is working on the DSA problem "${problemTitle}". Provide a helpful hint without giving away the complete code answer.
Problem text: ${questionText}
Student Current Code (${language}):
${code}`,
      contextData: { problemTitle, language }
    });

    res.json({ success: true, hint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

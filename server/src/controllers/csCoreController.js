import Topic from '../models/Topic.js';
import Question from '../models/Question.js';
import AttemptTrack from '../models/AttemptTrack.js';
import { generateAIResponse } from '../services/ai/geminiClient.js';
import { PERSONA_PROMPTS } from '../services/ai/promptTemplates.js';

export const getCSCoreSubjects = async (req, res) => {
  try {
    const subjects = await Topic.find({ category: 'cs_core' })
      .sort({ order: 1 })
      .select('-__v')
      .lean();

    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCSCoreTopics = async (req, res) => {
  try {
    const { subjectId } = req.params;

    if (!subjectId || typeof subjectId !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid subjectId' });
    }

    const topics = await Topic.find({ category: 'cs_core', subject: subjectId })
      .sort({ order: 1 })
      .select('-__v')
      .lean();

    res.json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCSCoreAIConcept = async (req, res) => {
  try {
    const { conceptTitle } = req.body;
    const response = await generateAIResponse({
      persona: 'CS Core Mentor',
      systemPrompt: PERSONA_PROMPTS['CS Core Mentor'],
      userPrompt: `Explain the CS Core concept "${conceptTitle}" with clear diagrams or bullet points and real-world software engineering analogies.`,
      contextData: { conceptTitle }
    });

    res.json({ success: true, explanation: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitCSCoreQuiz = async (req, res) => {
  try {
    const { topicId, answers } = req.body;
    const userId = req.user.userId;

    if (!topicId) {
      return res.status(400).json({ success: false, message: 'topicId is required' });
    }

    const isTopicObjectId = /^[0-9a-fA-F]{24}$/.test(topicId);
    if (!isTopicObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid topicId format' });
    }

    const topic = await Topic.findOne({ _id: topicId });
    if (!topic || topic.category !== 'cs_core') {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers must be an array' });
    }

    const validQuestions = await Question.find({ topicId: topic._id });
    const totalQuestions = validQuestions.length;
    
    const questionMap = {};
    validQuestions.forEach(q => {
      questionMap[q._id.toString()] = q;
    });

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    const attemptRecords = [];
    const processedQuestionIds = new Set();

    for (const ans of answers) {
      if (!ans.questionId || !ans.selectedOption) continue;
      
      const qIdStr = ans.questionId.toString();
      
      if (processedQuestionIds.has(qIdStr) || !questionMap[qIdStr]) {
        continue;
      }
      processedQuestionIds.add(qIdStr);

      const question = questionMap[qIdStr];
      let isCorrect = false;

      if ((question.type === 'mcq' || question.type === 'MCQ') && Array.isArray(question.mcqOptions)) {
        const correctOption = question.mcqOptions.find(o => o.isCorrect === true);
        if (correctOption && correctOption.optionId === ans.selectedOption) {
          isCorrect = true;
        }
      }

      if (isCorrect) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }

      attemptRecords.push({
        userId,
        questionId: question._id,
        category: 'cs_core',
        submittedCode: ans.selectedOption,
        status: isCorrect ? 'Accepted' : 'Wrong Answer',
        timeSpentSeconds: ans.timeSpentSeconds || 0
      });
    }

    const attemptedQuestions = correctAnswers + incorrectAnswers;
    const unansweredQuestions = totalQuestions - attemptedQuestions;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    let savedAttempts = [];
    if (attemptRecords.length > 0) {
      savedAttempts = await AttemptTrack.insertMany(attemptRecords);
    }

    res.json({
      success: true,
      data: {
        topic: {
          _id: topic._id,
          title: topic.title,
          slug: topic.slug,
          subject: topic.subject
        },
        result: {
          totalQuestions,
          attemptedQuestions,
          correctAnswers,
          incorrectAnswers,
          unansweredQuestions,
          accuracy
        },
        attemptIds: savedAttempts.map(a => a._id)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import Question from '../models/Question.js';
import Topic from '../models/Topic.js';

export const filterPracticeQuestions = async (req, res) => {
  try {
    const { category, topicId, difficulty, type, search } = req.query;

    const query = {};

    // 1. Handle category and topicId relationship
    if (category) {
      const allowedCategories = ['dsa', 'aptitude', 'cs_core'];
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
    }

    if (topicId) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(topicId);
      if (!isObjectId) {
        return res.status(400).json({ success: false, message: 'Invalid topicId format' });
      }

      const topic = await Topic.findById(topicId);
      if (!topic) {
        return res.status(404).json({ success: false, message: 'Topic not found' });
      }

      if (category && topic.category !== category) {
        return res.status(400).json({ success: false, message: 'Topic does not belong to the specified category' });
      }

      query.topicId = topic._id;
    } else if (category) {
      // Find all topics in the given category
      const topics = await Topic.find({ category }).select('_id');
      const topicIds = topics.map(t => t._id);
      query.topicId = { $in: topicIds };
    }

    // 2. Difficulty
    if (difficulty) {
      // Safely escape and make case-insensitive (e.g. Easy, Medium, Hard)
      query.difficulty = new RegExp(`^${difficulty}$`, 'i');
    }

    // 3. Type
    if (type) {
      query.type = new RegExp(`^${type}$`, 'i');
    }

    // 4. Search text (title or problemStatement)
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex chars
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { problemStatement: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    // Ensure we limit results if there are too many, using a safe project-consistent limit
    const limit = 50; 
    
    // Project safely, removing sensitive internal fields
    const safeProjection = {
      title: 1,
      slug: 1,
      difficulty: 1,
      type: 1,
      topicId: 1,
      companyTags: 1,
      mcqOptions: 1 // We must strip isCorrect if we return it
    };

    const questions = await Question.find(query)
      .select(safeProjection)
      .populate('topicId', 'title slug category subject')
      .limit(limit)
      .lean();

    // Strip sensitive fields like isCorrect inside mcqOptions
    const sanitizedQuestions = questions.map(q => {
      if (q.mcqOptions && Array.isArray(q.mcqOptions)) {
        q.mcqOptions = q.mcqOptions.map(opt => ({
          optionId: opt.optionId,
          optionText: opt.optionText,
          text: opt.text
        }));
      }
      return q;
    });

    res.json({
      success: true,
      data: sanitizedQuestions
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

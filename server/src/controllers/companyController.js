import Company from '../models/Company.js';
import Question from '../models/Question.js';

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({})
      .sort({ name: 1 })
      .select({
        _id: 1,
        name: 1,
        logoUrl: 1,
        description: 1,
        hiringRounds: 1,
        syllabus: 1,
        cutoffBenchmark: 1,
        createdAt: 1,
        updatedAt: 1
      })
      .lean();

    res.json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCompanyDetail = async (req, res) => {
  try {
    const { companyId } = req.params;

    // 1. Validate companyId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(companyId);
    if (!isObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid company ID format' });
    }

    // 2. Fetch company
    const company = await Company.findById(companyId)
      .select({
        _id: 1,
        name: 1,
        logoUrl: 1,
        description: 1,
        hiringRounds: 1,
        syllabus: 1,
        cutoffBenchmark: 1,
        createdAt: 1,
        updatedAt: 1
      })
      .lean();

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // 3. Fetch tagged questions
    const safeProjection = {
      _id: 1,
      title: 1,
      slug: 1,
      difficulty: 1,
      type: 1,
      problemStatement: 1,
      companyTags: 1,
      topicId: 1,
      mcqOptions: 1
    };

    const questions = await Question.find({ companyTags: company.name })
      .select(safeProjection)
      .populate('topicId', 'title slug category subject')
      .lean();

    // 4. Sanitize questions (strip isCorrect from mcqOptions)
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
      data: {
        company,
        questions: sanitizedQuestions
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

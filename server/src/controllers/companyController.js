import Company from '../models/Company.js';

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
    const company = {
      _id: companyId,
      name: companyId === 'comp-1' ? 'Google' : companyId === 'comp-2' ? 'Amazon' : 'TCS',
      category: 'Product-based',
      description: 'Comprehensive hiring track with tagged questions and round breakdowns.',
      hiringRounds: [
        { roundName: 'Online Screening Test', roundType: 'Coding & MCQs' },
        { roundName: 'Technical Interview 1', roundType: 'DSA Problem Solving' },
        { roundName: 'Technical Interview 2', roundType: 'CS Core & System Concepts' }
      ],
      taggedQuestions: [
        { title: 'Two Sum', difficulty: 'Easy', slug: 'two-sum' },
        { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', slug: 'longest-substring-without-repeating' }
      ]
    };

    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

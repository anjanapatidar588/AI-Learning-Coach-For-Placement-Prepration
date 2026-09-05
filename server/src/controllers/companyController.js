import Company from '../models/Company.js';

export const getCompanies = async (req, res) => {
  try {
    const companies = [
      {
        _id: 'comp-1',
        name: 'Google',
        logoUrl: 'https://www.google.com/favicon.ico',
        category: 'Product-based',
        description: 'Global tech giant emphasizing algorithmic efficiency, system design, and graph theory.',
        cutoffBenchmark: 85,
        hiringRounds: [
          { roundName: 'Round 1: Online Assessment', roundType: 'Coding (2 Hard Problems)', description: 'Graphs, Dynamic Programming, Strings' },
          { roundName: 'Round 2: Technical Interview 1', roundType: 'Data Structures & Algorithms', description: 'Trees, Recursion, Time complexity analysis' },
          { roundName: 'Round 3: Technical Interview 2', roundType: 'System Design / Architecture', description: 'Scalability, caching, database indexing' },
          { roundName: 'Round 4: Googleyness & Leadership', roundType: 'Behavioral Interview', description: 'Conflict resolution, leadership principles' }
        ],
        syllabus: ['Arrays & Hash Maps', 'Trees & Graphs', 'Dynamic Programming', 'System Design']
      },
      {
        _id: 'comp-2',
        name: 'Amazon',
        logoUrl: 'https://www.amazon.com/favicon.ico',
        category: 'Product-based',
        description: 'Focuses heavily on Leadership Principles and practical coding problems.',
        cutoffBenchmark: 80,
        hiringRounds: [
          { roundName: 'Round 1: OA', roundType: 'Coding + Work Simulation', description: '2 Coding questions + Leadership survey' },
          { roundName: 'Round 2: Technical Interview', roundType: 'DSA + Leadership Principles', description: 'Two Sum variants, Trees, Object-oriented design' }
        ],
        syllabus: ['Arrays & Strings', 'Trees & BST', 'Heap & Priority Queue', 'Amazon Leadership Principles']
      },
      {
        _id: 'comp-3',
        name: 'TCS (Digital / Ninja)',
        logoUrl: 'https://www.tcs.com/favicon.ico',
        category: 'Service-based',
        description: 'Comprehensive evaluation of Aptitude, Verbal Ability, CS Core fundamentals, and coding.',
        cutoffBenchmark: 70,
        hiringRounds: [
          { roundName: 'Round 1: TCS NQT Assessment', roundType: 'Aptitude + CS Core + Coding', description: 'Quant, Verbal, Reasoning, 2 Coding problems' },
          { roundName: 'Round 2: TR + MR + HR Interview', roundType: 'Technical & HR', description: 'DBMS, OS, OOPs concepts, project discussion' }
        ],
        syllabus: ['Quantitative Aptitude', 'Verbal Reasoning', 'DBMS & SQL', 'Basic Coding']
      }
    ];

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

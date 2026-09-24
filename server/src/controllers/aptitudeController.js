import Topic from '../models/Topic.js';
import Question from '../models/Question.js';
import { generateAIResponse } from '../services/ai/geminiClient.js';
import { PERSONA_PROMPTS } from '../services/ai/promptTemplates.js';

export const getAptitudeTopics = async (req, res) => {
  try {
    let topics = await Topic.find({ category: 'aptitude' }).sort({ order: 1 });
    if (topics.length === 0) {
      topics = [
        { _id: 'apt-1', category: 'aptitude', subject: 'Quantitative Aptitude', title: 'Percentages & Profit Loss', slug: 'percentages', order: 1, description: 'Markup, discount, successive changes' },
        { _id: 'apt-2', category: 'aptitude', subject: 'Quantitative Aptitude', title: 'Time & Work', slug: 'time-and-work', order: 2, description: 'Efficiency, pipes & cisterns' },
        { _id: 'apt-3', category: 'aptitude', subject: 'Logical Reasoning', title: 'Syllogisms & Venn Diagrams', slug: 'syllogisms', order: 3, description: 'Deductive reasoning and logical deductions' },
        { _id: 'apt-4', category: 'aptitude', subject: 'Verbal Ability', title: 'Reading Comprehension', slug: 'reading-comprehension', order: 4, description: 'Passage inference, central theme, vocabulary' },
      ];
    }
    res.json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAptitudeQuiz = async (req, res) => {
  try {
    const { topicId } = req.params;
    const questions = [
      {
        _id: 'q-apt-1',
        title: 'Aptitude: Successive Percentage Change',
        problemStatement: 'A price of an item is increased by 20% and then decreased by 10%. What is the net percentage change in the price?',
        difficulty: 'Easy',
        category: 'aptitude',
        type: 'mcq',
        mcqOptions: [
          { optionId: 'A', text: '10% increase', isCorrect: false },
          { optionId: 'B', text: '8% increase', isCorrect: true },
          { optionId: 'C', text: '12% increase', isCorrect: false },
          { optionId: 'D', text: 'no change', isCorrect: false },
        ],
        solutionExplanation: 'Net Change = A + B + (A*B)/100 = 20 + (-10) + (20 * -10)/100 = 10 - 2 = +8% increase.'
      },
      {
        _id: 'q-apt-2',
        title: 'Aptitude: Time & Work Efficiency',
        problemStatement: 'A can complete a work in 12 days and B in 24 days. Working together, how many days will they take?',
        difficulty: 'Easy',
        category: 'aptitude',
        type: 'mcq',
        mcqOptions: [
          { optionId: 'A', text: '8 days', isCorrect: true },
          { optionId: 'B', text: '6 days', isCorrect: false },
          { optionId: 'C', text: '10 days', isCorrect: false },
          { optionId: 'D', text: '18 days', isCorrect: false },
        ],
        solutionExplanation: 'Combined 1-day work = (1/12) + (1/24) = 3/24 = 1/8. Total days = 8 days.'
      }
    ];

    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitAptitudeQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // array of { questionId, selectedOption }
    let score = 0;
    const total = answers.length;

    answers.forEach(ans => {
      if (ans.selectedOption === 'B' || ans.selectedOption === 'A') {
        score += 1;
      }
    });

    const percentage = Math.round((score / total) * 100);

    res.json({
      success: true,
      data: {
        score,
        total,
        percentage,
        feedback: percentage >= 80 ? 'Outstanding aptitude speed and accuracy!' : 'Review shortcut formulas for Time & Work.'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAptitudeAIExplain = async (req, res) => {
  try {
    const { questionText, studentAnswer } = req.body;
    const explanation = await generateAIResponse({
      persona: 'Aptitude Mentor',
      systemPrompt: PERSONA_PROMPTS['Aptitude Mentor'],
      userPrompt: `Explain this aptitude problem step-by-step with mental math shortcuts.
Problem: ${questionText}
Student selected answer: ${studentAnswer}`,
      contextData: { questionText }
    });

    res.json({ success: true, explanation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

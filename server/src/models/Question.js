import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
    index: true,
  },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  type: {
    type: String,
    enum: ['coding', 'mcq', 'conceptual', 'CODING', 'MCQ', 'SHORT_ANSWER'],
    default: 'coding',
  },
  problemStatement: { type: String, required: true },
  description: { type: String },
  inputFormat: { type: String, default: '' },
  outputFormat: { type: String, default: '' },
  constraints: { type: String, default: '' },
  codeSnippets: {
    cpp: { type: String, default: '' },
    java: { type: String, default: '' },
    python: { type: String, default: '' },
    javascript: { type: String, default: '' }
  },
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
  }],
  mcqOptions: [{
    optionId: { type: String },
    optionText: { type: String },
    text: { type: String },
    isCorrect: { type: Boolean, default: false }
  }],
  hints: [{ type: String }],
  solutionCode: {
    cpp: { type: String, default: '' },
    python: { type: String, default: '' },
    java: { type: String, default: '' },
    javascript: { type: String, default: '' }
  },
  solutionExplanation: { type: String, default: '' },
  companyTags: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);

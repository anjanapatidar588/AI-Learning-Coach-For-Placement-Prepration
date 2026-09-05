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
    enum: ['coding', 'mcq', 'conceptual'],
    default: 'coding',
  },
  problemStatement: { type: String, required: true },
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
    optionId: { type: String, required: true },
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  solutionExplanation: { type: String, default: '' },
  companyTags: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);

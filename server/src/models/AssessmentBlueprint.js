import mongoose from 'mongoose';

const topicDistributionSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  topicName: { type: String, required: true },
  category: { type: String, enum: ['dsa', 'aptitude', 'cs_core', 'oops', 'dbms', 'os', 'cn'], default: 'dsa' },
  questionCount: { type: Number, required: true, min: 1 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
}, { _id: false });

const assessmentBlueprintSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  subjects: [{
    type: String,
    enum: ['dsa', 'aptitude', 'cs_core', 'oops', 'dbms', 'os', 'cn'],
    required: true
  }],
  topicDistribution: [topicDistributionSchema],
  difficultyDistribution: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 }
  },
  questionCount: { type: Number, required: true, min: 1 },
  questionTypes: [{
    type: String,
    enum: ['mcq', 'coding', 'MCQ', 'CODING'],
    default: 'mcq'
  }],
  marksPerQuestion: { type: Number, default: 1, min: 1 },
  totalMarks: { type: Number, required: true, min: 1 },
  durationMinutes: { type: Number, default: 30, min: 5 },
  negativeMarking: { type: Boolean, default: false },
  negativeMarks: { type: Number, default: 0 },
  targetAudience: { type: String, default: 'All Students' },
  graduationYear: { type: Number },
  status: {
    type: String,
    enum: ['DRAFT', 'GENERATING', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  version: { type: Number, default: 1 },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
}, { timestamps: true });

export default mongoose.model('AssessmentBlueprint', assessmentBlueprintSchema);

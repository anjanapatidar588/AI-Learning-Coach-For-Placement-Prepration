import mongoose from 'mongoose';

const strongTopicSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  topicName: { type: String, required: true },
  subject: { type: String, default: 'dsa' },
  accuracy: { type: Number, required: true },
  attempted: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  classification: { type: String, default: 'Strong' }
}, { _id: false });

const weakTopicSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  topicName: { type: String, required: true },
  subject: { type: String, default: 'dsa' },
  accuracy: { type: Number, required: true },
  attempted: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  incorrect: { type: Number, default: 0 },
  classification: { type: String, enum: ['Weak', 'Critical'], default: 'Weak' },
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'High' }
}, { _id: false });

const knowledgeGapSchema = new mongoose.Schema({
  gapType: {
    type: String,
    enum: ['CONCEPT_GAP', 'PATTERN_GAP', 'PRACTICE_GAP', 'DIFFICULTY_GAP'],
    required: true
  },
  topicName: { type: String, default: '' },
  subject: { type: String, default: '' },
  evidence: { type: String, default: '' },
  confidence: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
  recommendedAction: { type: String, default: '' }
}, { _id: false });

const aiAnalysisSchema = new mongoose.Schema({
  summary: { type: String, default: '' },
  strengths: [{ type: String }],
  weakAreas: [{ type: String }],
  learningPriorities: [{ type: String }],
  explanations: [{ type: String }],
  suggestedFocus: { type: String, default: '' }
}, { _id: false });

const assessmentAnalysisSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PublishedAssessment',
    required: true
  },
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssessmentAttempt',
    required: true,
    index: true
  },
  generatedAt: { type: Date, default: Date.now },
  overallPerformance: {
    totalQuestions: { type: Number, default: 0 },
    attempted: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    incorrect: { type: Number, default: 0 },
    unanswered: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    obtainedMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 }
  },
  subjectPerformance: { type: mongoose.Schema.Types.Mixed },
  topicPerformance: [{ type: mongoose.Schema.Types.Mixed }],
  difficultyPerformance: { type: mongoose.Schema.Types.Mixed },
  strongTopics: [strongTopicSchema],
  weakTopics: [weakTopicSchema],
  knowledgeGaps: [knowledgeGapSchema],
  priorityTopics: [{
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    topicName: { type: String },
    subject: { type: String },
    priority: { type: String },
    accuracy: { type: Number }
  }],
  recommendedLearningOrder: [{
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    topicName: { type: String },
    subject: { type: String },
    order: { type: Number }
  }],
  aiAnalysis: aiAnalysisSchema,
  aiAnalysisAvailable: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('AssessmentAnalysis', assessmentAnalysisSchema);

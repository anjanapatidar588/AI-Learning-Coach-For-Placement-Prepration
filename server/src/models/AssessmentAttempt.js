import mongoose from 'mongoose';

const studentAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedAnswer: { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
  marksObtained: { type: Number, default: 0 },
  timeSpentSeconds: { type: Number, default: 0 }
}, { _id: false });

const categoryMetricSchema = new mongoose.Schema({
  total: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  obtainedMarks: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 }
}, { _id: false });

const topicMetricSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  topicName: { type: String },
  category: { type: String },
  total: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 }
}, { _id: false });

const difficultyMetricSchema = new mongoose.Schema({
  total: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 }
}, { _id: false });

const assessmentAttemptSchema = new mongoose.Schema({
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PublishedAssessment',
    required: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  answers: [studentAnswerSchema],
  totalQuestions: { type: Number, default: 0 },
  attemptedQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
  unansweredQuestions: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  obtainedMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'COMPLETED', 'EXPIRED'],
    default: 'IN_PROGRESS'
  },
  subjectPerformance: {
    dsa: categoryMetricSchema,
    aptitude: categoryMetricSchema,
    csCore: categoryMetricSchema,
    oops: categoryMetricSchema,
    dbms: categoryMetricSchema,
    os: categoryMetricSchema,
    cn: categoryMetricSchema
  },
  topicPerformance: [topicMetricSchema],
  difficultyPerformance: {
    easy: difficultyMetricSchema,
    medium: difficultyMetricSchema,
    hard: difficultyMetricSchema
  },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  timeTakenMinutes: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('AssessmentAttempt', assessmentAttemptSchema);

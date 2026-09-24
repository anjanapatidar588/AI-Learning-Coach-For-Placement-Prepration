import mongoose from 'mongoose';

const attemptTrackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    index: true,
  },
  category: {
    type: String,
    enum: ['dsa', 'aptitude', 'cs_core'],
    required: true,
  },
  submittedCode: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compile Error'],
    required: true,
  },
  passedTestCases: { type: Number, default: 0, min: 0 },
  totalTestCases: { type: Number, default: 0, min: 0 },
  timeSpentSeconds: { type: Number, default: 0, min: 0 },
  hintsUsedCount: { type: Number, default: 0, min: 0 },
  aiFeedbackSummary: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('AttemptTrack', attemptTrackSchema);

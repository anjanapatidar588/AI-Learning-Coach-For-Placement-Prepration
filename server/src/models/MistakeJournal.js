import mongoose from 'mongoose';

const MISTAKE_CATEGORIES = [
  'CONCEPT_NOT_CLEAR',
  'PATTERN_NOT_RECOGNIZED',
  'LOGIC_MISTAKE',
  'CODING_IMPLEMENTATION_MISTAKE',
  'TIME_PRESSURE',
  'CARELESS_MISTAKE',
  'DID_NOT_UNDERSTAND_QUESTION'
];

const mistakeJournalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    index: true
  },
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttemptTrack',
    default: null
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    default: null
  },
  subject: {
    type: String,
    default: ''
  },
  mistakeCategory: {
    type: String,
    required: true,
    enum: MISTAKE_CATEGORIES
  },
  shortDescription: {
    type: String,
    default: ''
  },
  learningNote: {
    type: String,
    default: ''
  },
  resolved: {
    type: Boolean,
    default: false,
    index: true
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

mistakeJournalSchema.index({ userId: 1, resolved: 1 });
mistakeJournalSchema.index({ userId: 1, questionId: 1 });
mistakeJournalSchema.index({ userId: 1, mistakeCategory: 1 });

export { MISTAKE_CATEGORIES };
export default mongoose.model('MistakeJournal', mistakeJournalSchema);

import mongoose from 'mongoose';

const topicProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
    default: 'NOT_STARTED',
  },
  currentStage: {
    type: String,
    enum: ['UNDERSTAND', 'EXAMPLE', 'PRACTICE', 'PATTERN_RECOGNITION', 'SAME_LOGIC', 'MASTERY'],
    default: 'UNDERSTAND'
  },
  currentDifficulty: {
    type: String,
    enum: ['Beginner', 'Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  masteryScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  answeredQuestionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  cachedAiExplanation: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  latestNoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentNote',
    default: null
  },
  completedAt: { type: Date },
  lastAccessedAt: { type: Date, default: Date.now },
}, { timestamps: true });

topicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

export default mongoose.model('TopicProgress', topicProgressSchema);


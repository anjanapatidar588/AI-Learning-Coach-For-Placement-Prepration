import mongoose from 'mongoose';

const revisionCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    default: null
  },
  sourceType: {
    type: String,
    enum: ['SAVED_CONCEPT', 'NOTE', 'IMPORTANT_TOPIC', 'MISTAKE', 'MANUAL'],
    default: 'MANUAL'
  },
  sourceId: {
    type: String,
    default: null
  },
  front: {
    type: String,
    required: true
  },
  back: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'],
    default: 'MEDIUM'
  },
  nextReviewAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  lastReviewedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

revisionCardSchema.index({ userId: 1, nextReviewAt: 1 });

export default mongoose.model('RevisionCard', revisionCardSchema);

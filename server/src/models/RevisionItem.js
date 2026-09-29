import mongoose from 'mongoose';

const revisionItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['QUESTION', 'TOPIC', 'IMPORTANT_TOPIC'],
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    default: null
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    default: null
  },
  reason: {
    type: String,
    default: ''
  }
}, { timestamps: true });

revisionItemSchema.index({ userId: 1, type: 1, questionId: 1, topicId: 1 }, { unique: true });

export default mongoose.model('RevisionItem', revisionItemSchema);

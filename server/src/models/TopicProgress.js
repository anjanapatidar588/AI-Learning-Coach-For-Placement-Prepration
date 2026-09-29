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
  completedAt: { type: Date },
  lastAccessedAt: { type: Date, default: Date.now },
}, { timestamps: true });

topicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

export default mongoose.model('TopicProgress', topicProgressSchema);

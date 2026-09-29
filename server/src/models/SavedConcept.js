import mongoose from 'mongoose';

const savedConceptSchema = new mongoose.Schema({
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
  subject: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  conceptSnapshot: {
    type: String,
    required: true
  }
}, { timestamps: true });

savedConceptSchema.index({ userId: 1, topicId: 1 });
savedConceptSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('SavedConcept', savedConceptSchema);

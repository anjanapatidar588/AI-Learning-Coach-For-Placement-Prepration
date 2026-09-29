import mongoose from 'mongoose';

const studentNoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
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
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    default: null
  },
  roadmapNodeId: {
    type: String,
    default: null
  }
}, { timestamps: true });

studentNoteSchema.index({ userId: 1, createdAt: -1 });
studentNoteSchema.index({ userId: 1, topicId: 1 });

export default mongoose.model('StudentNote', studentNoteSchema);

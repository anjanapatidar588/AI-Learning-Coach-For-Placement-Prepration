import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['dsa', 'aptitude', 'cs_core'],
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  order: { type: Number, default: 0 },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  summary: { type: String, default: '' },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
  }],
  description: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Topic', topicSchema);

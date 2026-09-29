import mongoose from 'mongoose';

const roadmapNodeSchema = new mongoose.Schema({
  nodeId: { type: String, required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  topicName: { type: String, default: '' },
  subject: { type: String, default: 'dsa' },
  status: {
    type: String,
    enum: ['locked', 'in_progress', 'completed', 'NOT_STARTED', 'CURRENT', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'],
    default: 'locked'
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  priorityScore: { type: Number, default: 50, min: 0, max: 100 },
  estimatedHours: { type: Number, default: 1, min: 0 },
  estimatedMinutes: { type: Number, default: 45, min: 0 },
  recommendedActivity: { type: String, default: 'TARGETED_PRACTICE' },
  recommendedDifficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  adaptiveReason: { type: String, default: '' },
  reason: { type: String, default: '' },
  sequence: { type: Number, default: 1 },
  source: { type: String, enum: ['ASSESSMENT', 'PRACTICE', 'INITIAL'], default: 'INITIAL' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const roadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  nodes: [roadmapNodeSchema],
  lastGeneratedAt: { type: Date, default: Date.now },
  version: { type: Number, default: 1, min: 1 },
}, { timestamps: true });

export default mongoose.model('Roadmap', roadmapSchema);

import mongoose from 'mongoose';

const roadmapNodeSchema = new mongoose.Schema({
  nodeId: { type: String, required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  status: { type: String, enum: ['locked', 'in_progress', 'completed'], default: 'locked' },
  priorityScore: { type: Number, default: 0, min: 0, max: 100 },
  estimatedHours: { type: Number, default: 0, min: 0 }
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

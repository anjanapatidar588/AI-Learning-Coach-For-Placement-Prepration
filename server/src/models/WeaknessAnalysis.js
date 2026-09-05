import mongoose from 'mongoose';

const weaknessAnalysisSchema = new mongoose.Schema({
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
  },
  category: { type: String, required: true },
  failureCount: { type: Number, default: 1, min: 0 },
  accuracyPercentage: { type: Number, default: 0, min: 0, max: 100 },
  identifiedPattern: { type: String, default: '' },
  severity: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  remedialQuestionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, { timestamps: true });

export default mongoose.model('WeaknessAnalysis', weaknessAnalysisSchema);

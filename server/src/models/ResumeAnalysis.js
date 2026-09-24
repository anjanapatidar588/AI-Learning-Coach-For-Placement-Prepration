import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  atsScore: { type: Number, default: 0, min: 0, max: 100 },
  extractedSkills: [{ type: String }],
  missingKeywords: [{ type: String }],
  formattingFeedback: { type: String, default: '' },
  recommendedActionItems: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

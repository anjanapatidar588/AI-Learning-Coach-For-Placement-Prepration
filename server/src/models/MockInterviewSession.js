import mongoose from 'mongoose';

const mockInterviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  roleType: { type: String, default: 'Software Engineer' },
  companyContext: { type: String, default: 'General Tech Interview' },
  durationMinutes: { type: Number, default: 15, min: 0 },
  transcript: [{
    speaker: { type: String, enum: ['ai', 'student'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  evaluation: {
    technicalScore: { type: Number, default: 0, min: 0, max: 100 },
    communicationScore: { type: Number, default: 0, min: 0, max: 100 },
    problemSolvingScore: { type: Number, default: 0, min: 0, max: 100 },
    detailedFeedback: { type: String, default: '' },
    strengths: [{ type: String }],
    improvements: [{ type: String }]
  }
}, { timestamps: true });

export default mongoose.model('MockInterviewSession', mockInterviewSessionSchema);

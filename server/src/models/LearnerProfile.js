import mongoose from 'mongoose';

const learnerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  currentSkillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
  dsaMastery: { type: Number, default: 0, min: 0, max: 100 },
  aptitudeMastery: { type: Number, default: 0, min: 0, max: 100 },
  csCoreMastery: { type: Number, default: 0, min: 0, max: 100 },
  readinessScore: { type: Number, default: 0, min: 0, max: 100 },
  currentStreak: { type: Number, default: 0, min: 0 },
  longestStreak: { type: Number, default: 0, min: 0 },
  totalProblemsSolved: { type: Number, default: 0, min: 0 },
  totalTimeSpentMinutes: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

export default mongoose.model('LearnerProfile', learnerProfileSchema);

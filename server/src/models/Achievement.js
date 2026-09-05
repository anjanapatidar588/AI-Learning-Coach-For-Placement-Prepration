import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'award' },
  category: { type: String, enum: ['dsa', 'aptitude', 'streak', 'general'], default: 'general' },
  requirementType: { type: String, required: true }, // e.g. "problems_solved", "streak_days"
  requirementValue: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Achievement', achievementSchema);

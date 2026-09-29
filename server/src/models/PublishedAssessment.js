import mongoose from 'mongoose';

const publishedAssessmentSchema = new mongoose.Schema({
  blueprintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssessmentBlueprint',
    required: true
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  version: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'PUBLISHED'
  },
  durationMinutes: { type: Number, required: true, default: 30 },
  totalMarks: { type: Number, required: true },
  marksPerQuestion: { type: Number, default: 1 },
  passingMarks: { type: Number, default: 0 },
  negativeMarking: { type: Boolean, default: false },
  negativeMarks: { type: Number, default: 0 },
  questionCount: { type: Number, required: true },
  subjects: [{ type: String }],
  questions: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    marks: { type: Number, default: 1 },
    order: { type: Number, default: 1 }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('PublishedAssessment', publishedAssessmentSchema);

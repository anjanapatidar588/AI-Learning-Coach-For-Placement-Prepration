import mongoose from 'mongoose';

const confidenceCheckSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    index: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    index: true,
  },
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttemptTrack',
    index: true,
  },
  confidence: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Confidence score must be an integer between 1 and 5'
    }
  },
  pattern: { type: String, default: null, index: true },
}, { timestamps: true });

export default mongoose.model('ConfidenceCheck', confidenceCheckSchema);

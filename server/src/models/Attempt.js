const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic'
    },
    module: {
      type: String,
      enum: ['DSA', 'Aptitude', 'CS_CORE'],
      required: true
    },
    codeSubmitted: {
      type: String
    },
    selectedOptionIndex: {
      type: Number
    },
    language: {
      type: String,
      default: 'javascript'
    },
    status: {
      type: String,
      enum: ['ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'SYNTAX_ERROR', 'PARTIAL'],
      required: true
    },
    score: {
      type: Number,
      default: 0
    },
    timeSpentSeconds: {
      type: Number,
      default: 0
    },
    aiFeedback: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Attempt', attemptSchema);

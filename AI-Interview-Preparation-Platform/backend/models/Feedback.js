const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
  },
  strengths: [
    {
      type: String,
    },
  ],
  weaknesses: [
    {
      type: String,
    },
  ],
  suggestions: [
    {
      type: String,
    },
  ],
  weakTopics: [
    {
      topic: {
        type: String,
        required: true,
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
  ],
  score: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Feedback', feedbackSchema);

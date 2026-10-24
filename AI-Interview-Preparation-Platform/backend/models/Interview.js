const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    default: 'General',
  },
  expectedPoints: [String],
  userAnswer: {
    type: String,
    default: '',
  },
  score: {
    type: Number,
    default: 0,
  },
  correctness: {
    type: String,
    default: '',
  },
  strengths: {
    type: String,
    default: '',
  },
  improvements: {
    type: String,
    default: '',
  },
  feedback: {
    type: String,
    default: '',
  },
  answered: {
    type: Boolean,
    default: false,
  },
});

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['Technical', 'HR'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true,
  },
  targetRole: {
    type: String,
    default: 'Software Engineer',
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  questions: [questionSchema],
  answers: [
    {
      questionId: Number,
      answer: String,
      score: Number,
      feedback: String,
    },
  ],
  score: {
    type: Number,
    default: 0,
  },
  averageScore: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress',
  },
  completedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Interview', interviewSchema);

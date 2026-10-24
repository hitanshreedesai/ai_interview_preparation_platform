const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const Feedback = require('../models/Feedback');
const geminiService = require('../services/geminiService');

// @desc    Start new interview & generate questions via Gemini
// @route   POST /api/interview/start
// @access  Private
const startInterview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      type = 'Technical',
      difficulty = 'Beginner',
      totalQuestions = 5,
      targetRole = 'Software Engineer',
      useResume = false,
    } = req.body;

    // Validate inputs
    const validTypes = ['Technical', 'HR'];
    const validDifficulties = ['Beginner', 'Intermediate', 'Advanced'];
    const validCounts = [5, 10, 15];

    const selectedType = validTypes.includes(type) ? type : 'Technical';
    const selectedDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'Beginner';
    const selectedCount = validCounts.includes(Number(totalQuestions)) ? Number(totalQuestions) : 5;

    // Resume context if requested
    let resumeText = '';
    if (useResume) {
      const resume = await Resume.findOne({ userId }).sort({ uploadedAt: -1 });
      if (resume) {
        resumeText = resume.parsedText || `Resume of candidate: ${resume.originalName}`;
      }
    }

    // Generate questions using Google Gemini
    const rawQuestions = await geminiService.generateQuestions({
      type: selectedType,
      difficulty: selectedDifficulty,
      totalQuestions: selectedCount,
      targetRole,
      resumeText,
    });

    const formattedQuestions = rawQuestions.map((q, idx) => ({
      id: idx + 1,
      question: q.question,
      topic: q.topic || (selectedType === 'Technical' ? 'Technical Concepts' : 'General HR'),
      expectedPoints: q.expectedPoints || [],
      userAnswer: '',
      score: 0,
      correctness: '',
      strengths: '',
      improvements: '',
      feedback: '',
      answered: false,
    }));

    // Create interview record in MongoDB
    const interview = await Interview.create({
      userId,
      type: selectedType,
      difficulty: selectedDifficulty,
      targetRole,
      totalQuestions: selectedCount,
      questions: formattedQuestions,
      answers: [],
      score: 0,
      averageScore: 0,
      status: 'in-progress',
    });

    return res.status(201).json({
      success: true,
      message: 'Interview session initiated successfully.',
      interview: {
        id: interview._id,
        type: interview.type,
        difficulty: interview.difficulty,
        targetRole: interview.targetRole,
        totalQuestions: interview.totalQuestions,
        questions: interview.questions.map((q) => ({
          id: q.id,
          question: q.question,
          topic: q.topic,
          answered: q.answered,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit answer for a specific question & get AI evaluation
// @route   POST /api/interview/answer
// @access  Private
const submitAnswer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { interviewId, questionId, questionIndex, answer = '' } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: 'Interview ID is required.',
      });
    }

    const interview = await Interview.findOne({ _id: interviewId, userId });
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found or unauthorized.',
      });
    }

    // Determine target question by id or index
    let qIdx = -1;
    if (typeof questionIndex === 'number' && interview.questions[questionIndex]) {
      qIdx = questionIndex;
    } else if (questionId) {
      qIdx = interview.questions.findIndex((q) => q.id === Number(questionId));
    }

    if (qIdx === -1 || !interview.questions[qIdx]) {
      return res.status(400).json({
        success: false,
        message: 'Question not found in this interview session.',
      });
    }

    const targetQuestion = interview.questions[qIdx];

    // Evaluate answer with Gemini AI
    const evaluation = await geminiService.evaluateAnswer({
      question: targetQuestion.question,
      topic: targetQuestion.topic,
      expectedPoints: targetQuestion.expectedPoints,
      userAnswer: answer,
      type: interview.type,
      difficulty: interview.difficulty,
    });

    // Update question in interview document
    targetQuestion.userAnswer = answer;
    targetQuestion.score = evaluation.score;
    targetQuestion.correctness = evaluation.correctness;
    targetQuestion.strengths = evaluation.strengths;
    targetQuestion.improvements = evaluation.improvements;
    targetQuestion.feedback = evaluation.feedback;
    targetQuestion.answered = true;

    // Record in answers array
    const existingAnsIdx = interview.answers.findIndex((a) => a.questionId === targetQuestion.id);
    const answerEntry = {
      questionId: targetQuestion.id,
      answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
    };

    if (existingAnsIdx >= 0) {
      interview.answers[existingAnsIdx] = answerEntry;
    } else {
      interview.answers.push(answerEntry);
    }

    // Update running total score & average
    const answeredList = interview.questions.filter((q) => q.answered);
    const totalPoints = answeredList.reduce((acc, q) => acc + (q.score || 0), 0);
    interview.score = totalPoints;
    interview.averageScore = answeredList.length > 0 ? Number((totalPoints / answeredList.length).toFixed(1)) : 0;

    await interview.save();

    return res.status(200).json({
      success: true,
      message: 'Answer evaluated successfully.',
      evaluation: {
        questionId: targetQuestion.id,
        score: evaluation.score,
        correctness: evaluation.correctness,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        feedback: evaluation.feedback,
        topic: evaluation.topic,
      },
      currentAverageScore: interview.averageScore,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Complete interview session & generate overall feedback
// @route   POST /api/interview/complete
// @access  Private
const completeInterview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: 'Interview ID is required.',
      });
    }

    const interview = await Interview.findOne({ _id: interviewId, userId });
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    // Calculate completion metrics
    const totalQuestions = interview.totalQuestions;
    const answeredQuestions = interview.questions.filter((q) => q.answered || q.userAnswer);
    const questionsAnswered = answeredQuestions.length;
    const totalScore = answeredQuestions.reduce((acc, q) => acc + (q.score || 0), 0);
    const averageScore = questionsAnswered > 0 ? Number((totalScore / questionsAnswered).toFixed(1)) : 0;
    const correctAnswers = answeredQuestions.filter((q) => q.score >= 6).length;

    // Mark as completed
    interview.status = 'completed';
    interview.score = totalScore;
    interview.averageScore = averageScore;
    interview.completedAt = new Date();
    await interview.save();

    // Generate comprehensive AI feedback
    const aiFeedback = await geminiService.generateOverallFeedback({
      interviewType: interview.type,
      difficulty: interview.difficulty,
      questions: interview.questions,
      totalScore,
      averageScore,
    });

    // Save Feedback record in MongoDB
    const feedbackDoc = await Feedback.create({
      userId,
      interviewId: interview._id,
      strengths: aiFeedback.strengths,
      weaknesses: aiFeedback.weaknesses,
      suggestions: aiFeedback.suggestions,
      weakTopics: aiFeedback.weakTopics,
      score: averageScore,
    });

    return res.status(200).json({
      success: true,
      message: 'Interview completed successfully.',
      summary: {
        interviewId: interview._id,
        interviewType: interview.type,
        difficulty: interview.difficulty,
        totalQuestions,
        questionsAnswered,
        totalScore,
        averageScore,
        correctAnswers,
        strengths: aiFeedback.strengths,
        weaknesses: aiFeedback.weaknesses,
        suggestions: aiFeedback.suggestions,
        weakTopics: aiFeedback.weakTopics,
        completedAt: interview.completedAt,
      },
      feedbackId: feedbackDoc._id,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user interview history
// @route   GET /api/interview/history
// @access  Private
const getInterviewHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const interviews = await Interview.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews: interviews.map((item) => ({
        id: item._id,
        type: item.type,
        difficulty: item.difficulty,
        totalQuestions: item.totalQuestions,
        questionsAnswered: item.questions.filter((q) => q.answered).length,
        averageScore: item.averageScore,
        score: item.score,
        status: item.status,
        completedAt: item.completedAt,
        createdAt: item.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
};

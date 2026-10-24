const Feedback = require('../models/Feedback');

// @desc    Get all feedback records for the logged-in user
// @route   GET /api/feedback
// @access  Private
const getFeedback = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const feedbacks = await Feedback.find({ userId })
      .populate('interviewId', 'type difficulty totalQuestions completedAt')
      .sort({ createdAt: -1 });

    const formattedFeedbacks = feedbacks.map((item) => {
      const interview = item.interviewId || {};
      return {
        id: item._id,
        interviewId: interview._id || item.interviewId,
        interviewType: interview.type || 'Interview',
        difficulty: interview.difficulty || 'Intermediate',
        score: item.score,
        strengths: item.strengths || [],
        weaknesses: item.weaknesses || [],
        suggestions: item.suggestions || [],
        weakTopics: item.weakTopics || [],
        date: item.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedFeedbacks.length,
      feedbacks: formattedFeedbacks,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFeedback,
};

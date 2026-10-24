const Interview = require('../models/Interview');
const Feedback = require('../models/Feedback');

// @desc    Get user performance analytics & weak topics
// @route   GET /api/performance
// @access  Private
const getPerformance = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch all completed interviews for the user
    const completedInterviews = await Interview.find({
      userId,
      status: 'completed',
    }).sort({ completedAt: 1 }); // chronological for trend

    const totalInterviews = completedInterviews.length;

    if (totalInterviews === 0) {
      return res.status(200).json({
        success: true,
        analytics: {
          totalInterviews: 0,
          averageScore: 0,
          bestScore: 0,
          questionsAttempted: 0,
          weakTopics: [],
          recentHistory: [],
          scoreTrend: [],
          typeBreakdown: {
            technical: 0,
            hr: 0,
          },
        },
      });
    }

    // Calculations
    const scores = completedInterviews.map((inv) => inv.averageScore || 0);
    const sumScores = scores.reduce((a, b) => a + b, 0);
    const averageScore = Number((sumScores / totalInterviews).toFixed(1));
    const bestScore = Math.max(...scores);

    let questionsAttempted = 0;
    let technicalCount = 0;
    let hrCount = 0;

    completedInterviews.forEach((inv) => {
      questionsAttempted += inv.questions.filter((q) => q.answered || q.userAnswer).length;
      if (inv.type === 'Technical') technicalCount++;
      if (inv.type === 'HR') hrCount++;
    });

    // Aggregate Weak Topics from Feedback records
    const feedbacks = await Feedback.find({ userId });
    const topicMap = {};

    feedbacks.forEach((fb) => {
      if (Array.isArray(fb.weakTopics)) {
        fb.weakTopics.forEach((wt) => {
          if (!topicMap[wt.topic]) {
            topicMap[wt.topic] = { total: 0, count: 0 };
          }
          topicMap[wt.topic].total += wt.percentage || 40;
          topicMap[wt.topic].count += 1;
        });
      }
    });

    // Also parse questions with scores below 7 if feedback didn't capture enough
    completedInterviews.forEach((inv) => {
      inv.questions.forEach((q) => {
        if (q.answered && q.score < 7 && q.topic) {
          const weaknessPct = Math.round((10 - q.score) * 10);
          if (!topicMap[q.topic]) {
            topicMap[q.topic] = { total: 0, count: 0 };
          }
          topicMap[q.topic].total += weaknessPct;
          topicMap[q.topic].count += 1;
        }
      });
    });

    // Format weak topics list
    const weakTopics = Object.keys(topicMap)
      .map((topic) => ({
        topic,
        percentage: Math.min(95, Math.max(15, Math.round(topicMap[topic].total / topicMap[topic].count))),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 6);

    // Score trend for visual chart
    const scoreTrend = completedInterviews.map((inv, idx) => ({
      index: idx + 1,
      date: inv.completedAt ? new Date(inv.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Session ${idx + 1}`,
      score: inv.averageScore || 0,
      type: inv.type,
      difficulty: inv.difficulty,
    }));

    // Recent history in reverse chronological order
    const recentHistory = [...completedInterviews]
      .reverse()
      .slice(0, 10)
      .map((inv) => ({
        id: inv._id,
        type: inv.type,
        difficulty: inv.difficulty,
        totalQuestions: inv.totalQuestions,
        score: inv.score,
        averageScore: inv.averageScore,
        date: inv.completedAt || inv.createdAt,
      }));

    return res.status(200).json({
      success: true,
      analytics: {
        totalInterviews,
        averageScore,
        bestScore,
        questionsAttempted,
        weakTopics,
        recentHistory,
        scoreTrend,
        typeBreakdown: {
          technical: technicalCount,
          hr: hrCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPerformance,
};

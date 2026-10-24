const User = require('../models/User');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');

// @desc    Get user profile details & account summary
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const totalInterviews = await Interview.countDocuments({ userId, status: 'completed' });
    const resume = await Resume.findOne({ userId }).sort({ uploadedAt: -1 });

    return res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        totalInterviewsCompleted: totalInterviews,
        hasResume: !!resume,
        resumeName: resume ? resume.originalName : null,
        resumeUploadedAt: resume ? resume.uploadedAt : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
};

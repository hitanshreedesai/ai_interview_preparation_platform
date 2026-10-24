const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');

// @desc    Upload user resume
// @route   POST /api/resume/upload
// @access  Private
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a resume file to upload.',
      });
    }

    const userId = req.user.id;
    const file = req.file;

    // Relative path for storage & web serving
    const relativePath = path.join('uploads', file.filename).replace(/\\/g, '/');

    // Extract rudimentary text/keywords for Gemini prompt enrichment if readable
    let parsedText = `Candidate Resume (${file.originalname})`;
    try {
      if (file.mimetype.includes('text') || file.originalname.endsWith('.txt')) {
        parsedText = fs.readFileSync(file.path, 'utf8').slice(0, 3000);
      }
    } catch (e) {
      console.warn('Could not read raw resume text, using metadata context');
    }

    // Save resume record in MongoDB for this user
    const resume = await Resume.create({
      userId,
      fileName: file.filename,
      filePath: relativePath,
      originalName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      parsedText,
    });

    return res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully!',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        originalName: resume.originalName,
        fileSize: resume.fileSize,
        fileType: resume.fileType,
        uploadedAt: resume.uploadedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's latest resume
// @route   GET /api/resume
// @access  Private
const getResume = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resume = await Resume.findOne({ userId }).sort({ uploadedAt: -1 });

    if (!resume) {
      return res.status(200).json({
        success: true,
        hasResume: false,
        resume: null,
      });
    }

    return res.status(200).json({
      success: true,
      hasResume: true,
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        originalName: resume.originalName,
        filePath: resume.filePath,
        fileSize: resume.fileSize,
        fileType: resume.fileType,
        uploadedAt: resume.uploadedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadResume,
  getResume,
};

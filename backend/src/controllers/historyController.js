const prisma = require('../config/db');

/**
 * GET /api/customers/upload-history
 * Retrieves all CSV transactional uploads history logs.
 */
const getUploadHistory = async (req, res, next) => {
  try {
    const uploads = await prisma.uploadHistory.findMany({
      include: {
        uploadedBy: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedUploads = uploads.map(u => ({
      id: u.id,
      name: u.filename,
      date: new Date(u.createdAt).toISOString().replace('T', ' ').substring(0, 16),
      rows: u.totalRows,
      status: u.status === 'COMPLETED' ? 'SUCCESS' : 'FAILED',
      uploader: u.uploadedBy ? u.uploadedBy.fullName : 'System',
      error: u.errorDetails || undefined
    }));

    return res.status(200).json({
      success: true,
      count: formattedUploads.length,
      uploads: formattedUploads
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/recommendations/history
 * Retrieves historical logs of AI generated advice recommendations and ratings.
 */
const getRecommendationHistory = async (req, res, next) => {
  try {
    const recommendations = await prisma.recommendation.findMany({
      include: {
        segment: true,
        ratings: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedAI = recommendations.map(rec => {
      const latestRating = rec.ratings.length > 0 ? rec.ratings[rec.ratings.length - 1] : null;
      return {
        id: rec.id,
        segment: rec.segment ? rec.segment.name : 'Unassigned',
        version: rec.promptVersion || 'V4 (JSON)',
        date: new Date(rec.createdAt).toISOString().replace('T', ' ').substring(0, 16),
        strategy: rec.strategyContent,
        rating: latestRating ? latestRating.ratingValue : 5,
        feedback: latestRating ? latestRating.feedbackText : 'AI generated recommendation strategy.'
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedAI.length,
      recommendations: formattedAI
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUploadHistory,
  getRecommendationHistory
};

const prisma = require('../config/db');
const { generateRecommendation } = require('../services/geminiService');

/**
 * GET /api/recommendations
 * Retrieves all current recommendation strategies.
 */
const getRecommendations = async (req, res, next) => {
  try {
    let recommendations = await prisma.recommendation.findMany({
      include: {
        segment: true,
        ratings: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // If no recommendations are in the database yet, generate them initially (defaulting to V4)
    if (recommendations.length === 0) {
      console.log('[Recommendation Controller] DB empty. Triggering initial AI generation...');
      await regenerateAllStrategies('V4');
      
      recommendations = await prisma.recommendation.findMany({
        include: {
          segment: true,
          ratings: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    // Return the latest recommendation for each segment (to prevent flooding the list)
    const latestMap = new Map();
    recommendations.forEach(rec => {
      if (!latestMap.has(rec.segmentId)) {
        latestMap.set(rec.segmentId, rec);
      }
    });

    return res.status(200).json({
      success: true,
      count: latestMap.size,
      recommendations: Array.from(latestMap.values())
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/recommendations/generate
 * Admin-only endpoint to force regenerate AI strategies for all segments.
 */
const generateRecommendations = async (req, res, next) => {
  try {
    const { promptVersion } = req.body;
    const version = promptVersion || 'V4';

    if (!['V1', 'V2', 'V3', 'V4'].includes(version)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid promptVersion parameter. Must be V1, V2, V3, or V4.'
      });
    }

    await regenerateAllStrategies(version);

    const updatedRecommendations = await prisma.recommendation.findMany({
      include: {
        segment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const latestMap = new Map();
    updatedRecommendations.forEach(rec => {
      if (!latestMap.has(rec.segmentId)) {
        latestMap.set(rec.segmentId, rec);
      }
    });

    return res.status(200).json({
      success: true,
      message: `Successfully regenerated AI recommendations using Prompt ${version}.`,
      recommendations: Array.from(latestMap.values())
    });
  } catch (error) {
    next(error);
  }
};

// Helper utility to loop through all segments and call generateRecommendation
async function regenerateAllStrategies(promptVersion) {
  const segments = await prisma.segment.findMany();
  
  for (const segment of segments) {
    const adviceText = await generateRecommendation(segment.name, segment.description, promptVersion);
    
    let strategyType = 'GROWTH';
    
    // Attempt to extract strategyType if using V4 JSON structured format
    if (promptVersion === 'V4') {
      try {
        const cleanJson = adviceText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        strategyType = parsed.strategyType || 'GROWTH';
      } catch (jsonErr) {
        console.warn(`[Recommendations] Failed to parse JSON for segment "${segment.name}":`, jsonErr.message);
      }
    } else {
      // Map other prompt versions to clean types based on segment name
      if (segment.name.includes('VIP')) strategyType = 'RETENTION';
      else if (segment.name.includes('Potential')) strategyType = 'UPSELL';
      else if (segment.name.includes('Risk')) strategyType = 'RECOVERY';
      else if (segment.name.includes('Lost')) strategyType = 'DISCOUNT';
    }

    // Insert recommendation record
    await prisma.recommendation.create({
      data: {
        segmentId: segment.id,
        strategyType,
        strategyContent: adviceText,
        promptVersion
      }
    });
  }
}

module.exports = {
  getRecommendations,
  generateRecommendations
};

const prisma = require('../config/db');

const getAnalytics = async (req, res, next) => {
  try {
    const generations = await prisma.generation.findMany({
      orderBy: { createdAt: 'asc' }
    });

    const totalGenerations = generations.length;
    const ratedGenerations = generations.filter(g => g.rating != null);
    const averageRating = ratedGenerations.length > 0
      ? (ratedGenerations.reduce((sum, g) => sum + g.rating, 0) / ratedGenerations.length).toFixed(1)
      : 0;

    // Group generations by month (e.g. "Jun 2026")
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyUsage = {};
    const monthlyRatingSum = {};
    const monthlyRatingCount = {};

    generations.forEach(g => {
      const d = new Date(g.createdAt);
      const m = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      
      if (!monthlyUsage[m]) {
        monthlyUsage[m] = 0;
        monthlyRatingSum[m] = 0;
        monthlyRatingCount[m] = 0;
      }
      monthlyUsage[m]++;
      if (g.rating != null) {
        monthlyRatingSum[m] += g.rating;
        monthlyRatingCount[m]++;
      }
    });

    const usageTrends = Object.keys(monthlyUsage).map(month => ({
      month,
      generations: monthlyUsage[month],
      averageRating: monthlyRatingCount[month] > 0 
        ? parseFloat((monthlyRatingSum[month] / monthlyRatingCount[month]).toFixed(1)) 
        : null
    }));

    // Recent activity log
    const recentActivities = generations.reverse().slice(0, 10).map(g => ({
      id: g.id,
      action: 'AI Generation',
      details: `Generated analysis for "${g.subject}"`,
      rating: g.rating,
      time: new Date(g.createdAt).toISOString()
    }));

    res.status(200).json({
      success: true,
      summary: {
        totalGenerations,
        averageRating,
        totalRated: ratedGenerations.length
      },
      usageTrends,
      recentActivities
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics
};

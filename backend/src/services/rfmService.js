const prisma = require('../config/db');

/**
 * Computes RFM metrics for all customers and updates their segments in the database.
 */
async function recalculateRFM() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        transactions: true
      }
    });

    const segments = await prisma.segment.findMany();
    const now = new Date();

    console.log(`[RFM Calculator] Starting recalculation for ${customers.length} customers...`);

    for (const customer of customers) {
      const txs = customer.transactions;
      
      if (txs.length === 0) {
        // Default to lowest segment if no transactions exist
        const lowestScore = 3;
        const matchedSegment = segments.find(s => lowestScore >= s.minRfmScore && lowestScore <= s.maxRfmScore);
        if (matchedSegment) {
          await prisma.customer.update({
            where: { id: customer.id },
            data: { segmentId: matchedSegment.id }
          });
        }
        continue;
      }

      // 1. Calculate Recency (days since latest transaction)
      const latestTxDate = new Date(Math.max(...txs.map(t => new Date(t.transactionDate).getTime())));
      const diffTime = Math.abs(now - latestTxDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let recencyScore = 1;
      if (diffDays <= 30) recencyScore = 4;
      else if (diffDays <= 90) recencyScore = 3;
      else if (diffDays <= 180) recencyScore = 2;

      // 2. Calculate Frequency (number of transactions)
      const frequency = txs.length;
      let frequencyScore = 1;
      if (frequency >= 20) frequencyScore = 4;
      else if (frequency >= 10) frequencyScore = 3;
      else if (frequency >= 5) frequencyScore = 2;

      // 3. Calculate Monetary (sum of transaction amounts)
      const monetary = txs.reduce((sum, t) => sum + t.amount, 0);
      let monetaryScore = 1;
      if (monetary >= 20000) monetaryScore = 4;
      else if (monetary >= 10000) monetaryScore = 3;
      else if (monetary >= 5000) monetaryScore = 2;

      const totalRfmScore = recencyScore + frequencyScore + monetaryScore;

      // Match segment based on DB minRfmScore and maxRfmScore ranges
      const matchedSegment = segments.find(
        s => totalRfmScore >= s.minRfmScore && totalRfmScore <= s.maxRfmScore
      );

      if (matchedSegment) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { segmentId: matchedSegment.id }
        });
      }
    }

    console.log('[RFM Calculator] RFM Recalculation completed successfully.');
  } catch (error) {
    console.error('[RFM Calculator] Error during RFM recalculation:', error);
    throw error;
  }
}

module.exports = {
  recalculateRFM
};

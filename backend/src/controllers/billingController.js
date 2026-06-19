const prisma = require('../config/db');

/**
 * MOCK Stripe Checkout Session
 * Normally this uses the stripe package, but since we are in a prototype
 * without real API keys, this acts as a local stub.
 */
const createCheckoutSession = async (req, res, next) => {
  try {
    const { packageId } = req.body;
    
    let creditsToAdd = 50;
    if (packageId === 'premium') creditsToAdd = 150;

    // Simulate a successful checkout locally
    // In production, this would return { url: 'https://checkout.stripe.com/...' }
    res.status(200).json({ 
      success: true, 
      url: `/billing?mock_success=true&credits=${creditsToAdd}` 
    });

  } catch (error) {
    next(error);
  }
};

/**
 * MOCK Stripe Webhook
 * This route is hit by our frontend to simulate the webhook
 */
const mockWebhook = async (req, res, next) => {
  try {
    const { credits } = req.body;
    const userId = req.user.id;

    if (!credits) {
      return res.status(400).json({ success: false, message: 'Missing credits parameter.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    await prisma.user.update({
      where: { id: userId },
      data: { credits: user.credits + parseInt(credits) }
    });

    res.status(200).json({ success: true, message: 'Credits updated successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckoutSession,
  mockWebhook
};

const prisma = require('../config/db');
const { generateCustomAnalysis } = require('../services/geminiService');
const { sendGenerationReport } = require('../services/emailService');

const createGeneration = async (req, res, next) => {
  try {
    const { subject, requirements, constraints, preferences } = req.body;
    
    if (!subject || !requirements) {
      return res.status(400).json({ success: false, message: 'Subject and Requirements are mandatory fields.' });
    }

    // Call Gemini Service
    const aiResponse = await generateCustomAnalysis({ subject, requirements, constraints, preferences });

    // Save to Database
    const generation = await prisma.generation.create({
      data: {
        subject,
        requirements,
        constraints: constraints || '',
        preferences: preferences || '',
        aiResponse,
        userId: req.user.id
      }
    });

    res.status(201).json({ success: true, data: generation });

  } catch (error) {
    next(error);
  }
};

const getGenerations = async (req, res, next) => {
  try {
    const generations = await prisma.generation.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: generations.length, data: generations });
  } catch (error) {
    next(error);
  }
};

const rateGeneration = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const { id } = req.params;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    const generation = await prisma.generation.update({
      where: { id },
      data: { rating }
    });

    res.status(200).json({ success: true, data: generation });
  } catch (error) {
    next(error);
  }
};

const emailGeneration = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { id } = req.params;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Recipient email is required.' });
    }

    const generation = await prisma.generation.findUnique({
      where: { id }
    });

    if (!generation) {
      return res.status(404).json({ success: false, message: 'Generation not found.' });
    }

    const emailResult = await sendGenerationReport(email, generation.subject, generation.aiResponse);

    if (emailResult.success) {
      res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully!',
        previewUrl: emailResult.previewUrl 
      });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send email.', error: emailResult.error });
    }

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGeneration,
  getGenerations,
  rateGeneration,
  emailGeneration
};

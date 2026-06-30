const prisma = require('../config/db');
const { generateCustomAnalysis } = require('../services/geminiService');
const { sendGenerationReport } = require('../services/emailService');

const createGeneration = async (req, res, next) => {
  try {
    const { subject, requirements, constraints, preferences, customerId, isRegenerate } = req.body;
    
    if (!subject || !requirements) {
      return res.status(400).json({ success: false, message: 'Subject and Requirements are mandatory fields.' });
    }

    let finalRequirements = requirements;

    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: { segment: true }
      });
      if (!customer) {
        return res.status(404).json({ success: false, message: `Customer with ID ${customerId} not found.` });
      }
      
      let segmentName = customer.segment ? customer.segment.name : 'Unassigned';

      // Auto-assign segment if currently unassigned before generating the report
      if (segmentName === 'Unassigned') {
        let targetSegmentName = 'Regular Customers';
        if (customer.paymentDelayDays > 30) {
          targetSegmentName = customer.outstanding > 10000 ? 'At Risk' : 'Lost Customers';
        } else if (customer.totalPurchases >= 20000) {
          targetSegmentName = 'VIP Customers';
        } else if (customer.totalPurchases >= 10000) {
          targetSegmentName = 'High Potential';
        }

        const segment = await prisma.segment.findUnique({ where: { name: targetSegmentName } });
        if (segment) {
          await prisma.customer.update({
            where: { id: customer.id },
            data: { segmentId: segment.id }
          });
          segmentName = targetSegmentName;
          customer.segment = segment;
        }
      }
      
      const customerContext = `
      --- Customer Profile Context ---
      ID: ${customer.id}
      Name: ${customer.customerName}
      Segment: ${segmentName}
      Location: ${customer.location}
      Total Purchases: $${customer.totalPurchases}
      Orders: ${customer.orders}
      Average Order Value: $${customer.avgOrderValue}
      Outstanding Balance: $${customer.outstanding}
      Payment Delay: ${customer.paymentDelayDays} days
      Repeat Rate: ${customer.repeatRate}%
      Returns: ${customer.returns}
      ---------------------------------
      Please analyze this specific customer data and tailor the strategy accordingly. 
      CRITICAL INSTRUCTION: You MUST explicitly mention and base your strategy on the customer's Segment (${segmentName}).`;

      finalRequirements += '\n\n' + customerContext;
    }

    // Call Gemini Service
    let aiResponse = await generateCustomAnalysis({ subject, requirements: finalRequirements, constraints, preferences });

    // Programmatically inject the Customer Segment header if this is the first generation
    if (!isRegenerate && customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: { segment: true }
      });
      if (customer && customer.segment) {
        aiResponse = `# 🎯 CUSTOMER SEGMENT: ${customer.segment.name.toUpperCase()}\n\n---\n\n` + aiResponse;
      }
    }

    // Save to Database
    const generation = await prisma.generation.create({
      data: {
        subject,
        requirements: finalRequirements,
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
    const query = {
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true, role: true } }
      }
    };
    
    // Restrict standard users to only see their own generations
    if (req.user.role === 'USER') {
      query.where = { userId: req.user.id };
    }

    const generations = await prisma.generation.findMany(query);

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

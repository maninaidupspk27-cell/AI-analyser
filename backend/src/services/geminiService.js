const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/db');
const { readSettingsFile } = require('../controllers/settingsController');

// Professional detailed mock strategies for testing offline or with mock key
const mockStrategies = {
  'VIP Customers': {
    V1: `VIP Customers represent our highest value clients. Engage them with dedicated account managers, priority service channels, and early access to new product lines. Ensure a regular touchpoint once every two weeks to maintain the relationship.`,
    V2: `VIP Customers have high recency, frequency, and monetary scores. Since they buy frequently and spend heavily, our target is maximum retention. Strategy: Launch an exclusive loyalty rebate program offering 10% credit back on invoices paid within 10 days. Assign senior managers to key accounts to gather feedback.`,
    V3: `VIP Cash Flow Strategy: These accounts represent 80% of our revenue. Implement a 'Fast-Track Pay' model offering structured quarterly volume discounts. Maintain active lines of credit but request auto-debit ACH setups for seamless processing and zero collection lag.`,
    V4: JSON.stringify({
      strategyType: "RETENTION",
      executiveSummary: "Nurture and retain Manikanta Enterprises' highest-yielding client base by providing white-glove account management and structured financial incentives.",
      actionSteps: [
        "Assign a dedicated Senior Account Manager to schedule bi-weekly operational review calls.",
        "Launch the 'VIP Early Incentive' program: 10% rebate for invoices settled within 10 days of issue.",
        "Offer priority dispatch and zero-cost shipping options for all pending logistics invoices."
      ],
      scriptTemplate: "Dear [ContactName],\n\nWe appreciate Acme Corporation's outstanding partnership with Manikanta Enterprises. To show our gratitude, we have enrolled you in our VIP Fast-Track program. You are now eligible for a 10% rebate on all invoices paid within 10 days.\n\nWarm regards,\n[Your Name]\nManikanta Enterprises"
    })
  },
  'High Potential': {
    V1: `High Potential customers spend well and buy moderately. Focus on upselling related products or premium support packages to increase their lifetime value. Standardize quarterly emails with product recommendations.`,
    V2: `High Potential customers have solid monetary values and good recency, but low purchase frequency. Goal: Increase buying frequency. Strategy: Trigger customized email campaigns offering bundle discounts. Provide trial access to expanded logistics modules to showcase value.`,
    V3: `High Potential Financial Strategy: Build client growth by offering flexible credit limits that expand as purchase frequency increases. Propose bi-monthly inventory stocking plans to smooth out purchase cycles and lock in recurring revenue.`,
    V4: JSON.stringify({
      strategyType: "UPSELL",
      executiveSummary: "Accelerate order frequency and average order value (AOV) for active clients displaying solid spending capacity through targeted product bundling.",
      actionSteps: [
        "Send personalized product recommendation portfolios based on their past purchase history.",
        "Propose a 'Grow-With-Us' credit tier, increasing credit lines by 20% for clients scheduling recurring orders.",
        "Provide a 14-day trial of our Premium Logistics Tracker module."
      ],
      scriptTemplate: "Dear [ContactName],\n\nWe noticed you recently worked with us for shipping services. We are pleased to offer you a 15% discount on our new bundled warehousing services next month to help streamline your operations.\n\nBest regards,\n[Your Name]"
    })
  },
  'Regular Customers': {
    V1: `Regular Customers represent our baseline steady traffic. Keep them engaged with newsletters, standard discount campaigns, and general customer satisfaction surveys once a year.`,
    V2: `Regular Customers show average RFM scores across the board. Goal: Maintain relationship stability. Strategy: Maintain regular communication via newsletters. Offer small referral bonuses (5% off next order) to encourage steady transaction logs.`,
    V3: `Regular Customers Cash Flow: To protect cash flow, enforce standard Net-30 payment terms strictly. Require credit card backup on file to automatically settle invoices that go past 5 days overdue.`,
    V4: JSON.stringify({
      strategyType: "GROWTH",
      executiveSummary: "Stabilize transaction flow and optimize standard accounts by establishing automated credit reminders and low-friction referral incentives.",
      actionSteps: [
        "Enroll the client contact in standard monthly newsletters and feature release logs.",
        "Integrate automated Net-30 email invoicing reminders 5 days before due date.",
        "Offer a referral bonus: 5% invoice credit for every successful client introduced."
      ],
      scriptTemplate: "Hello [ContactName],\n\nThis is a friendly reminder that invoice #[InvoiceNum] is due in 5 days. For your convenience, you can pay online using credit card or ACH.\n\nBest regards,\nInvoicing Team"
    })
  },
  'At Risk': {
    V1: `At Risk clients show a long period of inactivity. Reach out immediately with a personal phone call to check on satisfaction, offer customized win-back discounts, or ask about issues they faced.`,
    V2: `At Risk clients have high lifetime value but have not purchased in over 90 days. Goal: Recovery. Strategy: Execute personal re-engagement calls. Offer a one-time 'Welcome Back' 15% discount on their next transaction. Ask if product quality or service met expectations.`,
    V3: `At Risk Credit Risk Strategy: Overdue balances are high. Offer a 3-part split payment installment structure to resolve pending invoices immediately. Block new credit shipments until older debts are resolved to minimize loss.`,
    V4: JSON.stringify({
      strategyType: "RECOVERY",
      executiveSummary: "Re-engage inactive high-spending clients and resolve outstanding balances by deploying win-back incentives and flexible installment plans.",
      actionSteps: [
        "Schedule a personal feedback call from the Customer Success Director.",
        "Offer a one-time 'Welcome Back' 15% discount to settle their next logistical order.",
        "For clients with overdue invoices, propose a 3-part weekly installment plan to clear the balance."
      ],
      scriptTemplate: "Dear [ContactName],\n\nWe value your past partnership and want to ensure we are meeting your needs. If you have outstanding balances, we would love to offer a flexible 3-week split payment schedule to clear the ledger smoothly. Let us know when you are free to discuss.\n\nWarmly,\nCustomer Care"
    })
  },
  'Lost Customers': {
    V1: `Lost Customers have not transacted in over 6 months. Send low-frequency automated emails highlighting new products or major updates, but avoid expensive manual sales outreach.`,
    V2: `Lost Customers have low RFM scores and very long inactivity periods. Goal: Low-cost reactivation. Strategy: Enroll in automated reactivation email flows. Offer entry-level pricing plans to see if price was the barrier. Avoid high-cost sales resources.`,
    V3: `Lost Customers Invoicing: Focus exclusively on bad debt collection. Send final automated collection notices. If inactive accounts owe funds, transfer to formal dispute resolution to close the account balance.`,
    V4: JSON.stringify({
      strategyType: "DISCOUNT",
      executiveSummary: "Perform low-cost automated email reactivation and final invoice cleanups to close out historical accounts without draining operational sales resources.",
      actionSteps: [
        "Trigger automated reactivation check-in emails with promotional starter coupons.",
        "Send final balance reconciliation statements for accounts with unresolved ledgers.",
        "Offer a low-cost basic tier package to test reactivation viability."
      ],
      scriptTemplate: "Dear [ContactName],\n\nWe miss working with you! We would love to welcome you back with a special 20% discount on our basic warehousing starter tier this month. Reconnect with us today!\n\nBest regards,\nSales Team"
    })
  }
};

/**
 * Generates tailored recommendations for a customer segment using the Gemini API.
 * Falls back to detailed mock strategies if a mock API key is detected or the API call fails.
 * 
 * @param {string} segmentName - Name of the segment (VIP Customers, Regular, etc.)
 * @param {string} segmentDesc - Description of the segment
 * @param {string} promptVersion - Prompt version to use (V1, V2, V3, V4)
 * @returns {Promise<string>} Structured strategy recommendation string
 */
async function generateRecommendation(segmentName, segmentDesc, promptVersion = 'V4') {
  const settings = readSettingsFile();
  const apiKey = settings.apiKey;
  const isMockKey = !apiKey || apiKey.startsWith('AIzaSyD_MOCK_') || apiKey === 'YOUR_GEMINI_KEY';

  console.log(`[Gemini Service] Generating recommendation for "${segmentName}" using Prompt ${promptVersion}...`);

  if (isMockKey) {
    console.log(`[Gemini Service] Mock API Key detected. Utilizing pre-formatted template fallback.`);
    const segmentMock = mockStrategies[segmentName] || mockStrategies['Regular Customers'];
    return segmentMock[promptVersion] || segmentMock['V4'];
  }

  // Define prompt structures
  let promptText = '';
  if (promptVersion === 'V1') {
    promptText = `Provide a short customer engagement strategy for the customer segment: "${segmentName}". Keep it under 2 paragraphs.`;
  } else if (promptVersion === 'V2') {
    promptText = `Write a customer retention and engagement strategy for the customer segment "${segmentName}" described as "${segmentDesc}". Suggest concrete actions focusing on their RFM behavior (Recency, Frequency, and Monetary levels).`;
  } else if (promptVersion === 'V3') {
    promptText = `As an AI business consultant for Manikanta Enterprises, design a customer strategy for the "${segmentName}" segment (description: "${segmentDesc}"). Highlight concrete payment terms, collection strategies, or upsell models to protect company cash flow and minimize credit risk.`;
  } else {
    // Default to V4 (Structured JSON)
    promptText = `Act as a senior growth consultant for Manikanta Enterprises. Design a customer success strategy for the customer segment "${segmentName}" (description: "${segmentDesc}").
    You MUST return your response as a raw JSON object with this exact structure:
    {
      "strategyType": "RETENTION | UPSELL | DISCOUNT | REMINDER | GROWTH",
      "executiveSummary": "A concise overview of the segment profile and target objectives.",
      "actionSteps": ["Action step 1", "Action step 2", "Action step 3"],
      "scriptTemplate": "A template email or call script to send to clients in this segment."
    }
    Do NOT wrap the response in markdown blocks (such as \`\`\`json). Return ONLY the raw JSON text.`;
  }

  // Prepend base system instructions if configured
  if (settings.systemPrompt) {
    promptText = `System Instructions Context:\n${settings.systemPrompt}\n\nTask Details:\n${promptText}`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: settings.model || 'gemini-2.5-flash' });
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const generatedText = response.text();
    
    if (!generatedText) {
      throw new Error('Gemini API returned empty content');
    }

    // In case the SDK still returned markdown JSON blocks, clean them up
    return generatedText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();

  } catch (apiError) {
    console.warn(`[Gemini Service] API call failed. Falling back to local templates. Error: ${apiError.message}`);
    const segmentMock = mockStrategies[segmentName] || mockStrategies['Regular Customers'];
    return segmentMock[promptVersion] || segmentMock['V4'];
  }
}

/**
 * Generates an analysis for the custom interactive generation flow.
 */
async function generateCustomAnalysis({ subject, requirements, constraints, preferences }) {
  const settings = readSettingsFile();
  const apiKey = settings.apiKey;
  const isMockKey = !apiKey || apiKey.startsWith('AIzaSyD_MOCK_') || apiKey === 'YOUR_GEMINI_KEY';

  console.log(`[Gemini Service] Generating custom analysis for subject: "${subject}"...`);

  if (isMockKey) {
    console.log(`[Gemini Service] Mock API Key detected. Utilizing mock response.`);
    return `### AI Analysis for: ${subject}\n\n**Requirements Addressed:**\n${requirements}\n\n**Strategic Plan:**\nBased on your constraints (${constraints}), we recommend focusing on a structured rollout. Your preference for ${preferences} has been factored in to ensure maximum efficiency.\n\n*Note: This is a mocked offline response.*`;
  }

  let promptText = `Please act as a business consultant for Manikanta Enterprises. Provide a comprehensive, structured analysis and strategy for the following request:
  
- Primary Subject/Context: ${subject}
- Specific Requirements: ${requirements}
- Constraints: ${constraints}
- Preferences: ${preferences}

Return the response in clear, formatted Markdown with sections and bullet points.`;

  if (settings.systemPrompt) {
    promptText = `System Instructions Context:\n${settings.systemPrompt}\n\nTask Details:\n${promptText}`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: settings.model || 'gemini-2.5-flash' });
    const result = await model.generateContent(promptText);
    const response = await result.response;
    return response.text();
  } catch (apiError) {
    console.warn(`[Gemini Service] API call failed. Falling back to local mock. Error: ${apiError.message}`);
    return `### AI Analysis for: ${subject}\n\n*Warning: API connection failed.* \n\nBased on your constraints (${constraints}), we recommend focusing on a structured rollout. Your preference for ${preferences} has been factored in.`;
  }
}

module.exports = {
  generateRecommendation,
  generateCustomAnalysis
};

const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../config/settings.json');

// Helper to read raw configurations from local file
function readSettingsFile() {
  let settings = {
    apiKey: process.env.GEMINI_API_KEY || 'AIzaSyD_MOCK_GEMINI_KEY_1782A',
    model: 'gemini-2.5-flash',
    systemPrompt: 'Act as an AI Customer Analyst for Manikanta Enterprises. Analyze customer transaction logs and categorize them into segments (VIP, High Potential, Regular, At Risk, Lost). Return a structured response advising our sales team on engagement strategies.'
  };

  if (fs.existsSync(settingsPath)) {
    try {
      const fileSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (fileSettings.apiKey) settings.apiKey = fileSettings.apiKey;
      if (fileSettings.model) settings.model = fileSettings.model;
      if (fileSettings.systemPrompt) settings.systemPrompt = fileSettings.systemPrompt;
    } catch (err) {
      console.error('Error parsing settings.json:', err.message);
    }
  }

  return settings;
}

// Helper to write raw configuration settings
function writeSettingsFile(data) {
  fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf8');
}

// Mask API key: first 7 and last 4 characters shown, rest is replaced by dots
function maskApiKey(key) {
  if (!key) return '';
  if (key.length <= 11) return '••••••••';
  return key.substring(0, 7) + '...' + key.substring(key.length - 4);
}

/**
 * GET /api/settings
 * Retrieves active system configuration settings (with masked credentials).
 */
const getSettings = async (req, res, next) => {
  try {
    const rawSettings = readSettingsFile();
    const maskedKey = maskApiKey(rawSettings.apiKey);
    
    return res.status(200).json({
      success: true,
      settings: {
        ...rawSettings,
        apiKey: maskedKey
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/settings
 * Updates active system parameters. Requires ADMIN role.
 */
const updateSettings = async (req, res, next) => {
  try {
    const { apiKey, model, systemPrompt } = req.body;
    const current = readSettingsFile();

    // Prevent overwriting credentials with masked keys (e.g. AIzaSyD...782A)
    const finalApiKey = (apiKey !== undefined && typeof apiKey === 'string' && !apiKey.includes('...')) ? apiKey : current.apiKey;

    const updated = {
      apiKey: finalApiKey,
      model: model || current.model,
      systemPrompt: systemPrompt !== undefined ? systemPrompt : current.systemPrompt
    };

    writeSettingsFile(updated);

    return res.status(200).json({
      success: true,
      message: 'System settings saved successfully!',
      settings: {
        ...updated,
        apiKey: maskApiKey(updated.apiKey)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  readSettingsFile // exported for services usage
};

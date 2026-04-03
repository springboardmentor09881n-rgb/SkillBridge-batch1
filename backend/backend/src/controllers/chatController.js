const axios = require("axios");

const AI_BASE = process.env.AI_SERVICE_BASE_URL || "http://localhost:5001";
const AI_URL = `${AI_BASE}/chat`;

/** Same rules as ai-service/app.py when Flask is not running */
function offlineAIReply(message) {
  if (message == null || String(message).trim() === "") {
    return "Try asking about matches, applications, or your profile.";
  }
  const m = String(message).toLowerCase();
  if (/(^|\s)(hi|hii|hello|hey|good morning|good afternoon|good evening)(\s|$|!|\.|\?)/i.test(m)) {
    return "Hi! I can help with skill matches, applications, and your profile. Try: 'recommend opportunities for me'.";
  }
  if (m.includes("match") || m.includes("recommend")) {
    return "Based on your skills, here are top matches:\n1. Web Developer - 90%\n2. Data Analyst - 80%";
  }
  if (m.includes("apply")) {
    return "To apply: Open an opportunity and click the Apply button.";
  }
  if (m.includes("profile")) {
    return "You can update your profile from the dashboard.";
  }
  return "Sorry, I didn't understand. Try asking about matches or applications.";
}

exports.chatWithAI = async (req, res) => {
  const { message } = req.body;
  // Use /chat endpoint specifically
  const CHAT_URL = AI_URL; 
  
  try {
    const response = await axios.post(
      CHAT_URL,
      { message },
      { timeout: 5000 }
    );
    res.json(response.data);
  } catch (error) {
    return res.status(200).json({ reply: offlineAIReply(message) });
  }
};

exports.getMatches = async (req, res) => {
  const { skills, iam, userId: bodyUserId } = req.body;
  const userId = bodyUserId || req.user?.userId;
  const MATCH_URL = `${AI_BASE}/match`;

  console.log(`[getMatches] iam=${iam}, userId=${userId}, skills=${JSON.stringify(skills)}`);

  try {
    const response = await axios.post(
      MATCH_URL,
      { skills, iam, userId },
      { timeout: 8000 }
    );
    
    // AI service now returns { success: true, matches: [], hasOpportunities: true }
    // Or just the raw object. We ensure we pass it correctly.
    const result = response.data;
    const matches = result.matches || [];
    
    res.json({ 
      success: true, 
      data: matches, // Legacy support for some frontend components
      matches: matches, // New format
      hasOpportunities: result.hasOpportunities ?? true,
      count: matches.length 
    });
  } catch (error) {
    console.error("AI match error:", error.message);
    res.status(500).json({ success: false, message: "AI matching unavailable", data: [], matches: [] });
  }
};

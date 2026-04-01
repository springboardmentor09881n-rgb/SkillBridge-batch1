const axios = require("axios");

const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:5001/chat";

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
  console.log("Chat request received:", message);

  try {
    const response = await axios.post(
      AI_URL,
      { message },
      { timeout: 5000 }
    );
    console.log("AI response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("AI service error details:", {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      data: error?.response?.data,
      stack: error?.stack,
    });
    // Always return 200 so the frontend can show a reply instead of the hardcoded error.
    return res.status(200).json({ reply: offlineAIReply(message) });
  }
};

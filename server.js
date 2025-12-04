// Simple Express Backend for AI Advisor
// Uses Hugging Face API - ALL content is AI-generated!

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Hugging Face Configuration
const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = "google/flan-t5-base"; // Free, reliable model for text generation

// Helper function to call Hugging Face API
async function callHuggingFace(prompt, maxLength = 150) {
  if (!HF_API_KEY) {
    throw new Error("HF_API_KEY not configured");
  }

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${HF_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: maxLength,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Hugging Face API error: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();

  // Handle model loading state
  if (data.error && data.error.includes("loading")) {
    throw new Error("Model is loading. Please try again in 10-20 seconds.");
  }

  // Extract generated text
  let text = "";
  if (Array.isArray(data) && data.length > 0) {
    text = data[0].generated_text || data[0];
  } else if (data.generated_text) {
    text = data.generated_text;
  } else if (typeof data === "string") {
    text = data;
  }

  return text.trim();
}

// Icons for formatting
const INSIGHT_ICONS = ["📊", "⏱️", "🌅", "🧠", "📚", "✍️", "🎯", "💪"];
const TIP_ICONS = ["☕", "💧", "😴", "🏃", "🥗", "📱"];

// Fallback content that rotates dynamically
const FALLBACK_QUOTES = [
  {
    quote: "Stay focused and consistent",
    text: "Every step brings you closer to success",
  },
  {
    quote: "Believe in your potential",
    text: "You're capable of amazing things",
  },
  {
    quote: "Progress over perfection",
    text: "Small steps lead to big achievements",
  },
  { quote: "Keep pushing forward", text: "Your future self will thank you" },
  {
    quote: "Study smart, not just hard",
    text: "Quality beats quantity every time",
  },
  { quote: "You've got this", text: "Challenges make you stronger" },
];

const FALLBACK_TIPS = [
  [
    { icon: "☕", text: "Take 5-min breaks" },
    { icon: "💧", text: "Drink water hourly" },
    { icon: "😴", text: "Sleep 7-8 hours" },
  ],
  [
    { icon: "🏃", text: "Move every hour" },
    { icon: "🥗", text: "Eat brain foods" },
    { icon: "📱", text: "Limit phone time" },
  ],
  [
    { icon: "☕", text: "Study in morning" },
    { icon: "💧", text: "Stay hydrated" },
    { icon: "😴", text: "Rest is important" },
  ],
];

const FALLBACK_CHALLENGES = [
  "Complete 3 focused study sessions today",
  "Review your notes from yesterday",
  "Teach someone what you learned",
  "Create a mind map of your topic",
  "Practice 10 past exam questions",
  "Summarize a chapter in your own words",
];

const FALLBACK_INSIGHTS = [
  [
    {
      icon: "📊",
      text: "Use the Pomodoro technique: 25 minutes focus, 5 minutes break",
    },
    {
      icon: "⏱️",
      text: "Study during your peak energy hours for better retention",
    },
    {
      icon: "🧠",
      text: "Test yourself regularly instead of just re-reading notes",
    },
    {
      icon: "📚",
      text: "Review material within 24 hours to boost memory by 60%",
    },
  ],
  [
    {
      icon: "🌅",
      text: "Start with the hardest subject when your mind is fresh",
    },
    { icon: "✍️", text: "Write summaries by hand to improve understanding" },
    { icon: "🎯", text: "Set specific goals for each study session" },
    {
      icon: "💪",
      text: "Take breaks to let your brain consolidate information",
    },
  ],
  [
    {
      icon: "📊",
      text: "Use active recall: quiz yourself without looking at notes",
    },
    { icon: "⏱️", text: "Space out your study sessions over multiple days" },
    {
      icon: "🧠",
      text: "Explain concepts out loud to identify gaps in knowledge",
    },
    {
      icon: "📚",
      text: "Mix up subjects to keep your brain engaged and alert",
    },
  ],
];

// Get random index based on current time (changes every hour)
function getRotatingIndex(arrayLength) {
  const hour = new Date().getHours();
  return hour % arrayLength;
}

// ===========================
// API Endpoints
// ===========================

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running!",
    aiEnabled: !!HF_API_KEY,
  });
});

// Get daily motivation from AI
app.get("/api/motivation", async (req, res) => {
  try {
    // Get rotating fallback content
    const quoteIndex = getRotatingIndex(FALLBACK_QUOTES.length);
    const tipsIndex = getRotatingIndex(FALLBACK_TIPS.length);
    const challengeIndex = getRotatingIndex(FALLBACK_CHALLENGES.length);

    // Try AI first if key is configured
    if (HF_API_KEY) {
      try {
        console.log("Generating motivation from AI...");
        const prompt = `Generate a motivational quote for students in 6 words or less:`;
        const aiResponse = await callHuggingFace(prompt, 50);

        if (aiResponse && aiResponse.length > 0) {
          const quote = {
            quote: aiResponse,
            text: "Every step brings you closer",
          };
          const tips = FALLBACK_TIPS[tipsIndex];
          const challenge = FALLBACK_CHALLENGES[challengeIndex];

          return res.json({ quote, tips, challenge });
        }
      } catch (aiError) {
        console.log("AI failed, using fallback content:", aiError.message);
      }
    }

    // Use fallback content (either no API key or AI failed)
    const quote = FALLBACK_QUOTES[quoteIndex];
    const tips = FALLBACK_TIPS[tipsIndex];
    const challenge = FALLBACK_CHALLENGES[challengeIndex];

    res.json({ quote, tips, challenge });
  } catch (error) {
    console.error("Error in motivation endpoint:", error.message);
    // Even if everything fails, return something
    res.json({
      quote: FALLBACK_QUOTES[0],
      tips: FALLBACK_TIPS[0],
      challenge: FALLBACK_CHALLENGES[0],
    });
  }
});

// Get personalized insights from AI
app.get("/api/insights", async (req, res) => {
  try {
    // Get rotating fallback content
    const insightsIndex = getRotatingIndex(FALLBACK_INSIGHTS.length);

    // Try AI first if key is configured
    if (HF_API_KEY) {
      try {
        console.log("Generating insights from AI...");
        const prompt = `List one helpful study tip for students in one sentence:`;
        const aiResponse = await callHuggingFace(prompt, 100);

        if (aiResponse && aiResponse.length > 0) {
          const insights = [
            { icon: INSIGHT_ICONS[0], text: aiResponse },
            ...FALLBACK_INSIGHTS[insightsIndex].slice(1),
          ];
          return res.json({ insights });
        }
      } catch (aiError) {
        console.log("AI failed, using fallback content:", aiError.message);
      }
    }

    // Use fallback content (either no API key or AI failed)
    const insights = FALLBACK_INSIGHTS[insightsIndex];
    res.json({ insights });
  } catch (error) {
    console.error("Error in insights endpoint:", error.message);
    // Even if everything fails, return something
    res.json({ insights: FALLBACK_INSIGHTS[0] });
  }
});

// AI Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("Received message:", message);

    // Try AI if key is configured
    if (HF_API_KEY) {
      try {
        const prompt = `As a study advisor, answer this question in 2-3 helpful sentences: ${message}`;
        const aiResponse = await callHuggingFace(prompt, 200);

        if (aiResponse && aiResponse.length > 0) {
          return res.json({
            response: aiResponse,
            source: "huggingface",
          });
        }
      } catch (aiError) {
        console.log("AI failed, using fallback response:", aiError.message);
      }
    }

    // Fallback responses based on keywords
    const lowerMessage = message.toLowerCase();
    let fallbackResponse = "";

    if (lowerMessage.includes("motivat") || lowerMessage.includes("inspire")) {
      fallbackResponse =
        "Stay focused on your goals! Break your study sessions into manageable chunks and celebrate small wins. Remember, consistency beats intensity every time.";
    } else if (
      lowerMessage.includes("time") ||
      lowerMessage.includes("manage") ||
      lowerMessage.includes("schedule")
    ) {
      fallbackResponse =
        "Try the Pomodoro technique: study for 25 minutes, then take a 5-minute break. Plan your day the night before and tackle the hardest subjects when you're most alert.";
    } else if (
      lowerMessage.includes("memory") ||
      lowerMessage.includes("remember") ||
      lowerMessage.includes("forget")
    ) {
      fallbackResponse =
        "Use active recall and spaced repetition! Test yourself regularly instead of just re-reading. Review material within 24 hours to boost retention by up to 60%.";
    } else if (
      lowerMessage.includes("exam") ||
      lowerMessage.includes("test") ||
      lowerMessage.includes("prep")
    ) {
      fallbackResponse =
        "Practice past papers under timed conditions. Focus on understanding concepts, not memorizing. Get good sleep before the exam - your brain consolidates memory during sleep!";
    } else if (
      lowerMessage.includes("stress") ||
      lowerMessage.includes("anxious") ||
      lowerMessage.includes("worry")
    ) {
      fallbackResponse =
        "Take deep breaths and break tasks into smaller steps. Regular exercise and good sleep help manage stress. Remember, it's okay to take breaks - they actually improve productivity!";
    } else if (
      lowerMessage.includes("focus") ||
      lowerMessage.includes("distract") ||
      lowerMessage.includes("concentrate")
    ) {
      fallbackResponse =
        "Remove distractions: put your phone away and use website blockers. Study in a dedicated space and use background music or white noise if it helps you concentrate.";
    } else {
      fallbackResponse =
        "Great question! Try breaking your study material into smaller chunks, use active recall techniques, and don't forget to take regular breaks. Consistency is key to success!";
    }

    res.json({
      response: fallbackResponse,
      source: "fallback",
    });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.json({
      response:
        "I'm here to help with your studies! Try asking about study techniques, time management, or exam preparation.",
      source: "fallback",
    });
  }
});

// ===========================
// Start Server
// ===========================

app.listen(PORT, () => {
  const hasApiKey = !!HF_API_KEY;

  console.log(`
╔════════════════════════════════════════╗
║   🚀 AI Study Advisor Server Running   ║
╚════════════════════════════════════════╝

📍 Server: http://localhost:${PORT}
🤖 AI Chat: http://localhost:${PORT}/api/chat
💡 Motivation: http://localhost:${PORT}/api/motivation
📊 Insights: http://localhost:${PORT}/api/insights

${
  hasApiKey
    ? "✅ Hugging Face API key configured - Using real AI!"
    : "⚠️  No API key - Please add HF_API_KEY to .env file"
}

${
  !hasApiKey
    ? `
To add API key:
  1. Get key from: https://huggingface.co/settings/tokens
  2. Select "Read" access when creating token
  3. Add to .env file: HF_API_KEY=your_key_here
  4. Restart server
`
    : ""
}
Press Ctrl+C to stop the server
  `);
});

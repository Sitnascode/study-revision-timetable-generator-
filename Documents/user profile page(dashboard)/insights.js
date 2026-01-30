// Serverless Function for AI Insights
// Works with Vercel, Netlify, and other serverless platforms

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { timetable, subjectTotals, stats, streak } = req.body;

    // Validate input
    if (!timetable || !stats) {
      return res.status(400).json({ error: "Missing required data" });
    }

    // Prepare data summary for AI
    const subjectDetails = Object.keys(timetable)
      .map((subj) => {
        const planned = timetable[subj] || 0;
        const actual = Math.round(subjectTotals[subj] || 0);
        const pct = planned > 0 ? Math.round((actual / planned) * 100) : 0;
        return `${subj}: ${actual}h/${planned}h (${pct}%)`;
      })
      .join(", ");

    const prompt = `As a study advisor, analyze this student's data and provide exactly 3 short, actionable insights (each under 15 words):

Study Data:
- Total hours: ${Math.round(stats.totalStudied)}h studied of ${Math.round(
      stats.plannedHours
    )}h planned
- Productivity: ${stats.productivity}%
- Streak: ${streak} days
- Subjects: ${subjectDetails}

Provide 3 specific, actionable insights. Format: One insight per line, no numbering.`;

    // Get API key from environment variable
    const API_KEY = process.env.HUGGINGFACE_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        error: "API key not configured",
        fallback: true,
      });
    }

    // Call Hugging Face API
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", errorText);
      return res.status(response.status).json({
        error: "AI API failed",
        fallback: true,
      });
    }

    const data = await response.json();
    let aiText = data[0]?.generated_text || "";

    // Parse insights from AI response
    const insights = aiText
      .split("\n")
      .filter((line) => line.trim().length > 10)
      .map((line) =>
        line
          .replace(/^\d+\.\s*/, "")
          .replace(/^[-•*]\s*/, "")
          .trim()
      )
      .filter((line) => line.length > 0 && line.length < 200)
      .slice(0, 3);

    if (insights.length >= 3) {
      return res.status(200).json({
        success: true,
        insights: insights,
      });
    } else {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: "AI response incomplete",
      });
    }
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).json({
      error: error.message,
      fallback: true,
    });
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, mode } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const temperature = mode === "questions" ? 0.8 : 0.3;
  // Increase max tokens to prevent truncation
  const maxOutputTokens = mode === "questions" ? 3000 : 8000;

  const makeRequest = async () => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens, temperature },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();

    // Check for finish reason — STOP is good, MAX_TOKENS means truncated
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason === "MAX_TOKENS") {
      throw new Error("Response truncated — retrying with shorter prompt");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) throw new Error("Empty response from Gemini");

    return text.replace(/```json|```/g, "").trim();
  };

  // Retry logic — up to 2 attempts
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const clean = await makeRequest();
      return res.status(200).json({ raw: clean });
    } catch (err) {
      lastError = err;
      console.error(`Attempt ${attempt} failed:`, err.message);
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000)); // wait 1s before retry
    }
  }

  return res.status(500).json({ error: "Analysis failed after retries", detail: lastError?.message });
}

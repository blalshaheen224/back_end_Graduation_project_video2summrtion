const Groq = require("groq-sdk");

// ==========================
// إعدادات Groq
// ==========================
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.3-70b-versatile"; // أفضل موديل مجاني في Groq

// ==========================
// إعدادات Retry
// ==========================
const MAX_RETRIES = 4;
const BASE_DELAY_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * استدعاء Groq مع Retry تلقائي عند 429 / 503
 */
const callGroq = async (messages, maxTokens = 512) => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages,
        temperature: 0.3,
        max_tokens: maxTokens,
      });
      console.log(completion.usage);
      return completion.choices?.[0]?.message?.content?.trim() || null;

    } catch (err) {
      const status = err?.status ?? err?.response?.status;
      const isRetryable = status === 429 || status === 503;

      if (isRetryable) {
        const waitMs = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `[Groq] ${status} — attempt ${attempt}/${MAX_RETRIES}, waiting ${waitMs}ms...`
        );
        if (attempt < MAX_RETRIES) {
          await sleep(waitMs);
          continue;
        }
      }

      throw err;
    }
  }
};

/**
 * تلخيص نص إنجليزي
 */
const summarizeText = async (text) => {
  if (!text || text.trim().length === 0) {
    throw new Error("No text provided for summarization");
  }

  if (text.split(" ").length < 50) {
    return text; // نص قصير لا يحتاج تلخيص
  }

  const messages = [
    {
      role: "system",
      content:
        "You are a professional summarizer. Summarize transcribed audio text in clear, concise English. Keep the summary to 3-5 sentences. Do not add any introduction like 'Here is a summary', just write the summary directly.",
    },
    {
      role: "user",
      content: `Summarize the following text:\n\n${text}`,
    },
  ];

  const result = await callGroq(messages, 512);
  if (!result) throw new Error("Groq returned empty summary");
  return result;
};

/**
 * استخراج الكلمات المفتاحية
 */
const extractKeywords = async (text) => {
  if (!text || text.trim().length === 0) {
    return "No keywords found";
  }

  const messages = [
    {
      role: "system",
      content:
        "You are a keyword extractor. Return only a comma-separated list of 5 keywords. No explanation, no numbering, no extra text.",
    },
    {
      role: "user",
      content: `Extract the 5 most important keywords from this text:\n\n${text}`,
    },
  ];

  await sleep(500); // فاصل بسيط بين الطلبين

  const result = await callGroq(messages, 100);
  return result || "No keywords found";
};
module.exports = { summarizeText, extractKeywords };
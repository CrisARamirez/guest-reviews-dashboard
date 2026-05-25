import { callLLM } from "./llm";

import {
  buildPortfolioSystemPrompt,
} from "./llm/prompts/portfolio";

export async function extractThemes(
  propertyName,
  reviewTexts
) {
  const system = `
You extract recurring themes from short-term rental guest reviews.

Return ONLY valid JSON.

Format:
[
  {
    "theme": "AC",
    "sentiment": "negative",
    "reviewIndexes": [0,1]
  }
]
`;

  const prompt = `
Property: ${propertyName}

Reviews:
${reviewTexts
  .map((t, i) => `[${i}] ${t}`)
  .join("\n")}
`;

  const result = await callLLM({
    system,

    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],

    maxTokens: 800,
  });

  try {
    const raw = (result && result.text) ? String(result.text) : "";

    const firstBracket = raw.indexOf("[");
    const lastBracket = raw.lastIndexOf("]");
    const maybeJson = firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket
      ? raw.slice(firstBracket, lastBracket + 1)
      : raw;

    if (maybeJson.length > 200_000) {
      console.warn("extractThemes: LLM returned very large payload, trimming before parse");
    }

    const parsed = JSON.parse(maybeJson);

    if (!Array.isArray(parsed)) return [];

    const MAX_THEMES = 60;
    const MAX_INDEXES_PER_THEME = 200;

    const normalized = parsed.slice(0, MAX_THEMES).map((item) => {
      const theme = item?.theme ? String(item.theme).slice(0, 120) : "";
      const sentiment = ["negative", "positive", "mixed"].includes(item?.sentiment)
        ? item.sentiment
        : "mixed";

      const reviewIndexes = Array.isArray(item?.reviewIndexes)
        ? Array.from(
            new Set(
              item.reviewIndexes
                .map((n) => Number(n))
                .filter((n) => Number.isInteger(n) && n >= 0 && n < reviewTexts.length)
            )
          ).slice(0, MAX_INDEXES_PER_THEME)
        : [];

      return { theme, sentiment, reviewIndexes };
    });

    return normalized;
  } catch (err) {
    console.warn("extractThemes: failed to parse LLM response", err);
    return [];
  }
}

export async function generateDraftResponse(
  review
) {
  const prompt = `
Write a host response.

Rating:
${review.rating_overall}/5

Review:
${review.review_text}

Rules:
- under 100 words
- natural tone
`;

  const result = await callLLM({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],

    maxTokens: 300,
  });

  return result.text;
}

export async function chatWithPortfolio(
  question,
  reviews,
  conversationHistory,
  portfolioStats
) {
  const system =
    buildPortfolioSystemPrompt(
      portfolioStats
    );

  console.log(reviews)
  const sample = reviews
    .slice(0, 80) //For free LLMs I have to limit the number of reviews in the prompt
    .map(
      (r) =>
        `[${r.review_id}] ${r.property_name} | ${r.rating_overall}★ | ${r.review_text?.slice(
          0,
          200
        )}`
    )
    .join("\n");

  const messages = [
    ...conversationHistory,

    {
      role: "user",
      content: `
Reviews sample:

${sample}

Question:
${question}
`,
    },
  ];

  return callLLM({
    system,
    messages,
    maxTokens: 600,
  });
}
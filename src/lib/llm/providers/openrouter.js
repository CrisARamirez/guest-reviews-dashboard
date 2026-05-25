const API_URL =
  "https://openrouter.ai/api/v1/chat/completions";

export async function callOpenRouter({
  system = "",
  messages,
  maxTokens = 1000,
}) {
  const apiKey =
    import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing OpenRouter API key"
    );
  }

  const res = await fetch(API_URL, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${apiKey}`,

      "Content-Type":
        "application/json",
    },

    body: JSON.stringify({
      model:
        "anthropic/claude-sonnet-4",

      messages: [
        {
          role: "system",
          content: system,
        },

        ...messages,
      ],

      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    throw new Error(
      `OpenRouter error ${res.status}`
    );
  } 

  const data = await res.json();

  return (
    data.choices?.[0]?.message
      ?.content ?? ""
  );
}
const API_URL =
  "https://api.openai.com/v1/chat/completions";

const MODEL = "gpt-4.1-mini";

export async function callOpenAI({
  system = "",
  messages,
  maxTokens = 1000,
}) {
  const apiKey =
    import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing OpenAI API key"
    );
  }

  const res = await fetch(API_URL, {
    method: "POST",

    headers: {
      "Content-Type":
        "application/json",

      Authorization: `Bearer ${apiKey}`,
    },

    body: JSON.stringify({
      model: MODEL,

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
    const err = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      err?.error?.message ??
        `OpenAI error ${res.status}`
    );
  }

  const data = await res.json();

  return (
    data.choices?.[0]?.message
      ?.content ?? ""
  );
}
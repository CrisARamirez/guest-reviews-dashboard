const API_URL =
  "https://api.anthropic.com/v1/messages";

const MODEL =
  "claude-sonnet-4-20250514";

export async function callAnthropic({
  system = "",
  messages,
  maxTokens = 1000,
}) {
  const apiKey =
    import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing Anthropic API key"
    );
  }

  const res = await fetch(API_URL, {
    method: "POST",

    headers: {
      "Content-Type":
        "application/json",

      "x-api-key": apiKey,

      "anthropic-version":
        "2023-06-01",

      "anthropic-dangerous-direct-browser-access":
        "true",
    },

    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      err?.error?.message ??
        `Anthropic error ${res.status}`
    );
  }

  const data = await res.json();

  return data.content
    .map((block) =>
      block.type === "text"
        ? block.text
        : ""
    )
    .filter(Boolean)
    .join("\n");
}
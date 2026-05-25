const MODEL =
  "gemini-2.5-flash";

export async function callGemini({
  system = "",
  messages,
}) {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key"
    );
  }

  const prompt = `
${system}

${messages
  .map(
    (m) =>
      `${m.role.toUpperCase()}: ${m.content}`
  )
  .join("\n\n")}
`;

console.log(prompt)

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );
  console.log(res)

  if (!res.ok) {
    throw new Error(
      `Gemini ${res.status}: ${res.text}`
    );
  }

  const data = await res.json();

  return (
    data.candidates?.[0]?.content
      ?.parts?.[0]?.text ?? ""
  );
}
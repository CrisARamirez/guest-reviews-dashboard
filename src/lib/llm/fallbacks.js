import { callAnthropic } from "./providers/anthropic";
import { callOpenAI } from "./providers/openai";
import { callGemini } from "./providers/gemini";
import { callOpenRouter } from "./providers/openrouter";

export function getAvailableProviders() {
  const providers = [];

  if (
    import.meta.env
      .VITE_GEMINI_API_KEY
  ) {
    providers.push({
      name: "Gemini",
      fn: callGemini,
    });
  }

  if (
    import.meta.env
      .VITE_ANTHROPIC_API_KEY
  ) {
    providers.push({
      name: "Claude",
      fn: callAnthropic,
    });
  }

  if (
    import.meta.env
      .VITE_OPENAI_API_KEY
  ) {
    providers.push({
      name: "OpenAI",
      fn: callOpenAI,
    });
  }

  if (
    import.meta.env
      .VITE_OPENROUTER_API_KEY
  ) {
    providers.push({
      name: "OpenRouter",
      fn: callOpenRouter,
    });
  }

  return providers;
}
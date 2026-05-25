import { getAvailableProviders } from "./fallbacks";

export async function callLLM(
  payload
) {
  const providers = getAvailableProviders();
  let lastError = null;

  for (const provider of providers) {
    try {
      console.log(
        `[LLM] Trying ${provider.name}`
      );

      const result =
        await provider.fn(payload);

      console.log(
        `[LLM] ${provider.name} success`
      );

      return {
        provider: provider.name,
        text: result,
      };
    } catch (e) {
      console.warn(
        `[LLM] ${provider.name} failed`,
        e
      );

      lastError = e;
    }
  }

  throw (
    lastError ??
    new Error(
      "All providers failed"
    )
  );
}
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { env } from "~/env";

const gateway = createOpenAICompatible({
  name: "vercel-ai-gateway",
  baseURL: "https://ai-gateway.vercel.sh/v1",
  apiKey: env.VERCEL_AI_GATEWAY_API_KEY,
  supportsStructuredOutputs: true,
});

export const modelFlash = gateway("google/gemini-3.1-flash-lite-preview");
export const modelThinking = gateway("google/gemini-3-flash");

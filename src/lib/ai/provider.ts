export type AiMode = "demo" | "provider";

export type AiProvider = {
  answer(input: string): Promise<string>;
};

export function getAiMode(): AiMode {
  return process.env.AI_MODE === "provider" ? "provider" : "demo";
}

export function assertProviderConfiguration() {
  if (getAiMode() === "provider" && (!process.env.AI_API_KEY || !process.env.AI_MODEL)) {
    throw new Error("AI_MODE=provider requiere AI_API_KEY y AI_MODEL.");
  }
}

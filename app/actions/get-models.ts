"use server";

import { gateway } from "@ai-sdk/gateway";

interface Model {
  provider: string;
  name: string;
  id: string;
}

export async function getModels(): Promise<Model[]> {
  try {
    const { models } = await gateway.getAvailableModels();
    const textModels = models.filter((m) => m.modelType === "language");

    // Transform models into provider/name structure
    const formattedModels = textModels.map((m) => {
      const [provider, ...nameParts] = m.id.split("/");
      return {
        provider,
        name: nameParts.join("/"), // Handle cases where name might contain '/'
        id: m.id,
      };
    });

    return formattedModels;
  } catch (error) {
    console.error("❌ Error fetching models:", error);
    return [];
  }
}

export async function getModelPricing(): Promise<
  Record<
    string,
    {
      input: number;
      output: number;
      cachedInputTokens?: number;
      cacheCreationInputTokens?: number;
    }
  >
> {
  try {
    const { models } = await gateway.getAvailableModels();
    const textModels = models.filter((m) => m.modelType === "language");

    const pricing: Record<
      string,
      {
        input: number;
        output: number;
        cachedInputTokens?: number;
        cacheCreationInputTokens?: number;
      }
    > = {};

    textModels.forEach((model) => {
      if (model.pricing) {
        pricing[model.id] = {
          input: parseFloat(model.pricing.input),
          output: parseFloat(model.pricing.output),
          cachedInputTokens: model.pricing.cachedInputTokens
            ? parseFloat(model.pricing.cachedInputTokens)
            : undefined,
          cacheCreationInputTokens: model.pricing.cacheCreationInputTokens
            ? parseFloat(model.pricing.cacheCreationInputTokens)
            : undefined,
        };
      }
    });

    return pricing;
  } catch (error) {
    console.error("❌ Error fetching model pricing:", error);
    return {};
  }
}

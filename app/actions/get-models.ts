"use server";

import type { Model } from "@/lib/chat-types";
import { gateway } from "@ai-sdk/gateway";

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

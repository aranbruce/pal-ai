import Chat from "@/components/chat";
import { gateway } from "@ai-sdk/gateway";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Model {
  provider: string;
  name: string;
  id: string;
}

async function getModels(): Promise<Model[]> {
  try {
    const { models } = await gateway.getAvailableModels();
    const textModels = models.filter((m) => m.modelType === "language");
    console.log("🌐 Fetched", textModels.length, "text models from gateway");

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

export default async function Page() {
  const models = await getModels();
  return <Chat models={models} defaultModel="alibaba/qwen3-vl-thinking" />;
}

import Chat from "@/components/chat";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Model {
  provider: string;
  name: string;
  id: string;
}

async function getModels(): Promise<Model[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const response = await fetch(`${baseUrl}/api/models`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch models");
      return [];
    }

    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
}

export default async function Page() {
  const models = await getModels();

  return <Chat models={models} defaultModel="alibaba/qwen3-vl-thinking" />;
}

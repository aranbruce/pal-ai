import { getModels } from "@/app/actions/get-models";
import Chat from "@/components/chat";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function Page() {
  const models = await getModels();
  return <Chat models={models} defaultModel="moonshotai/kimi-k2" />;
}

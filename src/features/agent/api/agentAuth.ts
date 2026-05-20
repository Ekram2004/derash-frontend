// src/features/agent/api/agentAuth.ts
import api from "../../../services/api";
import { useAuthStore } from "@/features/auth/store/auth.store";

export async function syncAgentApiKey(): Promise<string | null> {
  try {
    // This endpoint uses JWT cookie, not API key
    const response = await api.get("/agent/me");
    const agent = response.data.data;

    if (agent?.apiKey) {
      const { user } = useAuthStore.getState();
      if (user) {
        useAuthStore.setState({
          user: {
            ...user,
            agent: {
              ...user.agent,
              id: agent.id,
              api_key: agent.apiKey,   // store the key
              name: agent.name,
              code: agent.code
            }
          }
        });
        return agent.apiKey;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to sync agent API key:", error);
    return null;
  }
}
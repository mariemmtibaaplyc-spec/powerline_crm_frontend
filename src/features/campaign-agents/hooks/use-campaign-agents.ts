"use client";

import { useCampaignAgentsStore } from "@/features/campaign-agents/store/campaign-agents.store";
import type { CampaignAgentRecord } from "@/types/campaign-agent.types";

const EMPTY_AGENTS: CampaignAgentRecord[] = [];

export function useCampaignAgents(campaignId?: string) {
  const loadCampaignAgents = useCampaignAgentsStore((state) => state.loadCampaignAgents);
  const attachCampaignAgent = useCampaignAgentsStore((state) => state.attachCampaignAgent);
  const attachCampaignAgents = useCampaignAgentsStore((state) => state.attachCampaignAgents);
  const detachCampaignAgent = useCampaignAgentsStore((state) => state.detachCampaignAgent);
  const campaignAgents = useCampaignAgentsStore((state) => {
    if (!campaignId) {
      return EMPTY_AGENTS;
    }

    return state.agentsByCampaign[campaignId] ?? EMPTY_AGENTS;
  });
  const isLoadingCampaignAgents = useCampaignAgentsStore((state) =>
    campaignId ? Boolean(state.loadingCampaignAgentIds[campaignId]) : false,
  );
  const campaignAgentsError = useCampaignAgentsStore((state) =>
    campaignId ? state.campaignAgentErrorsByCampaign[campaignId] ?? null : null,
  );
  const isMutatingCampaignAgents = useCampaignAgentsStore((state) =>
    campaignId ? Boolean(state.mutatingCampaignAgentIds[campaignId]) : false,
  );
  const campaignAgentsActionError = useCampaignAgentsStore((state) =>
    campaignId ? state.campaignAgentActionErrorsByCampaign[campaignId] ?? null : null,
  );

  return {
    campaignAgents,
    isLoadingCampaignAgents,
    campaignAgentsError,
    isMutatingCampaignAgents,
    campaignAgentsActionError,
    loadCampaignAgents,
    attachCampaignAgent,
    attachCampaignAgents,
    detachCampaignAgent,
  };
}

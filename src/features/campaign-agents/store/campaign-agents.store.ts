"use client";

import { create } from "zustand";
import { campaignAgentsApi } from "@/features/campaign-agents/api/campaign-agents.api";
import type { CampaignAgentRecord } from "@/types/campaign-agent.types";

interface CampaignAgentsStoreState {
  agentsByCampaign: Record<string, CampaignAgentRecord[]>;
  loadingCampaignAgentIds: Record<string, boolean>;
  campaignAgentErrorsByCampaign: Record<string, string | null>;
  mutatingCampaignAgentIds: Record<string, boolean>;
  campaignAgentActionErrorsByCampaign: Record<string, string | null>;
  loadCampaignAgents: (campaignId: string, force?: boolean) => Promise<void>;
  attachCampaignAgent: (campaignId: string, agentId: string) => Promise<void>;
  attachCampaignAgents: (campaignId: string, agentIds: string[]) => Promise<void>;
  detachCampaignAgent: (campaignId: string, agentId: string) => Promise<void>;
}

export const useCampaignAgentsStore = create<CampaignAgentsStoreState>((set, get) => ({
  agentsByCampaign: {},
  loadingCampaignAgentIds: {},
  campaignAgentErrorsByCampaign: {},
  mutatingCampaignAgentIds: {},
  campaignAgentActionErrorsByCampaign: {},
  loadCampaignAgents: async (campaignId, force = false) => {
    const existingAgents = get().agentsByCampaign[campaignId];
    const isLoading = get().loadingCampaignAgentIds[campaignId];

    if (existingAgents && !force && !isLoading) {
      return;
    }

    set((state) => ({
      loadingCampaignAgentIds: {
        ...state.loadingCampaignAgentIds,
        [campaignId]: true,
      },
      campaignAgentErrorsByCampaign: {
        ...state.campaignAgentErrorsByCampaign,
        [campaignId]: null,
      },
    }));

    try {
      const agents = await campaignAgentsApi.getCampaignAgents(campaignId);

      set((state) => ({
        agentsByCampaign: {
          ...state.agentsByCampaign,
          [campaignId]: agents,
        },
        loadingCampaignAgentIds: {
          ...state.loadingCampaignAgentIds,
          [campaignId]: false,
        },
        campaignAgentErrorsByCampaign: {
          ...state.campaignAgentErrorsByCampaign,
          [campaignId]: null,
        },
      }));
    } catch (error) {
      set((state) => ({
        agentsByCampaign: {
          ...state.agentsByCampaign,
          [campaignId]: [],
        },
        loadingCampaignAgentIds: {
          ...state.loadingCampaignAgentIds,
          [campaignId]: false,
        },
        campaignAgentErrorsByCampaign: {
          ...state.campaignAgentErrorsByCampaign,
          [campaignId]:
            error instanceof Error
              ? error.message
              : "Impossible de charger les agents de cette campagne.",
        },
      }));
    }
  },
  attachCampaignAgent: async (campaignId, agentId) => {
    set((state) => ({
      mutatingCampaignAgentIds: {
        ...state.mutatingCampaignAgentIds,
        [campaignId]: true,
      },
      campaignAgentActionErrorsByCampaign: {
        ...state.campaignAgentActionErrorsByCampaign,
        [campaignId]: null,
      },
    }));

    try {
      await campaignAgentsApi.attachCampaignAgent(campaignId, agentId);
      await get().loadCampaignAgents(campaignId, true);
    } catch (error) {
      set((state) => ({
        campaignAgentActionErrorsByCampaign: {
          ...state.campaignAgentActionErrorsByCampaign,
          [campaignId]:
            error instanceof Error
              ? error.message
              : "Impossible d affecter l agent.",
        },
      }));
      throw error;
    } finally {
      set((state) => ({
        mutatingCampaignAgentIds: {
          ...state.mutatingCampaignAgentIds,
          [campaignId]: false,
        },
      }));
    }
  },
  attachCampaignAgents: async (campaignId, agentIds) => {
    set((state) => ({
      mutatingCampaignAgentIds: {
        ...state.mutatingCampaignAgentIds,
        [campaignId]: true,
      },
      campaignAgentActionErrorsByCampaign: {
        ...state.campaignAgentActionErrorsByCampaign,
        [campaignId]: null,
      },
    }));

    try {
      if (agentIds.length === 0) {
        throw new Error("Aucun agent actif disponible à affecter.");
      }

      const results = await Promise.allSettled(
        agentIds.map((agentId) =>
          campaignAgentsApi.attachCampaignAgent(campaignId, agentId),
        ),
      );

      await get().loadCampaignAgents(campaignId, true);

      const failedResults = results.filter(
        (result): result is PromiseRejectedResult => result.status === "rejected",
      );

      if (failedResults.length > 0) {
        const firstReason = failedResults[0]?.reason;
        const firstMessage =
          firstReason instanceof Error
            ? firstReason.message
            : "Impossible d affecter certains agents.";

        if (failedResults.length === agentIds.length) {
          throw new Error(firstMessage);
        }

        throw new Error(
          `${agentIds.length - failedResults.length} agent(s) affecté(s), ${failedResults.length} en échec. ${firstMessage}`,
        );
      }
    } catch (error) {
      set((state) => ({
        campaignAgentActionErrorsByCampaign: {
          ...state.campaignAgentActionErrorsByCampaign,
          [campaignId]:
            error instanceof Error
              ? error.message
              : "Impossible d affecter les agents.",
        },
      }));
      throw error;
    } finally {
      set((state) => ({
        mutatingCampaignAgentIds: {
          ...state.mutatingCampaignAgentIds,
          [campaignId]: false,
        },
      }));
    }
  },
  detachCampaignAgent: async (campaignId, agentId) => {
    set((state) => ({
      mutatingCampaignAgentIds: {
        ...state.mutatingCampaignAgentIds,
        [campaignId]: true,
      },
      campaignAgentActionErrorsByCampaign: {
        ...state.campaignAgentActionErrorsByCampaign,
        [campaignId]: null,
      },
    }));

    try {
      await campaignAgentsApi.detachCampaignAgent(campaignId, agentId);
      await get().loadCampaignAgents(campaignId, true);
    } catch (error) {
      set((state) => ({
        campaignAgentActionErrorsByCampaign: {
          ...state.campaignAgentActionErrorsByCampaign,
          [campaignId]:
            error instanceof Error
              ? error.message
              : "Impossible de retirer l agent.",
        },
      }));
      throw error;
    } finally {
      set((state) => ({
        mutatingCampaignAgentIds: {
          ...state.mutatingCampaignAgentIds,
          [campaignId]: false,
        },
      }));
    }
  },
}));

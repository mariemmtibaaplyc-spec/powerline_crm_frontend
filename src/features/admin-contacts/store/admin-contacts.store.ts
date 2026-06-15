"use client";

import { create } from "zustand";
import { adminContactsApi } from "@/features/admin-contacts/api/admin-contacts.api";
import {
  createUpdatedContactPayload,
  MOCK_ADMIN_CONTACTS,
} from "@/features/admin-contacts/mocks/admin-contacts.mock";
import type {
  AdminContactFormValues,
  AdminContactsMeta,
  AdminContactRecord,
  LoadAdminContactsParams,
} from "@/types/admin-contact.types";

interface AdminContactsStoreState {
  contacts: AdminContactRecord[];
  contactsMeta: AdminContactsMeta;
  isLoadingContacts: boolean;
  contactsError: string | null;
  lastLoadContactsParams: LoadAdminContactsParams;
  loadContacts: (params?: LoadAdminContactsParams) => Promise<void>;
  editableContacts: AdminContactRecord[];
  updateContact: (id: string, values: AdminContactFormValues) => void;
  getContactById: (id: string) => AdminContactRecord | undefined;
}

export const useAdminContactsStore = create<AdminContactsStoreState>((set, get) => ({
  contacts: [],
  contactsMeta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
  },
  isLoadingContacts: false,
  contactsError: null,
  lastLoadContactsParams: {
    page: 1,
    limit: 10,
    sortBy: "created_at",
    order: "desc",
  },
  editableContacts: MOCK_ADMIN_CONTACTS,
  loadContacts: async (params = {}) => {
    const mergedParams = {
      page: 1,
      limit: 10,
      sortBy: "created_at",
      order: "desc" as const,
      ...params,
    };

    set({
      isLoadingContacts: true,
      contactsError: null,
    });

    try {
      const response = await adminContactsApi.getContacts(mergedParams);

      set({
        contacts: response.data,
        contactsMeta: response.meta,
        isLoadingContacts: false,
        contactsError: null,
        lastLoadContactsParams: mergedParams,
      });
    } catch (error) {
      set({
        contacts: [],
        contactsMeta: {
          total: 0,
          page: mergedParams.page ?? 1,
          limit: mergedParams.limit ?? 10,
          totalPages: 1,
          hasNextPage: false,
        },
        isLoadingContacts: false,
        contactsError:
          error instanceof Error
            ? error.message
            : "Impossible de charger les contacts.",
        lastLoadContactsParams: mergedParams,
      });
    }
  },
  updateContact: (id, values) => {
    set((state) => ({
      editableContacts: state.editableContacts.map((contact) =>
        contact.id === id ? createUpdatedContactPayload(contact, values) : contact,
      ),
    }));
  },
  getContactById: (id) => get().editableContacts.find((contact) => contact.id === id),
}));

"use client";

import { create } from "zustand";
import { listsApi } from "@/features/lists/api/lists.api";
import { createListPayload } from "@/features/lists/mocks/lists.mock";
import type {
  ListContactRecord,
  ListFormValues,
  ListRecord,
  ListStatus,
  ListsPaginationMeta,
  LoadListContactsParams,
  LoadListsParams,
} from "@/types/list.types";

interface ListsStoreState {
  lists: ListRecord[];
  listsError: string | null;
  listsMeta: ListsPaginationMeta;
  isLoadingLists: boolean;
  lastLoadListsParams: LoadListsParams;
  isUpdatingListStatus: boolean;
  listStatusUpdateError: string | null;
  selectedList: ListRecord | null;
  isLoadingSelectedList: boolean;
  selectedListError: string | null;
  selectedListContacts: ListContactRecord[];
  selectedListContactsMeta: ListsPaginationMeta;
  isLoadingSelectedListContacts: boolean;
  selectedListContactsError: string | null;
  loadLists: (params?: LoadListsParams) => Promise<void>;
  loadListById: (id: string, force?: boolean) => Promise<ListRecord | undefined>;
  loadListContacts: (
    listId: string,
    params?: LoadListContactsParams,
  ) => Promise<void>;
  createList: (values: ListFormValues) => string;
  updateList: (id: string, values: ListFormValues) => void;
  updateListStatusAction: (id: string, status: ListStatus) => Promise<void>;
  getListById: (id: string) => ListRecord | undefined;
}

export const useListsStore = create<ListsStoreState>((set, get) => ({
  lists: [],
  listsError: null,
  listsMeta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
  },
  isLoadingLists: false,
  lastLoadListsParams: {},
  isUpdatingListStatus: false,
  listStatusUpdateError: null,
  selectedList: null,
  isLoadingSelectedList: false,
  selectedListError: null,
  selectedListContacts: [],
  selectedListContactsMeta: {
    total: 0,
    page: 1,
    limit: 30,
    totalPages: 1,
    hasNextPage: false,
  },
  isLoadingSelectedListContacts: false,
  selectedListContactsError: null,
  loadLists: async (params = {}) => {
    set({ isLoadingLists: true, listsError: null });

    try {
      const response = await listsApi.getLists(params);

      set({
        lists: response.data,
        listsMeta: response.meta,
        lastLoadListsParams: params,
        listsError: null,
        isLoadingLists: false,
      });
    } catch {
      set({
        lists: [],
        lastLoadListsParams: params,
        listsError: "Impossible de charger la liste des listes.",
        isLoadingLists: false,
      });
    }
  },
  loadListById: async (id, force = false) => {
    const selectedList = get().selectedList;
    if (!force && selectedList?.id === id) {
      return selectedList;
    }

    set({
      isLoadingSelectedList: true,
      selectedListError: null,
    });

    try {
      const list = await listsApi.getListById(id);

      set((state) => ({
        selectedList: list,
        isLoadingSelectedList: false,
        selectedListError: null,
        lists: state.lists.some((entry) => entry.id === list.id)
          ? state.lists.map((entry) => (entry.id === list.id ? list : entry))
          : state.lists,
      }));

      return list;
    } catch {
      set({
        selectedList: null,
        isLoadingSelectedList: false,
        selectedListError: "Impossible de charger le detail de la liste.",
      });

      return undefined;
    }
  },
  loadListContacts: async (listId, params = {}) => {
    set({
      isLoadingSelectedListContacts: true,
      selectedListContactsError: null,
    });

    try {
      const response = await listsApi.getListContacts(listId, params);

      set((state) => ({
        selectedListContacts: response.data,
        selectedListContactsMeta: response.meta,
        isLoadingSelectedListContacts: false,
        selectedListContactsError: null,
        selectedList:
          state.selectedList?.id === listId
            ? {
                ...state.selectedList,
                contacts: response.data,
                contactsCount:
                  state.selectedList.contactsCount > 0
                    ? state.selectedList.contactsCount
                    : response.meta.total,
              }
            : state.selectedList,
      }));
    } catch {
      set({
        selectedListContacts: [],
        isLoadingSelectedListContacts: false,
        selectedListContactsError: "Impossible de charger les contacts de la liste.",
      });
    }
  },
  createList: (values) => {
    const nextList = createListPayload(values);
    set((state) => ({
      lists: [nextList, ...state.lists],
    }));
    return nextList.id;
  },
  updateList: (id, values) => {
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === id
          ? {
              ...list,
              name: values.name.trim(),
              type: values.type,
              source: values.source.trim(),
              status: values.status,
              campaign: values.campaign.trim(),
              contactsCount: Number(values.contactsCount) || 0,
              description: values.description.trim(),
            }
          : list,
      ),
    }));
  },
  updateListStatusAction: async (id, status) => {
    set({
      isUpdatingListStatus: true,
      listStatusUpdateError: null,
    });

    try {
      await listsApi.updateListStatus(id, status);
      await get().loadLists(get().lastLoadListsParams);

      if (get().selectedList?.id === id) {
        await get().loadListById(id, true);
      }

      set({
        isUpdatingListStatus: false,
        listStatusUpdateError: null,
      });
    } catch {
      set({
        isUpdatingListStatus: false,
        listStatusUpdateError: "Impossible de mettre a jour le statut de la liste.",
      });
    }
  },
  getListById: (id) => {
    const selectedList = get().selectedList;
    if (selectedList?.id === id) {
      return selectedList;
    }

    return get().lists.find((list) => list.id === id);
  },
}));

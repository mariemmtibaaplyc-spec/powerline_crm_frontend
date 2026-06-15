"use client";

import { useEffect } from "react";
import { useListsStore } from "@/features/lists/store/lists.store";
import type { LoadListsParams } from "@/types/list.types";

export function useLists(params?: LoadListsParams) {
  const lists = useListsStore((state) => state.lists);
  const listsError = useListsStore((state) => state.listsError);
  const listsMeta = useListsStore((state) => state.listsMeta);
  const isLoadingLists = useListsStore((state) => state.isLoadingLists);
  const isUpdatingListStatus = useListsStore((state) => state.isUpdatingListStatus);
  const listStatusUpdateError = useListsStore((state) => state.listStatusUpdateError);
  const selectedList = useListsStore((state) => state.selectedList);
  const isLoadingSelectedList = useListsStore((state) => state.isLoadingSelectedList);
  const selectedListError = useListsStore((state) => state.selectedListError);
  const selectedListContacts = useListsStore((state) => state.selectedListContacts);
  const selectedListContactsMeta = useListsStore((state) => state.selectedListContactsMeta);
  const isLoadingSelectedListContacts = useListsStore((state) => state.isLoadingSelectedListContacts);
  const selectedListContactsError = useListsStore((state) => state.selectedListContactsError);
  const loadLists = useListsStore((state) => state.loadLists);
  const loadListById = useListsStore((state) => state.loadListById);
  const loadListContacts = useListsStore((state) => state.loadListContacts);
  const createList = useListsStore((state) => state.createList);
  const updateList = useListsStore((state) => state.updateList);
  const updateListStatusAction = useListsStore((state) => state.updateListStatusAction);
  const getListById = useListsStore((state) => state.getListById);

  useEffect(() => {
    if (params) {
      void loadLists(params);
    }
  }, [loadLists, params?.limit, params?.page, params?.q, params?.status, params?.type]);

  return {
    lists,
    listsError,
    listsMeta,
    isLoadingLists,
    isUpdatingListStatus,
    listStatusUpdateError,
    selectedList,
    isLoadingSelectedList,
    selectedListError,
    selectedListContacts,
    selectedListContactsMeta,
    isLoadingSelectedListContacts,
    selectedListContactsError,
    loadLists,
    loadListById,
    loadListContacts,
    createList,
    updateList,
    updateListStatusAction,
    getListById,
  };
}

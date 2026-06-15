"use client";

import { useAdminContactsStore } from "@/features/admin-contacts/store/admin-contacts.store";

export function useAdminContacts() {
  const contacts = useAdminContactsStore((state) => state.contacts);
  const contactsMeta = useAdminContactsStore((state) => state.contactsMeta);
  const isLoadingContacts = useAdminContactsStore((state) => state.isLoadingContacts);
  const contactsError = useAdminContactsStore((state) => state.contactsError);
  const loadContacts = useAdminContactsStore((state) => state.loadContacts);
  const updateContact = useAdminContactsStore((state) => state.updateContact);
  const getContactById = useAdminContactsStore((state) => state.getContactById);

  return {
    contacts,
    contactsMeta,
    isLoadingContacts,
    contactsError,
    loadContacts,
    updateContact,
    getContactById,
  };
}

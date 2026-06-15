"use client";

import { Eye, PenSquare } from "lucide-react";
import Link from "next/link";
import { getContactFullName } from "@/features/admin-contacts/mocks/admin-contacts.mock";
import type { AdminContactRecord } from "@/types/admin-contact.types";
import { ContactStatusBadge } from "@/components/admin-contacts/contact-status-badge";
import {
  Table,
  TableCell,
  TableHeadCell,
  TableWrapper,
} from "@/components/ui/table";

export function ContactsTable({ contacts }: { contacts: AdminContactRecord[] }) {
  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <TableHeadCell>Nom complet</TableHeadCell>
            <TableHeadCell>Telephone</TableHeadCell>
            <TableHeadCell>Ville</TableHeadCell>
            <TableHeadCell>Source</TableHeadCell>
            <TableHeadCell>Statut contact</TableHeadCell>
            <TableHeadCell>Creation</TableHeadCell>
            <TableHeadCell className="text-right">Actions</TableHeadCell>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-semibold text-[#102033]">{getContactFullName(contact)}</p>
                  {contact.email ? (
                    <p className="text-xs text-[#607287]">{contact.email}</p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p>{contact.phone}</p>
                  {contact.phone2 ? (
                    <p className="text-xs text-[#607287]">{contact.phone2}</p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>{contact.city}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p>{contact.source || "-"}</p>
                  {contact.company ? (
                    <p className="text-xs text-[#607287]">{contact.company}</p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <ContactStatusBadge status={contact.status} />
              </TableCell>
              <TableCell>{contact.createdAt || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/contacts/${contact.id}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce6f0] bg-white text-[#295086] shadow-[0_10px_20px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:bg-[#f7fbff]"
                    aria-label={`Voir ${getContactFullName(contact)}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/admin/contacts/${contact.id}/edit`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce6f0] bg-white text-[#295086] shadow-[0_10px_20px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:bg-[#f7fbff]"
                    aria-label={`Modifier ${getContactFullName(contact)}`}
                  >
                    <PenSquare className="h-4 w-4" />
                  </Link>
                </div>
              </TableCell>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
}

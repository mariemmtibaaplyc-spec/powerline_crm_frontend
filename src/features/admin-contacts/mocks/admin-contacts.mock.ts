import { MOCK_CAMPAIGNS } from "@/features/campaigns/mocks/campaigns.mock";
import { MOCK_IMPORTS } from "@/features/imports/mocks/imports.mock";
import { MOCK_LISTS } from "@/features/lists/mocks/lists.mock";
import type {
  AdminContactFormValues,
  AdminContactRecord,
  ContactStatus,
} from "@/types/admin-contact.types";

export const CONTACT_STATUS_OPTIONS: Array<{ value: ContactStatus; label: string }> = [
  { value: "new", label: "Nouveau" },
  { value: "in_progress", label: "En traitement" },
  { value: "callback", label: "A rappeler" },
  { value: "appointment", label: "RDV pris" },
  { value: "qualified", label: "Qualifie" },
  { value: "blacklisted", label: "Blacklist" },
  { value: "unreachable", label: "Non joignable" },
];

export const CONTACT_CAMPAIGN_OPTIONS = Array.from(
  new Set([
    ...MOCK_CAMPAIGNS.map((campaign) => campaign.name),
    ...MOCK_LISTS.map((list) => list.campaign),
  ]),
);

export const CONTACT_LIST_OPTIONS = Array.from(new Set(MOCK_LISTS.map((list) => list.name)));

export const CONTACT_SOURCE_OPTIONS = Array.from(
  new Set(MOCK_IMPORTS.map((item) => item.name)),
);

export const MOCK_ADMIN_CONTACTS: AdminContactRecord[] = [
  {
    id: "ctc-001",
    firstName: "Imed",
    lastName: "Triki",
    phone: "+216 21 509 177",
    phone2: "+216 27 114 906",
    email: "imed.triki@prospect.test",
    address: "12 rue des Jasmins",
    city: "Tunis",
    postalCode: "1002",
    campaign: "NAT ISA Residentiel",
    listName: "Base B2B Avril",
    sourceImport: "Import B2B Avril",
    status: "qualified",
    lastAction: "Qualifie aujourd hui a 15:01",
    lastQualification: "Interesse sous validation technique",
    note: "Prospect joignable, souhaite une relance par conseiller senior.",
  },
  {
    id: "ctc-002",
    firstName: "Meriem",
    lastName: "Abbassi",
    phone: "+216 28 441 020",
    phone2: "+216 24 612 389",
    email: "meriem.abbassi@lead.test",
    address: "Residence Ennour, rue des Jasmins",
    city: "Ariana",
    postalCode: "2080",
    campaign: "Solar Elite Avril",
    listName: "Qualification solaire Q2",
    sourceImport: "Import qualification solaire",
    status: "callback",
    lastAction: "Rappel programme sous 48h",
    lastQualification: "A relancer",
    note: "Demande un retour apres consultation de l offre familiale.",
  },
  {
    id: "ctc-003",
    firstName: "Leila",
    lastName: "Khadraoui",
    phone: "+216 26 381 004",
    phone2: null,
    email: "leila.khadraoui@callback.test",
    address: "4 avenue Habib Bourguiba",
    city: "Sousse",
    postalCode: "4000",
    campaign: "Relance devis habitat",
    listName: "Rappels sous 48h",
    sourceImport: "Import callbacks habitat",
    status: "appointment",
    lastAction: "RDV confirme vendredi 11:30",
    lastQualification: "RDV pris",
    note: "Transfert commercial planifie avec fiche deja enrichie.",
  },
  {
    id: "ctc-004",
    firstName: "Walid",
    lastName: "Dridi",
    phone: "+216 22 640 317",
    phone2: null,
    email: "walid.dridi@habitat.test",
    address: "8 cite El Amal",
    city: "Monastir",
    postalCode: "5000",
    campaign: "Relance devis habitat",
    listName: "Rappels sous 48h",
    sourceImport: "Import callbacks habitat",
    status: "unreachable",
    lastAction: "Aucun decroche aujourd hui 17:18",
    lastQualification: "Non joignable",
    note: "Nouvelle tentative recommandee sur le creneau de fin de journee.",
  },
  {
    id: "ctc-005",
    firstName: "Nour",
    lastName: "Gharbi",
    phone: "+216 27 901 115",
    phone2: "+216 70 188 311",
    email: "nour.gharbi@solar.test",
    address: "15 rue de la Liberte",
    city: "Nabeul",
    postalCode: "8000",
    campaign: "Solar Elite Avril",
    listName: "Qualification solaire Q2",
    sourceImport: "Import qualification solaire",
    status: "in_progress",
    lastAction: "Fiche reprise par plateau solaire",
    lastQualification: "Qualification en cours",
    note: "Besoin d enrichir la consommation mensuelle avant proposition.",
  },
  {
    id: "ctc-006",
    firstName: "Sami",
    lastName: "Ben Amor",
    phone: "+216 23 704 522",
    phone2: null,
    email: "sami.benamor@crm.test",
    address: "17 rue Farhat Hached",
    city: "Sfax",
    postalCode: "3000",
    campaign: "NAT ISA Residentiel",
    listName: "Base B2B Avril",
    sourceImport: "Import B2B Avril",
    status: "new",
    lastAction: "Injecte suite import du 12/04",
    lastQualification: "Aucune qualification",
    note: "Contact encore vierge, disponible pour premiere diffusion.",
  },
  {
    id: "ctc-007",
    firstName: "Karim",
    lastName: "Bouzid",
    phone: "+216 24 881 994",
    phone2: null,
    email: "karim.bouzid@control.test",
    address: "Zone industrielle Mghira",
    city: "Ben Arous",
    postalCode: "2014",
    campaign: "Aucune campagne",
    listName: "Liste rouge prioritaire",
    sourceImport: "Nettoyage blacklist mars",
    status: "blacklisted",
    lastAction: "Exclusion ajoutee par controle CRM",
    lastQualification: "Numero a bloquer",
    note: "Contact signale en opposition marketing, diffusion interdite.",
  },
  {
    id: "ctc-008",
    firstName: "Rim",
    lastName: "Mnasri",
    phone: "+216 29 314 661",
    phone2: "+216 71 801 240",
    email: "rim.mnasri@premium.test",
    address: "Residence les oliviers, bloc C",
    city: "La Marsa",
    postalCode: "2070",
    campaign: "Reactivation clients premium",
    listName: "Nettoyage doublons habitat",
    sourceImport: "Nettoyage blacklist mars",
    status: "qualified",
    lastAction: "Controle dedoublonnage finalise",
    lastQualification: "Valide pour reactivation",
    note: "Fiche conservee en portefeuille premium pour relance ciblee.",
  },
];

export function getContactStatusLabel(status: string) {
  if (status.trim().toLowerCase() === "unknown") {
    return "UNKNOWN";
  }

  return CONTACT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function getContactFullName(contact: Pick<AdminContactRecord, "firstName" | "lastName">) {
  return `${contact.firstName} ${contact.lastName}`;
}

export function createUpdatedContactPayload(
  current: AdminContactRecord,
  values: AdminContactFormValues,
): AdminContactRecord {
  return {
    ...current,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phone: values.phone.trim(),
    phone2: values.phone2.trim() ? values.phone2.trim() : null,
    email: values.email.trim() ? values.email.trim().toLowerCase() : null,
    company: values.company.trim() ? values.company.trim() : null,
    address: values.address.trim() ? values.address.trim() : null,
    city: values.city.trim(),
    postalCode: values.postalCode.trim() ? values.postalCode.trim() : null,
    source: values.source.trim() ? values.source.trim() : null,
    country: values.country.trim() ? values.country.trim() : null,
    status: values.status,
  };
}

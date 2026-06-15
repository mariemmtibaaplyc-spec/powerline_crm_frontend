import { MOCK_PROSPECTS } from "@/features/workspace/mocks/prospects.mock";
import { prospectFullName, shiftDate } from "@/features/workspace/mocks/mock.utils";
import type { HistoryEntry } from "@/types/workspace.types";

export function createMockHistory(today: string): HistoryEntry[] {
  return [
    {
      id: "history-01",
      date: today,
      time: "08:55",
      clientName: prospectFullName(MOCK_PROSPECTS.meriemAbbassi),
      phone: MOCK_PROSPECTS.meriemAbbassi.phone,
      campaign: "Solar Elite",
      queue: "File outbound premium",
      result: "Qualification",
      summary:
        "Prospect interesse. Rappel programme sous 48h apres validation du besoin residentiel.",
      status: "follow_up",
      prospect: MOCK_PROSPECTS.meriemAbbassi,
    },
    {
      id: "history-02",
      date: today,
      time: "10:12",
      clientName: prospectFullName(MOCK_PROSPECTS.samiBenAmor),
      phone: MOCK_PROSPECTS.samiBenAmor.phone,
      campaign: "NAT ISA",
      queue: "File EMY ecologie",
      result: "Non joignable",
      summary:
        "Aucun decroche. Une nouvelle tentative reste recommandee en fin de journee.",
      status: "unreachable",
      prospect: MOCK_PROSPECTS.samiBenAmor,
    },
    {
      id: "history-03",
      date: today,
      time: "11:47",
      clientName: prospectFullName(MOCK_PROSPECTS.leilaKhadhraoui),
      phone: MOCK_PROSPECTS.leilaKhadhraoui.phone,
      campaign: "Solar Elite",
      queue: "File reactivation",
      result: "RDV pris",
      summary:
        "Rendez-vous confirme vendredi avec le commercial senior apres transfert reussi.",
      status: "appointment",
      prospect: MOCK_PROSPECTS.leilaKhadhraoui,
    },
    {
      id: "history-04",
      date: today,
      time: "13:22",
      clientName: prospectFullName(MOCK_PROSPECTS.imedTriki),
      phone: MOCK_PROSPECTS.imedTriki.phone,
      campaign: "Eco Habitat",
      queue: "File reprise chaude",
      result: "Refus",
      summary:
        "Refus explicite. Prospect archive et etiquette dans la liste rouge interne.",
      status: "refused",
      prospect: MOCK_PROSPECTS.imedTriki,
    },
    {
      id: "history-05",
      date: today,
      time: "15:05",
      clientName: prospectFullName(MOCK_PROSPECTS.nourGharbi),
      phone: MOCK_PROSPECTS.nourGharbi.phone,
      campaign: "NAT ISA",
      queue: "File reprise chaude",
      result: "Rappel",
      summary:
        "La prospecte demande un retour en fin de journee apres consultation du devis.",
      status: "follow_up",
      prospect: MOCK_PROSPECTS.nourGharbi,
    },
    {
      id: "history-06",
      date: today,
      time: "17:18",
      clientName: prospectFullName(MOCK_PROSPECTS.walidDridi),
      phone: MOCK_PROSPECTS.walidDridi.phone,
      campaign: "Eco Habitat",
      queue: "File outbound premium",
      result: "Repondeur",
      summary:
        "Repondeur detecte. Aucun message laisse pour rester sur le rythme de production.",
      status: "voicemail",
      prospect: MOCK_PROSPECTS.walidDridi,
    },
    {
      id: "history-07",
      date: shiftDate(today, -1),
      time: "09:32",
      clientName: prospectFullName(MOCK_PROSPECTS.sarraHamdi),
      phone: MOCK_PROSPECTS.sarraHamdi.phone,
      campaign: "NAT ISA",
      queue: "File EMY ecologie",
      result: "Vente refusee",
      summary:
        "La vente n'a pas ete conclue apres objection budgetaire, sans demande de rappel.",
      status: "refused",
      prospect: MOCK_PROSPECTS.sarraHamdi,
    },
    {
      id: "history-08",
      date: shiftDate(today, -1),
      time: "12:10",
      clientName: prospectFullName(MOCK_PROSPECTS.bilelHadded),
      phone: MOCK_PROSPECTS.bilelHadded.phone,
      campaign: "Eco Habitat",
      queue: "File reprise chaude",
      result: "Rappel",
      summary:
        "Le prospect demande une reprise en soiree apres verification avec son associe.",
      status: "follow_up",
      prospect: MOCK_PROSPECTS.bilelHadded,
    },
    {
      id: "history-09",
      date: shiftDate(today, -2),
      time: "10:40",
      clientName: prospectFullName(MOCK_PROSPECTS.asmaTrabelsi),
      phone: MOCK_PROSPECTS.asmaTrabelsi.phone,
      campaign: "Solar Elite",
      queue: "File reactivation",
      result: "Qualification",
      summary:
        "Le besoin a ete requalifie mais le prospect reste en attente d'une proposition technique detaillee.",
      status: "completed",
      prospect: MOCK_PROSPECTS.asmaTrabelsi,
    },
  ];
}

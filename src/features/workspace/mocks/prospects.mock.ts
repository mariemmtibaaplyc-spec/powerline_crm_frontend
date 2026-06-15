import type { ProspectSheet } from "@/types/workspace.types";

export const MOCK_PROSPECTS = {
  meriemAbbassi: {
    id: "prospect-meriem-abbassi",
    firstName: "Meriem",
    lastName: "Abbassi",
    phone: "+216 28 441 020",
    phoneSecondary: "+216 24 612 389",
    email: "meriem.abbassi@powerline.test",
    address: "Residence Ennour, rue des Jasmins",
    postalCode: "2080",
    city: "Ariana",
    comments:
      "Prospect joignable en fin de matinee. Interesse par une presentation rapide du service et un rappel commercial sous 48h.",
  },
  samiBenAmor: {
    id: "prospect-sami-ben-amor",
    firstName: "Sami",
    lastName: "Ben Amor",
    phone: "+216 24 612 389",
    phoneSecondary: "+216 28 441 020",
    email: "sami.benamor@powerline.test",
    address: "Cite El Khadra, immeuble 4",
    postalCode: "1003",
    city: "Tunis",
    comments:
      "Demande un second contact apres validation familiale. Priorite a la qualification budgetaire et au calendrier de decision.",
  },
  leilaKhadhraoui: {
    id: "prospect-leila-khadhraoui",
    firstName: "Leila",
    lastName: "Khadhraoui",
    phone: "+216 26 381 004",
    phoneSecondary: "+216 23 814 922",
    email: "leila.khadhraoui@powerline.test",
    address: "Rue de la Gare, residence El Wafa",
    postalCode: "2013",
    city: "Ben Arous",
    comments:
      "Attente principale: disponibilite technique et delai d'installation. Le recapitulatif a deja ete envoye.",
  },
  imedTriki: {
    id: "prospect-imed-triki",
    firstName: "Imed",
    lastName: "Triki",
    phone: "+216 21 509 177",
    phoneSecondary: "+216 28 931 650",
    email: "imed.triki@powerline.test",
    address: "Residence El Manar, bloc C",
    postalCode: "2092",
    city: "El Manar",
    comments:
      "Transfert precedent interrompu. Relancer sur la valeur economique et proposer un rappel ferme en cas d'absence.",
  },
  nourGharbi: {
    id: "prospect-nour-gharbi",
    firstName: "Nour",
    lastName: "Gharbi",
    phone: "+216 27 901 115",
    phoneSecondary: "+216 52 880 114",
    email: "nour.gharbi@powerline.test",
    address: "Rue Ibn Khaldoun, residence Assil",
    postalCode: "2037",
    city: "La Marsa",
    comments:
      "Souhaite un contact en fin de journee apres lecture des tarifs. Revenir sur la formule premium et la flexibilite du paiement.",
  },
  walidDridi: {
    id: "prospect-walid-dridi",
    firstName: "Walid",
    lastName: "Dridi",
    phone: "+216 22 640 317",
    phoneSecondary: "+216 26 701 204",
    email: "walid.dridi@powerline.test",
    address: "Cite Ennasr 2, avenue des Orangers",
    postalCode: "2037",
    city: "Ariana",
    comments:
      "Prospect absent plus tot dans la journee. Qualification courte attendue avant transfert commercial eventuel.",
  },
  aminaRekik: {
    id: "prospect-amina-rekik",
    firstName: "Amina",
    lastName: "Rekik",
    phone: "+216 53 880 120",
    phoneSecondary: "+216 55 002 491",
    email: "amina.rekik@powerline.test",
    address: "Residence El Amen, rue des Palmiers",
    postalCode: "4051",
    city: "Sousse",
    comments:
      "Devis envoye. La prochaine relance doit verifier sa bonne reception et le niveau d'interet reel.",
  },
  hatemJebali: {
    id: "prospect-hatem-jebali",
    firstName: "Hatem",
    lastName: "Jebali",
    phone: "+216 29 117 480",
    phoneSecondary: "+216 21 904 842",
    email: "hatem.jebali@powerline.test",
    address: "Rue El Farabi, residence Nour",
    postalCode: "3000",
    city: "Sfax",
    comments:
      "Disponible uniquement apres 15h30. Garder une qualification courte avant tout engagement commercial.",
  },
  nadiaBenSalem: {
    id: "prospect-nadia-ben-salem",
    firstName: "Nadia",
    lastName: "Ben Salem",
    phone: "+216 97 331 020",
    phoneSecondary: "+216 52 774 300",
    email: "nadia.bensalem@powerline.test",
    address: "Rue de l'Artisanat, residence Yasmine",
    postalCode: "5000",
    city: "Monastir",
    comments:
      "Rappel reporte de la veille. A traiter avant midi avec un angle centre sur la reduction de facture.",
  },
  firasMami: {
    id: "prospect-firas-mami",
    firstName: "Firas",
    lastName: "Mami",
    phone: "+216 93 440 002",
    phoneSecondary: "+216 28 110 700",
    email: "firas.mami@powerline.test",
    address: "Rue des Entrepreneurs, immeuble Horizon",
    postalCode: "3027",
    city: "Sfax",
    comments:
      "Prospect disponible le matin seulement. Valider l'interet et tenter une prise de rendez-vous si la discussion avance.",
  },
  sarraHamdi: {
    id: "prospect-sarra-hamdi",
    firstName: "Sarra",
    lastName: "Hamdi",
    phone: "+216 54 621 208",
    phoneSecondary: "+216 26 812 994",
    email: "sarra.hamdi@powerline.test",
    address: "Residence Rym, avenue Habib Bourguiba",
    postalCode: "6000",
    city: "Gabes",
    comments:
      "Suite a une premiere presentation. Le rappel doit insister sur le gain economique et les delais d'installation.",
  },
  bilelHadded: {
    id: "prospect-bilel-hadded",
    firstName: "Bilel",
    lastName: "Hadded",
    phone: "+216 29 380 611",
    phoneSecondary: "+216 22 700 191",
    email: "bilel.hadded@powerline.test",
    address: "Rue des Jasmins, residence El Hana",
    postalCode: "4011",
    city: "Hammam Sousse",
    comments:
      "Verifier que le prospect reste decisionnaire principal avant de poursuivre la relance commerciale.",
  },
  asmaTrabelsi: {
    id: "prospect-asma-trabelsi",
    firstName: "Asma",
    lastName: "Trabelsi",
    phone: "+216 26 710 904",
    phoneSecondary: "+216 98 611 041",
    email: "asma.trabelsi@powerline.test",
    address: "Rue de la Republique, residence Carthage",
    postalCode: "7000",
    city: "Bizerte",
    comments:
      "Qualification deja menee. La prochaine reprise doit repartir du recap technique.",
  },
  hamzaBenYoussef: {
    id: "prospect-hamza-ben-youssef",
    firstName: "Hamza",
    lastName: "Ben Youssef",
    phone: "+216 95 110 441",
    phoneSecondary: "+216 24 630 282",
    email: "hamza.benyoussef@powerline.test",
    address: "Rue des Fleurs, residence Elya",
    postalCode: "8030",
    city: "Grombalia",
    comments:
      "Verifier la lecture des informations envoyees et cadrer une nouvelle disponibilite de relance.",
  },
  inesBouslama: {
    id: "prospect-ines-bouslama",
    firstName: "Ines",
    lastName: "Bouslama",
    phone: "+216 24 431 550",
    phoneSecondary: "+216 21 404 781",
    email: "ines.bouslama@powerline.test",
    address: "Avenue des Pins, residence Salima",
    postalCode: "2074",
    city: "Mourouj",
    comments:
      "Echange initial trop court. Reprendre sur les usages actuels et la maturite du projet avant tout transfert.",
  },
  mouradChaabane: {
    id: "prospect-mourad-chaabane",
    firstName: "Mourad",
    lastName: "Chaabane",
    phone: "+216 98 501 270",
    phoneSecondary: "+216 55 881 710",
    email: "mourad.chaabane@powerline.test",
    address: "Rue du Lac, residence Azure",
    postalCode: "1053",
    city: "Les Berges du Lac",
    comments:
      "Derniere tentative de reprise avant report. Garder un discours bref et qualifier rapidement la disponibilite.",
  },
} satisfies Record<string, ProspectSheet>;

export const DEFAULT_AGENT_PROSPECT = MOCK_PROSPECTS.meriemAbbassi;

export function createUnknownManualCallProspect(phone: string): ProspectSheet {
  return {
    id: `prospect-unknown-${phone.replace(/[^0-9*#]+/g, "") || "manual"}`,
    firstName: "Numero",
    lastName: "inconnu",
    phone,
    phoneSecondary: "",
    email: "",
    address: "",
    postalCode: "",
    city: "",
    comments:
      "Aucune fiche client connue pour ce numero. Verifier l'origine de l'appel puis qualifier manuellement avant creation de fiche.",
  };
}

export const MOCK_PROSPECTS_BY_PHONE = Object.values(MOCK_PROSPECTS).reduce<
  Record<string, ProspectSheet>
>((accumulator, prospect) => {
  accumulator[prospect.phone] = prospect;
  return accumulator;
}, {});

export function findMockProspectByPhone(phone: string) {
  return MOCK_PROSPECTS_BY_PHONE[phone] ?? null;
}

import type {
  UserFormValues,
  UserRecord,
  UserRole,
  UserStatus,
} from "@/types/user.types";

export const USER_ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: "admin", label: "Admin" },
  { value: "supervisor", label: "Superviseur" },
  { value: "agent", label: "Agent" },
];

export const USER_STATUS_OPTIONS: Array<{ value: UserStatus; label: string }> = [
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
  { value: "suspended", label: "Suspendu" },
];

export const USER_TEAMS = [
  "Administration CRM",
  "Supervision Plateau",
  "Outbound Energie",
  "Outbound Solaire",
  "Retention Premium",
  "Support & Qualite",
] as const;

export const USER_GROUPS = [
  "Control room",
  "NAT ISA",
  "Solar Elite",
  "Eco Habitat",
  "Support CRM",
  "EMY ecologie",
] as const;

export const USER_CAMPAIGNS = [
  "NAT ISA",
  "Solar Elite",
  "Eco Habitat",
  "Retargeting printemps",
  "Reactivation premium",
] as const;

export const MOCK_USERS: UserRecord[] = [
  {
    id: "usr-admin-001",
    firstName: "Nadia",
    lastName: "Khemiri",
    email: "nadia.khemiri@powerline.test",
    username: "nadia.k",
    role: "admin",
    team: "Administration CRM",
    status: "active",
    createdAt: "2026-01-08",
    lastActivity: "Aujourd'hui 11:42",
  },
  {
    id: "usr-admin-002",
    firstName: "Karim",
    lastName: "Mansouri",
    email: "karim.mansouri@powerline.test",
    username: "karim.m",
    role: "admin",
    team: "Administration CRM",
    status: "active",
    createdAt: "2026-01-11",
    lastActivity: "Aujourd'hui 10:18",
  },
  {
    id: "usr-sup-001",
    firstName: "Leila",
    lastName: "Trabelsi",
    email: "leila.trabelsi@powerline.test",
    username: "leila.t",
    role: "supervisor",
    team: "Supervision Plateau",
    status: "active",
    createdAt: "2026-02-02",
    lastActivity: "Aujourd'hui 09:55",
  },
  {
    id: "usr-sup-002",
    firstName: "Yassine",
    lastName: "Brahmi",
    email: "yassine.brahmi@powerline.test",
    username: "yassine.b",
    role: "supervisor",
    team: "Supervision Plateau",
    status: "inactive",
    createdAt: "2026-02-14",
    lastActivity: "23/04/2026 16:20",
  },
  {
    id: "usr-agent-001",
    firstName: "Meriem",
    lastName: "Abbassi",
    email: "meriem.abbassi@powerline.test",
    username: "agent014",
    role: "agent",
    team: "Outbound Energie",
    status: "active",
    createdAt: "2026-02-18",
    lastActivity: "Aujourd'hui 08:51",
  },
  {
    id: "usr-agent-002",
    firstName: "Sami",
    lastName: "Ben Amor",
    email: "sami.benamor@powerline.test",
    username: "sami.ba",
    role: "agent",
    team: "Outbound Solaire",
    status: "active",
    createdAt: "2026-02-20",
    lastActivity: "Aujourd'hui 10:04",
  },
  {
    id: "usr-agent-003",
    firstName: "Nour",
    lastName: "Gharbi",
    email: "nour.gharbi@powerline.test",
    username: "nour.g",
    role: "agent",
    team: "Retention Premium",
    status: "suspended",
    createdAt: "2026-03-04",
    lastActivity: "21/04/2026 14:09",
  },
  {
    id: "usr-agent-004",
    firstName: "Walid",
    lastName: "Dridi",
    email: "walid.dridi@powerline.test",
    username: "walid.d",
    role: "agent",
    team: "Support & Qualite",
    status: "inactive",
    createdAt: "2026-03-10",
    lastActivity: "20/04/2026 18:31",
  },
];

export function getRoleLabel(role: UserRole) {
  return USER_ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;
}

export function getStatusLabel(status: UserStatus) {
  return USER_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function getUserFullName(user: Pick<UserRecord, "firstName" | "lastName">) {
  return `${user.firstName} ${user.lastName}`;
}

export function createUserPayload(values: UserFormValues): UserRecord {
  return {
    id: `usr-${Date.now()}`,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    username: values.username.trim(),
    role: values.role as UserRole,
    team: values.team,
    status: values.status,
    createdAt: new Date().toISOString().slice(0, 10),
    lastActivity: "Jamais connecte",
  };
}

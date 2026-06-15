"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { USER_STATUS_OPTIONS } from "@/features/users/mocks/users.mock";
import { createUserSchema, updateUserSchema } from "@/features/users/schemas/user.schema";
import type { RoleOption, TeamOption, UserFormValues } from "@/types/user.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const emptyValues: UserFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  role: "",
  team: "",
  status: "active",
  password: "",
};

interface UserFormProps {
  mode: "create" | "edit";
  initialValues?: UserFormValues;
  roles?: RoleOption[];
  teams?: TeamOption[];
  onSubmit: (values: UserFormValues) => Promise<void> | void;
}

function normalizeFormValues(values?: UserFormValues): UserFormValues {
  return {
    firstName: values?.firstName ?? "",
    lastName: values?.lastName ?? "",
    email: values?.email ?? "",
    username: values?.username ?? "",
    role: values?.role ?? "",
    team: values?.team ?? "",
    status: values?.status ?? "active",
    password: values?.password ?? "",
  };
}

export function UserForm({
  mode,
  initialValues = emptyValues,
  roles = [],
  teams = [],
  onSubmit,
}: UserFormProps) {
  const [values, setValues] = useState<UserFormValues>(() =>
    normalizeFormValues(initialValues),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = mode === "create" ? createUserSchema : updateUserSchema;
  const hasRoles = roles.length > 0;
  const hasTeams = teams.length > 0;
  const roleValue = values.role ?? "";
  const teamValue = values.team ?? "";
  const selectedRoleExists = roles.some((role) => role.id === roleValue);
  const selectedTeamExists = teams.some((team) => team.id === teamValue);

  useEffect(() => {
    setValues(normalizeFormValues(initialValues));
  }, [initialValues]);

  useEffect(() => {
    const matchingRole = roles.find(
      (role) =>
        role.id === roleValue ||
        role.name.trim().toLowerCase() === roleValue.trim().toLowerCase(),
    );
    const matchingTeam = teams.find(
      (team) =>
        team.id === teamValue ||
        team.name.trim().toLowerCase() === teamValue.trim().toLowerCase(),
    );

    if (!roleValue && mode === "create" && roles[0]) {
      setValues((current) => ({
        ...current,
        role: roles[0]?.id ?? "",
      }));
    } else if (matchingRole && matchingRole.id !== roleValue) {
      setValues((current) => ({
        ...current,
        role: matchingRole.id,
      }));
    }

    if (!teamValue && mode === "create" && teams[0]) {
      setValues((current) => ({
        ...current,
        team: teams[0]?.id ?? "",
      }));
    } else if (matchingTeam && matchingTeam.id !== teamValue) {
      setValues((current) => ({
        ...current,
        team: matchingTeam.id,
      }));
    }
  }, [mode, roleValue, teamValue, roles, teams]);

  const handleFieldChange = <Key extends keyof UserFormValues>(
    key: Key,
    value: UserFormValues[Key],
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = schema.safeParse(values);

    if (!result.success) {
      const nextErrors: Record<string, string> = {};

      for (const [key, value] of Object.entries(result.error.flatten().fieldErrors)) {
        if (value?.[0]) {
          nextErrors[key] = value[0];
        }
      }

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        ...result.data,
        team: result.data.team ?? "",
      });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "fieldErrors" in error &&
        error.fieldErrors &&
        typeof error.fieldErrors === "object"
      ) {
        setErrors(error.fieldErrors as Record<string, string>);
      }

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Impossible de creer l utilisateur pour le moment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Creer un utilisateur" : "Modifier l utilisateur"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Formulaire simple de creation d un compte admin, superviseur ou agent."
            : "Mise a jour des informations essentielles du compte utilisateur."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Login"
              error={errors.username}
              input={
                <Input
                  value={values.username ?? ""}
                  onChange={(event) => handleFieldChange("username", event.target.value)}
                  placeholder="Nom d utilisateur"
                />
              }
            />
            <Field
              label="Prenom"
              error={errors.firstName}
              input={
                <Input
                  value={values.firstName ?? ""}
                  onChange={(event) => handleFieldChange("firstName", event.target.value)}
                  placeholder="Prenom"
                />
              }
            />
            <Field
              label="Nom"
              error={errors.lastName}
              input={
                <Input
                  value={values.lastName ?? ""}
                  onChange={(event) => handleFieldChange("lastName", event.target.value)}
                  placeholder="Nom"
                />
              }
            />
            <Field
              label="Role"
              error={errors.role}
              input={
                <Select
                  value={roleValue}
                  disabled={!hasRoles}
                  className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                  onChange={(event) => handleFieldChange("role", event.target.value)}
                >
                  {hasRoles ? (
                    <>
                      {!selectedRoleExists && roleValue ? (
                        <option value={roleValue}>{roleValue}</option>
                      ) : null}
                      <option value="" disabled>
                        Selectionner un role
                      </option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="">Aucun role disponible</option>
                  )}
                </Select>
              }
            />
            <Field
              label="Statut"
              error={errors.status}
              input={
                <Select
                  value={values.status ?? "active"}
                  className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                  onChange={(event) => handleFieldChange("status", event.target.value as UserFormValues["status"])}
                >
                  {USER_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              }
            />
            <Field
              label="Email"
              error={errors.email}
              input={
                <Input
                  value={values.email ?? ""}
                  onChange={(event) => handleFieldChange("email", event.target.value)}
                  placeholder="Email optionnel"
                />
              }
            />
            <Field
              label="Equipe"
              error={errors.team}
              input={
                <Select
                  value={teamValue}
                  disabled={!hasTeams}
                  className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                  onChange={(event) => handleFieldChange("team", event.target.value)}
                >
                  {hasTeams ? (
                    <>
                      {!selectedTeamExists && teamValue ? (
                        <option value={teamValue}>{teamValue}</option>
                      ) : null}
                      <option value="">Aucune equipe</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="">Aucune equipe disponible</option>
                  )}
                </Select>
              }
            />
            {mode === "create" ? (
              <Field
                label="Mot de passe"
                error={errors.password}
                input={
                  <Input
                    type="password"
                    value={values.password ?? ""}
                    onChange={(event) => handleFieldChange("password", event.target.value)}
                    placeholder="Mot de passe"
                  />
                }
              />
            ) : null}
          </div>

          {submitError ? (
            <div className="rounded-[1rem] border border-[#ffb8ad] bg-[#fff1ef] px-4 py-3 text-sm text-[#8c2c21]">
              {submitError}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#edf2f7] pt-5">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Enregistrement..."
                : mode === "create"
                  ? "Creer l utilisateur"
                  : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  input,
  error,
}: {
  label: string;
  input: ReactNode;
  error?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-[#24415d]">{label}</span>
      {input}
      {error ? <span className="block text-xs text-[#b55a72]">{error}</span> : null}
    </label>
  );
}

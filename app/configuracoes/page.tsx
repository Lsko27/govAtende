"use client";

import { ArrowLeft, Save, Settings2, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  use,
  useEffect,
  useState,
} from "react";
import Swal from "sweetalert2";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AccountVariant = "cidadao" | "servidor";

type SettingsPageProps = {
  searchParams: Promise<{
    perfil?: string;
  }>;
};

type AccountProfile = {
  id: number;
  nome: string;
  email: string;
  telefone?: string | null;
  cpfMascarado?: string | null;
  matricula?: string | null;
  cargo?: string | null;
  dataCadastro: string;
  ativo: boolean;
  perfil: "SERVIDOR" | "AUDITOR";
};

type CitizenForm = {
  nome: string;
  email: string;
  telefone: string;
};

type FormErrors = Partial<Record<keyof CitizenForm, string>>;

type SettingsFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  autoComplete?: string;
  readOnly?: boolean;
  error?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatDate = (value?: string) => {
  if (!value) {
    return "Não informada";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(date);
};

const getApiError = async (response: Response, fallback: string) => {
  const body = await response.json().catch(() => null);

  return body?.detail || body?.message || fallback;
};

const SettingsField = ({
  id,
  label,
  value,
  placeholder,
  type = "text",
  maxLength,
  autoComplete,
  readOnly = false,
  error,
  onChange,
}: SettingsFieldProps) => {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-blue-950">
        {label}
      </label>

      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        readOnly={readOnly}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={onChange}
        className={`
          h-11 bg-white
          ${readOnly ? "cursor-default bg-zinc-100 text-zinc-600" : ""}
          ${error ? "border-red-500 focus-visible:ring-red-500" : ""}
        `}
      />

      {error && (
        <p id={errorId} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

const SettingsPage = ({ searchParams }: SettingsPageProps) => {
  const router = useRouter();

  const { perfil } = use(searchParams);

  const variant: AccountVariant =
    perfil === "servidor" ? "servidor" : "cidadao";

  const isCitizen = variant === "cidadao";

  const profileEndpoint = isCitizen
    ? "/api/backend/cidadaos/me"
    : "/api/backend/servidor/me";

  const loginHref = isCitizen ? "/" : "/servidor";

  const backHref = isCitizen ? "/servicos" : "/servidor/dashboard";

  const [profile, setProfile] = useState<AccountProfile | null>(null);

  const [form, setForm] = useState<CitizenForm>({
    nome: "",
    email: "",
    telefone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [pageError, setPageError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setPageError("");
        setErrors({});
        setProfile(null);

        const response = await fetch(profileEndpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          router.replace(loginHref);
          router.refresh();
          return;
        }

        if (!response.ok) {
          throw new Error(
            await getApiError(
              response,
              "Não foi possível carregar os dados da conta.",
            ),
          );
        }

        const data = (await response.json()) as AccountProfile;

        setProfile(data);

        if (isCitizen) {
          setForm({
            nome: data.nome ?? "",
            email: data.email ?? "",
            telefone: formatPhone(data.telefone ?? ""),
          });
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setPageError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados da conta.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      controller.abort();
    };
  }, [isCitizen, loginHref, profileEndpoint, router]);

  const validateForm = () => {
    const validationErrors: FormErrors = {};
    const name = form.nome.trim();
    const email = form.email.trim();
    const phoneDigits = form.telefone.replace(/\D/g, "");

    if (!name) {
      validationErrors.nome = "Informe o nome.";
    } else if (name.length > 150) {
      validationErrors.nome = "O nome deve possuir no máximo 150 caracteres.";
    }

    if (!email) {
      validationErrors.email = "Informe o e-mail.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.email = "Informe um e-mail válido.";
    } else if (email.length > 150) {
      validationErrors.email =
        "O e-mail deve possuir no máximo 150 caracteres.";
    }

    if (
      phoneDigits.length > 0 &&
      phoneDigits.length !== 10 &&
      phoneDigits.length !== 11
    ) {
      validationErrors.telefone = "O telefone deve possuir 10 ou 11 dígitos.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isCitizen || !validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/backend/cidadaos/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          telefone: form.telefone.replace(/\D/g, "") || null,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/");
        router.refresh();
        return;
      }

      if (!response.ok) {
        throw new Error(
          await getApiError(
            response,
            "Não foi possível atualizar os dados da conta.",
          ),
        );
      }

      const updatedProfile = (await response.json()) as AccountProfile;

      setProfile(updatedProfile);

      setForm({
        nome: updatedProfile.nome,
        email: updatedProfile.email,
        telefone: formatPhone(updatedProfile.telefone ?? ""),
      });

      await Swal.fire({
        icon: "success",
        title: "Dados atualizados!",
        text: "As alterações da sua conta foram salvas.",
        confirmButtonText: "OK",
        confirmButtonColor: "#172554",
      });

      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Erro ao atualizar",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar os dados da conta.",
        confirmButtonText: "OK",
        confirmButtonColor: "#172554",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Desativar sua conta?",
      text:
        "Você perderá o acesso ao GovAtende e precisará " +
        "solicitar a reativação da conta para entrar novamente.",
      showCancelButton: true,
      confirmButtonText: "Sim, desativar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#71717a",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setIsDeactivating(true);

    try {
      const response = await fetch("/api/backend/cidadaos/me/desativar", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/");
        router.refresh();
        return;
      }

      if (!response.ok) {
        throw new Error(
          await getApiError(response, "Não foi possível desativar a conta."),
        );
      }

      await fetch("/api/auth/logout", {
        method: "POST",
      });

      await Swal.fire({
        icon: "success",
        title: "Conta desativada",
        text: "Sua sessão foi encerrada com segurança.",
        confirmButtonText: "OK",
        confirmButtonColor: "#172554",
      });

      router.replace("/");
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Erro ao desativar",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível desativar a conta.",
        confirmButtonText: "OK",
        confirmButtonColor: "#172554",
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <>
      <Navbar
        authenticated
        variant={variant}
        userName={profile?.nome}
        userRole={isCitizen ? "Cidadão" : (profile?.cargo ?? "Servidor")}
        userProfile={isCitizen ? undefined : profile?.perfil}
      />

      <main className="min-h-[calc(100vh-73px)] bg-zinc-100 px-4 py-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-blue-950 p-3 text-white">
              <Settings2 className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-blue-950">
                Configurações da conta
              </h1>

              <p className="mt-1 text-sm text-zinc-600">
                {isCitizen
                  ? "Gerencie seus dados pessoais e as configurações da sua conta."
                  : "Consulte os dados vinculados ao seu acesso de servidor."}
              </p>
            </div>
          </div>

          {isLoading && (
            <Card>
              <CardContent className="flex min-h-64 items-center justify-center">
                <div className="flex items-center gap-3 text-zinc-600">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-950 border-t-transparent" />

                  <span>Carregando configurações...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && pageError && (
            <Card>
              <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
                <p className="text-red-600">{pageError}</p>

                <Button type="button" onClick={() => window.location.reload()}>
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && !pageError && profile && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6 flex flex-col justify-between gap-3 border-b pb-5 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-blue-950">
                        Dados da conta
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        Conta criada em {formatDate(profile.dataCadastro)}
                      </p>
                    </div>

                    <div
                      className={`
                          flex w-fit items-center gap-2
                          rounded-full px-3 py-1
                          text-xs font-semibold
                          ${
                            profile.ativo
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }
                        `}
                    >
                      <ShieldCheck className="h-4 w-4" />

                      {profile.ativo ? "Conta ativa" : "Conta inativa"}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-5 md:grid-cols-2">
                      <SettingsField
                        id="nome"
                        label="Nome completo"
                        value={isCitizen ? form.nome : profile.nome}
                        maxLength={150}
                        autoComplete="name"
                        readOnly={!isCitizen}
                        error={isCitizen ? errors.nome : undefined}
                        onChange={
                          isCitizen
                            ? (event) => {
                                setForm((current) => ({
                                  ...current,
                                  nome: event.target.value,
                                }));

                                setErrors((current) => ({
                                  ...current,
                                  nome: undefined,
                                }));
                              }
                            : undefined
                        }
                      />

                      {isCitizen ? (
                        <SettingsField
                          id="cpf"
                          label="CPF"
                          value={profile.cpfMascarado ?? "CPF não informado"}
                          readOnly
                        />
                      ) : (
                        <SettingsField
                          id="matricula"
                          label="Matrícula"
                          value={profile.matricula ?? "Matrícula não informada"}
                          readOnly
                        />
                      )}

                      <SettingsField
                        id="email"
                        label="E-mail"
                        type="email"
                        value={isCitizen ? form.email : profile.email}
                        maxLength={150}
                        autoComplete="email"
                        readOnly={!isCitizen}
                        error={isCitizen ? errors.email : undefined}
                        onChange={
                          isCitizen
                            ? (event) => {
                                setForm((current) => ({
                                  ...current,
                                  email: event.target.value,
                                }));

                                setErrors((current) => ({
                                  ...current,
                                  email: undefined,
                                }));
                              }
                            : undefined
                        }
                      />

                      {isCitizen ? (
                        <SettingsField
                          id="telefone"
                          label="Telefone"
                          value={form.telefone}
                          placeholder="(11) 99999-9999"
                          maxLength={15}
                          autoComplete="tel"
                          error={errors.telefone}
                          onChange={(event) => {
                            setForm((current) => ({
                              ...current,
                              telefone: formatPhone(event.target.value),
                            }));

                            setErrors((current) => ({
                              ...current,
                              telefone: undefined,
                            }));
                          }}
                        />
                      ) : (
                        <SettingsField
                          id="cargo"
                          label="Cargo"
                          value={profile.cargo ?? "Cargo não informado"}
                          readOnly
                        />
                      )}
                    </div>

                    {!isCitizen && (
                      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                        Os dados do servidor são administrados pelo órgão
                        público. Para solicitar uma alteração, entre em contato
                        com o administrador do sistema.
                      </div>
                    )}

                    <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t pt-5 sm:flex-row">
                      <Button variant="outline" asChild>
                        <Link href={backHref}>
                          <ArrowLeft className="h-4 w-4" />
                          Voltar
                        </Link>
                      </Button>

                      {isCitizen && (
                        <Button
                          type="submit"
                          disabled={isSaving}
                          className="bg-blue-950 hover:bg-blue-900"
                        >
                          {isSaving ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}

                          {isSaving ? "Salvando..." : "Salvar alterações"}
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {isCitizen && (
                <Card className="border-red-200">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-red-700">
                      Zona de segurança
                    </h2>

                    <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-medium text-zinc-900">
                          Desativar minha conta
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          Sua conta será desativada e a sessão atual será
                          encerrada.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        disabled={isDeactivating}
                        onClick={() => void handleDeactivateAccount()}
                      >
                        {isDeactivating ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}

                        {isDeactivating ? "Desativando..." : "Desativar conta"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default SettingsPage;

"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  Filter,
  RefreshCw,
  RotateCcw,
  ScrollText,
  ShieldCheck,
} from "lucide-react";

import Navbar from "@/components/navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TipoAtorAuditoria = "CIDADAO" | "SERVIDOR" | "AUDITOR" | "SISTEMA";

type AcaoAuditoria =
  | "LOGIN"
  | "CRIACAO_AUDITOR"
  | "CONSULTA_DADOS_PESSOAIS"
  | "ATUALIZACAO_PERFIL"
  | "DESATIVACAO_CIDADAO"
  | "CANCELAMENTO_SOLICITACAO"
  | "ALTERACAO_STATUS_SOLICITACAO"
  | "CONSULTA_RELATORIO"
  | "EXPORTACAO_RELATORIO"
  | "DOWNLOAD_ANEXO"
  | "CONSULTA_AUDITORIA"
  | "EXCLUSAO_REGISTRO"
  | "ACESSO_NEGADO";

type TipoRecursoAuditoria =
  | "CIDADAO"
  | "SERVIDOR"
  | "SOLICITACAO"
  | "ANEXO"
  | "RELATORIO"
  | "AUDITORIA"
  | "API";

type ResultadoAuditoria = "SUCESSO" | "NEGADO" | "ERRO";

type PerfilServidor = "SERVIDOR" | "AUDITOR";

type ServidorProfile = {
  id: number;
  nome: string;
  matricula: string;
  email: string;
  cargo: string;
  perfil: PerfilServidor;
  ativo: boolean;
};

type RegistroAuditoria = {
  id: number;
  tipoAtor: TipoAtorAuditoria;
  atorId: number | null;
  acao: AcaoAuditoria;
  tipoRecurso: TipoRecursoAuditoria;
  recursoId: string | null;
  valorAnterior: string | null;
  valorNovo: string | null;
  resultado: ResultadoAuditoria;
  metodoHttp: string | null;
  endpoint: string | null;
  enderecoIp: string | null;
  detalhe: string | null;
  dataEvento: string;
};

type PaginaAuditoria = {
  registros: RegistroAuditoria[];
  paginaAtual: number;
  tamanhoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  primeiraPagina: boolean;
  ultimaPagina: boolean;
};

type AuditFilters = {
  inicio: string;
  fim: string;
  tipoAtor: TipoAtorAuditoria | "TODOS";
  atorId: string;
  acao: AcaoAuditoria | "TODOS";
  tipoRecurso: TipoRecursoAuditoria | "TODOS";
  recursoId: string;
  resultado: ResultadoAuditoria | "TODOS";
};

const initialFilters: AuditFilters = {
  inicio: "",
  fim: "",
  tipoAtor: "TODOS",
  atorId: "",
  acao: "TODOS",
  tipoRecurso: "TODOS",
  recursoId: "",
  resultado: "TODOS",
};

const actorLabels: Record<TipoAtorAuditoria, string> = {
  CIDADAO: "Cidadão",
  SERVIDOR: "Servidor",
  AUDITOR: "Auditor",
  SISTEMA: "Sistema",
};

const actionLabels: Record<AcaoAuditoria, string> = {
  LOGIN: "Login",
  CRIACAO_AUDITOR: "Criação de auditor",
  CONSULTA_DADOS_PESSOAIS: "Consulta de dados pessoais",
  ATUALIZACAO_PERFIL: "Atualização de perfil",
  DESATIVACAO_CIDADAO: "Desativação de cidadão",
  CANCELAMENTO_SOLICITACAO: "Cancelamento de solicitação",
  ALTERACAO_STATUS_SOLICITACAO: "Alteração de status",
  CONSULTA_RELATORIO: "Consulta de relatório",
  EXPORTACAO_RELATORIO: "Exportação de relatório",
  DOWNLOAD_ANEXO: "Download de anexo",
  CONSULTA_AUDITORIA: "Consulta da auditoria",
  EXCLUSAO_REGISTRO: "Exclusão de registro",
  ACESSO_NEGADO: "Acesso negado",
};

const resourceLabels: Record<TipoRecursoAuditoria, string> = {
  CIDADAO: "Cidadão",
  SERVIDOR: "Servidor",
  SOLICITACAO: "Solicitação",
  ANEXO: "Anexo",
  RELATORIO: "Relatório",
  AUDITORIA: "Auditoria",
  API: "API",
};

const resultLabels: Record<ResultadoAuditoria, string> = {
  SUCESSO: "Sucesso",
  NEGADO: "Negado",
  ERRO: "Erro",
};

const actions = Object.keys(actionLabels) as AcaoAuditoria[];

const actors = Object.keys(actorLabels) as TipoAtorAuditoria[];

const resources = Object.keys(resourceLabels) as TipoRecursoAuditoria[];

const results = Object.keys(resultLabels) as ResultadoAuditoria[];

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
};

const getApiError = async (response: Response, fallback: string) => {
  const body = await response.json().catch(() => null);

  return body?.detail || body?.message || fallback;
};

const getResultClassName = (result: ResultadoAuditoria) => {
  switch (result) {
    case "SUCESSO":
      return ["border-emerald-200", "bg-emerald-50", "text-emerald-700"].join(
        " ",
      );

    case "NEGADO":
      return ["border-red-200", "bg-red-50", "text-red-700"].join(" ");

    case "ERRO":
      return ["border-amber-200", "bg-amber-50", "text-amber-700"].join(" ");
  }
};

const AuditPage = () => {
  const router = useRouter();

  const [profile, setProfile] = useState<ServidorProfile | null>(null);

  const [data, setData] = useState<PaginaAuditoria | null>(null);

  const [filters, setFilters] = useState<AuditFilters>({
    ...initialFilters,
  });

  const [appliedFilters, setAppliedFilters] = useState<AuditFilters>({
    ...initialFilters,
  });

  const [page, setPage] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const [pageError, setPageError] = useState("");

  const [filterError, setFilterError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
      try {
        setIsProfileLoading(true);
        setPageError("");

        const response = await fetch("/api/backend/servidor/me", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401) {
          router.replace("/servidor");
          router.refresh();
          return;
        }

        if (response.status === 403) {
          router.replace("/servidor/painel");
          router.refresh();
          return;
        }

        if (!response.ok) {
          throw new Error(
            await getApiError(response, "Não foi possível validar o perfil."),
          );
        }

        const serverProfile = (await response.json()) as ServidorProfile;

        if (serverProfile.perfil !== "AUDITOR") {
          router.replace("/servidor/painel");
          router.refresh();
          return;
        }

        setProfile(serverProfile);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setPageError(
          error instanceof Error
            ? error.message
            : "Não foi possível validar o perfil.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsProfileLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      controller.abort();
    };
  }, [router]);

  useEffect(() => {
    if (!profile || profile.perfil !== "AUDITOR") {
      return;
    }

    const controller = new AbortController();

    const loadAudits = async () => {
      try {
        setIsLoading(true);
        setPageError("");

        const params = new URLSearchParams({
          pagina: String(page),
          tamanho: "20",
        });

        if (appliedFilters.inicio) {
          params.set("inicio", appliedFilters.inicio);
        }

        if (appliedFilters.fim) {
          params.set("fim", appliedFilters.fim);
        }

        if (appliedFilters.tipoAtor !== "TODOS") {
          params.set("tipoAtor", appliedFilters.tipoAtor);
        }

        if (appliedFilters.atorId) {
          params.set("atorId", appliedFilters.atorId);
        }

        if (appliedFilters.acao !== "TODOS") {
          params.set("acao", appliedFilters.acao);
        }

        if (appliedFilters.tipoRecurso !== "TODOS") {
          params.set("tipoRecurso", appliedFilters.tipoRecurso);
        }

        if (appliedFilters.recursoId) {
          params.set("recursoId", appliedFilters.recursoId);
        }

        if (appliedFilters.resultado !== "TODOS") {
          params.set("resultado", appliedFilters.resultado);
        }

        const response = await fetch(
          `/api/backend/servidor/auditoria?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (response.status === 401) {
          router.replace("/servidor");
          router.refresh();
          return;
        }

        if (response.status === 403) {
          router.replace("/servidor/painel");
          router.refresh();
          return;
        }

        if (!response.ok) {
          throw new Error(
            await getApiError(
              response,
              "Não foi possível carregar a auditoria.",
            ),
          );
        }

        setData((await response.json()) as PaginaAuditoria);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setPageError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a auditoria.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadAudits();

    return () => {
      controller.abort();
    };
  }, [appliedFilters, page, profile, reloadKey, router]);

  const pageRecords = data?.registros ?? [];

  const deniedOnPage = useMemo(
    () => pageRecords.filter((record) => record.resultado === "NEGADO").length,
    [pageRecords],
  );

  const actorsOnPage = useMemo(
    () =>
      new Set(
        pageRecords.map((record) => `${record.tipoAtor}-${record.atorId}`),
      ).size,
    [pageRecords],
  );

  const handleFilter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (filters.inicio && filters.fim && filters.inicio > filters.fim) {
      setFilterError("A data inicial não pode ser posterior à data final.");
      return;
    }

    if (filters.atorId && Number(filters.atorId) < 1) {
      setFilterError("O ID do ator deve ser maior que zero.");
      return;
    }

    setFilterError("");
    setPage(0);
    setAppliedFilters({
      ...filters,
      atorId: filters.atorId.trim(),
      recursoId: filters.recursoId.trim(),
    });
    setReloadKey((current) => current + 1);
  };

  const handleClearFilters = () => {
    setFilters({
      ...initialFilters,
    });

    setAppliedFilters({
      ...initialFilters,
    });

    setFilterError("");
    setPage(0);
    setReloadKey((current) => current + 1);
  };

  return (
    <>
      <Navbar
        authenticated
        variant="servidor"
        userName={profile?.nome}
        userRole={profile?.cargo ?? "Governança e auditoria"}
        userProfile={profile?.perfil ?? "AUDITOR"}
      />

      <main className="min-h-[calc(100vh-73px)] bg-zinc-100 px-4 py-8">
        <div className="mx-auto w-full max-w-7xl space-y-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-950 p-3 text-white">
                <ScrollText className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-blue-950">
                  Trilha de auditoria
                </h1>

                <p className="mt-1 text-sm text-zinc-600">
                  Consulte eventos de segurança, acesso e alterações relevantes
                  do GovAtende.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading || isProfileLoading || !profile}
              onClick={() => setReloadKey((current) => current + 1)}
            >
              <RefreshCw
                className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
              />
              Atualizar
            </Button>
          </div>

          <Alert className="border-blue-200 bg-blue-50 text-blue-950">
            <ShieldCheck className="h-4 w-4" />

            <AlertTitle>Acesso restrito à governança</AlertTitle>

            <AlertDescription>
              Os registros exibem metadados das operações. Senhas, tokens, CPF,
              e-mail, conteúdo de anexos e corpos de requisição não são
              armazenados.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-blue-950">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleFilter} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="inicio">Data inicial</Label>

                    <Input
                      id="inicio"
                      type="date"
                      value={filters.inicio}
                      onChange={(event) =>
                        setFilters((current) => ({
                          ...current,
                          inicio: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fim">Data final</Label>

                    <Input
                      id="fim"
                      type="date"
                      value={filters.fim}
                      onChange={(event) =>
                        setFilters((current) => ({
                          ...current,
                          fim: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de ator</Label>

                    <Select
                      value={filters.tipoAtor}
                      onValueChange={(value) =>
                        setFilters((current) => ({
                          ...current,
                          tipoAtor: value as AuditFilters["tipoAtor"],
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="TODOS">Todos</SelectItem>

                        {actors.map((actor) => (
                          <SelectItem key={actor} value={actor}>
                            {actorLabels[actor]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="atorId">ID do ator</Label>

                    <Input
                      id="atorId"
                      type="number"
                      min={1}
                      placeholder="Ex.: 1"
                      value={filters.atorId}
                      onChange={(event) =>
                        setFilters((current) => ({
                          ...current,
                          atorId: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ação</Label>

                    <Select
                      value={filters.acao}
                      onValueChange={(value) =>
                        setFilters((current) => ({
                          ...current,
                          acao: value as AuditFilters["acao"],
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="TODOS">Todas</SelectItem>

                        {actions.map((action) => (
                          <SelectItem key={action} value={action}>
                            {actionLabels[action]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Recurso</Label>

                    <Select
                      value={filters.tipoRecurso}
                      onValueChange={(value) =>
                        setFilters((current) => ({
                          ...current,
                          tipoRecurso: value as AuditFilters["tipoRecurso"],
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="TODOS">Todos</SelectItem>

                        {resources.map((resource) => (
                          <SelectItem key={resource} value={resource}>
                            {resourceLabels[resource]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recursoId">ID do recurso</Label>

                    <Input
                      id="recursoId"
                      placeholder="Ex.: 210"
                      maxLength={100}
                      value={filters.recursoId}
                      onChange={(event) =>
                        setFilters((current) => ({
                          ...current,
                          recursoId: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Resultado</Label>

                    <Select
                      value={filters.resultado}
                      onValueChange={(value) =>
                        setFilters((current) => ({
                          ...current,
                          resultado: value as AuditFilters["resultado"],
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="TODOS">Todos</SelectItem>

                        {results.map((result) => (
                          <SelectItem key={result} value={result}>
                            {resultLabels[result]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filterError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Filtros inválidos</AlertTitle>
                    <AlertDescription>{filterError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearFilters}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Limpar
                  </Button>

                  <Button
                    type="submit"
                    className="bg-blue-950 hover:bg-blue-900"
                  >
                    <Filter className="h-4 w-4" />
                    Aplicar filtros
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {pageError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Não foi possível carregar a página</AlertTitle>
              <AlertDescription>{pageError}</AlertDescription>
            </Alert>
          )}

          {isProfileLoading ? (
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-zinc-500">Total encontrado</p>
                  <p className="mt-2 text-3xl font-bold text-blue-950">
                    {data?.totalRegistros ?? 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-zinc-500">Nesta página</p>
                  <p className="mt-2 text-3xl font-bold text-blue-950">
                    {pageRecords.length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-zinc-500">Acessos negados</p>
                  <p className="mt-2 text-3xl font-bold text-red-700">
                    {deniedOnPage}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-zinc-500">Atores na página</p>
                  <p className="mt-2 text-3xl font-bold text-blue-950">
                    {actorsOnPage}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-950">
                Registros encontrados
              </CardTitle>
            </CardHeader>

            <CardContent>
              {isLoading && !data ? (
                <div className="space-y-3">
                  {Array.from({
                    length: 6,
                  }).map((_, index) => (
                    <Skeleton key={index} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <TooltipProvider>
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data e hora</TableHead>
                          <TableHead>Ator</TableHead>
                          <TableHead>Ação</TableHead>
                          <TableHead>Recurso</TableHead>
                          <TableHead>Resultado</TableHead>
                          <TableHead>Requisição</TableHead>
                          <TableHead>Detalhe</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {pageRecords.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="h-32 text-center text-zinc-500"
                            >
                              Nenhum registro encontrado para os filtros
                              aplicados.
                            </TableCell>
                          </TableRow>
                        ) : (
                          pageRecords.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell className="whitespace-nowrap">
                                {formatDateTime(record.dataEvento)}
                              </TableCell>

                              <TableCell>
                                <p className="font-medium text-zinc-900">
                                  {actorLabels[record.tipoAtor]}
                                </p>

                                <p className="text-xs text-zinc-500">
                                  ID: {record.atorId ?? "não identificado"}
                                </p>
                              </TableCell>

                              <TableCell className="min-w-56">
                                <p className="font-medium">
                                  {actionLabels[record.acao]}
                                </p>

                                {(record.valorAnterior || record.valorNovo) && (
                                  <p className="mt-1 text-xs text-zinc-500">
                                    {record.valorAnterior ?? "—"}
                                    {" → "}
                                    {record.valorNovo ?? "—"}
                                  </p>
                                )}
                              </TableCell>

                              <TableCell>
                                <p>{resourceLabels[record.tipoRecurso]}</p>

                                <p className="max-w-52 truncate text-xs text-zinc-500">
                                  {record.recursoId ?? "Sem ID"}
                                </p>
                              </TableCell>

                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={getResultClassName(
                                    record.resultado,
                                  )}
                                >
                                  {resultLabels[record.resultado]}
                                </Badge>
                              </TableCell>

                              <TableCell className="min-w-64">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">
                                    {record.metodoHttp ?? "N/A"}
                                  </Badge>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="max-w-52 cursor-help truncate text-sm">
                                        {record.endpoint ?? "Sem endpoint"}
                                      </span>
                                    </TooltipTrigger>

                                    <TooltipContent className="max-w-sm">
                                      <p>{record.endpoint ?? "Sem endpoint"}</p>
                                      <p className="mt-1 text-xs opacity-80">
                                        IP:{" "}
                                        {record.enderecoIp ?? "não informado"}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TableCell>

                              <TableCell className="min-w-72">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="max-w-72 cursor-help truncate text-sm text-zinc-600">
                                      {record.detalhe ?? "Sem detalhes"}
                                    </p>
                                  </TooltipTrigger>

                                  <TooltipContent className="max-w-md">
                                    {record.detalhe ?? "Sem detalhes"}
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TooltipProvider>
              )}

              <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t pt-5 sm:flex-row">
                <p className="text-sm text-zinc-500">
                  Página {(data?.paginaAtual ?? 0) + 1} de{" "}
                  {Math.max(data?.totalPaginas ?? 0, 1)}
                </p>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading || !data || data.primeiraPagina}
                    onClick={() =>
                      setPage((current) => Math.max(current - 1, 0))
                    }
                  >
                    Anterior
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading || !data || data.ultimaPagina}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default AuditPage;

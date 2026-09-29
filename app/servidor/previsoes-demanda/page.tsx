"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BrainCircuit,
  Building2,
  CircleAlert,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import Navbar from "@/components/navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  PARAMETROS_PADRAO_PREVISAO,
  PrevisaoDemandaApiError,
  consultarResumoPrevisao,
  consultarUltimasPrevisoes,
  gerarPrevisaoDemanda,
  type NivelDemanda,
  type PrevisaoDemanda,
  type ResumoPrevisaoDemanda,
  type TendenciaDemanda,
} from "@/lib/previsao-demanda-api";
import TriageQueue from "@/components/triage-queue";

type ServerProfile = {
  id: number;
  nome: string;
  cargo: string;
  perfil: "SERVIDOR" | "AUDITOR";
};

const levelLabels: Record<NivelDemanda, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

const trendLabels: Record<TendenciaDemanda, string> = {
  CRESCENTE: "Crescente",
  ESTAVEL: "Estável",
  DECRESCENTE: "Decrescente",
};

const levelClasses: Record<NivelDemanda, string> = {
  BAIXA: "border-emerald-200 bg-emerald-50 text-emerald-700",
  MEDIA: "border-amber-200 bg-amber-50 text-amber-700",
  ALTA: "border-orange-200 bg-orange-50 text-orange-700",
  CRITICA: "border-red-200 bg-red-50 text-red-700",
};

const trendClasses: Record<TendenciaDemanda, string> = {
  CRESCENTE: "border-red-200 bg-red-50 text-red-700",
  ESTAVEL: "border-blue-200 bg-blue-50 text-blue-700",
  DECRESCENTE: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const formatNumber = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits,
  }).format(value);

const formatPercentage = (value: number) => `${formatNumber(value)}%`;

const formatConfidence = (value: number) =>
  formatPercentage(value <= 1 ? value * 100 : value);

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const readApiError = async (response: Response, fallback: string) => {
  const body = await response.json().catch(() => null);

  return body?.detail || body?.message || fallback;
};

const ForecastSkeleton = () => (
  <div className="mx-auto max-w-7xl space-y-6">
    <Skeleton className="h-24 w-full" />

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-32 w-full" />
      ))}
    </div>

    <Skeleton className="h-96 w-full" />
  </div>
);

const DemandForecastPage = () => {
  const router = useRouter();

  const [profile, setProfile] = useState<ServerProfile | null>(null);

  const [summary, setSummary] = useState<ResumoPrevisaoDemanda | null>(null);

  const [forecasts, setForecasts] = useState<PrevisaoDemanda[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);

  const [forceRequired, setForceRequired] = useState(false);

  const [pageError, setPageError] = useState("");

  const [operationError, setOperationError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const redirectToLogin = useCallback(() => {
    router.replace("/servidor");
    router.refresh();
  }, [router]);

  const loadForecasts = useCallback(async () => {
    const [summaryBody, forecastsBody] = await Promise.all([
      consultarResumoPrevisao(),
      consultarUltimasPrevisoes(),
    ]);

    setSummary(summaryBody);
    setForecasts(forecastsBody);
  }, []);

  const loadPage = useCallback(async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const response = await fetch("/api/backend/servidor/me", {
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        redirectToLogin();
        return;
      }

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Não foi possível carregar o perfil do servidor.",
          ),
        );
      }

      setProfile((await response.json()) as ServerProfile);

      await loadForecasts();
    } catch (error) {
      if (
        error instanceof PrevisaoDemandaApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        redirectToLogin();
        return;
      }

      setPageError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as previsões.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [loadForecasts, redirectToLogin]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  const handleGenerate = async (forceGeneration = false) => {
    setIsGenerating(true);
    setOperationError("");
    setSuccessMessage("");
    setForceRequired(false);

    try {
      const result = await gerarPrevisaoDemanda({
        ...PARAMETROS_PADRAO_PREVISAO,
        forcarGeracao: forceGeneration,
      });

      await loadForecasts();

      setSuccessMessage(
        `Previsão gerada com ${result.totalRegistrosAnalisados} registros analisados e ${result.totalPrevisoes} resultados.`,
      );
    } catch (error) {
      if (error instanceof PrevisaoDemandaApiError) {
        if (error.status === 401 || error.status === 403) {
          redirectToLogin();
          return;
        }

        setForceRequired(error.status === 409);

        setOperationError(error.message);
        return;
      }

      setOperationError("Não foi possível gerar a previsão de demanda.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar authenticated variant="servidor" userRole="Servidor público" />

        <main className="min-h-screen bg-zinc-100 px-4 py-8 md:px-8">
          <ForecastSkeleton />
        </main>
      </>
    );
  }

  if (pageError || !profile) {
    return (
      <>
        <Navbar
          authenticated
          variant="servidor"
          userName={profile?.nome}
          userRole={profile?.cargo}
          userProfile={profile?.perfil}
        />

        <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-zinc-100 px-4">
          <Card className="w-full max-w-lg">
            <CardContent className="py-10 text-center">
              <CircleAlert className="mx-auto h-10 w-10 text-red-500" />

              <h1 className="mt-4 text-xl font-bold text-blue-950">
                Erro ao carregar previsões
              </h1>

              <p className="mt-2 text-sm text-zinc-600">
                {pageError || "O perfil do servidor não foi encontrado."}
              </p>

              <Button className="mt-6" onClick={() => void loadPage()}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar
        authenticated
        variant="servidor"
        userName={profile.nome}
        userRole={profile.cargo}
      />

      <main className="min-h-screen bg-zinc-100 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Inteligência de gestão
              </p>

              <h1 className="mt-1 text-3xl font-bold text-blue-950">
                Previsão de demanda
              </h1>

              <p className="mt-2 max-w-3xl text-zinc-600">
                Analise o histórico para estimar a demanda por bairro, categoria
                e subserviço.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/servidor/painel">
                  <ArrowLeft />
                  Voltar ao painel
                </Link>
              </Button>

              <Button
                disabled={isGenerating}
                onClick={() => void handleGenerate(false)}
              >
                <Sparkles />

                {isGenerating ? "Gerando..." : "Gerar previsão"}
              </Button>
            </div>
          </header>

          {operationError && (
            <Alert variant="destructive" className="mt-6">
              <CircleAlert />

              <AlertTitle>Não foi possível gerar a previsão</AlertTitle>

              <AlertDescription>
                <p>{operationError}</p>

                {forceRequired && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="mt-3"
                    disabled={isGenerating}
                    onClick={() => void handleGenerate(true)}
                  >
                    Forçar nova geração
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mt-6 border-emerald-200 bg-emerald-50 text-emerald-800">
              <Sparkles />

              <AlertTitle>Previsão atualizada</AlertTitle>

              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {!summary ? (
            <Card className="mt-8">
              <CardContent className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                <BrainCircuit className="h-12 w-12 text-blue-700" />

                <h2 className="mt-4 text-xl font-semibold text-blue-950">
                  Nenhuma previsão foi gerada
                </h2>

                <p className="mt-2 max-w-xl text-sm text-zinc-600">
                  Gere a primeira previsão utilizando 90 dias de histórico para
                  projetar a demanda dos próximos 30 dias.
                </p>

                <Button
                  className="mt-6"
                  disabled={isGenerating}
                  onClick={() => void handleGenerate(false)}
                >
                  <Sparkles />

                  {isGenerating ? "Gerando..." : "Gerar primeira previsão"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="mt-6 text-sm text-zinc-500">
                Gerada em {formatDateTime(summary.dataGeracao)} · histórico de{" "}
                {summary.periodoHistoricoDias} dias · projeção de{" "}
                {summary.periodoPrevisaoDias} dias
              </p>

              <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                  <CardContent className="flex items-start justify-between py-5">
                    <div>
                      <p className="text-sm text-zinc-500">Demanda prevista</p>

                      <p className="mt-2 text-2xl font-bold text-blue-950">
                        {formatNumber(summary.quantidadeTotalPrevista)}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {summary.totalPrevisoes} agrupamentos
                      </p>
                    </div>

                    <Target className="h-7 w-7 text-blue-700" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start justify-between py-5">
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-500">Maior demanda</p>

                      <p className="mt-2 truncate text-lg font-bold text-blue-950">
                        {summary.bairroMaiorDemanda}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {formatNumber(
                          summary.quantidadePrevistaBairroMaiorDemanda,
                        )}{" "}
                        solicitações previstas
                      </p>
                    </div>

                    <Building2 className="h-7 w-7 shrink-0 text-violet-700" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start justify-between py-5">
                    <div>
                      <p className="text-sm text-zinc-500">Alta ou crítica</p>

                      <p className="mt-2 text-2xl font-bold text-blue-950">
                        {summary.demandasAltas + summary.demandasCriticas}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {summary.demandasCriticas} críticas
                      </p>
                    </div>

                    <CircleAlert className="h-7 w-7 text-red-600" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start justify-between py-5">
                    <div>
                      <p className="text-sm text-zinc-500">Maior confiança</p>

                      <p className="mt-2 text-2xl font-bold text-blue-950">
                        {formatConfidence(summary.maiorConfianca)}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Melhor evidência do modelo
                      </p>
                    </div>

                    <BrainCircuit className="h-7 w-7 text-emerald-700" />
                  </CardContent>
                </Card>
              </section>

              <Card className="mt-6 overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-950 hover:bg-blue-950">
                        <TableHead className="pl-4 text-white">Local</TableHead>

                        <TableHead className="text-white">Serviço</TableHead>

                        <TableHead className="text-right text-white">
                          Histórico
                        </TableHead>

                        <TableHead className="text-right text-white">
                          Previsto
                        </TableHead>

                        <TableHead className="text-white">Tendência</TableHead>

                        <TableHead className="text-white">Nível</TableHead>

                        <TableHead className="pr-4 text-right text-white">
                          Confiança
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {forecasts.map((forecast) => (
                        <TableRow key={forecast.idPrevisao}>
                          <TableCell className="pl-4 font-medium">
                            {forecast.bairro}
                          </TableCell>

                          <TableCell>
                            <p className="font-medium text-zinc-800">
                              {forecast.subservicoNome}
                            </p>

                            <p className="text-xs text-zinc-500">
                              {forecast.categoriaNome}
                            </p>
                          </TableCell>

                          <TableCell className="text-right">
                            {forecast.ocorrenciasHistoricas}
                          </TableCell>

                          <TableCell className="text-right font-semibold">
                            {formatNumber(forecast.quantidadePrevista)}
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="outline"
                              className={trendClasses[forecast.tendencia]}
                            >
                              {forecast.tendencia === "CRESCENTE" ? (
                                <TrendingUp />
                              ) : forecast.tendencia === "DECRESCENTE" ? (
                                <TrendingDown />
                              ) : null}

                              {trendLabels[forecast.tendencia]}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="outline"
                              className={levelClasses[forecast.nivelDemanda]}
                            >
                              {levelLabels[forecast.nivelDemanda]}
                            </Badge>
                          </TableCell>

                          <TableCell className="pr-4 text-right">
                            {formatConfidence(forecast.confianca)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {profile.perfil === "SERVIDOR" && <TriageQueue />}

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => void loadPage()}>
              <RefreshCw />
              Atualizar dados
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};

export default DemandForecastPage;

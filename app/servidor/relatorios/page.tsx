"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeft,
  ChartColumn,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  ClipboardList,
  Clock3,
  Gauge,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import Navbar from "@/components/navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type ServerProfile = {
  id: number;
  nome: string;
  matricula: string;
  email: string;
  cargo: string;
  dataCadastro: string;
  ativo: boolean;
  perfil: "SERVIDOR" | "AUDITOR";
};

type DistributionItem = {
  codigo: string;
  descricao: string;
  quantidade: number;
  percentual: number;
};

type DailyEvolution = {
  data: string;
  quantidade: number;
};

type StatisticalIndicators = {
  totalSolicitacoes: number;
  solicitacoesEmAberto: number;
  solicitacoesConcluidas: number;
  solicitacoesCanceladas: number;
  taxaConclusaoPercentual: number;
  percentualAltaOuCritica: number;
  mediaDiaria: number;
  medianaDiaria: number;
  modasDiarias: number[];
  varianciaPopulacional: number;
  desvioPadraoPopulacional: number;
  coeficienteVariacaoPercentual: number;
  tempoMedioResolucaoHoras: number;
};

type StatisticalReport = {
  periodoInicio: string;
  periodoFim: string;
  indicadores: StatisticalIndicators;
  porCategoria: DistributionItem[];
  porStatus: DistributionItem[];
  porUrgencia: DistributionItem[];
  evolucaoDiaria: DailyEvolution[];
  analisesESugestoes: string[];
};

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  tooltip: string;
  icon: LucideIcon;
  iconClassName: string;
  iconBackground: string;
};

type DistributionChartProps = {
  data: DistributionItem[];
  color: string;
};

type DistributionTableProps = {
  data: DistributionItem[];
};

const evolutionChartConfig = {
  quantidade: {
    label: "Solicitações",
    color: "#1d4ed8",
  },
} satisfies ChartConfig;

const formatNumber = (value: number, maximumFractionDigits = 2) => {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${formatNumber(value, 2)}%`;
};

const formatHours = (value: number) => {
  return `${formatNumber(value, 2)} h`;
};

const formatDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR");
};

const formatShortDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
};

const readError = async (response: Response, fallback: string) => {
  const body = await response.json().catch(() => null);

  return body?.detail || body?.message || fallback;
};

const MetricCard = ({
  title,
  value,
  description,
  tooltip,
  icon: Icon,
  iconClassName,
  iconBackground,
}: MetricCardProps) => {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 py-5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm text-zinc-500">{title}</p>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`Informações sobre ${title}`}
                  className="rounded-full text-zinc-400 outline-none hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-700"
                >
                  <CircleHelp className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>

              <TooltipContent className="max-w-72">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <p className="mt-2 text-2xl font-bold text-blue-950">{value}</p>

          <p className="mt-1 text-xs text-zinc-500">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${iconBackground}`}>
          <Icon className={`h-6 w-6 ${iconClassName}`} />
        </div>
      </CardContent>
    </Card>
  );
};

const DistributionChart = ({ data, color }: DistributionChartProps) => {
  const chartConfig = {
    quantidade: {
      label: "Solicitações",
      color,
    },
  } satisfies ChartConfig;

  if (data.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center text-sm text-zinc-500">
        Nenhum dado disponível para o período.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-80 w-full">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{
          left: 8,
          right: 24,
        }}
      >
        <CartesianGrid horizontal={false} />

        <YAxis
          dataKey="descricao"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={150}
          tickFormatter={(value: string) =>
            value.length > 22 ? `${value.slice(0, 22)}…` : value
          }
        />

        <XAxis dataKey="quantidade" type="number" allowDecimals={false} hide />

        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />

        <Bar
          dataKey="quantidade"
          fill="var(--color-quantidade)"
          radius={[0, 5, 5, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
};

const DistributionTable = ({ data }: DistributionTableProps) => {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-950 hover:bg-blue-950">
            <TableHead className="text-white">Classificação</TableHead>

            <TableHead className="text-right text-white">Quantidade</TableHead>

            <TableHead className="text-right text-white">Percentual</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-28 text-center text-zinc-500">
                Nenhum dado disponível.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.codigo}>
                <TableCell className="font-medium text-zinc-800">
                  {item.descricao}
                </TableCell>

                <TableCell className="text-right">
                  {formatNumber(item.quantidade, 0)}
                </TableCell>

                <TableCell className="text-right">
                  <Badge variant="outline">
                    {formatPercentage(item.percentual)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const ReportSkeleton = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-80 max-w-full" />
        <Skeleton className="h-4 w-md max-w-full" />
      </div>

      <Skeleton className="h-36 w-full" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-105 w-full" />
        <Skeleton className="h-105 w-full" />
      </div>
    </div>
  );
};

const ServerReportsPage = () => {
  const router = useRouter();

  const [profile, setProfile] = useState<ServerProfile | null>(null);

  const [report, setReport] = useState<StatisticalReport | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  const [pageError, setPageError] = useState("");
  const [filterError, setFilterError] = useState("");

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const [profileResponse, reportResponse] = await Promise.all([
        fetch("/api/backend/servidor/me", {
          cache: "no-store",
        }),

        fetch("/api/backend/servidor/relatorios/estatisticas", {
          cache: "no-store",
        }),
      ]);

      if (
        profileResponse.status === 401 ||
        profileResponse.status === 403 ||
        reportResponse.status === 401 ||
        reportResponse.status === 403
      ) {
        router.replace("/servidor");
        router.refresh();
        return;
      }

      if (!profileResponse.ok) {
        throw new Error(
          await readError(
            profileResponse,
            "Não foi possível carregar o perfil do servidor.",
          ),
        );
      }

      if (!reportResponse.ok) {
        throw new Error(
          await readError(
            reportResponse,
            "Não foi possível carregar o relatório estatístico.",
          ),
        );
      }

      const profileBody = (await profileResponse.json()) as ServerProfile;

      const reportBody = (await reportResponse.json()) as StatisticalReport;

      setProfile(profileBody);
      setReport(reportBody);

      setStartDate(reportBody.periodoInicio);
      setEndDate(reportBody.periodoFim);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o relatório.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const requestReport = async (start?: string, end?: string) => {
    const searchParams = new URLSearchParams();

    if (start) {
      searchParams.set("inicio", start);
    }

    if (end) {
      searchParams.set("fim", end);
    }

    const query = searchParams.toString();

    const endpoint = query
      ? `/api/backend/servidor/relatorios/estatisticas?${query}`
      : "/api/backend/servidor/relatorios/estatisticas";

    const response = await fetch(endpoint, {
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      router.replace("/servidor");
      router.refresh();
      return null;
    }

    if (!response.ok) {
      throw new Error(
        await readError(response, "Não foi possível atualizar o relatório."),
      );
    }

    return (await response.json()) as StatisticalReport;
  };

  const handleApplyFilter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFilterError("");

    if (!startDate || !endDate) {
      setFilterError("Informe as datas inicial e final.");
      return;
    }

    if (startDate > endDate) {
      setFilterError("A data inicial não pode ser posterior à data final.");
      return;
    }

    setIsFiltering(true);

    try {
      const updatedReport = await requestReport(startDate, endDate);

      if (updatedReport) {
        setReport(updatedReport);
      }
    } catch (error) {
      setFilterError(
        error instanceof Error
          ? error.message
          : "Não foi possível aplicar o período.",
      );
    } finally {
      setIsFiltering(false);
    }
  };

  const handleResetFilter = async () => {
    setFilterError("");
    setIsFiltering(true);

    try {
      const updatedReport = await requestReport();

      if (updatedReport) {
        setReport(updatedReport);
        setStartDate(updatedReport.periodoInicio);
        setEndDate(updatedReport.periodoFim);
      }
    } catch (error) {
      setFilterError(
        error instanceof Error
          ? error.message
          : "Não foi possível restaurar o período.",
      );
    } finally {
      setIsFiltering(false);
    }
  };

  const dailyChartData = useMemo(() => {
    return (
      report?.evolucaoDiaria.map((item) => ({
        ...item,
        rotulo: formatShortDate(item.data),
      })) ?? []
    );
  }, [report]);

  if (isLoading) {
    return (
      <>
        <Navbar authenticated variant="servidor" userRole="Servidor público" />

        <main className="min-h-screen bg-zinc-100 px-4 py-8 md:px-8">
          <ReportSkeleton />
        </main>
      </>
    );
  }

  if (pageError || !profile || !report) {
    return (
      <>
        <Navbar
          authenticated
          variant="servidor"
          userName={profile?.nome}
          userRole={profile?.cargo}
        />

        <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-zinc-100 px-4">
          <Card className="w-full max-w-lg">
            <CardContent className="py-10 text-center">
              <CircleAlert className="mx-auto h-10 w-10 text-red-500" />

              <h1 className="mt-4 text-xl font-bold text-blue-950">
                Erro ao carregar relatório
              </h1>

              <p className="mt-2 text-sm text-zinc-600">
                {pageError || "Os dados do relatório não foram encontrados."}
              </p>

              <Button
                type="button"
                className="mt-6"
                onClick={() => void loadInitialData()}
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const indicators = report.indicadores;

  const modes =
    indicators.modasDiarias.length > 0
      ? indicators.modasDiarias
          .map((value) => formatNumber(value, 0))
          .join(", ")
      : "Amodal";

  return (
    <TooltipProvider>
      <Navbar
        authenticated
        variant="servidor"
        userName={profile.nome}
        userRole={profile.cargo}
        userProfile={profile.perfil}
      />

      <main className="min-h-screen bg-zinc-100 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Área administrativa
              </p>

              <h1 className="mt-1 text-3xl font-bold text-blue-950">
                Relatórios estatísticos
              </h1>

              <p className="mt-2 text-zinc-600">
                Analise demanda, desempenho e distribuição das solicitações
                registradas.
              </p>
            </div>

            <Button variant="outline" asChild>
              <Link href="/servidor/painel">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao painel
              </Link>
            </Button>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Período do relatório</CardTitle>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleApplyFilter}
                className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
              >
                <div className="space-y-2">
                  <Label htmlFor="report-start-date">Data inicial</Label>

                  <Input
                    id="report-start-date"
                    type="date"
                    value={startDate}
                    max={endDate || undefined}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-end-date">Data final</Label>

                  <Input
                    id="report-end-date"
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button type="submit" disabled={isFiltering}>
                    {isFiltering ? "Atualizando..." : "Aplicar período"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isFiltering}
                    onClick={() => void handleResetFilter()}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Restaurar
                  </Button>
                </div>
              </form>

              {filterError && (
                <Alert variant="destructive" className="mt-4">
                  <CircleAlert className="h-4 w-4" />

                  <AlertTitle>Não foi possível aplicar o filtro</AlertTitle>

                  <AlertDescription>{filterError}</AlertDescription>
                </Alert>
              )}

              <p className="mt-4 text-sm text-zinc-500">
                Dados entre <strong>{formatDate(report.periodoInicio)}</strong>{" "}
                e <strong>{formatDate(report.periodoFim)}</strong>.
              </p>
            </CardContent>
          </Card>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              title="Total de solicitações"
              value={formatNumber(indicators.totalSolicitacoes, 0)}
              description="Registros no período selecionado"
              tooltip="Quantidade total de solicitações abertas dentro do intervalo."
              icon={ClipboardList}
              iconClassName="text-blue-700"
              iconBackground="bg-blue-100"
            />

            <MetricCard
              title="Solicitações em aberto"
              value={formatNumber(indicators.solicitacoesEmAberto, 0)}
              description="Ainda dependem de atendimento"
              tooltip="Solicitações que não estão concluídas nem canceladas."
              icon={CircleAlert}
              iconClassName="text-orange-700"
              iconBackground="bg-orange-100"
            />

            <MetricCard
              title="Solicitações concluídas"
              value={formatNumber(indicators.solicitacoesConcluidas, 0)}
              description={`${formatNumber(
                indicators.solicitacoesCanceladas,
                0,
              )} canceladas`}
              tooltip="Quantidade de solicitações que finalizaram o fluxo com status concluída."
              icon={CheckCircle2}
              iconClassName="text-emerald-700"
              iconBackground="bg-emerald-100"
            />

            <MetricCard
              title="Taxa de conclusão"
              value={formatPercentage(indicators.taxaConclusaoPercentual)}
              description="Concluídas em relação ao total"
              tooltip="Percentual calculado dividindo solicitações concluídas pelo total do período."
              icon={Gauge}
              iconClassName="text-purple-700"
              iconBackground="bg-purple-100"
            />

            <MetricCard
              title="Alta ou crítica"
              value={formatPercentage(indicators.percentualAltaOuCritica)}
              description="Participação das maiores urgências"
              tooltip="Percentual das solicitações classificadas com urgência alta ou crítica."
              icon={Activity}
              iconClassName="text-red-700"
              iconBackground="bg-red-100"
            />

            <MetricCard
              title="Tempo médio de resolução"
              value={formatHours(indicators.tempoMedioResolucaoHoras)}
              description="Considera apenas solicitações concluídas"
              tooltip="Média de horas entre a abertura e a conclusão das solicitações finalizadas."
              icon={Clock3}
              iconClassName="text-amber-700"
              iconBackground="bg-amber-100"
            />
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Evolução diária das solicitações</CardTitle>
              </CardHeader>

              <CardContent>
                <ChartContainer
                  config={evolutionChartConfig}
                  className="min-h-80 w-full"
                >
                  <LineChart
                    accessibilityLayer
                    data={dailyChartData}
                    margin={{
                      left: 8,
                      right: 8,
                    }}
                  >
                    <CartesianGrid vertical={false} />

                    <XAxis
                      dataKey="rotulo"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      interval="preserveStartEnd"
                    />

                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      width={28}
                    />

                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />

                    <Line
                      dataKey="quantidade"
                      type="monotone"
                      stroke="var(--color-quantidade)"
                      strokeWidth={3}
                      dot={{
                        fill: "var(--color-quantidade)",
                        r: 3,
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medidas estatísticas diárias</CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medida</TableHead>
                      <TableHead className="text-right">Resultado</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <TableRow>
                      <TableCell>Média</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatNumber(indicators.mediaDiaria)}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Mediana</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatNumber(indicators.medianaDiaria)}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Moda</TableCell>
                      <TableCell className="text-right font-semibold">
                        {modes}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Variância populacional</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatNumber(indicators.varianciaPopulacional)}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Desvio-padrão populacional</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatNumber(indicators.desvioPadraoPopulacional)}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Coeficiente de variação</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPercentage(
                          indicators.coeficienteVariacaoPercentual,
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Distribuição das solicitações</CardTitle>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="categoria">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="categoria">Categorias</TabsTrigger>

                  <TabsTrigger value="status">Status</TabsTrigger>

                  <TabsTrigger value="urgencia">Urgências</TabsTrigger>
                </TabsList>

                <TabsContent value="categoria" className="mt-6">
                  <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                    <DistributionChart
                      data={report.porCategoria}
                      color="#1d4ed8"
                    />

                    <DistributionTable data={report.porCategoria} />
                  </div>
                </TabsContent>

                <TabsContent value="status" className="mt-6">
                  <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                    <DistributionChart
                      data={report.porStatus}
                      color="#7c3aed"
                    />

                    <DistributionTable data={report.porStatus} />
                  </div>
                </TabsContent>

                <TabsContent value="urgencia" className="mt-6">
                  <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                    <DistributionChart
                      data={report.porUrgencia}
                      color="#ea580c"
                    />

                    <DistributionTable data={report.porUrgencia} />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Análises e sugestões para o atendimento</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {report.analisesESugestoes.map((analysis, index) => (
                <Alert key={`${index}-${analysis}`}>
                  <Lightbulb className="h-4 w-4" />

                  <AlertTitle>Análise {index + 1}</AlertTitle>

                  <AlertDescription>{analysis}</AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </TooltipProvider>
  );
};

export default ServerReportsPage;

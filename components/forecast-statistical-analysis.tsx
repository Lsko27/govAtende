import {
  Activity,
  ChartNoAxesCombined,
  Minus,
  Sigma,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type {
  ForcaCorrelacao,
  PrevisaoDemanda,
  TendenciaDemanda,
} from "@/lib/previsao-demanda-api";

type ForecastStatisticalAnalysisProps = {
  forecasts: PrevisaoDemanda[];
};

type ForecastWithRegression = PrevisaoDemanda & {
  coeficienteCorrelacao: number;
  coeficienteDeterminacao: number;
  coeficienteAngular: number;
  intercepto: number;
  equacao: string;
  forcaCorrelacao: ForcaCorrelacao;
  tendenciaRegressao: TendenciaDemanda;
  quantidadeDiasRegressao: number;
  variacaoEstimadaPercentual: number;
  interpretacaoRegressao: string;
};

const strengthLabels: Record<ForcaCorrelacao, string> = {
  MUITO_FRACA: "Muito fraca",
  FRACA: "Fraca",
  MODERADA: "Moderada",
  FORTE: "Forte",
  MUITO_FORTE: "Muito forte",
};

const strengthClasses: Record<ForcaCorrelacao, string> = {
  MUITO_FRACA: "border-zinc-200 bg-zinc-50 text-zinc-700",
  FRACA: "border-amber-200 bg-amber-50 text-amber-700",
  MODERADA: "border-blue-200 bg-blue-50 text-blue-700",
  FORTE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  MUITO_FORTE: "border-violet-200 bg-violet-50 text-violet-700",
};

const trendLabels: Record<TendenciaDemanda, string> = {
  CRESCENTE: "Crescente",
  ESTAVEL: "Estável",
  DECRESCENTE: "Decrescente",
};

const trendClasses: Record<TendenciaDemanda, string> = {
  CRESCENTE: "border-red-200 bg-red-50 text-red-700",
  ESTAVEL: "border-blue-200 bg-blue-50 text-blue-700",
  DECRESCENTE: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const hasRegression = (
  forecast: PrevisaoDemanda,
): forecast is ForecastWithRegression =>
  forecast.coeficienteCorrelacao !== null &&
  forecast.coeficienteDeterminacao !== null &&
  forecast.coeficienteAngular !== null &&
  forecast.intercepto !== null &&
  forecast.equacao !== null &&
  forecast.forcaCorrelacao !== null &&
  forecast.tendenciaRegressao !== null &&
  forecast.quantidadeDiasRegressao !== null &&
  forecast.variacaoEstimadaPercentual !== null &&
  forecast.interpretacaoRegressao !== null;

const formatNumber = (value: number, maximumFractionDigits = 3) =>
  new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits,
  }).format(value);

const formatPercentage = (value: number) => `${formatNumber(value, 2)}%`;

const TrendIcon = ({ trend }: { trend: TendenciaDemanda }) => {
  if (trend === "CRESCENTE") {
    return <TrendingUp className="h-4 w-4" />;
  }

  if (trend === "DECRESCENTE") {
    return <TrendingDown className="h-4 w-4" />;
  }

  return <Minus className="h-4 w-4" />;
};

const ForecastStatisticalAnalysis = ({
  forecasts,
}: ForecastStatisticalAnalysisProps) => {
  const analyses = forecasts.filter(hasRegression);

  if (analyses.length === 0) {
    return (
      <Alert className="mt-6">
        <TriangleAlert />

        <AlertTitle>Análise estatística indisponível</AlertTitle>

        <AlertDescription>
          As previsões desta geração não possuem dados de correlação e
          regressão. Gere uma nova previsão com o modelo 2.0.0.
        </AlertDescription>
      </Alert>
    );
  }

  const strongestCorrelation = analyses.reduce((strongest, current) =>
    Math.abs(current.coeficienteCorrelacao) >
    Math.abs(strongest.coeficienteCorrelacao)
      ? current
      : strongest,
  );

  const highestDetermination = analyses.reduce((highest, current) =>
    current.coeficienteDeterminacao > highest.coeficienteDeterminacao
      ? current
      : highest,
  );

  const lowExplanatoryPowerCount = analyses.filter(
    (forecast) => forecast.coeficienteDeterminacao < 0.3,
  ).length;

  const growingCount = analyses.filter(
    (forecast) => forecast.tendenciaRegressao === "CRESCENTE",
  ).length;

  return (
    <section className="mt-6 space-y-4">
      <div>
        <p className="text-sm font-medium text-blue-700">
          Estatística aplicada
        </p>

        <h2 className="mt-1 text-xl font-bold text-blue-950">
          Correlação e regressão linear
        </h2>

        <p className="mt-1 text-sm text-zinc-600">
          Análise da relação entre tempo e volume diário de solicitações em cada
          agrupamento.
        </p>
      </div>

      {lowExplanatoryPowerCount > 0 && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <TriangleAlert />

          <AlertTitle>Poder explicativo limitado</AlertTitle>

          <AlertDescription>
            {lowExplanatoryPowerCount} de {analyses.length} séries apresentam R²
            abaixo de 30%. Os resultados apoiam a análise gerencial, mas não
            devem ser interpretados como relação causal ou previsão definitiva.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-start justify-between py-5">
            <div>
              <p className="text-sm text-zinc-500">Séries analisadas</p>

              <p className="mt-2 text-2xl font-bold text-blue-950">
                {analyses.length}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Com regressão calculada
              </p>
            </div>

            <ChartNoAxesCombined className="h-7 w-7 text-blue-700" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start justify-between py-5">
            <div className="min-w-0">
              <p className="text-sm text-zinc-500">Maior correlação</p>

              <p className="mt-2 text-2xl font-bold text-blue-950">
                {formatNumber(strongestCorrelation.coeficienteCorrelacao, 3)}
              </p>

              <p className="mt-1 truncate text-xs text-zinc-500">
                {strongestCorrelation.bairro} ·{" "}
                {strongestCorrelation.subservicoNome}
              </p>
            </div>

            <Activity className="h-7 w-7 shrink-0 text-violet-700" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start justify-between py-5">
            <div className="min-w-0">
              <p className="text-sm text-zinc-500">Maior R²</p>

              <p className="mt-2 text-2xl font-bold text-blue-950">
                {formatPercentage(
                  highestDetermination.coeficienteDeterminacao * 100,
                )}
              </p>

              <p className="mt-1 truncate text-xs text-zinc-500">
                Variação explicada pelo modelo
              </p>
            </div>

            <Sigma className="h-7 w-7 shrink-0 text-emerald-700" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start justify-between py-5">
            <div>
              <p className="text-sm text-zinc-500">Tendências crescentes</p>

              <p className="mt-2 text-2xl font-bold text-blue-950">
                {growingCount}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Entre as séries analisadas
              </p>
            </div>

            <TrendingUp className="h-7 w-7 text-red-600" />
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-950 hover:bg-blue-950">
                <TableHead className="pl-4 text-white">Série</TableHead>

                <TableHead className="text-right text-white">
                  Correlação
                </TableHead>

                <TableHead className="text-right text-white">R²</TableHead>

                <TableHead className="text-white">Força</TableHead>

                <TableHead className="text-white">Tendência</TableHead>

                <TableHead className="pr-4 text-white">Equação</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {analyses.map((forecast) => (
                <TableRow key={forecast.idPrevisao}>
                  <TableCell className="pl-4">
                    <p className="font-medium text-zinc-900">
                      {forecast.bairro}
                    </p>

                    <p className="text-xs text-zinc-500">
                      {forecast.subservicoNome}
                    </p>
                  </TableCell>

                  <TableCell className="text-right font-medium">
                    {formatNumber(forecast.coeficienteCorrelacao, 3)}
                  </TableCell>

                  <TableCell className="text-right">
                    {formatPercentage(forecast.coeficienteDeterminacao * 100)}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={strengthClasses[forecast.forcaCorrelacao]}
                    >
                      {strengthLabels[forecast.forcaCorrelacao]}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={trendClasses[forecast.tendenciaRegressao]}
                    >
                      <TrendIcon trend={forecast.tendenciaRegressao} />

                      {trendLabels[forecast.tendenciaRegressao]}
                    </Badge>
                  </TableCell>

                  <TableCell className="pr-4 font-mono text-xs">
                    {forecast.equacao}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {analyses.map((forecast) => (
          <Card key={`analysis-${forecast.idPrevisao}`}>
            <CardContent className="py-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-blue-950">
                    {forecast.bairro}
                  </h3>

                  <p className="text-sm text-zinc-500">
                    {forecast.subservicoNome}
                  </p>
                </div>

                <Badge variant="outline">
                  {forecast.quantidadeDiasRegressao} dias
                </Badge>
              </div>

              <p className="mt-4 text-sm leading-6 text-zinc-700">
                {forecast.interpretacaoRegressao}
              </p>

              <p className="mt-3 text-xs text-zinc-500">
                Correlação indica associação estatística, não causalidade.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ForecastStatisticalAnalysis;

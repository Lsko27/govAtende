"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HistoricoPrevisaoDemanda } from "@/lib/previsao-demanda-api";

type ForecastHistoryProps = {
  history: HistoricoPrevisaoDemanda[];
};

const chartConfig = {
  quantidadePrevista: {
    label: "Demanda prevista",
    color: "#7c3aed",
  },
} satisfies ChartConfig;

const formatNumber = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits,
  }).format(value);

const formatConfidence = (value: number) =>
  `${formatNumber(value <= 1 ? value * 100 : value)}%`;

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

const formatChartDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const ForecastHistory = ({ history }: ForecastHistoryProps) => {
  const chartData = useMemo(
    () =>
      [...history]
        .sort(
          (first, second) =>
            new Date(first.dataGeracao).getTime() -
            new Date(second.dataGeracao).getTime(),
        )
        .map((generation) => ({
          geracao: formatChartDate(generation.dataGeracao),
          quantidadePrevista: generation.quantidadeTotalPrevista,
        })),
    [history],
  );

  return (
    <Card className="mt-6 overflow-hidden">
      <CardHeader>
        <CardTitle>Histórico das previsões</CardTitle>

        <p className="text-sm text-zinc-500">
          Compare as gerações já executadas e acompanhe a evolução da demanda
          total estimada.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {history.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed text-sm text-zinc-500">
            Ainda não há histórico de gerações disponível.
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="min-h-72 w-full"
              initialDimension={{
                width: 900,
                height: 320,
              }}
            >
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 8,
                  right: 20,
                  top: 12,
                }}
              >
                <CartesianGrid vertical={false} />

                <XAxis
                  dataKey="geracao"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />

                <Line
                  dataKey="quantidadePrevista"
                  type="monotone"
                  stroke="var(--color-quantidadePrevista)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-950 hover:bg-blue-950">
                    <TableHead className="pl-4 text-white">Geração</TableHead>

                    <TableHead className="text-white">Parâmetros</TableHead>

                    <TableHead className="text-right text-white">
                      Agrupamentos
                    </TableHead>

                    <TableHead className="text-right text-white">
                      Registros históricos
                    </TableHead>

                    <TableHead className="text-right text-white">
                      Total previsto
                    </TableHead>

                    <TableHead className="text-right text-white">
                      Alta ou crítica
                    </TableHead>

                    <TableHead className="text-right text-white">
                      Confiança
                    </TableHead>

                    <TableHead className="pr-4 text-white">Modelo</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {history.map((generation) => (
                    <TableRow key={generation.dataGeracao}>
                      <TableCell className="whitespace-nowrap pl-4 font-medium">
                        {formatDateTime(generation.dataGeracao)}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        {generation.periodoHistoricoDias}d{" → "}
                        {generation.periodoPrevisaoDias}d
                      </TableCell>

                      <TableCell className="text-right">
                        {generation.totalPrevisoes}
                      </TableCell>

                      <TableCell className="text-right">
                        {formatNumber(generation.totalOcorrenciasHistoricas)}
                      </TableCell>

                      <TableCell className="text-right font-semibold">
                        {formatNumber(generation.quantidadeTotalPrevista)}
                      </TableCell>

                      <TableCell className="text-right">
                        {generation.demandasAltas + generation.demandasCriticas}
                      </TableCell>

                      <TableCell className="text-right">
                        {formatConfidence(generation.maiorConfianca)}
                      </TableCell>

                      <TableCell className="pr-4">
                        <Badge
                          variant="secondary"
                          className="whitespace-nowrap"
                        >
                          {generation.nomeModelo} v{generation.versaoModelo}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ForecastHistory;

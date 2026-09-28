"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { PrevisaoDemanda } from "@/lib/previsao-demanda-api";

type ForecastChartProps = {
  forecasts: PrevisaoDemanda[];
};

const chartConfig = {
  quantidadePrevista: {
    label: "Quantidade prevista",
    color: "#1d4ed8",
  },
} satisfies ChartConfig;

const ForecastChart = ({ forecasts }: ForecastChartProps) => {
  const chartData = useMemo(
    () =>
      [...forecasts]
        .sort(
          (first, second) =>
            second.quantidadePrevista - first.quantidadePrevista,
        )
        .slice(0, 8)
        .map((forecast) => ({
          grupo: `${forecast.bairro} · ${forecast.subservicoNome}`,
          quantidadePrevista: forecast.quantidadePrevista,
        })),
    [forecasts],
  );

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Maiores demandas previstas</CardTitle>

        <p className="text-sm text-zinc-500">
          Os oito agrupamentos com maior volume estimado para o horizonte da
          previsão atual.
        </p>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="min-h-80 w-full"
          initialDimension={{
            width: 900,
            height: 360,
          }}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 8,
              right: 24,
            }}
          >
            <CartesianGrid horizontal={false} />

            <YAxis
              dataKey="grupo"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={190}
              tickFormatter={(value: string) =>
                value.length > 28 ? `${value.slice(0, 28)}…` : value
              }
            />

            <XAxis
              dataKey="quantidadePrevista"
              type="number"
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />

            <Bar
              dataKey="quantidadePrevista"
              fill="var(--color-quantidadePrevista)"
              radius={[0, 5, 5, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ForecastChart;

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CircleAlert,
  ListOrdered,
  RefreshCw,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Urgency = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

type TriageStatus = "REGISTRADA" | "EM_TRIAGEM";

type TriageRequest = {
  solicitacao: {
    id: number;
    titulo: string;
    status: TriageStatus;
    urgencia: Urgency;
    dataAbertura: string;
    categoriaNome: string;
    subservicoNome: string;
  };
};

type TriageQueueItem = {
  posicao: number;
  urgencia: Urgency;
  dataAbertura: string;
  solicitacao: TriageRequest;
};

type ApiErrorBody = {
  detail?: string;
  message?: string;
};

const urgencyLabels: Record<Urgency, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

const urgencyClasses: Record<Urgency, string> = {
  BAIXA: "border-emerald-200 bg-emerald-50 text-emerald-700",
  MEDIA: "border-amber-200 bg-amber-50 text-amber-700",
  ALTA: "border-orange-200 bg-orange-50 text-orange-700",
  CRITICA: "border-red-200 bg-red-50 text-red-700",
};

const statusLabels: Record<TriageStatus, string> = {
  REGISTRADA: "Registrada",
  EM_TRIAGEM: "Em triagem",
};

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

const readApiError = async (response: Response) => {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;

  return body?.detail || body?.message || "Não foi possível carregar a fila.";
};

const TriageQueueSkeleton = () => (
  <Card className="mt-6">
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full max-w-xl" />
    </CardHeader>

    <CardContent className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </CardContent>
  </Card>
);

const TriageQueue = () => {
  const router = useRouter();

  const [items, setItems] = useState<TriageQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQueue = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          "/api/backend/servidor/solicitacoes/fila-triagem",
          {
            cache: "no-store",
            signal,
          },
        );

        if (response.status === 401 || response.status === 403) {
          router.replace("/servidor");
          router.refresh();
          return;
        }

        if (!response.ok) {
          throw new Error(await readApiError(response));
        }

        setItems((await response.json()) as TriageQueueItem[]);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a fila de triagem.",
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [router],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadQueue(controller.signal);

    return () => controller.abort();
  }, [loadQueue]);

  if (isLoading) {
    return <TriageQueueSkeleton />;
  }

  return (
    <Card className="mt-6 overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-blue-950">
              <ListOrdered className="h-5 w-5 text-blue-700" />
              Fila de triagem
            </CardTitle>

            <CardDescription className="mt-2">
              Solicitações registradas ou em triagem, ordenadas por urgência,
              antiguidade e ID.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {items.length} {items.length === 1 ? "item" : "itens"}
            </Badge>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void loadQueue()}
            >
              <RefreshCw />
              Atualizar fila
            </Button>
          </div>
        </div>
      </CardHeader>

      {error ? (
        <CardContent>
          <Alert variant="destructive">
            <CircleAlert />

            <AlertTitle>Erro ao carregar a fila</AlertTitle>

            <AlertDescription>
              <p>{error}</p>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => void loadQueue()}
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      ) : items.length === 0 ? (
        <CardContent className="flex min-h-40 flex-col items-center justify-center text-center">
          <ListOrdered className="h-10 w-10 text-zinc-400" />

          <p className="mt-3 font-medium text-blue-950">
            Nenhuma solicitação aguardando triagem
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Novas solicitações aparecerão aqui conforme forem registradas.
          </p>
        </CardContent>
      ) : (
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-240">
              <TableHeader>
                <TableRow className="bg-blue-950 hover:bg-blue-950">
                  <TableHead className="w-20 pl-6 text-white">
                    Posição
                  </TableHead>

                  <TableHead className="text-white">Solicitação</TableHead>

                  <TableHead className="text-white">Serviço</TableHead>

                  <TableHead className="text-white">Urgência</TableHead>

                  <TableHead className="text-white">Status</TableHead>

                  <TableHead className="text-white">Abertura</TableHead>

                  <TableHead className="pr-6 text-right text-white">
                    Ação
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => {
                  const request = item.solicitacao.solicitacao;

                  return (
                    <TableRow key={request.id}>
                      <TableCell className="pl-6">
                        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-blue-100 px-2 text-sm font-bold text-blue-800">
                          {item.posicao}
                        </span>
                      </TableCell>

                      <TableCell>
                        <p className="font-medium text-zinc-900">
                          #{request.id} · {request.titulo}
                        </p>
                      </TableCell>

                      <TableCell>
                        <p className="font-medium text-zinc-800">
                          {request.subservicoNome}
                        </p>

                        <p className="text-xs text-zinc-500">
                          {request.categoriaNome}
                        </p>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={urgencyClasses[item.urgencia]}
                        >
                          {urgencyLabels[item.urgencia]}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary">
                          {statusLabels[request.status]}
                        </Badge>
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-zinc-600">
                        {formatDateTime(item.dataAbertura)}
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/servidor/solicitacoes/${request.id}`}>
                            Abrir
                            <ArrowUpRight />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default TriageQueue;

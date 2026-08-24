/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Download,
  FileText,
  MapPin,
  Tag,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatusSolicitacao =
  | "REGISTRADA"
  | "EM_TRIAGEM"
  | "EM_ANDAMENTO"
  | "AGUARDANDO_INFORMACOES"
  | "CONCLUIDA"
  | "CANCELADA";

type NivelUrgencia = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

type EnderecoResponse = {
  id: number;
  logradouro: string;
  numero: string | null;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string | null;
  latitude: number | null;
  longitude: number | null;
};

type SolicitacaoResponse = {
  id: number;
  titulo: string;
  descricao: string;
  status: StatusSolicitacao;
  urgencia: NivelUrgencia;
  dataAbertura: string;
  dataAtualizacao: string;
  subservicoId: number;
  subservicoNome: string;
  categoriaId: number;
  categoriaNome: string;
  endereco: EnderecoResponse;
};

type HistoricoResponse = {
  id: number;
  statusAnterior: StatusSolicitacao | null;
  statusNovo: StatusSolicitacao;
  observacao: string | null;
  dataAlteracao: string;
};

type AnexoResponse = {
  id: number;
  nomeOriginal: string;
  tipoConteudo: string;
  tamanho: number;
  dataEnvio: string;
};

const statusConfig: Record<
  StatusSolicitacao,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  REGISTRADA: {
    label: "Registrada",
    className: "bg-blue-100 text-blue-700",
    dotClassName: "bg-blue-600",
  },
  EM_TRIAGEM: {
    label: "Em triagem",
    className: "bg-purple-100 text-purple-700",
    dotClassName: "bg-purple-600",
  },
  EM_ANDAMENTO: {
    label: "Em andamento",
    className: "bg-amber-100 text-amber-700",
    dotClassName: "bg-amber-500",
  },
  AGUARDANDO_INFORMACOES: {
    label: "Aguardando informações",
    className: "bg-orange-100 text-orange-700",
    dotClassName: "bg-orange-500",
  },
  CONCLUIDA: {
    label: "Concluída",
    className: "bg-green-100 text-green-700",
    dotClassName: "bg-green-600",
  },
  CANCELADA: {
    label: "Cancelada",
    className: "bg-red-100 text-red-700",
    dotClassName: "bg-red-600",
  },
};

const urgencyConfig: Record<
  NivelUrgencia,
  {
    label: string;
    className: string;
  }
> = {
  BAIXA: {
    label: "Baixa",
    className: "bg-green-100 text-green-700",
  },
  MEDIA: {
    label: "Média",
    className: "bg-yellow-100 text-yellow-700",
  },
  ALTA: {
    label: "Alta",
    className: "bg-orange-100 text-orange-700",
  },
  CRITICA: {
    label: "Crítica",
    className: "bg-red-100 text-red-700",
  },
};

const formatDateTime = (value: string) => {
  if (!value) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatCep = (value: string | null) => {
  if (!value) {
    return "Não informado";
  }

  const numbers = value.replace(/\D/g, "");

  if (numbers.length !== 8) {
    return value;
  }

  return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
};

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} bytes`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const readErrorMessage = async (response: Response, fallback: string) => {
  const body = await response.json().catch(() => null);

  return body?.detail || body?.message || fallback;
};

const RequestDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const requestId = params.id;

  const [solicitacao, setSolicitacao] = useState<SolicitacaoResponse | null>(
    null,
  );

  const [historico, setHistorico] = useState<HistoricoResponse[]>([]);

  const [anexos, setAnexos] = useState<AnexoResponse[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");

  const loadRequest = useCallback(async () => {
    if (!requestId || !/^\d+$/.test(requestId)) {
      setError("Identificador da solicitação inválido.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [requestResponse, historyResponse, attachmentResponse] =
        await Promise.all([
          fetch(`/api/backend/solicitacoes/${requestId}`, {
            cache: "no-store",
          }),
          fetch(`/api/backend/solicitacoes/${requestId}/historico`, {
            cache: "no-store",
          }),
          fetch(`/api/backend/solicitacoes/${requestId}/anexos`, {
            cache: "no-store",
          }),
        ]);

      const responses = [requestResponse, historyResponse, attachmentResponse];

      const authenticationFailed = responses.some(
        (response) => response.status === 401 || response.status === 403,
      );

      if (authenticationFailed) {
        router.replace("/");
        router.refresh();
        return;
      }

      if (requestResponse.status === 404) {
        throw new Error(
          "A solicitação não foi encontrada ou não pertence ao usuário autenticado.",
        );
      }

      if (!requestResponse.ok) {
        throw new Error(
          await readErrorMessage(
            requestResponse,
            "Não foi possível carregar a solicitação.",
          ),
        );
      }

      if (!historyResponse.ok) {
        throw new Error(
          await readErrorMessage(
            historyResponse,
            "Não foi possível carregar o histórico.",
          ),
        );
      }

      if (!attachmentResponse.ok) {
        throw new Error(
          await readErrorMessage(
            attachmentResponse,
            "Não foi possível carregar os anexos.",
          ),
        );
      }

      const requestBody = (await requestResponse.json()) as SolicitacaoResponse;

      const historyBody = (await historyResponse.json()) as HistoricoResponse[];

      const attachmentBody =
        (await attachmentResponse.json()) as AnexoResponse[];

      setSolicitacao(requestBody);
      setHistorico(historyBody);
      setAnexos(attachmentBody);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a solicitação.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [requestId, router]);

  useEffect(() => {
    void loadRequest();
  }, [loadRequest]);

  const handleCancel = async () => {
    if (!solicitacao) {
      return;
    }

    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Cancelar solicitação?",
      text: "Essa operação será registrada no histórico e não poderá ser desfeita.",
      showCancelButton: true,
      confirmButtonText: "Sim, cancelar",
      cancelButtonText: "Voltar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#172554",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setIsCancelling(true);

    try {
      const response = await fetch(
        `/api/backend/solicitacoes/${solicitacao.id}/cancelar`,
        {
          method: "PATCH",
        },
      );

      if (response.status === 401 || response.status === 403) {
        router.replace("/");
        router.refresh();
        return;
      }

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            "Não foi possível cancelar a solicitação.",
          ),
        );
      }

      await Swal.fire({
        icon: "success",
        title: "Solicitação cancelada",
        text: "O cancelamento foi registrado no histórico.",
        confirmButtonText: "OK",
        confirmButtonColor: "#172554",
      });

      await loadRequest();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Erro ao cancelar",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível cancelar a solicitação.",
        confirmButtonText: "OK",
        confirmButtonColor: "#172554",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-100 px-4 py-8">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-6 h-8 w-52 rounded bg-zinc-300" />

          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <div className="h-96 rounded-xl bg-white" />
            <div className="h-96 rounded-xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !solicitacao) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
            <FileText className="h-12 w-12 text-zinc-400" />

            <div>
              <h1 className="text-xl font-bold text-blue-950">
                Não foi possível abrir a solicitação
              </h1>

              <p className="mt-2 text-sm text-zinc-600">{error}</p>
            </div>

            <Button asChild>
              <Link href="/servicos/minhas-solicitacoes">
                Voltar para solicitações
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const currentStatus = statusConfig[solicitacao.status];
  const currentUrgency = urgencyConfig[solicitacao.urgencia];

  const canCancel =
    solicitacao.status === "REGISTRADA" || solicitacao.status === "EM_TRIAGEM";

  const fullAddress = [
    solicitacao.endereco.logradouro,
    solicitacao.endereco.numero,
    solicitacao.endereco.complemento,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/servicos/minhas-solicitacoes"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para minhas solicitações
        </Link>

        <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Solicitação #{solicitacao.id}
            </p>

            <h1 className="mt-1 text-2xl font-bold text-blue-950 md:text-3xl">
              {solicitacao.titulo}
            </h1>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${currentStatus.className}`}
          >
            {currentStatus.label}
          </span>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-950">
                  Informações da solicitação
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-zinc-500">
                    Descrição
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                    {solicitacao.descricao}
                  </p>
                </div>

                <div className="grid gap-4 border-t pt-5 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Tag className="mt-0.5 h-5 w-5 text-blue-700" />

                    <div>
                      <p className="text-xs font-semibold uppercase text-zinc-500">
                        Categoria
                      </p>

                      <p className="mt-1 text-sm font-medium text-zinc-800">
                        {solicitacao.categoriaNome}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-blue-700" />

                    <div>
                      <p className="text-xs font-semibold uppercase text-zinc-500">
                        Serviço
                      </p>

                      <p className="mt-1 text-sm font-medium text-zinc-800">
                        {solicitacao.subservicoNome}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5 text-blue-700" />

                    <div>
                      <p className="text-xs font-semibold uppercase text-zinc-500">
                        Data de abertura
                      </p>

                      <p className="mt-1 text-sm font-medium text-zinc-800">
                        {formatDateTime(solicitacao.dataAbertura)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 h-5 w-5 text-blue-700" />

                    <div>
                      <p className="text-xs font-semibold uppercase text-zinc-500">
                        Última atualização
                      </p>

                      <p className="mt-1 text-sm font-medium text-zinc-800">
                        {formatDateTime(solicitacao.dataAtualizacao)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-5">
                  <p className="text-xs font-semibold uppercase text-zinc-500">
                    Urgência informada
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${currentUrgency.className}`}
                  >
                    {currentUrgency.label}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-950">
                  <MapPin className="h-5 w-5" />
                  Localização
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="font-medium text-zinc-800">{fullAddress}</p>

                <p className="mt-1 text-sm text-zinc-600">
                  {solicitacao.endereco.bairro}, {solicitacao.endereco.cidade} -{" "}
                  {solicitacao.endereco.estado}
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  CEP: {formatCep(solicitacao.endereco.cep)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-950">Anexos</CardTitle>
              </CardHeader>

              <CardContent>
                {anexos.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    Nenhum arquivo foi anexado.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {anexos.map((anexo) => {
                      const fileUrl =
                        `/api/backend/solicitacoes/` +
                        `${solicitacao.id}/anexos/` +
                        `${anexo.id}/arquivo`;

                      const isImage = anexo.tipoConteudo.startsWith("image/");

                      return (
                        <a
                          key={anexo.id}
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="overflow-hidden rounded-lg border bg-white transition hover:border-blue-500"
                        >
                          {isImage ? (
                            <img
                              src={fileUrl}
                              alt={anexo.nomeOriginal}
                              className="h-44 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-44 items-center justify-center bg-zinc-100">
                              <FileText className="h-12 w-12 text-zinc-400" />
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-3 p-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-zinc-800">
                                {anexo.nomeOriginal}
                              </p>

                              <p className="text-xs text-zinc-500">
                                {formatFileSize(anexo.tamanho)}
                              </p>
                            </div>

                            <Download className="h-4 w-4 shrink-0 text-blue-700" />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-950">Histórico</CardTitle>
              </CardHeader>

              <CardContent>
                {historico.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    Nenhuma movimentação registrada.
                  </p>
                ) : (
                  <div className="space-y-0">
                    {historico.map((evento, index) => {
                      const eventStatus = statusConfig[evento.statusNovo];

                      const isLast = index === historico.length - 1;

                      return (
                        <div
                          key={evento.id}
                          className="relative flex gap-4 pb-7 last:pb-0"
                        >
                          {!isLast && (
                            <span className="absolute left-[7px] top-4 h-full w-px bg-zinc-200" />
                          )}

                          <span
                            className={`relative mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-white ${eventStatus.dotClassName}`}
                          />

                          <div>
                            <p className="font-semibold text-zinc-800">
                              {eventStatus.label}
                            </p>

                            {evento.statusAnterior && (
                              <p className="mt-1 text-xs text-zinc-500">
                                De {statusConfig[evento.statusAnterior].label}{" "}
                                para {eventStatus.label}
                              </p>
                            )}

                            {evento.observacao && (
                              <p className="mt-2 text-sm text-zinc-600">
                                {evento.observacao}
                              </p>
                            )}

                            <p className="mt-2 text-xs text-zinc-400">
                              {formatDateTime(evento.dataAlteracao)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {canCancel && (
              <Card className="border-red-200">
                <CardContent className="pt-6">
                  <p className="text-sm leading-6 text-zinc-600">
                    Você pode cancelar enquanto a solicitação estiver registrada
                    ou em triagem.
                  </p>

                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isCancelling}
                    onClick={handleCancel}
                    className="mt-4 w-full"
                  >
                    <Trash2 className="h-4 w-4" />

                    {isCancelling ? "Cancelando..." : "Cancelar solicitação"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
};

export default RequestDetailsPage;

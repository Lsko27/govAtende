"use client";

import {
  ArrowLeft,
  Bot,
  CalendarDays,
  Clock3,
  History,
  Loader2,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

type StatusSolicitacao =
  | "REGISTRADA"
  | "EM_TRIAGEM"
  | "EM_ANDAMENTO"
  | "AGUARDANDO_INFORMACOES"
  | "CONCLUIDA"
  | "CANCELADA";

type Urgencia = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

type Endereco = {
  id?: number;
  logradouro: string;
  numero: string | null;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type Solicitacao = {
  id: number;
  titulo: string;
  descricao: string;
  status: StatusSolicitacao;
  urgencia: Urgencia;
  dataAbertura: string;
  dataAtualizacao?: string;
  subservicoId?: number;
  subservicoNome: string;
  categoriaId?: number;
  categoriaNome: string;
  endereco: Endereco;
};

type ServidorSolicitacaoResponse = {
  cidadaoId: number;
  cidadaoNome: string;
  solicitacao: Solicitacao;
};

type HistoricoSolicitacao = {
  id?: number;
  statusAnterior?: string;
  statusNovo?: string;
  novoStatus?: string;
  status?: string;
  observacao?: string;
  dataAlteracao?: string;
  criadoEm?: string;
  data?: string;
};

type AnaliseIA = {
  categoriaSugerida?: string;
  subservicoSugerido?: string;
  urgenciaSugerida?: string;
  scorePrioridade?: number;
  nivelPrioridade?: string;
  confianca?: number;
  justificativa?: string;
  nomeModelo?: string;
  versao?: string;
  dataAnalise?: string;
};

type ApiError = Error & {
  status?: number;
};

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/backend${endpoint}`, {
    ...options,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(options.body
        ? {
            "Content-Type": "application/json",
          }
        : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    let message = `Erro HTTP ${response.status}`;

    if (contentType.includes("application/json")) {
      const body = await response.json().catch(() => null);

      message = body?.detail ?? body?.message ?? body?.error ?? message;
    } else {
      const text = await response.text().catch(() => "");

      if (text) {
        message = text;
      }
    }

    const error = new Error(message) as ApiError;
    error.status = response.status;

    throw error;
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

const statusLabel: Record<StatusSolicitacao, string> = {
  REGISTRADA: "Registrada",
  EM_TRIAGEM: "Em triagem",
  EM_ANDAMENTO: "Em andamento",
  AGUARDANDO_INFORMACOES: "Aguardando informações",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

const proximosStatus: Record<StatusSolicitacao, StatusSolicitacao[]> = {
  REGISTRADA: ["EM_TRIAGEM"],
  EM_TRIAGEM: ["EM_ANDAMENTO", "AGUARDANDO_INFORMACOES"],
  EM_ANDAMENTO: ["CONCLUIDA", "AGUARDANDO_INFORMACOES"],
  AGUARDANDO_INFORMACOES: ["EM_TRIAGEM", "EM_ANDAMENTO"],
  CONCLUIDA: [],
  CANCELADA: [],
};

const formatarData = (data?: string) => {
  if (!data) {
    return "Não informado";
  }

  const parsed = new Date(data);

  if (Number.isNaN(parsed.getTime())) {
    return data;
  }

  return parsed.toLocaleString("pt-BR");
};

const formatarConfianca = (valor?: number) => {
  if (valor === undefined || valor === null) {
    return "-";
  }

  const percentual = valor <= 1 ? valor * 100 : valor;

  return `${Math.round(percentual)}%`;
};

export default function SolicitacaoServidorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const solicitacaoId = params.id;

  const [dados, setDados] = useState<ServidorSolicitacaoResponse | null>(null);

  const [historico, setHistorico] = useState<HistoricoSolicitacao[]>([]);

  const [analise, setAnalise] = useState<AnaliseIA | null>(null);

  const [loading, setLoading] = useState(true);
  const [salvandoStatus, setSalvandoStatus] = useState(false);

  const [novoStatus, setNovoStatus] = useState("");
  const [observacao, setObservacao] = useState("");

  const solicitacao = dados?.solicitacao ?? null;

  const carregarDados = useCallback(async () => {
    if (!solicitacaoId) {
      return;
    }

    setLoading(true);

    try {
      const dadosSolicitacao = await apiFetch<ServidorSolicitacaoResponse>(
        `/servidor/solicitacoes/${solicitacaoId}`,
      );

      setDados(dadosSolicitacao);

      try {
        const dadosHistorico = await apiFetch<HistoricoSolicitacao[]>(
          `/servidor/solicitacoes/${solicitacaoId}/historico`,
        );

        setHistorico(Array.isArray(dadosHistorico) ? dadosHistorico : []);
      } catch (error) {
        const status = (error as ApiError).status;

        if (status === 401 || status === 403) {
          router.replace("/servidor");
          router.refresh();
          return;
        }

        console.error("Erro ao carregar histórico:", error);
        setHistorico([]);
      }

      try {
        const dadosAnalise = await apiFetch<AnaliseIA>(
          `/servidor/solicitacoes/${solicitacaoId}/analise-ia`,
        );

        setAnalise(dadosAnalise);
      } catch (error) {
        const status = (error as ApiError).status;

        if (status === 401 || status === 403) {
          router.replace("/servidor");
          router.refresh();
          return;
        }

        console.error("Análise de IA ainda não disponível:", error);
        setAnalise(null);
      }
    } catch (error) {
      console.error(error);

      const status = (error as ApiError).status;

      if (status === 401 || status === 403) {
        await Swal.fire({
          icon: "warning",
          title: "Sessão expirada",
          text: "Faça login novamente como servidor.",
          confirmButtonText: "OK",
          confirmButtonColor: "#172554",
        });

        router.replace("/servidor");
        router.refresh();

        return;
      }

      if (status === 404) {
        await Swal.fire({
          icon: "error",
          title: "Solicitação não encontrada",
          text: `Não encontramos a solicitação ${solicitacaoId}.`,
        });

        router.push("/servidor/painel");

        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Erro",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a solicitação.",
      });
    } finally {
      setLoading(false);
    }
  }, [router, solicitacaoId]);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  const categoria = solicitacao?.categoriaNome ?? "Não informado";

  const subservico = solicitacao?.subservicoNome ?? "Não informado";

  const nomeCidadao = dados?.cidadaoNome ?? "Não informado";

  const enderecoCompleto = useMemo(() => {
    if (!solicitacao?.endereco) {
      return "Não informado";
    }

    const endereco = solicitacao.endereco;

    const partes = [
      endereco.numero
        ? `${endereco.logradouro}, ${endereco.numero}`
        : endereco.logradouro,
      endereco.complemento,
      endereco.bairro,
      `${endereco.cidade} - ${endereco.estado}`,
      endereco.cep ? `CEP ${endereco.cep}` : null,
    ].filter(Boolean);

    return partes.length ? partes.join(" • ") : "Não informado";
  }, [solicitacao]);

  const opcoesStatus = solicitacao ? proximosStatus[solicitacao.status] : [];

  const atualizarStatus = async () => {
    if (!solicitacao || !novoStatus) {
      return;
    }

    const observacaoNormalizada = observacao.trim();

    if (
      observacaoNormalizada.length < 5 ||
      observacaoNormalizada.length > 500
    ) {
      await Swal.fire({
        icon: "error",
        title: "Observação inválida",
        text: "A observação deve possuir entre 5 e 500 caracteres.",
        confirmButtonText: "OK",
        confirmButtonColor: "#172554",
      });

      return;
    }

    const confirmar = await Swal.fire({
      icon: "question",
      title: "Atualizar status?",
      text: `A solicitação passará para "${statusLabel[novoStatus as StatusSolicitacao]}".`,
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmar.isConfirmed) {
      return;
    }

    setSalvandoStatus(true);

    try {
      await apiFetch(`/servidor/solicitacoes/${solicitacao.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          novoStatus,
          observacao: observacaoNormalizada,
        }),
      });

      await Swal.fire({
        icon: "success",
        title: "Status atualizado",
        text: "A solicitação foi atualizada com sucesso.",
        timer: 1800,
        showConfirmButton: false,
      });

      setNovoStatus("");
      setObservacao("");

      await carregarDados();
    } catch (error) {
      console.error(error);

      const status = (error as ApiError).status;

      if (status === 401 || status === 403) {
        router.replace("/servidor");
        router.refresh();
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Erro",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar o status.",
      });
    } finally {
      setSalvandoStatus(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando solicitação...
        </div>
      </main>
    );
  }

  if (!solicitacao) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Solicitação não encontrada
          </h1>

          <button
            type="button"
            onClick={() => router.push("/servidor/painel")}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white"
          >
            Voltar ao painel
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <button
          type="button"
          onClick={() => router.push("/servidor/painel")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para solicitações
        </button>

        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-blue-600">
                Solicitação #{solicitacao.id}
              </span>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {statusLabel[solicitacao.status] ?? solicitacao.status}
              </span>

              {solicitacao.urgencia && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Urgência: {solicitacao.urgencia}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-slate-950">
              {solicitacao.titulo}
            </h1>

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays className="h-4 w-4" />
              Aberta em {formatarData(solicitacao.dataAbertura)}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-slate-900">
                Dados da solicitação
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <Info titulo="Categoria" valor={categoria} />

                <Info titulo="Subserviço" valor={subservico} />

                <Info
                  titulo="Urgência"
                  valor={solicitacao.urgencia ?? "Não informado"}
                />

                <Info
                  titulo="Status atual"
                  valor={statusLabel[solicitacao.status] ?? solicitacao.status}
                />
              </div>

              <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-slate-500">
                  Descrição
                </p>

                <p className="leading-7 text-slate-700">
                  {solicitacao.descricao}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-600" />

                <h2 className="text-lg font-semibold text-slate-900">
                  Localização
                </h2>
              </div>

              <p className="text-slate-700">{enderecoCompleto}</p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <Bot className="h-5 w-5 text-blue-600" />

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Análise com Inteligência Artificial
                  </h2>

                  <p className="text-sm text-slate-500">
                    Apoio à classificação e priorização da ocorrência
                  </p>
                </div>
              </div>

              {analise ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Info
                      titulo="Categoria sugerida"
                      valor={analise.categoriaSugerida ?? "-"}
                    />

                    <Info
                      titulo="Subserviço sugerido"
                      valor={analise.subservicoSugerido ?? "-"}
                    />

                    <Info
                      titulo="Urgência sugerida"
                      valor={analise.urgenciaSugerida ?? "-"}
                    />

                    <Info
                      titulo="Prioridade"
                      valor={analise.nivelPrioridade ?? "-"}
                    />

                    <Info
                      titulo="Score"
                      valor={
                        analise.scorePrioridade !== undefined
                          ? String(analise.scorePrioridade)
                          : "-"
                      }
                    />

                    <Info
                      titulo="Confiança"
                      valor={formatarConfianca(analise.confianca)}
                    />
                  </div>

                  {analise.justificativa && (
                    <div className="mt-6 rounded-xl bg-blue-50 p-4">
                      <p className="mb-1 text-sm font-semibold text-blue-900">
                        Justificativa da IA
                      </p>

                      <p className="text-sm leading-6 text-blue-800">
                        {analise.justificativa}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                    {analise.nomeModelo && (
                      <span>Modelo: {analise.nomeModelo}</span>
                    )}

                    {analise.versao && <span>Versão: {analise.versao}</span>}

                    {analise.dataAnalise && (
                      <span>
                        Analisado em: {formatarData(analise.dataAnalise)}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <Bot className="mx-auto mb-3 h-8 w-8 text-slate-400" />

                  <p className="font-medium text-slate-700">
                    Análise de IA ainda não disponível.
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    A solicitação pode ainda estar sendo processada pelo serviço
                    de IA.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <History className="h-5 w-5 text-blue-600" />

                <h2 className="text-lg font-semibold text-slate-900">
                  Histórico de atendimento
                </h2>
              </div>

              {historico.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhuma alteração registrada até o momento.
                </p>
              ) : (
                <div className="space-y-0">
                  {historico.map((item, index) => {
                    const statusHistorico =
                      item.statusNovo ??
                      item.novoStatus ??
                      item.status ??
                      "Atualização";

                    return (
                      <div
                        key={item.id ?? `${statusHistorico}-${index}`}
                        className="relative flex gap-4 pb-7"
                      >
                        {index < historico.length - 1 && (
                          <div className="absolute left-1.75 top-5 h-full w-px bg-slate-200" />
                        )}

                        <div className="relative mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-blue-100 bg-blue-600" />

                        <div>
                          <p className="font-semibold text-slate-800">
                            {statusLabel[
                              statusHistorico as StatusSolicitacao
                            ] ?? statusHistorico}
                          </p>

                          {item.observacao && (
                            <p className="mt-1 text-sm text-slate-600">
                              {item.observacao}
                            </p>
                          )}

                          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                            <Clock3 className="h-3.5 w-3.5" />

                            {formatarData(
                              item.dataAlteracao ?? item.criadoEm ?? item.data,
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <User className="h-5 w-5 text-blue-600" />

                <h2 className="text-lg font-semibold text-slate-900">
                  Cidadão
                </h2>
              </div>

              <Info titulo="Nome" valor={nomeCidadao} />

              <div className="mt-4">
                <Info
                  titulo="ID"
                  valor={dados?.cidadaoId ? String(dados.cidadaoId) : "-"}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600" />

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Gerenciar atendimento
                  </h2>

                  <p className="text-sm text-slate-500">
                    Atualize o andamento da solicitação
                  </p>
                </div>
              </div>

              {opcoesStatus.length > 0 ? (
                <>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Novo status
                  </label>

                  <select
                    value={novoStatus}
                    onChange={(event) => setNovoStatus(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Selecione</option>

                    {opcoesStatus.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel[status]}
                      </option>
                    ))}
                  </select>

                  <label className="mb-2 mt-5 block text-sm font-medium text-slate-700">
                    Observação
                  </label>

                  <textarea
                    value={observacao}
                    onChange={(event) => setObservacao(event.target.value)}
                    rows={4}
                    placeholder="Descreva a atualização realizada..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={atualizarStatus}
                    disabled={!novoStatus || salvandoStatus}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {salvandoStatus && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Atualizar status
                  </button>
                </>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  Esta solicitação está finalizada e não possui novas transições
                  disponíveis.
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Info({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-500">{titulo}</p>

      <p className="font-medium text-slate-800">{valor}</p>
    </div>
  );
}

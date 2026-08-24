"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Ellipsis,
  LoaderCircle,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import Navbar from "@/components/navbar";

type StatusSolicitacao =
  | "REGISTRADA"
  | "EM_TRIAGEM"
  | "EM_ANDAMENTO"
  | "AGUARDANDO_INFORMACOES"
  | "CONCLUIDA"
  | "CANCELADA";

type NivelUrgencia = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

type Endereco = {
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

type Solicitacao = {
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
  endereco: Endereco;
};

type Cidadao = {
  id: number;
  nome: string;
  cpfMascarado: string;
  email: string;
  telefone: string | null;
  dataCadastro: string;
  ativo: boolean;
};

const STATUS_CONFIG: Record<
  StatusSolicitacao,
  {
    label: string;
    className: string;
  }
> = {
  REGISTRADA: {
    label: "ABERTA",
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  EM_TRIAGEM: {
    label: "EM TRIAGEM",
    className: "bg-purple-50 text-purple-700 ring-purple-600/20",
  },
  EM_ANDAMENTO: {
    label: "EM ANDAMENTO",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  AGUARDANDO_INFORMACOES: {
    label: "AGUARDANDO INFORMAÇÕES",
    className: "bg-orange-50 text-orange-700 ring-orange-600/20",
  },
  CONCLUIDA: {
    label: "CONCLUÍDA",
    className: "bg-green-50 text-green-700 ring-green-600/20",
  },
  CANCELADA: {
    label: "CANCELADA",
    className: "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
  },
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
};

const getAddress = (address: Endereco) => {
  return [address.logradouro, address.numero, address.bairro, address.cidade]
    .filter(Boolean)
    .join(", ");
};

type SolicitacaoCardProps = {
  solicitacao: Solicitacao;
  isCanceling: boolean;
  onCancel: (solicitacao: Solicitacao) => Promise<void>;
};

const SolicitacaoCard = ({
  solicitacao,
  isCanceling,
  onCancel,
}: SolicitacaoCardProps) => {
  const statusConfig = STATUS_CONFIG[solicitacao.status];

  const canCancel =
    solicitacao.status === "REGISTRADA" || solicitacao.status === "EM_TRIAGEM";

  return (
    <article className="flex min-h-72 flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-700">
            {solicitacao.categoriaNome}
          </p>

          <h2 className="mt-1 text-lg font-bold leading-tight text-blue-950">
            {solicitacao.titulo}
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {solicitacao.subservicoNome}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${statusConfig.className}`}
        >
          {statusConfig.label}
        </span>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-600">
        {solicitacao.descricao}
      </p>

      <div className="mt-5 flex flex-col gap-3 text-sm text-zinc-600">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

          <span>{getAddress(solicitacao.endereco)}</span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-blue-600" />

          <span>{formatDate(solicitacao.dataAbertura)}</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 border-t border-zinc-100 pt-5">
        {canCancel ? (
          <button
            type="button"
            disabled={isCanceling}
            onClick={() => void onCancel(solicitacao)}
            className="flex items-center gap-2 text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCanceling ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}

            {isCanceling ? "Cancelando..." : "Cancelar"}
          </button>
        ) : (
          <span className="text-xs text-zinc-400">Solicitação encerrada</span>
        )}

        <Link
          href={`/servicos/minhas-solicitacoes/${solicitacao.id}`}
          className="flex items-center gap-2 text-sm font-medium text-blue-800 hover:underline"
        >
          <Ellipsis className="h-5 w-5" />
          Ver detalhes
        </Link>
      </div>
    </article>
  );
};

const MinhasSolicitacoesPage = () => {
  const router = useRouter();

  const [cidadao, setCidadao] = useState<Cidadao | null>(null);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusSolicitacao | "TODAS">(
    "TODAS",
  );

  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadingError("");

    try {
      const [profileResponse, requestsResponse] = await Promise.all([
        fetch("/api/backend/cidadaos/me", {
          cache: "no-store",
        }),
        fetch("/api/backend/solicitacoes/minhas", {
          cache: "no-store",
        }),
      ]);

      if (
        profileResponse.status === 401 ||
        profileResponse.status === 403 ||
        requestsResponse.status === 401 ||
        requestsResponse.status === 403
      ) {
        router.replace("/");
        router.refresh();
        return;
      }

      const profileBody = await profileResponse.json().catch(() => null);
      const requestsBody = await requestsResponse.json().catch(() => null);

      if (!profileResponse.ok || !requestsResponse.ok) {
        throw new Error(
          requestsBody?.detail ||
            profileBody?.detail ||
            "Não foi possível carregar suas solicitações.",
        );
      }

      setCidadao(profileBody);
      setSolicitacoes(requestsBody);
    } catch (error) {
      setLoadingError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar suas solicitações.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return solicitacoes.filter((solicitacao) => {
      const matchesStatus =
        statusFilter === "TODAS" || solicitacao.status === statusFilter;

      const searchableText = [
        solicitacao.titulo,
        solicitacao.descricao,
        solicitacao.categoriaNome,
        solicitacao.subservicoNome,
        solicitacao.endereco.logradouro,
        solicitacao.endereco.bairro,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [search, solicitacoes, statusFilter]);

  const totalInProgress = solicitacoes.filter((solicitacao) =>
    ["EM_TRIAGEM", "EM_ANDAMENTO", "AGUARDANDO_INFORMACOES"].includes(
      solicitacao.status,
    ),
  ).length;

  const totalCompleted = solicitacoes.filter(
    (solicitacao) => solicitacao.status === "CONCLUIDA",
  ).length;

  const firstName = cidadao?.nome
    ?.trim()
    .split(/\s+/)[0]
    .toLocaleUpperCase("pt-BR");

  const handleCancel = async (solicitacao: Solicitacao) => {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Cancelar solicitação?",
      text: `A solicitação “${solicitacao.titulo}” será cancelada.`,
      showCancelButton: true,
      confirmButtonText: "Sim, cancelar",
      cancelButtonText: "Voltar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#1e40af",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setCancelingId(solicitacao.id);

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
        const responseBody = await response.json().catch(() => null);

        throw new Error(
          responseBody?.detail ||
            responseBody?.message ||
            "Não foi possível cancelar a solicitação.",
        );
      }

      setSolicitacoes((currentRequests) =>
        currentRequests.map((currentRequest) =>
          currentRequest.id === solicitacao.id
            ? {
                ...currentRequest,
                status: "CANCELADA",
                dataAtualizacao: new Date().toISOString(),
              }
            : currentRequest,
        ),
      );

      await Swal.fire({
        icon: "success",
        title: "Solicitação cancelada",
        text: "O cancelamento foi registrado com sucesso.",
        confirmButtonText: "OK",
        confirmButtonColor: "#1e40af",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Erro ao cancelar",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível cancelar a solicitação.",
        confirmButtonText: "OK",
        confirmButtonColor: "#1e40af",
      });
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <>
      <main className="min-h-[calc(100vh-72px)] bg-zinc-100">
        <section className="bg-linear-to-r from-blue-950 to-blue-800 text-white">
          <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-7 md:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm text-blue-100">Olá,</p>

              <h1 className="mt-1 text-2xl font-bold">
                {firstName ?? "CIDADÃO"}
              </h1>

              <p className="mt-2 text-sm text-blue-100">
                Acompanhe o andamento das suas solicitações urbanas.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-white/10 px-5 py-3 backdrop-blur-sm">
                <p className="text-xs text-blue-100">Total</p>
                <p className="mt-1 text-xl font-bold">{solicitacoes.length}</p>
              </div>

              <div className="rounded-lg bg-white/10 px-5 py-3 backdrop-blur-sm">
                <p className="text-xs text-blue-100">Em andamento</p>
                <p className="mt-1 text-xl font-bold">{totalInProgress}</p>
              </div>

              <div className="rounded-lg bg-white/10 px-5 py-3 backdrop-blur-sm">
                <p className="text-xs text-blue-100">Concluídas</p>
                <p className="mt-1 text-xl font-bold">{totalCompleted}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8">
          <Link
            href="/servicos"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-800 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para serviços
          </Link>

          <div className="mt-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-3">
                <ClipboardList className="h-7 w-7 text-blue-900" />

                <h2 className="text-2xl font-bold text-blue-950">
                  Ocorrências registradas
                </h2>
              </div>

              <p className="mt-2 text-sm text-zinc-600">
                Consulte, filtre e acompanhe suas solicitações.
              </p>
            </div>

            <p className="text-sm font-medium text-zinc-500">
              {filteredRequests.length}{" "}
              {filteredRequests.length === 1
                ? "solicitação encontrada"
                : "solicitações encontradas"}
            </p>
          </div>

          <div className="mt-6 grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_260px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pesquise por título, categoria, serviço ou endereço"
                className="h-11 w-full rounded-md border border-zinc-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as StatusSolicitacao | "TODAS",
                  )
                }
                className="h-11 w-full appearance-none rounded-md border border-zinc-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
              >
                <option value="TODAS">Todos os status</option>
                <option value="REGISTRADA">Abertas</option>
                <option value="EM_TRIAGEM">Em triagem</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="AGUARDANDO_INFORMACOES">
                  Aguardando informações
                </option>
                <option value="CONCLUIDA">Concluídas</option>
                <option value="CANCELADA">Canceladas</option>
              </select>
            </div>
          </div>

          {isLoading && (
            <div className="flex min-h-80 items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-zinc-500">
                <LoaderCircle className="h-8 w-8 animate-spin text-blue-800" />
                <p className="text-sm">Carregando solicitações...</p>
              </div>
            </div>
          )}

          {!isLoading && loadingError && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-semibold text-red-800">
                Não foi possível carregar os dados
              </p>

              <p className="mt-2 text-sm text-red-600">{loadingError}</p>

              <button
                type="button"
                onClick={() => void loadData()}
                className="mt-5 rounded-full bg-blue-800 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-900"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!isLoading && !loadingError && filteredRequests.length > 0 && (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {filteredRequests.map((solicitacao) => (
                <SolicitacaoCard
                  key={solicitacao.id}
                  solicitacao={solicitacao}
                  isCanceling={cancelingId === solicitacao.id}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}

          {!isLoading && !loadingError && filteredRequests.length === 0 && (
            <div className="mt-6 flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
              <ClipboardList className="h-12 w-12 text-zinc-300" />

              <h3 className="mt-4 text-lg font-bold text-blue-950">
                Nenhuma solicitação encontrada
              </h3>

              <p className="mt-2 max-w-md text-sm text-zinc-500">
                Não existem solicitações correspondentes aos filtros
                selecionados.
              </p>
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <Link
              href="/servicos"
              className="w-full max-w-sm rounded-full bg-blue-800 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-900"
            >
              Voltar para a tela inicial
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default MinhasSolicitacoesPage;

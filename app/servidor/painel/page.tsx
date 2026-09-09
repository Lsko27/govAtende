"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Navbar from "@/components/navbar";

import {
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Clock3,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RequestStatus =
  | "REGISTRADA"
  | "EM_TRIAGEM"
  | "EM_ANDAMENTO"
  | "AGUARDANDO_INFORMACOES"
  | "CONCLUIDA"
  | "CANCELADA";

type Urgency = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

type ServerProfile = {
  id: number;
  nome: string;
  matricula: string;
  email: string;
  cargo: string;
  dataCadastro: string;
  ativo: boolean;
};

type Address = {
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

type RequestResponse = {
  id: number;
  titulo: string;
  descricao: string;
  status: RequestStatus;
  urgencia: Urgency;
  dataAbertura: string;
  dataAtualizacao: string;
  subservicoId: number;
  subservicoNome: string;
  categoriaId: number;
  categoriaNome: string;
  endereco: Address;
};

type ServerRequestResponse = {
  cidadaoId: number;
  cidadaoNome: string;
  solicitacao: RequestResponse;
};

const statusConfig: Record<
  RequestStatus,
  {
    label: string;
    className: string;
  }
> = {
  REGISTRADA: {
    label: "Registrada",
    className: "bg-blue-100 text-blue-700",
  },
  EM_TRIAGEM: {
    label: "Em triagem",
    className: "bg-purple-100 text-purple-700",
  },
  EM_ANDAMENTO: {
    label: "Em andamento",
    className: "bg-amber-100 text-amber-700",
  },
  AGUARDANDO_INFORMACOES: {
    label: "Aguardando informações",
    className: "bg-orange-100 text-orange-700",
  },
  CONCLUIDA: {
    label: "Concluída",
    className: "bg-green-100 text-green-700",
  },
  CANCELADA: {
    label: "Cancelada",
    className: "bg-red-100 text-red-700",
  },
};

const urgencyConfig: Record<
  Urgency,
  {
    label: string;
    className: string;
  }
> = {
  BAIXA: {
    label: "Baixa",
    className: "text-green-700",
  },
  MEDIA: {
    label: "Média",
    className: "text-yellow-700",
  },
  ALTA: {
    label: "Alta",
    className: "text-orange-700",
  },
  CRITICA: {
    label: "Crítica",
    className: "font-semibold text-red-700",
  },
};

const allowedTransitions: Record<RequestStatus, RequestStatus[]> = {
  REGISTRADA: ["EM_TRIAGEM"],
  EM_TRIAGEM: ["EM_ANDAMENTO", "AGUARDANDO_INFORMACOES"],
  EM_ANDAMENTO: ["CONCLUIDA", "AGUARDANDO_INFORMACOES"],
  AGUARDANDO_INFORMACOES: ["EM_TRIAGEM", "EM_ANDAMENTO"],
  CONCLUIDA: [],
  CANCELADA: [],
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  const formattedDate = date.toLocaleDateString("pt-BR");

  const formattedTime = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formattedDate} ${formattedTime}`;
};

const readError = async (response: Response, fallback: string) => {
  const body = await response.json().catch(() => null);

  return body?.detail || body?.message || fallback;
};

const ServerDashboardPage = () => {
  const router = useRouter();

  const [profile, setProfile] = useState<ServerProfile | null>(null);

  const [requests, setRequests] = useState<ServerRequestResponse[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [urgencyFilter, setUrgencyFilter] = useState("TODAS");

  const [selectedRequest, setSelectedRequest] =
    useState<ServerRequestResponse | null>(null);

  const [nextStatus, setNextStatus] = useState<RequestStatus | "">("");

  const [observation, setObservation] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const loadPanel = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [profileResponse, requestsResponse] = await Promise.all([
        fetch("/api/backend/servidor/me", {
          cache: "no-store",
        }),
        fetch("/api/backend/servidor/solicitacoes", {
          cache: "no-store",
        }),
      ]);

      if (
        profileResponse.status === 401 ||
        profileResponse.status === 403 ||
        requestsResponse.status === 401 ||
        requestsResponse.status === 403
      ) {
        router.replace("/servidor");
        router.refresh();
        return;
      }

      if (!profileResponse.ok) {
        throw new Error(
          await readError(
            profileResponse,
            "Não foi possível carregar o perfil.",
          ),
        );
      }

      if (!requestsResponse.ok) {
        throw new Error(
          await readError(
            requestsResponse,
            "Não foi possível carregar as solicitações.",
          ),
        );
      }

      const profileBody = (await profileResponse.json()) as ServerProfile;

      const requestsBody =
        (await requestsResponse.json()) as ServerRequestResponse[];

      setProfile(profileBody);
      setRequests(requestsBody);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o painel.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadPanel();
  }, [loadPanel]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    return [...requests]
      .filter((item) => {
        const request = item.solicitacao;

        const matchesSearch =
          !normalizedSearch ||
          request.titulo
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          item.cidadaoNome
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          request.categoriaNome
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          request.subservicoNome
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          String(request.id).includes(normalizedSearch);

        const matchesStatus =
          statusFilter === "TODOS" || request.status === statusFilter;

        const matchesUrgency =
          urgencyFilter === "TODAS" || request.urgencia === urgencyFilter;

        return matchesSearch && matchesStatus && matchesUrgency;
      })
      .sort(
        (first, second) =>
          new Date(second.solicitacao.dataAbertura).getTime() -
          new Date(first.solicitacao.dataAbertura).getTime(),
      );
  }, [requests, search, statusFilter, urgencyFilter]);

  const statistics = useMemo(() => {
    return {
      total: requests.length,

      abertas: requests.filter(
        ({ solicitacao }) =>
          solicitacao.status !== "CONCLUIDA" &&
          solicitacao.status !== "CANCELADA",
      ).length,

      andamento: requests.filter(
        ({ solicitacao }) => solicitacao.status === "EM_ANDAMENTO",
      ).length,

      concluidas: requests.filter(
        ({ solicitacao }) => solicitacao.status === "CONCLUIDA",
      ).length,
    };
  }, [requests]);

  const openStatusDialog = (request: ServerRequestResponse) => {
    const transitions = allowedTransitions[request.solicitacao.status];

    if (transitions.length === 0) {
      void Swal.fire({
        icon: "info",
        title: "Solicitação encerrada",
        text: "Essa solicitação não permite novas alterações de status.",
        confirmButtonText: "OK",
        confirmButtonColor: "#172554",
      });

      return;
    }

    setSelectedRequest(request);
    setNextStatus(transitions[0]);
    setObservation("");
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !nextStatus) {
      return;
    }

    const normalizedObservation = observation.trim();

    if (
      normalizedObservation.length < 5 ||
      normalizedObservation.length > 500
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

    setIsUpdating(true);

    try {
      const response = await fetch(
        `/api/backend/servidor/solicitacoes/${selectedRequest.solicitacao.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            novoStatus: nextStatus,
            observacao: normalizedObservation,
          }),
        },
      );

      if (response.status === 401 || response.status === 403) {
        router.replace("/servidor");
        router.refresh();
        return;
      }

      if (!response.ok) {
        throw new Error(
          await readError(response, "Não foi possível atualizar o status."),
        );
      }

      const updatedRequest = (await response.json()) as ServerRequestResponse;

      setRequests((current) =>
        current.map((item) =>
          item.solicitacao.id === updatedRequest.solicitacao.id
            ? updatedRequest
            : item,
        ),
      );

      setSelectedRequest(null);
      setNextStatus("");
      setObservation("");

      await Swal.fire({
        icon: "success",
        title: "Status atualizado",
        text: "O cidadão recebeu uma nova notificação.",
        confirmButtonText: "OK",
        confirmButtonColor: "#172554",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Erro ao atualizar",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar o status.",
        confirmButtonText: "OK",
        confirmButtonColor: "#172554",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100">
        <div className="text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-4 border-blue-950 border-t-transparent" />

          <p className="mt-3 text-sm text-zinc-500">Carregando painel...</p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
        <Card className="w-full max-w-lg">
          <CardContent className="py-10 text-center">
            <CircleAlert className="mx-auto h-10 w-10 text-red-500" />

            <h1 className="mt-4 text-xl font-bold text-blue-950">
              Erro ao carregar painel
            </h1>

            <p className="mt-2 text-sm text-zinc-600">{error}</p>

            <Button onClick={() => void loadPanel()} className="mt-6">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </main>
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
          <div>
            <p className="text-sm font-medium text-blue-700">
              Área administrativa
            </p>

            <h1 className="mt-1 text-3xl font-bold text-blue-950">
              Solicitações dos cidadãos
            </h1>

            <p className="mt-2 text-zinc-600">
              Consulte, filtre e atualize o andamento dos atendimentos.
            </p>
          </div>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 py-5">
                <ClipboardList className="h-8 w-8 text-blue-700" />

                <div>
                  <p className="text-sm text-zinc-500">Total</p>

                  <p className="text-2xl font-bold text-blue-950">
                    {statistics.total}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 py-5">
                <CircleAlert className="h-8 w-8 text-orange-600" />

                <div>
                  <p className="text-sm text-zinc-500">Abertas</p>

                  <p className="text-2xl font-bold text-blue-950">
                    {statistics.abertas}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 py-5">
                <Clock3 className="h-8 w-8 text-amber-600" />

                <div>
                  <p className="text-sm text-zinc-500">Em andamento</p>

                  <p className="text-2xl font-bold text-blue-950">
                    {statistics.andamento}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 py-5">
                <CheckCircle2 className="h-8 w-8 text-green-600" />

                <div>
                  <p className="text-sm text-zinc-500">Concluídas</p>

                  <p className="text-2xl font-bold text-blue-950">
                    {statistics.concluidas}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-[1fr_220px_220px]">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por título, cidadão, categoria ou ID"
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="TODOS">Todos os status</SelectItem>

                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Urgência" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="TODAS">Todas as urgências</SelectItem>

                  {Object.entries(urgencyConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                Solicitações encontradas: {filteredRequests.length}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table className="min-w-290 table-fixed">
                  <TableHeader>
                    <TableRow className="bg-blue-950 hover:bg-blue-950">
                      <TableHead className="w-15 px-4 text-white">ID</TableHead>

                      <TableHead className="w-55 px-4 text-white">
                        Solicitação
                      </TableHead>

                      <TableHead className="w-45 px-4 text-white">
                        Cidadão
                      </TableHead>

                      <TableHead className="w-55 px-4 text-white">
                        Serviço
                      </TableHead>

                      <TableHead className="w-20 px-4 text-white">
                        Urgência
                      </TableHead>

                      <TableHead className="w-40 px-4 text-white">
                        Status
                      </TableHead>

                      <TableHead className="w-35 whitespace-nowrap px-4 text-white">
                        Abertura
                      </TableHead>

                      <TableHead className="w-35 whitespace-nowrap px-4 text-white">
                        Ação
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="h-32 text-center text-zinc-500"
                        >
                          Nenhuma solicitação encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((item) => {
                        const request = item.solicitacao;

                        const transitions = allowedTransitions[request.status];

                        return (
                          <TableRow
                            key={request.id}
                            onClick={() =>
                              router.push(
                                `/servidor/solicitacoes/${request.id}`,
                              )
                            }
                            className="cursor-pointer hover:bg-zinc-50"
                          >
                            <TableCell className="px-4 font-semibold text-blue-950">
                              #{request.id}
                            </TableCell>

                            <TableCell className="px-4">
                              <p
                                title={request.titulo}
                                className="truncate font-medium text-zinc-800"
                              >
                                {request.titulo}
                              </p>

                              <p
                                title={request.categoriaNome}
                                className="mt-1 truncate text-xs text-zinc-500"
                              >
                                {request.categoriaNome}
                              </p>
                            </TableCell>

                            <TableCell className="px-4 text-zinc-700">
                              <p title={item.cidadaoNome} className="truncate">
                                {item.cidadaoNome}
                              </p>
                            </TableCell>

                            <TableCell className="px-4 text-zinc-700">
                              <p
                                title={request.subservicoNome}
                                className="truncate"
                              >
                                {request.subservicoNome}
                              </p>
                            </TableCell>

                            <TableCell
                              className={`whitespace-nowrap px-4 ${
                                urgencyConfig[request.urgencia].className
                              }`}
                            >
                              {urgencyConfig[request.urgencia].label}
                            </TableCell>

                            <TableCell className="whitespace-nowrap px-4">
                              <span
                                className={`
                                  inline-flex rounded-full px-3 py-1
                                  text-xs font-semibold
                                  ${statusConfig[request.status].className}
                                `}
                              >
                                {statusConfig[request.status].label}
                              </span>
                            </TableCell>

                            <TableCell className="whitespace-nowrap px-4 text-zinc-600">
                              {formatDate(request.dataAbertura)}
                            </TableCell>

                            <TableCell className="whitespace-nowrap px-4">
                              <Button
                                type="button"
                                size="sm"
                                variant={
                                  transitions.length > 0 ? "default" : "outline"
                                }
                                onClick={() => openStatusDialog(item)}
                              >
                                {transitions.length > 0
                                  ? "Atualizar status"
                                  : "Encerrada"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog
        open={selectedRequest !== null}
        onOpenChange={(open) => {
          if (!open && !isUpdating) {
            setSelectedRequest(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Atualizar solicitação #{selectedRequest?.solicitacao.id}
            </DialogTitle>

            <DialogDescription>
              A alteração será registrada no histórico e enviará uma notificação
              ao cidadão.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-zinc-500">Solicitação</p>

                <p className="mt-1 font-semibold text-blue-950">
                  {selectedRequest.solicitacao.titulo}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Novo status</Label>

                <Select
                  value={nextStatus}
                  onValueChange={(value) =>
                    setNextStatus(value as RequestStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>

                  <SelectContent>
                    {allowedTransitions[selectedRequest.solicitacao.status].map(
                      (status) => (
                        <SelectItem key={status} value={status}>
                          {statusConfig[status].label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observation">Observação</Label>

                <Textarea
                  id="observation"
                  value={observation}
                  onChange={(event) => setObservation(event.target.value)}
                  placeholder="Descreva o andamento realizado"
                  maxLength={500}
                  className="min-h-28 resize-none"
                />

                <p className="text-right text-xs text-zinc-400">
                  {observation.length}/500
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isUpdating}
              onClick={() => setSelectedRequest(null)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              disabled={isUpdating}
              onClick={() => void handleUpdateStatus()}
            >
              {isUpdating ? "Atualizando..." : "Confirmar atualização"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServerDashboardPage;

export type NivelDemanda = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

export type TendenciaDemanda = "CRESCENTE" | "ESTAVEL" | "DECRESCENTE";

export type PrevisaoDemanda = {
  idPrevisao: number;
  bairro: string;

  categoriaId: number;
  categoriaNome: string;

  subservicoId: number;
  subservicoNome: string;

  periodoHistoricoDias: number;
  periodoPrevisaoDias: number;

  ocorrenciasHistoricas: number;

  mediaDiaria: number;
  tendenciaPercentual: number;
  quantidadePrevista: number;

  tendencia: TendenciaDemanda;
  nivelDemanda: NivelDemanda;

  confianca: number;
  justificativa: string;

  nomeModelo: string;
  versaoModelo: string;
  dataPrevisao: string;
};

export type ResumoPrevisaoDemanda = {
  dataGeracao: string;

  periodoHistoricoDias: number;
  periodoPrevisaoDias: number;

  totalPrevisoes: number;
  totalOcorrenciasHistoricas: number;
  quantidadeTotalPrevista: number;

  demandasCriticas: number;
  demandasAltas: number;
  demandasMedias: number;
  demandasBaixas: number;

  bairroMaiorDemanda: string;
  quantidadePrevistaBairroMaiorDemanda: number;

  bairroMaiorCrescimento: string;
  categoriaMaiorCrescimento: string;
  subservicoMaiorCrescimento: string;
  maiorTendenciaPercentual: number;

  maiorConfianca: number;
};

export type HistoricoPrevisaoDemanda = {
  dataGeracao: string;

  periodoHistoricoDias: number;
  periodoPrevisaoDias: number;

  totalPrevisoes: number;
  totalOcorrenciasHistoricas: number;
  quantidadeTotalPrevista: number;

  demandasCriticas: number;
  demandasAltas: number;
  demandasMedias: number;
  demandasBaixas: number;

  maiorConfianca: number;

  nomeModelo: string;
  versaoModelo: string;
};

export type ParametrosGeracaoPrevisao = {
  periodoHistoricoDias: number;
  periodoPrevisaoDias: number;
  minimoOcorrencias: number;
  forcarGeracao: boolean;
};

export type ResultadoGeracaoPrevisao = {
  dataGeracao: string;

  periodoHistoricoDias: number;
  periodoPrevisaoDias: number;

  totalRegistrosRecebidos: number;
  totalRegistrosAnalisados: number;
  totalPrevisoes: number;
};

type ApiErrorBody = {
  detail?: string;
  message?: string;
};

const BASE_ENDPOINT = "/api/backend/servidor/previsoes-demanda";

export const PARAMETROS_PADRAO_PREVISAO: ParametrosGeracaoPrevisao = {
  periodoHistoricoDias: 90,
  periodoPrevisaoDias: 30,
  minimoOcorrencias: 2,
  forcarGeracao: false,
};

export class PrevisaoDemandaApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);

    this.name = "PrevisaoDemandaApiError";
    this.status = status;
  }
}

const lerCorpoErro = async (response: Response, fallback: string) => {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;

  return body?.detail || body?.message || fallback;
};

const requisitarJson = async <T>(
  endpoint: string,
  init?: RequestInit,
): Promise<T> => {
  const headers = new Headers(init?.headers);

  headers.set("Accept", "application/json");

  const response = await fetch(endpoint, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new PrevisaoDemandaApiError(
      response.status,
      await lerCorpoErro(
        response,
        "Não foi possível concluir a operação de previsão de demanda.",
      ),
    );
  }

  return (await response.json()) as T;
};

const retornarVazioQuandoNaoEncontrado = async <T>(
  request: Promise<T>,
  emptyValue: T,
) => {
  try {
    return await request;
  } catch (error) {
    if (error instanceof PrevisaoDemandaApiError && error.status === 404) {
      return emptyValue;
    }

    throw error;
  }
};

export const consultarResumoPrevisao = () =>
  retornarVazioQuandoNaoEncontrado<ResumoPrevisaoDemanda | null>(
    requisitarJson<ResumoPrevisaoDemanda>(`${BASE_ENDPOINT}/resumo`),
    null,
  );

export const consultarUltimasPrevisoes = () =>
  retornarVazioQuandoNaoEncontrado<PrevisaoDemanda[]>(
    requisitarJson<PrevisaoDemanda[]>(`${BASE_ENDPOINT}/ultima`),
    [],
  );

export const consultarHistoricoPrevisoes = () =>
  retornarVazioQuandoNaoEncontrado<HistoricoPrevisaoDemanda[]>(
    requisitarJson<HistoricoPrevisaoDemanda[]>(`${BASE_ENDPOINT}/historico`),
    [],
  );

export const gerarPrevisaoDemanda = (parametros: ParametrosGeracaoPrevisao) =>
  requisitarJson<ResultadoGeracaoPrevisao>(`${BASE_ENDPOINT}/gerar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parametros),
  });

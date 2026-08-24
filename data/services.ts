import {
  BookSearch,
  Building2,
  Car,
  Lightbulb,
  Trash2,
  Trees,
  type LucideIcon,
} from "lucide-react";

export type SubService = {
  id: number;
  slug: string;
  title: string;
  href: string;
};

export type Service = {
  id: number;
  slug: string;
  icon: LucideIcon;
  cardTitle: string;
  pageTitle: string;
  href: string;
  items: SubService[];
};

const createOccurrenceHref = (
  serviceSlug: string,
  subServiceSlug: string,
  subServiceId: number,
) => {
  return (
    "/servicos/registro-ocorrencia" +
    `?servico=${serviceSlug}` +
    `&subservico=${subServiceSlug}` +
    `&subservicoId=${subServiceId}`
  );
};

const createSubService = (
  id: number,
  serviceSlug: string,
  slug: string,
  title: string,
): SubService => ({
  id,
  slug,
  title,
  href: createOccurrenceHref(serviceSlug, slug, id),
});

export const services: Service[] = [
  {
    id: 1,
    slug: "infraestrutura",
    icon: Building2,
    cardTitle: "Infraestrutura Urbana",
    pageTitle: "Infraestrutura Urbana",
    href: "/servicos/infraestrutura",
    items: [
      createSubService(2, "infraestrutura", "buracos-na-via", "Buracos na via"),
      createSubService(
        3,
        "infraestrutura",
        "recapeamento-asfaltico",
        "Recapeamento asfáltico",
      ),
      createSubService(
        4,
        "infraestrutura",
        "manutencao-de-calcadas",
        "Manutenção de calçadas",
      ),
      createSubService(
        5,
        "infraestrutura",
        "sinalizacao-viaria",
        "Sinalização viária",
      ),
      createSubService(
        6,
        "infraestrutura",
        "manutencao-de-semaforos",
        "Manutenção de semáforos",
      ),
      createSubService(
        7,
        "infraestrutura",
        "lombadas-redutores-velocidade",
        "Lombadas e redutores de velocidade",
      ),
    ],
  },
  {
    id: 2,
    slug: "iluminacao",
    icon: Lightbulb,
    cardTitle: "Iluminação Pública",
    pageTitle: "Iluminação Pública",
    href: "/servicos/iluminacao",
    items: [
      createSubService(8, "iluminacao", "lampada-queimada", "Lâmpada queimada"),
      createSubService(
        9,
        "iluminacao",
        "falta-de-iluminacao-em-via-publica",
        "Falta de iluminação em via pública",
      ),
      createSubService(
        10,
        "iluminacao",
        "manutencao-de-postes",
        "Manutenção de postes",
      ),
      createSubService(
        11,
        "iluminacao",
        "iluminacao-em-pracas",
        "Iluminação em praças",
      ),
      createSubService(
        12,
        "iluminacao",
        "iluminacao-em-areas-de-risco",
        "Iluminação em áreas de risco",
      ),
    ],
  },
  {
    id: 3,
    slug: "zeladoria",
    icon: Trees,
    cardTitle: "Zeladoria e Meio Ambiente",
    pageTitle: "Zeladoria e Meio Ambiente",
    href: "/servicos/zeladoria",
    items: [
      createSubService(13, "zeladoria", "poda-de-arvores", "Poda de árvores"),
      createSubService(
        14,
        "zeladoria",
        "remocao-de-arvores-em-risco-de-queda",
        "Remoção de árvores em risco de queda",
      ),
      createSubService(
        15,
        "zeladoria",
        "limpeza-de-pracas-e-areas-verdes",
        "Limpeza de praças e áreas verdes",
      ),
      createSubService(
        16,
        "zeladoria",
        "capina-de-terrenos-publicos",
        "Capina de terrenos públicos",
      ),
      createSubService(
        17,
        "zeladoria",
        "manutencao-de-parques",
        "Manutenção de parques",
      ),
    ],
  },
  {
    id: 4,
    slug: "limpeza",
    icon: Trash2,
    cardTitle: "Limpeza Urbana",
    pageTitle: "Limpeza Urbana",
    href: "/servicos/limpeza",
    items: [
      createSubService(18, "limpeza", "coleta-de-entulho", "Coleta de entulho"),
      createSubService(
        19,
        "limpeza",
        "descarte-irregular-de-lixo",
        "Descarte irregular de lixo",
      ),
      createSubService(
        20,
        "limpeza",
        "limpeza-de-vias-publicas",
        "Limpeza de vias públicas",
      ),
      createSubService(
        21,
        "limpeza",
        "limpeza-pos-evento",
        "Limpeza pós-evento",
      ),
      createSubService(22, "limpeza", "coleta-seletiva", "Coleta seletiva"),
    ],
  },
  {
    id: 5,
    slug: "fiscalizacao",
    icon: BookSearch,
    cardTitle: "Fiscalização",
    pageTitle: "Fiscalização",
    href: "/servicos/fiscalizacao",
    items: [
      createSubService(
        23,
        "fiscalizacao",
        "denuncia-de-terreno-abandonado",
        "Denúncia de terreno abandonado",
      ),
      createSubService(
        24,
        "fiscalizacao",
        "fiscalizacao-de-obras-irregulares",
        "Fiscalização de obras irregulares",
      ),
      createSubService(
        25,
        "fiscalizacao",
        "fiscalizacao-de-comercio-irregular",
        "Fiscalização de comércio irregular",
      ),
      createSubService(
        26,
        "fiscalizacao",
        "poluicao-sonora",
        "Poluição sonora",
      ),
      createSubService(
        27,
        "fiscalizacao",
        "ocupacao-irregular-de-calcadas",
        "Ocupação irregular de calçadas",
      ),
    ],
  },
  {
    id: 6,
    slug: "mobilidade",
    icon: Car,
    cardTitle: "Mobilidade Urbana",
    pageTitle: "Mobilidade Urbana",
    href: "/servicos/mobilidade",
    items: [
      createSubService(
        28,
        "mobilidade",
        "solicitacao-de-ponto-de-onibus",
        "Solicitação de ponto de ônibus",
      ),
      createSubService(
        29,
        "mobilidade",
        "reclamacao-de-linha-de-onibus",
        "Reclamação de linha de ônibus",
      ),
      createSubService(
        30,
        "mobilidade",
        "falta-de-abrigo-em-ponto-de-onibus",
        "Falta de abrigo em ponto de ônibus",
      ),
      createSubService(
        31,
        "mobilidade",
        "problemas-de-acessibilidade",
        "Problemas de acessibilidade",
      ),
      createSubService(
        32,
        "mobilidade",
        "manutencao-de-ciclovias",
        "Manutenção de ciclovias",
      ),
    ],
  },
];

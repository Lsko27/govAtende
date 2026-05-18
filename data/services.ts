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
  slug: string;
  title: string;
  href: string;
};

export type Service = {
  slug: string;
  icon: LucideIcon;
  cardTitle: string;
  pageTitle: string;
  href: string;
  items: SubService[];
};

const createOccurrenceHref = (serviceSlug: string, subServiceSlug: string) => {
  return `/registro-ocorrencia?servico=${serviceSlug}&subservico=${subServiceSlug}`;
};

export const services: Service[] = [
  {
    slug: "infraestrutura",
    icon: Building2,
    cardTitle: "Infraestrutura Urbana",
    pageTitle: "Infraestrutura Urbana",
    href: "/servicos/infraestrutura",
    items: [
      {
        slug: "buracos-na-via",
        title: "Buracos na via",
        href: createOccurrenceHref("infraestrutura", "buracos-na-via"),
      },
      {
        slug: "recapeamento-asfaltico",
        title: "Recapeamento asfáltico",
        href: createOccurrenceHref("infraestrutura", "recapeamento-asfaltico"),
      },
      {
        slug: "manutencao-de-calcadas",
        title: "Manutenção de calçadas",
        href: createOccurrenceHref("infraestrutura", "manutencao-de-calcadas"),
      },
      {
        slug: "sinalizacao-viaria",
        title: "Sinalização viária",
        href: createOccurrenceHref("infraestrutura", "sinalizacao-viaria"),
      },
      {
        slug: "manutencao-de-semaforos",
        title: "Manutenção de semáforos",
        href: createOccurrenceHref("infraestrutura", "manutencao-de-semaforos"),
      },
      {
        slug: "lombadas-redutores-velocidade",
        title: "Lombadas e redutores de velocidade",
        href: createOccurrenceHref(
          "infraestrutura",
          "lombadas-redutores-velocidade",
        ),
      },
    ],
  },
  {
    slug: "iluminacao",
    icon: Lightbulb,
    cardTitle: "Iluminação",
    pageTitle: "Iluminação",
    href: "/servicos/iluminacao",
    items: [
      {
        slug: "lampada-queimada",
        title: "Lâmpada queimada",
        href: createOccurrenceHref("iluminacao", "lampada-queimada"),
      },
      {
        slug: "poste-sem-iluminacao",
        title: "Poste sem iluminação",
        href: createOccurrenceHref("iluminacao", "poste-sem-iluminacao"),
      },
      {
        slug: "iluminacao-piscando",
        title: "Iluminação piscando",
        href: createOccurrenceHref("iluminacao", "iluminacao-piscando"),
      },
      {
        slug: "fiacao-exposta",
        title: "Fiação exposta",
        href: createOccurrenceHref("iluminacao", "fiacao-exposta"),
      },
      {
        slug: "poste-danificado",
        title: "Poste danificado",
        href: createOccurrenceHref("iluminacao", "poste-danificado"),
      },
      {
        slug: "area-sem-iluminacao-publica",
        title: "Área sem iluminação pública",
        href: createOccurrenceHref("iluminacao", "area-sem-iluminacao-publica"),
      },
    ],
  },
  {
    slug: "zeladoria",
    icon: Trees,
    cardTitle: "Zeladoria e Meio Ambiente",
    pageTitle: "Zeladoria e Meio Ambiente",
    href: "/servicos/zeladoria",
    items: [
      {
        slug: "poda-de-arvore",
        title: "Poda de árvore",
        href: createOccurrenceHref("zeladoria", "poda-de-arvore"),
      },
      {
        slug: "arvore-caida",
        title: "Árvore caída",
        href: createOccurrenceHref("zeladoria", "arvore-caida"),
      },
      {
        slug: "mato-alto",
        title: "Mato alto",
        href: createOccurrenceHref("zeladoria", "mato-alto"),
      },
      {
        slug: "praca-danificada",
        title: "Praça danificada",
        href: createOccurrenceHref("zeladoria", "praca-danificada"),
      },
      {
        slug: "area-verde-abandonada",
        title: "Área verde abandonada",
        href: createOccurrenceHref("zeladoria", "area-verde-abandonada"),
      },
      {
        slug: "descarte-irregular-em-area-verde",
        title: "Descarte irregular em área verde",
        href: createOccurrenceHref(
          "zeladoria",
          "descarte-irregular-em-area-verde",
        ),
      },
    ],
  },
  {
    slug: "limpeza",
    icon: Trash2,
    cardTitle: "Limpeza Urbana",
    pageTitle: "Limpeza Urbana",
    href: "/servicos/limpeza",
    items: [
      {
        slug: "coleta-de-lixo",
        title: "Coleta de lixo",
        href: createOccurrenceHref("limpeza", "coleta-de-lixo"),
      },
      {
        slug: "entulho-em-via-publica",
        title: "Entulho em via pública",
        href: createOccurrenceHref("limpeza", "entulho-em-via-publica"),
      },
      {
        slug: "lixeira-danificada",
        title: "Lixeira danificada",
        href: createOccurrenceHref("limpeza", "lixeira-danificada"),
      },
      {
        slug: "varricao-de-rua",
        title: "Varrição de rua",
        href: createOccurrenceHref("limpeza", "varricao-de-rua"),
      },
      {
        slug: "bueiro-entupido",
        title: "Bueiro entupido",
        href: createOccurrenceHref("limpeza", "bueiro-entupido"),
      },
      {
        slug: "lixo-acumulado",
        title: "Lixo acumulado",
        href: createOccurrenceHref("limpeza", "lixo-acumulado"),
      },
    ],
  },
  {
    slug: "fiscalizacao",
    icon: BookSearch,
    cardTitle: "Fiscalização",
    pageTitle: "Fiscalização",
    href: "/servicos/fiscalizacao",
    items: [
      {
        slug: "comercio-irregular",
        title: "Comércio irregular",
        href: createOccurrenceHref("fiscalizacao", "comercio-irregular"),
      },
      {
        slug: "obra-irregular",
        title: "Obra irregular",
        href: createOccurrenceHref("fiscalizacao", "obra-irregular"),
      },
      {
        slug: "ocupacao-irregular-de-calcada",
        title: "Ocupação irregular de calçada",
        href: createOccurrenceHref(
          "fiscalizacao",
          "ocupacao-irregular-de-calcada",
        ),
      },
      {
        slug: "poluicao-sonora",
        title: "Poluição sonora",
        href: createOccurrenceHref("fiscalizacao", "poluicao-sonora"),
      },
      {
        slug: "publicidade-irregular",
        title: "Publicidade irregular",
        href: createOccurrenceHref("fiscalizacao", "publicidade-irregular"),
      },
      {
        slug: "descarte-irregular-de-residuos",
        title: "Descarte irregular de resíduos",
        href: createOccurrenceHref(
          "fiscalizacao",
          "descarte-irregular-de-residuos",
        ),
      },
    ],
  },
  {
    slug: "mobilidade",
    icon: Car,
    cardTitle: "Mobilidade Urbana",
    pageTitle: "Mobilidade Urbana",
    href: "/servicos/mobilidade",
    items: [
      {
        slug: "problema-em-ponto-de-onibus",
        title: "Problema em ponto de ônibus",
        href: createOccurrenceHref("mobilidade", "problema-em-ponto-de-onibus"),
      },
      {
        slug: "faixa-de-pedestre",
        title: "Faixa de pedestre",
        href: createOccurrenceHref("mobilidade", "faixa-de-pedestre"),
      },
      {
        slug: "semaforo-com-defeito",
        title: "Semáforo com defeito",
        href: createOccurrenceHref("mobilidade", "semaforo-com-defeito"),
      },
      {
        slug: "placa-de-transito-danificada",
        title: "Placa de trânsito danificada",
        href: createOccurrenceHref(
          "mobilidade",
          "placa-de-transito-danificada",
        ),
      },
      {
        slug: "ciclovia-danificada",
        title: "Ciclovia danificada",
        href: createOccurrenceHref("mobilidade", "ciclovia-danificada"),
      },
      {
        slug: "obstaculo-na-via",
        title: "Obstáculo na via",
        href: createOccurrenceHref("mobilidade", "obstaculo-na-via"),
      },
    ],
  },
];

import {
  BookSearch,
  Building2,
  Car,
  Lightbulb,
  Trash2,
  Trees,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  slug: string;
  icon: LucideIcon;
  cardTitle: string;
  pageTitle: string;
  href: string;
};

export const services: Service[] = [
  {
    slug: "infraestrutura",
    icon: Building2,
    cardTitle: "Infraestrutura Urbana",
    pageTitle: "Infraestrutura",
    href: "/servicos/infraestrutura",
  },
  {
    slug: "iluminacao",
    icon: Lightbulb,
    cardTitle: "Iluminação",
    pageTitle: "Iluminação",
    href: "/servicos/iluminacao",
  },
  {
    slug: "zeladoria",
    icon: Trees,
    cardTitle: "Zeladoria e Meio Ambiente",
    pageTitle: "Zeladoria e Meio Ambiente",
    href: "/servicos/zeladoria",
  },
  {
    slug: "limpeza",
    icon: Trash2,
    cardTitle: "Limpeza Urbana",
    pageTitle: "Limpeza Urbana",
    href: "/servicos/limpeza",
  },
  {
    slug: "fiscalizacao",
    icon: BookSearch,
    cardTitle: "Fiscalização",
    pageTitle: "Fiscalização",
    href: "/servicos/fiscalizacao",
  },
  {
    slug: "mobilidade",
    icon: Car,
    cardTitle: "Mobilidade Urbana",
    pageTitle: "Mobilidade Urbana",
    href: "/servicos/mobilidade",
  },
];

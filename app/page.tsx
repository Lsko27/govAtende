import LevelProgress from "@/components/level-progress";
import Navbar from "../components/navbar";
import SearchInput from "@/components/search-input";
import { Card } from "@/components/ui/card";
import {
  BookSearch,
  Building,
  Car,
  Lightbulb,
  Trash2,
  Trees,
} from "lucide-react";
import ServiceCard from "@/components/service-card";

const services = [
  {
    icon: Building,
    title: "Infraestrutura Urbana",
    href: "/servicos/infraestrutura",
  },
  {
    icon: Lightbulb,
    title: "Iluminação",
    href: "/servicos/iluminacao",
  },
  {
    icon: Trees,
    title: "Zeladoria e Meio Ambiente",
    href: "/servicos/zeladoria",
  },
  {
    icon: Trash2,
    title: "Limpeza Urbana",
    href: "/servicos/limpeza",
  },
  {
    icon: BookSearch,
    title: "Fiscalização",
    href: "/servicos/fiscalizacao",
  },
  {
    icon: Car,
    title: "Mobilidade Urbana",
    href: "/servicos/mobilidade",
  },
];

const Home = () => {
  return (
    <>
      <Navbar />
      <LevelProgress />
      <div className="mx-5 mt-5">
        <SearchInput />
      </div>

      <div className="mt-4 mx-5">
        <h1 className="text-2xl font-bold text-blue-900">Serviços</h1>
        <div className="mt-3 flex flex-col gap-1">
          {services.map((service) => (
            <ServiceCard
              key={service.href}
              icon={service.icon}
              title={service.title}
              href={service.href}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;

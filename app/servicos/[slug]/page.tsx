import LevelProgress from "@/components/level-progress";
import SearchInput from "@/components/search-input";
import SubServiceCard from "@/components/sub-service-card";
import { services } from "@/data/services";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const ServicePage = async ({ params }: PageProps) => {
  const { slug } = await params;

  const service = services.find((item) => item.slug === slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <LevelProgress />

      <main className="min-h-screen bg-zinc-100 px-5 pt-5">
        <SearchInput />

        <div className="mt-5">
          <div className="flex items-center gap-1">
            <h1 className="text-2xl font-bold text-blue-950">Serviços</h1>

            <span className="text-sm font-bold text-zinc-500">&gt;</span>

            <span className="text-sm font-bold text-blue-700">
              {service.pageTitle}
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {service.items.map((item) => (
              <SubServiceCard
                key={item.href}
                title={item.title}
                href={item.href}
              />
            ))}
          </div>

          <Link
            href="/servicos"
            className="mt-5 flex items-center gap-2 text-sm text-blue-950"
          >
            <ArrowLeft className="h-4 w-4" />
            voltar
          </Link>
        </div>
      </main>
    </>
  );
};

export default ServicePage;

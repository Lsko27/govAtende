import LevelProgress from "@/components/level-progress";
import Navbar from "@/components/navbar";
import SearchInput from "@/components/search-input";
import { services } from "@/data/services";
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
      <Navbar />
      <LevelProgress />

      <div className="mx-5 mt-5">
        <SearchInput />
      </div>

      <main className="mx-5 mt-6">
        <h1 className="text-2xl font-bold text-blue-900">
          {service.pageTitle}
        </h1>

        <p className="mt-3 text-gray-600">
          Selecione ou acompanhe solicitações relacionadas a {service.pageTitle}
          .
        </p>
      </main>
    </>
  );
};

export default ServicePage;

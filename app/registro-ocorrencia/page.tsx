import LevelProgress from "@/components/level-progress";
import Navbar from "@/components/navbar";
import OccurrenceForm from "@/components/form-ocorrencia";
import SearchInput from "@/components/search-input";
import { services } from "@/data/services";

type RegisterOccurrencePageProps = {
  searchParams: Promise<{
    servico?: string;
    subservico?: string;
  }>;
};

const RegisterOccurrencePage = async ({
  searchParams,
}: RegisterOccurrencePageProps) => {
  const { servico, subservico } = await searchParams;

  const selectedService = services.find((service) => service.slug === servico);

  const selectedSubService = selectedService?.items.find(
    (item) => item.slug === subservico,
  );

  return (
    <>
      <Navbar authenticated />
      <LevelProgress />

      <main className="min-h-screen bg-zinc-100 px-4 pt-4 pb-6">
        <SearchInput />

        <section className="mt-4">
          <div className="flex items-center gap-1 text-sm">
            <h1 className="text-lg font-bold text-blue-950">
              {selectedService?.pageTitle ?? "Serviço Base"}
            </h1>

            <span className="font-bold text-zinc-500">&gt;</span>

            <span className="font-bold text-blue-950">
              {selectedSubService?.title ?? "serviço solicitado"}
            </span>
          </div>

          <OccurrenceForm backHref={selectedService?.href ?? "/servicos"} />
        </section>
      </main>
    </>
  );
};

export default RegisterOccurrencePage;

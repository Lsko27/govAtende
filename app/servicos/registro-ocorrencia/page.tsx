import { notFound } from "next/navigation";

import LevelProgress from "@/components/level-progress";
import OccurrenceForm from "@/components/form-ocorrencia";
import SearchInput from "@/components/search-input";
import { services } from "@/data/services";

type RegisterOccurrencePageProps = {
  searchParams: Promise<{
    servico?: string;
    subservico?: string;
    subservicoId?: string;
  }>;
};

const RegisterOccurrencePage = async ({
  searchParams,
}: RegisterOccurrencePageProps) => {
  const { servico, subservico, subservicoId } = await searchParams;

  const selectedService = services.find((service) => service.slug === servico);

  const selectedSubService = selectedService?.items.find(
    (item) => item.slug === subservico,
  );

  const parsedSubServiceId = Number(subservicoId);

  if (
    !selectedService ||
    !selectedSubService ||
    !Number.isInteger(parsedSubServiceId) ||
    parsedSubServiceId !== selectedSubService.id
  ) {
    notFound();
  }

  return (
    <>
      <LevelProgress />

      <main className="min-h-screen bg-zinc-100 px-4 pb-8 pt-4">
        <div className="mx-auto w-full max-w-7xl">
          <SearchInput />

          <section className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-blue-950">
                {selectedService.pageTitle}
              </h1>

              <span className="font-bold text-zinc-500">&gt;</span>

              <span className="font-semibold text-blue-950">
                {selectedSubService.title}
              </span>
            </div>

            <OccurrenceForm
              backHref={selectedService.href}
              subservicoId={selectedSubService.id}
            />
          </section>
        </div>
      </main>
    </>
  );
};

export default RegisterOccurrencePage;

import LevelProgress from "@/components/level-progress";
import SearchInput from "@/components/search-input";
import ServiceCard from "@/components/service-card";
import { services } from "@/data/services";

const ServiceHomePage = () => {
  return (
    <>
      <LevelProgress />

      <div className="mx-5 mt-5">
        <SearchInput />
      </div>

      <div className="mt-6 mx-5">
        <h1 className="text-2xl font-bold text-blue-900">Serviços</h1>

        <div className="mt-3 flex flex-col gap-1">
          {services.map((service) => (
            <ServiceCard
              key={service.href}
              icon={service.icon}
              title={service.cardTitle}
              href={service.href}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ServiceHomePage;

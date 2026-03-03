import LevelProgress from "@/components/level-progress";
import Navbar from "@/components/navbar";
import SearchInput from "@/components/search-input";

interface SubservicesPageProps {
  params: { slug: string };
}

const SubservicesPage = ({ params }: SubservicesPageProps) => {
  return (
    <>
      <Navbar />
      <LevelProgress />
      <div className="mx-5 mt-5">
        <SearchInput />
        <h1>{params.slug}</h1>
      </div>
    </>
  );
};

export default SubservicesPage;

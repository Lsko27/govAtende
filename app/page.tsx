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
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Building />
              <p>Infraestrutura Urbana</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb />
              <p>Iluminação </p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Trees />
              <p>Zeladoria e Meio Ambiente</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Trash2 />
              <p>Limpeza Urbana</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <BookSearch />
              <p>Fiscalização</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Car />
              <p>Mobilidade Urbana</p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Home;

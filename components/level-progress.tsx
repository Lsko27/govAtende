import { TrendingUp } from "lucide-react";
import { Button } from "./ui/button";

const LevelProgress = () => {
  return (
    <div className="bg-linear-to-r from-blue-950 to-blue-700">
      <div className="mx-5 py-5 space-y-2">
        <h1 className="text-xl text-white">
          Olá, <span className="font-bold uppercase">yuri</span>
        </h1>
        <div className="space-y-5">
          <h2 className="uppercase text-sm text-white font-normal">
            sua conta é nível <span className="font-semibold">bronze</span>
          </h2>
          <div className="flex gap-2">
            <div className="flex-1 h-2 bg-amber-700"></div>
            <div className="flex-1 h-2 bg-gray-300 opacity-50"></div>
            <div className="flex-1 h-2 bg-gray-300 opacity-50"></div>
          </div>
          <div className="flex justify-end">
            <Button className="bg-white text-blue-700 hover:bg-white/90">
              <TrendingUp />
              <span className="text-xs uppercase font-normal ">
                Aumentar nível
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelProgress;

import IdentificationOption from "@/components/identification-option";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookMarked,
  CloudUpload,
  IdCardIcon,
  Landmark,
  Smartphone,
} from "lucide-react";

const LoginPage = () => {
  return (
    <>
      <Navbar />
      <div className="mt-8 px-5">
        <div className="px-5 py-10 bg-white rounded-xl">
          <h1 className="font-bold">Identifique-se com:</h1>
          <div className="flex gap-6 mt-6 items-center">
            <IdCardIcon className="h-9 w-9 text-blue-900" />
            <p className="font-medium text-gray-500">Número do CPF</p>
          </div>
          <div className="mt-8">
            <div className="flex flex-col gap-4">
              <p className="font-bold text-lg">CPF</p>
              <Input
                placeholder="Digite seu CPF"
                className="placeholder:italic"
              ></Input>
            </div>
          </div>
          <Button className="w-full mt-8 rounded-full bg-blue-800 text-md">
            Continuar
          </Button>

          <div className="mt-8">
            <p className="text-sm text-gray-500">
              Outras opções de identificação
            </p>
            <div className="mt-2 h-px bg-gray-400 w-full" />
          </div>

          <div className="mt-8 flex flex-col gap-3 mb-12">
            <IdentificationOption
              icon={Landmark}
              label="Login com seu banco"
              iconColor="text-green-500"
              badgeText="sua conta será prata"
              badgeColor="bg-green-500"
            />

            <IdentificationOption
              icon={Smartphone}
              label="Seu aplicativo gov.br"
            />

            <IdentificationOption
              icon={BookMarked}
              label="Seu certificado digital"
            />

            <IdentificationOption
              icon={CloudUpload}
              label="Seu certificado digital em nuvem"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

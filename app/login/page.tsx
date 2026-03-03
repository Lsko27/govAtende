"use client";

import { useState } from "react";
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
import { formatCpf } from "@/utils/formatters";

const LoginPage = () => {
  const [step, setStep] = useState<"cpf" | "senha">("cpf");
  const [cpf, setCpf] = useState("");

  return (
    <>
      <Navbar />

      <div className="mt-8 px-5">
        <div className="px-5 py-10 bg-white rounded-xl min-h-155 flex flex-col">
          <div className="flex-1">
            {step === "cpf" && (
              <>
                <h1 className="font-bold">Identifique-se com:</h1>

                <div className="flex gap-6 mt-6 items-center">
                  <IdCardIcon className="h-9 w-9 text-blue-900" />
                  <p className="font-medium text-gray-500">Número do CPF</p>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                  <p className="font-bold text-lg">CPF</p>

                  <Input
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    placeholder="Digite seu CPF"
                    className="placeholder:italic"
                  />
                </div>

                <Button
                  onClick={() => {
                    if (cpf.length >= 11) {
                      setStep("senha");
                    }
                  }}
                  className="w-full mt-8 rounded-full bg-blue-800 text-md"
                >
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
              </>
            )}

            {step === "senha" && (
              <>
                <h1 className="font-bold text-lg">Digite sua senha</h1>

                <div className="mt-6 flex flex-col gap-1">
                  <p className="text-md text-gray-800 font-medium">CPF</p>
                  <p className="font-bold">{cpf}</p>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <p className="font-medium">Senha</p>

                  <Input
                    type="password"
                    placeholder="Digite sua senha atual"
                    className="placeholder:italic"
                  />
                </div>

                <Button className="w-full mt-8 rounded-full bg-blue-800 text-md">
                  Continuar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

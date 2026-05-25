"use client";

import { useState } from "react";
import IdentificationOption from "@/components/identification-option";
import Navbar from "@/components/navbar";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookMarked,
  CloudUpload,
  IdCardIcon,
  Landmark,
  Smartphone,
} from "lucide-react";
import { formatCpf, maskCpf } from "@/utils/formatters";
import { isValidCpf } from "@/utils/validateCpf";
import { useRouter } from "next/navigation";
import { validatePassword } from "@/utils/validatePassword";

const LoginPage = () => {
  const [step, setStep] = useState<"cpf" | "senha">("cpf");
  const [cpf, setCpf] = useState("");
  const [cpfError, setCpfError] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaError, setSenhaError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleCpfContinue = () => {
    if (!cpf) {
      setCpfError("O CPF é obrigatório.");
      return;
    }

    if (!isValidCpf(cpf)) {
      setCpfError("CPF inválido. Por favor, verifique e tente novamente.");
      return;
    }
    setCpfError("");
    setStep("senha");
  };

  async function fakeLogin() {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return true;
  }

  const handleLogin = async () => {
    const passwordError = validatePassword(senha);

    if (passwordError) {
      setSenhaError(passwordError);

      await Swal.fire({
        icon: "error",
        title: "Senha inválida",
        text: passwordError,
        confirmButtonText: "OK",
        confirmButtonColor: "#1e40af",
      });

      return;
    }

    setSenhaError("");
    setIsLoading(true);

    try {
      await fakeLogin();

      await Swal.fire({
        icon: "success",
        title: "Login realizado com sucesso!",
        text: "Você será redirecionado para a área de serviços.",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#1e40af",
      });

      router.push("/servicos");
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Erro ao realizar login",
        text: "Não foi possível concluir o login. Tente novamente.",
        confirmButtonText: "OK",
        confirmButtonColor: "#1e40af",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                    onChange={(e) => {
                      setCpf(formatCpf(e.target.value));
                      setCpfError("");
                    }}
                    placeholder="Digite seu CPF"
                    maxLength={14}
                    className="placeholder:italic"
                  />

                  {cpfError && (
                    <p className="text-sm text-red-600">{cpfError}</p>
                  )}
                </div>

                <Button
                  onClick={handleCpfContinue}
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
                  <p className="font-bold">{maskCpf(cpf)}</p>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <p className="font-medium">Senha</p>

                  <Input
                    type="password"
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      setSenhaError("");
                    }}
                    placeholder="Digite sua senha atual"
                    className="placeholder:italic"
                  />

                  {senhaError && (
                    <p className="text-sm text-red-600">{senhaError}</p>
                  )}
                </div>

                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full mt-8 rounded-full bg-blue-800 text-md disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isLoading && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}

                    {isLoading ? "Entrando..." : "Continuar"}
                  </span>
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

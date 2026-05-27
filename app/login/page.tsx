"use client";

import { useState } from "react";
import Image from "next/image";
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
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-7xl items-center justify-center px-5 py-8 md:px-8 lg:justify-between lg:gap-12 lg:py-0">
        <div className="hidden flex-[1.4] items-center justify-center lg:flex">
          <div className="relative flex w-full max-w-190 flex-col items-center">
            <Image
              src="/govAtende-splash.png"
              alt="Ilustração govAtende"
              width={760}
              height={520}
              priority
              className="h-auto w-full max-w-190"
            />
          </div>
        </div>

        <div className="flex min-h-140 w-full max-w-90 shrink-0 flex-col rounded-sm bg-white px-4 py-7 shadow-[0_3px_14px_rgba(0,0,0,0.22)] md:px-5 md:py-8 lg:min-h-160">
          {step === "cpf" && (
            <>
              <h1 className="text-sm font-bold text-black">
                Identifique-se com:
              </h1>

              <div className="mt-6 flex items-center gap-4">
                <IdCardIcon className="h-6 w-6 text-blue-900" />
                <p className="text-sm font-medium text-gray-600">
                  Número do CPF
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <label className="text-sm font-bold text-black">CPF</label>

                <Input
                  value={cpf}
                  onChange={(e) => {
                    setCpf(formatCpf(e.target.value));
                    setCpfError("");
                  }}
                  placeholder="Digite seu CPF"
                  maxLength={14}
                  className="h-10 rounded-md border-gray-400 text-sm placeholder:italic"
                />

                {cpfError && <p className="text-xs text-red-600">{cpfError}</p>}
              </div>

              <Button
                onClick={handleCpfContinue}
                className="mt-7 h-9 w-full rounded-full bg-blue-800 text-sm font-semibold hover:bg-blue-900"
              >
                Continuar
              </Button>

              <div className="mt-6">
                <p className="text-[11px] text-gray-500">
                  Outras opções de identificação
                </p>
                <div className="mt-2 h-px w-full bg-gray-400" />
              </div>

              <div className="mt-5 flex flex-col gap-3">
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
              <h1 className="text-base font-bold text-black">
                Digite sua senha
              </h1>

              <div className="mt-6 flex flex-col gap-1">
                <p className="text-sm font-medium text-gray-800">CPF</p>
                <p className="font-bold text-black">{maskCpf(cpf)}</p>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <label className="text-sm font-medium text-black">Senha</label>

                <Input
                  type="password"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setSenhaError("");
                  }}
                  placeholder="Digite sua senha atual"
                  className="h-10 rounded-md border-gray-400 text-sm placeholder:italic"
                />

                {senhaError && (
                  <p className="text-xs text-red-600">{senhaError}</p>
                )}
              </div>

              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="mt-7 h-9 w-full rounded-full bg-blue-800 text-sm font-semibold hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
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
      </section>
    </main>
  );
};

export default LoginPage;

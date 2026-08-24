"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Eye, EyeOff, IdCardIcon, X } from "lucide-react";
import Swal from "sweetalert2";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCpf, maskCpf } from "@/utils/formatters";
import { isValidCpf } from "@/utils/validateCpf";

type CadastroStep = "dados" | "senha";

type FormErrors = {
  nome?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  senha?: string;
  confirmarSenha?: string;
};

const cleanCpf = (value: string) => value.replace(/\D/g, "");

const cleanPhone = (value: string) => value.replace(/\D/g, "");

const formatPhone = (value: string) => {
  const numbers = cleanPhone(value).slice(0, 11);

  if (numbers.length <= 2) {
    return numbers;
  }

  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }

  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(
      2,
      6,
    )}-${numbers.slice(6)}`;
  }

  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

const CadastroPage = () => {
  const router = useRouter();

  const [step, setStep] = useState<CadastroStep>("dados");

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const passwordRules = useMemo(
    () => [
      {
        label: "Mínimo 8 caracteres",
        valid: senha.length >= 8,
      },
      {
        label: "Máximo 16 caracteres",
        valid: senha.length <= 16,
      },
      {
        label: "Um caractere especial",
        valid: /[^A-Za-z0-9]/.test(senha),
      },
      {
        label: "Pelo menos uma letra minúscula",
        valid: /[a-z]/.test(senha),
      },
      {
        label: "Pelo menos uma letra maiúscula",
        valid: /[A-Z]/.test(senha),
      },
      {
        label: "Pelo menos um número",
        valid: /\d/.test(senha),
      },
    ],
    [senha],
  );

  const passwordIsValid = passwordRules.every((rule) => rule.valid);

  const clearError = (field: keyof FormErrors) => {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  };

  const handleContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    const phoneNumbers = cleanPhone(telefone);

    if (nome.trim().length < 3) {
      nextErrors.nome = "Informe seu nome completo.";
    }

    if (!isValidCpf(cleanCpf(cpf))) {
      nextErrors.cpf = "Informe um CPF válido.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Informe um e-mail válido.";
    }

    if (
      phoneNumbers &&
      phoneNumbers.length !== 10 &&
      phoneNumbers.length !== 11
    ) {
      nextErrors.telefone = "O telefone deve possuir 10 ou 11 dígitos.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setStep("senha");
  };

  const handleCadastro = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!passwordIsValid) {
      nextErrors.senha = "A senha ainda não atende a todos os requisitos.";
    }

    if (!confirmarSenha) {
      nextErrors.confirmarSenha = "Repita sua senha.";
    } else if (senha !== confirmarSenha) {
      nextErrors.confirmarSenha = "As senhas não são iguais.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
          cpf: cleanCpf(cpf),
          email: email.trim().toLowerCase(),
          telefone: cleanPhone(telefone) || null,
          senha,
        }),
      });

      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseBody?.detail ||
            responseBody?.message ||
            "Não foi possível realizar o cadastro.",
        );
      }

      await Swal.fire({
        icon: "success",
        title: "Cadastro realizado!",
        text: "Sua conta foi criada. Agora você pode entrar no GovAtende.",
        confirmButtonText: "Ir para o login",
        confirmButtonColor: "#1e40af",
      });

      router.replace("/");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o cadastro.";

      await Swal.fire({
        icon: "error",
        title: "Erro ao realizar cadastro",
        text: message,
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

      <section className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-7xl items-center justify-center px-5 py-10 md:px-8 lg:justify-between lg:gap-14 lg:py-0">
        <div className="hidden flex-[1.4] items-center justify-center lg:flex">
          <div className="relative flex w-full max-w-190 flex-col items-center">
            <Image
              src="/govAtende-splash.png"
              alt="Ilustração GovAtende"
              width={760}
              height={520}
              priority
              className="h-auto w-full max-w-190"
            />
          </div>
        </div>

        <div className="flex min-h-160 w-full max-w-110 shrink-0 flex-col rounded-xl bg-white px-6 py-8 shadow-[0_3px_18px_rgba(0,0,0,0.20)] md:px-8">
          <div className="mb-7">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500">
                Cadastro de cidadão
              </p>

              <p className="text-xs font-semibold text-blue-800">
                Etapa {step === "dados" ? "1" : "2"} de 2
              </p>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full bg-blue-800 transition-all ${
                  step === "dados" ? "w-1/2" : "w-full"
                }`}
              />
            </div>
          </div>

          {step === "dados" && (
            <form onSubmit={handleContinue}>
              <h1 className="text-lg font-bold text-black">Cadastre-se com:</h1>

              <div className="mt-6 flex items-center gap-3">
                <IdCardIcon className="h-6 w-6 text-blue-900" />

                <p className="text-sm font-medium text-gray-600">
                  Seus dados pessoais
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="nome"
                    className="text-sm font-semibold text-black"
                  >
                    Nome completo
                  </label>

                  <Input
                    id="nome"
                    value={nome}
                    onChange={(event) => {
                      setNome(event.target.value);
                      clearError("nome");
                    }}
                    placeholder="Digite seu nome completo"
                    autoComplete="name"
                    className="h-11 border-gray-400 placeholder:italic"
                  />

                  {errors.nome && (
                    <p className="text-xs text-red-600">{errors.nome}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="cpf"
                    className="text-sm font-semibold text-black"
                  >
                    CPF
                  </label>

                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(event) => {
                      setCpf(formatCpf(event.target.value));
                      clearError("cpf");
                    }}
                    placeholder="Digite seu CPF"
                    inputMode="numeric"
                    maxLength={14}
                    className="h-11 border-gray-400 placeholder:italic"
                  />

                  {errors.cpf && (
                    <p className="text-xs text-red-600">{errors.cpf}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-black"
                  >
                    E-mail
                  </label>

                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      clearError("email");
                    }}
                    placeholder="Digite seu e-mail"
                    autoComplete="email"
                    className="h-11 border-gray-400 placeholder:italic"
                  />

                  {errors.email && (
                    <p className="text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="telefone"
                    className="text-sm font-semibold text-black"
                  >
                    Telefone{" "}
                    <span className="font-normal text-gray-500">
                      (opcional)
                    </span>
                  </label>

                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(event) => {
                      setTelefone(formatPhone(event.target.value));
                      clearError("telefone");
                    }}
                    placeholder="(11) 99999-9999"
                    inputMode="tel"
                    maxLength={15}
                    autoComplete="tel"
                    className="h-11 border-gray-400 placeholder:italic"
                  />

                  {errors.telefone && (
                    <p className="text-xs text-red-600">{errors.telefone}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="mt-7 h-10 w-full rounded-full bg-blue-800 font-semibold hover:bg-blue-900"
              >
                Continuar
              </Button>

              <p className="mt-6 text-center text-sm text-gray-600">
                Já possui uma conta?{" "}
                <Link
                  href="/"
                  className="font-semibold text-blue-800 hover:underline"
                >
                  Entrar
                </Link>
              </p>
            </form>
          )}

          {step === "senha" && (
            <form onSubmit={handleCadastro}>
              <button
                type="button"
                onClick={() => setStep("dados")}
                className="mb-5 flex items-center gap-2 text-sm font-medium text-blue-800 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>

              <h1 className="text-lg font-bold text-black">Crie sua senha</h1>

              <div className="mt-5">
                <p className="text-sm font-medium text-gray-700">CPF</p>

                <p className="mt-1 font-bold text-black">{maskCpf(cpf)}</p>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <label
                  htmlFor="senha"
                  className="text-sm font-semibold text-black"
                >
                  Senha
                </label>

                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    value={senha}
                    onChange={(event) => {
                      setSenha(event.target.value);
                      clearError("senha");
                    }}
                    placeholder="Digite sua senha"
                    maxLength={16}
                    autoComplete="new-password"
                    className="h-11 border-gray-400 pr-11 placeholder:italic"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {errors.senha && (
                  <p className="text-xs text-red-600">{errors.senha}</p>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {passwordRules.map((rule) => (
                  <div
                    key={rule.label}
                    className={`flex items-center gap-2 text-xs ${
                      rule.valid ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {rule.valid ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}

                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <label
                  htmlFor="confirmarSenha"
                  className="text-sm font-semibold text-black"
                >
                  Repita sua senha
                </label>

                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    type={showPasswordConfirmation ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(event) => {
                      setConfirmarSenha(event.target.value);
                      clearError("confirmarSenha");
                    }}
                    placeholder="Digite sua senha novamente"
                    maxLength={16}
                    autoComplete="new-password"
                    className="h-11 border-gray-400 pr-11 placeholder:italic"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswordConfirmation((current) => !current)
                    }
                    aria-label={
                      showPasswordConfirmation
                        ? "Ocultar confirmação"
                        : "Mostrar confirmação"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  >
                    {showPasswordConfirmation ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {errors.confirmarSenha && (
                  <p className="text-xs text-red-600">
                    {errors.confirmarSenha}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-7 h-10 w-full rounded-full bg-blue-800 font-semibold hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default CadastroPage;

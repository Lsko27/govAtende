"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";

import { Eye, EyeOff, IdCard, LockKeyhole } from "lucide-react";

import Navbar from "@/components/navbar";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ServerLoginResponse = {
  servidorId: number;
  nome: string;
  cargo: string;
  mensagem: string;
};

const ServerLoginPage = () => {
  const router = useRouter();

  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!matricula.trim() || !senha) {
      setError("Informe a matrícula e a senha.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/servidor/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          matricula: matricula.trim(),
          senha,
        }),
      });

      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseBody?.detail ||
            responseBody?.message ||
            "Matrícula ou senha inválidas.",
        );
      }

      const server = responseBody as ServerLoginResponse;

      await Swal.fire({
        icon: "success",
        title: "Login realizado",
        text: `Bem-vindo, ${server.nome}.`,
        confirmButtonText: "Acessar painel",
        confirmButtonColor: "#172554",
      });

      router.replace("/servidor/painel");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o login.";

      setError(message);

      await Swal.fire({
        icon: "error",
        title: "Erro ao entrar",
        text: message,
        confirmButtonText: "OK",
        confirmButtonColor: "#172554",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section
        className="
          mx-auto flex min-h-[calc(100vh-88px)]
          w-full max-w-7xl items-center justify-center
          gap-12 px-5 py-8 md:px-8 lg:py-12
        "
      >
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <Image
            src="/govAtende-splash.png"
            alt="Ilustração GovAtende"
            width={700}
            height={500}
            priority
            className="h-auto w-full max-w-2xl"
          />
        </div>

        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <p className="text-sm font-medium text-blue-700">
              Área administrativa
            </p>

            <CardTitle className="text-2xl text-blue-950">
              Acesso do servidor
            </CardTitle>

            <p className="text-sm leading-6 text-zinc-500">
              Entre com sua matrícula funcional para gerenciar as solicitações
              dos cidadãos.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>

                <div className="relative">
                  <IdCard
                    className="
                      absolute top-1/2 left-3 h-4 w-4
                      -translate-y-1/2 text-zinc-400
                    "
                  />

                  <Input
                    id="matricula"
                    type="text"
                    value={matricula}
                    onChange={(event) => {
                      setMatricula(event.target.value);
                      setError("");
                    }}
                    placeholder="Digite sua matrícula"
                    autoComplete="username"
                    className="h-11 pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>

                <div className="relative">
                  <LockKeyhole
                    className="
                      absolute top-1/2 left-3 h-4 w-4
                      -translate-y-1/2 text-zinc-400
                    "
                  />

                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    value={senha}
                    onChange={(event) => {
                      setSenha(event.target.value);
                      setError("");
                    }}
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    className="h-11 px-10"
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    className="
                      absolute top-1/2 right-3
                      -translate-y-1/2 text-zinc-500
                    "
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full bg-blue-950 hover:bg-blue-900"
              >
                {isLoading && (
                  <span
                    className="
                      h-4 w-4 animate-spin rounded-full
                      border-2 border-white
                      border-t-transparent
                    "
                  />
                )}

                {isLoading ? "Entrando..." : "Entrar no painel"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default ServerLoginPage;

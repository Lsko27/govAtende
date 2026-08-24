"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";

import NotificationsDropdown from "@/components/notification-dropdown";

import { ClipboardList, LogOut, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavbarProps = {
  authenticated?: boolean;
  requestsHref?: string;
};

const Navbar = ({
  authenticated = false,
  requestsHref = "/servicos/minhas-solicitacoes",
}: NavbarProps) => {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const homeHref = authenticated ? "/servicos" : "/";

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Não foi possível encerrar a sessão.");
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Erro ao sair",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível encerrar a sessão.",
        confirmButtonText: "OK",
        confirmButtonColor: "#172554",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Card className="rounded-none border-x-0 border-t-0">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <Link
            href={homeHref}
            aria-label="Ir para a página inicial"
            className="cursor-pointer"
          >
            <Image
              src="/GovAtende.png"
              width={130}
              height={130}
              alt="GovAtende"
              priority
            />
          </Link>

          {authenticated && (
            <div className="flex items-center gap-4">
              <NotificationsDropdown />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Abrir menu do usuário"
                    className="
                      flex h-10 w-10 cursor-pointer items-center
                      justify-center rounded-full bg-zinc-700
                      outline-none transition hover:bg-zinc-800
                      focus-visible:ring-2
                      focus-visible:ring-blue-700
                    "
                  >
                    <User className="h-6 w-6 text-gray-300" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha conta</DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href={requestsHref} className="cursor-pointer">
                      <ClipboardList className="h-4 w-4" />
                      Minhas solicitações
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    disabled={isLoggingOut}
                    onClick={() => void handleLogout()}
                    className="
                      cursor-pointer text-red-600
                      focus:bg-red-50 focus:text-red-700
                    "
                  >
                    <LogOut className="h-4 w-4 text-red-600" />

                    {isLoggingOut ? "Saindo..." : "Sair da conta"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Navbar;

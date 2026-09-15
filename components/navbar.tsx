"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";

import NotificationsDropdown from "@/components/notification-dropdown";

import {
  ChartColumn,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavbarVariant = "cidadao" | "servidor";

type NavbarProps = {
  authenticated?: boolean;
  variant?: NavbarVariant;
  requestsHref?: string;
  userName?: string;
  userRole?: string;
};

type NavigationConfig = {
  homeHref: string;
  loginHref: string;
  logoutEndpoint: string;
  settingsHref: string;
};

const navigationConfig: Record<NavbarVariant, NavigationConfig> = {
  cidadao: {
    homeHref: "/servicos",
    loginHref: "/",
    logoutEndpoint: "/api/auth/logout",
    settingsHref: "/configuracoes?perfil=cidadao",
  },

  servidor: {
    homeHref: "/servidor/painel",
    loginHref: "/servidor",
    logoutEndpoint: "/api/auth/servidor/logout",
    settingsHref: "/configuracoes?perfil=servidor",
  },
};

const Navbar = ({
  authenticated = false,
  variant = "cidadao",
  requestsHref = "/servicos/minhas-solicitacoes",
  userName,
  userRole,
}: NavbarProps) => {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isServer = variant === "servidor";

  const currentNavigation = navigationConfig[variant];

  const homeHref = authenticated
    ? currentNavigation.homeHref
    : currentNavigation.loginHref;

  const displayedName = userName ?? (isServer ? "Servidor" : "Minha conta");

  const displayedRole = userRole ?? (isServer ? "Servidor público" : "Cidadão");

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await fetch(currentNavigation.logoutEndpoint, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Não foi possível encerrar a sessão.");
      }

      router.replace(currentNavigation.loginHref);
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
              {!isServer && <NotificationsDropdown />}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Abrir menu do usuário"
                    className="
                      flex h-10 w-10 cursor-pointer
                      items-center justify-center
                      rounded-full bg-zinc-700
                      outline-none transition
                      hover:bg-zinc-800
                      focus-visible:ring-2
                      focus-visible:ring-blue-700
                    "
                  >
                    <User className="h-6 w-6 text-gray-300" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="font-normal">
                    <p className="truncate text-sm font-semibold text-blue-950">
                      {displayedName}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {displayedRole}
                    </p>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {isServer ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/servidor/painel"
                          className="cursor-pointer"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Painel administrativo
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link
                          href="/servidor/relatorios"
                          className="cursor-pointer"
                        >
                          <ChartColumn className="h-4 w-4" />
                          Relatórios estatísticos
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href={requestsHref} className="cursor-pointer">
                        <ClipboardList className="h-4 w-4" />
                        Minhas solicitações
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link
                      href={currentNavigation.settingsHref}
                      className="cursor-pointer"
                    >
                      <Settings className="h-4 w-4" />
                      Configurações
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    disabled={isLoggingOut}
                    onSelect={() => void handleLogout()}
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

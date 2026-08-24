import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, ClipboardList, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type NavbarProps = {
  authenticated?: boolean;
  requestsHref?: string;
};

const Navbar = ({
  authenticated = false,
  requestsHref = "/servicos/minhas-solicitacoes",
}: NavbarProps) => {
  const homeHref = authenticated ? "/servicos" : "/";

  return (
    <Card className="relative z-50 rounded-none border-x-0 border-t-0">
      <CardContent>
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
            />
          </Link>

          {authenticated && (
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Abrir notificações"
                className="rounded-full p-2 transition-colors hover:bg-gray-100"
              >
                <Bell className="h-6 w-6 text-gray-500" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Abrir menu do usuário"
                    className="flex items-center gap-2 rounded-full p-1 outline-none transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-800"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                      <User className="h-6 w-6 text-gray-300" />
                    </span>

                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-64"
                >
                  <DropdownMenuLabel>
                    <p className="text-xs font-normal text-gray-500">
                      Área do cidadão
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-gray-900">
                      Minha conta GovAtende
                    </p>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link
                        href={requestsHref}
                        className="flex cursor-pointer items-center gap-3 py-2.5"
                      >
                        <ClipboardList className="h-5 w-5 text-blue-800" />

                        <span>Minhas solicitações</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
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

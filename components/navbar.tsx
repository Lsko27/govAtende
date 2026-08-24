import { Card, CardContent } from "@/components/ui/card";
import { Bell, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type NavbarProps = {
  authenticated?: boolean;
};

const Navbar = ({ authenticated = false }: NavbarProps) => {
  const homeHref = authenticated ? "/servicos" : "/";

  return (
    <Card>
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
            <div className="flex items-center justify-between gap-4">
              <Bell className="h-6 w-6 text-gray-500" />

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                <User className="h-6 w-6 text-gray-300" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Navbar;

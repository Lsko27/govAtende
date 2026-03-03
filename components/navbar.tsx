import { Card, CardContent } from "@/components/ui/card";
import { Bell, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <Card>
      <CardContent>
        <div className=" flex items-center justify-between">
          <Link href="/servicos">
            <Image
              src="/GovAtende.png"
              width={130}
              height={130}
              alt="GovAtende"
            />
          </Link>
          <div className="flex items-center justify-between gap-4">
            <Bell className="h-6 w-6 text-gray-500" />

            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-700">
              <User className="h-6 w-6 text-gray-300" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Navbar;

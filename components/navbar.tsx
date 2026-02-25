import { Card } from "@/components/ui/card";
import { Bell, User } from "lucide-react";
import Image from "next/image";

const Navbar = () => {
  return (
    <Card>
      <div className="mx-5 flex items-center justify-between">
        <Image
          src="/GovAtende-blue.png"
          width={130}
          height={130}
          alt="GovAtende"
        />
        <div className="flex items-center justify-between gap-4">
          <Bell className="h-6 w-6 text-gray-500" />

          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-700">
            <User className="h-6 w-6 text-gray-300" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Navbar;

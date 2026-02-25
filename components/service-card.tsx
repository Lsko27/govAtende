import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  href: string;
}

const ServiceCard = ({ icon: Icon, title, href }: ServiceCardProps) => {
  return (
    <Link href={href} className="block">
      <Card className="p-4 hover:bg-muted/50 transition cursor-pointer">
        <div className="flex items-start gap-3">
          <Icon className="h-7 w-7 text-blue-700" />
          <p className="text-md font-bold">{title}</p>
        </div>
      </Card>
    </Link>
  );
};

export default ServiceCard;

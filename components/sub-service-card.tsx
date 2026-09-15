import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

type SubServiceCardProps = {
  title: string;
  href: string;
};

const SubServiceCard = ({ title, href }: SubServiceCardProps) => {
  return (
    <Link href={href}>
      <Card className="cursor-pointer p-4 transition hover:bg-muted/50">
        <CardContent className="p-0">
          <p className="text-md font-bold text-blue-950">{title}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SubServiceCard;

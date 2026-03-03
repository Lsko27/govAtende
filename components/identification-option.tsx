import { LucideIcon } from "lucide-react";

interface IdentificationOptionProps {
  icon: LucideIcon;
  label: string;
  iconColor?: string;
  badgeText?: string;
  badgeColor?: string;
}

const IdentificationOption = ({
  icon: Icon,
  label,
  iconColor = "text-blue-600",
  badgeText,
  badgeColor = "bg-green-500",
}: IdentificationOptionProps) => {
  return (
    <div className="flex items-center gap-3 mt-3 cursor-pointer">
      <Icon className={`h-6 w-6 ${iconColor}`} />

      <p className="text-sm">{label}</p>

      {badgeText && (
        <div className={`${badgeColor} px-2 py-1 rounded`}>
          <p className="text-xs font-bold uppercase text-white">{badgeText}</p>
        </div>
      )}
    </div>
  );
};

export default IdentificationOption;

import { Search } from "lucide-react";
import { Input } from "./ui/input";

const SearchInput = () => {
  return (
    <div className="relative border border-gray-300 rounded-lg">
      <Input
        placeholder="Solicite um serviço"
        className="pr-10 placeholder:italic"
      />
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <Search className="h-6 w-6 text-gray-400" />
      </div>
    </div>
  );
};

export default SearchInput;

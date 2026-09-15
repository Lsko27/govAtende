import Navbar from "@/components/navbar";
import { Input } from "@/components/ui/input";

const PasswordRecovery = () => {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <h1 className="mx-auto mt-10 max-w-7xl px-6 text-center text-2xl font-bold text-gray-900 md:px-8 lg:mt-16">
        Recuperação de Senha
      </h1>
      <p className="mx-auto mt-4 max-w-2xl px-6 text-center text-sm text-gray-600 md:px-8">
        Insira seu CPF para receber as instruções de recuperação de senha.
      </p>
      <div className="mx-auto mt-8 max-w-2xl px-6 md:px-8">
        <label
          htmlFor="cpf"
          className="block text-sm font-medium text-gray-700"
        >
          CPF
        </label>
        <Input
          id="cpf"
          name="cpf"
          type="text"
          placeholder="Digite seu CPF"
          maxLength={14}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div className="mx-auto mt-6 max-w-2xl px-6 md:px-8">
        <button className="mt-4 w-full rounded-full bg-blue-800 py-3 text-sm font-semibold text-white hover:bg-blue-900">
          Enviar Instruções
        </button>
      </div>
    </main>
  );
};

export default PasswordRecovery;

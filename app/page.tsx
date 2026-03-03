import Image from "next/image";
import Link from "next/link";

const SplashScreenPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between px-6 py-12">
      <div className="flex flex-col items-center">
        <Image
          src="/govAtende-splash.png"
          alt="Splash Screen"
          width={700}
          height={200}
          className="mt-12"
        />
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <Link
          href="/login"
          className="bg-blue-800 text-white text-center py-3 rounded-full font-medium"
        >
          Entrar com gov.br
        </Link>

        <Link
          href="/cadastro"
          className="border-2 border-blue-800 text-blue-800 text-center py-3 rounded-full font-medium"
        >
          Cadastrar
        </Link>
      </div>
    </div>
  );
};

export default SplashScreenPage;

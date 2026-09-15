import Image from "next/image";
import Link from "next/link";

const SplashScreenPage = () => {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-between px-6 py-10 md:px-8 lg:justify-center lg:gap-10">
        <div className="flex flex-1 items-center justify-center lg:flex-none">
          <Image
            src="/govAtende-splash.png"
            alt="govAtende"
            width={760}
            height={520}
            priority
            className="h-auto w-full max-w-155 md:max-w-175 lg:max-w-190"
          />
        </div>

        <div className="flex w-full max-w-90 flex-col gap-4 pb-4 lg:pb-0">
          <Link
            href="/login"
            className="rounded-full bg-blue-800 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-900"
          >
            Entrar com gov.br
          </Link>

          <Link
            href="/cadastro"
            className="rounded-full border-2 border-blue-800 py-3 text-center text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
          >
            Cadastrar
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SplashScreenPage;
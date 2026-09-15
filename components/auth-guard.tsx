"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type AuthGuardProps = {
  children: ReactNode;
};

const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    const validateBearerToken = async () => {
      const token = localStorage.getItem("govatende_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!token || !apiUrl) {
        router.replace("/");
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/cidadaos/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("govatende_token");
          localStorage.removeItem("govatende_usuario");

          router.replace("/");
          return;
        }

        if (!response.ok) {
          throw new Error("Não foi possível validar a autenticação.");
        }

        setIsAuthenticated(true);
      } catch {
        setConnectionError(true);
      } finally {
        setIsChecking(false);
      }
    };

    void validateBearerToken();
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-800 border-t-transparent" />
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-600">
          Não foi possível validar sua autenticação.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-blue-800 px-4 py-2 text-sm text-white"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default AuthGuard;

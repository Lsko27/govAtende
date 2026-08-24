import type { ReactNode } from "react";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "govatende_session";

type ServicosLayoutProps = {
  children: ReactNode;
};

export default async function ServicosLayout({
  children,
}: ServicosLayoutProps) {
  const apiUrl = process.env.BACKEND_API_URL;

  if (!apiUrl) {
    throw new Error("BACKEND_API_URL não foi configurada.");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    redirect("/");
  }

  const response = await fetch(`${apiUrl}/cidadaos/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    redirect("/");
  }

  if (!response.ok) {
    throw new Error("Não foi possível validar a sessão.");
  }

  return children;
}

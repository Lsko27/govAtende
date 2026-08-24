const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL não foi configurada");
  }

  const headers = new Headers(opcoes.headers);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("govatende_token")
      : null;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (opcoes.body && !(opcoes.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers,
    cache: "no-store",
  });

  if (resposta.status === 204) {
    return undefined as T;
  }

  const tipoConteudo = resposta.headers.get("content-type");
  const dados = tipoConteudo?.includes("application/json")
    ? await resposta.json()
    : await resposta.text();

  if (!resposta.ok) {
    const mensagem =
      typeof dados === "object"
        ? dados.detail || dados.message || "Erro na requisição"
        : dados || "Erro na requisição";

    throw new Error(mensagem);
  }

  return dados as T;
}

import { NextResponse } from "next/server";

type ServerProfile = "SERVIDOR" | "AUDITOR";

type ServerLoginResponse = {
  token: string;
  tipo: string;
  expiraEmSegundos: number;
  servidorId: number;
  nome: string;
  cargo: string;
  perfil: ServerProfile;
  mensagem: string;
};

export async function POST(request: Request) {
  const backendApiUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "");

  if (!backendApiUrl) {
    return NextResponse.json(
      {
        message: "A variável BACKEND_API_URL não está configurada.",
      },
      {
        status: 500,
      },
    );
  }

  const requestBody = await request.json().catch(() => null);

  if (!requestBody?.matricula?.trim() || !requestBody?.senha) {
    return NextResponse.json(
      {
        message: "Matrícula e senha são obrigatórias.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const backendResponse = await fetch(
      `${backendApiUrl}/auth/servidor/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          matricula: requestBody.matricula.trim(),
          senha: requestBody.senha,
        }),
        cache: "no-store",
      },
    );

    const responseBody = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return NextResponse.json(
        responseBody ?? {
          message: "Não foi possível realizar o login.",
        },
        {
          status: backendResponse.status,
        },
      );
    }

    const loginResponse = responseBody as ServerLoginResponse;

    if (
      loginResponse.perfil !== "SERVIDOR" &&
      loginResponse.perfil !== "AUDITOR"
    ) {
      return NextResponse.json(
        {
          message: "O perfil retornado pelo servidor é inválido.",
        },
        {
          status: 502,
        },
      );
    }

    const response = NextResponse.json({
      servidorId: loginResponse.servidorId,
      nome: loginResponse.nome,
      cargo: loginResponse.cargo,
      perfil: loginResponse.perfil,
      mensagem: loginResponse.mensagem,
    });

    response.cookies.set({
      name: "govatende_servidor_session",
      value: loginResponse.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: loginResponse.expiraEmSegundos,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        message: "Não foi possível conectar ao servidor.",
      },
      {
        status: 503,
      },
    );
  }
}

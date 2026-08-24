import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "govatende_session";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { message: "Origem da requisição não permitida." },
      { status: 403 },
    );
  }

  const apiUrl = process.env.BACKEND_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { message: "A URL do back-end não foi configurada." },
      { status: 500 },
    );
  }

  try {
    const credentials = await request.json();

    const backendResponse = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });

    const responseBody = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return NextResponse.json(
        responseBody ?? {
          message: "Não foi possível realizar o login.",
        },
        { status: backendResponse.status },
      );
    }

    if (!responseBody?.token) {
      return NextResponse.json(
        { message: "O back-end não retornou o token JWT." },
        { status: 502 },
      );
    }

    const response = NextResponse.json({
      cidadaoId: responseBody.cidadaoId,
      nome: responseBody.nome,
      mensagem: responseBody.mensagem,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: responseBody.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: responseBody.expiraEmSegundos,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Não foi possível conectar ao back-end." },
      { status: 503 },
    );
  }
}

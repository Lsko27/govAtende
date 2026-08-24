import { NextRequest, NextResponse } from "next/server";

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
      { message: "O back-end não foi configurado." },
      { status: 500 },
    );
  }

  try {
    const requestBody = await request.json();

    const backendResponse = await fetch(`${apiUrl}/cidadaos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    const responseBody = await backendResponse.json().catch(() => null);

    return NextResponse.json(
      responseBody ?? {
        message: "Não foi possível processar o cadastro.",
      },
      { status: backendResponse.status },
    );
  } catch {
    return NextResponse.json(
      { message: "Não foi possível conectar ao back-end." },
      { status: 503 },
    );
  }
}

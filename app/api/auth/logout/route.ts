import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "govatende_session";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { message: "Origem não permitida." },
      { status: 403 },
    );
  }

  const response = NextResponse.json({
    message: "Logout realizado com sucesso.",
  });

  response.cookies.delete(COOKIE_NAME);

  return response;
}

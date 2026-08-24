import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "govatende_session";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const apiUrl = process.env.BACKEND_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { message: "O back-end não foi configurado." },
      { status: 500 },
    );
  }

  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(request.method);

  if (isMutation) {
    const origin = request.headers.get("origin");

    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json(
        { message: "Origem não permitida." },
        { status: 403 },
      );
    }
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Usuário não autenticado." },
      { status: 401 },
    );
  }

  const { path } = await context.params;

  const safePath = path.map((segment) => encodeURIComponent(segment)).join("/");

  const backendUrl = new URL(`${apiUrl}/${safePath}`);
  backendUrl.search = request.nextUrl.search;

  const headers = new Headers();

  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", request.headers.get("accept") ?? "application/json");

  const contentType = request.headers.get("content-type");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);

  const backendResponse = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
  });

  const responseHeaders = new Headers();

  const responseContentType = backendResponse.headers.get("content-type");

  const contentDisposition = backendResponse.headers.get("content-disposition");

  if (responseContentType) {
    responseHeaders.set("Content-Type", responseContentType);
  }

  if (contentDisposition) {
    responseHeaders.set("Content-Disposition", contentDisposition);
  }

  const response = new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    headers: responseHeaders,
  });

  if (backendResponse.status === 401 || backendResponse.status === 403) {
    response.cookies.delete(COOKIE_NAME);
  }

  return response;
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;

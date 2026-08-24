import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

const mutationMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const handleRequest = async (request: NextRequest, context: RouteContext) => {
  const backendApiUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "");

  if (!backendApiUrl) {
    return Response.json(
      {
        message: "BACKEND_API_URL não está configurada.",
      },
      {
        status: 500,
      },
    );
  }

  if (mutationMethods.has(request.method)) {
    const origin = request.headers.get("origin");

    if (origin && origin !== request.nextUrl.origin) {
      return Response.json(
        {
          message: "Origem da requisição não permitida.",
        },
        {
          status: 403,
        },
      );
    }
  }

  const { path } = await context.params;

  const isServerRoute = path[0] === "servidor";

  const cookieName = isServerRoute
    ? "govatende_servidor_session"
    : "govatende_session";

  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;

  if (!token) {
    return Response.json(
      {
        message: "Usuário não autenticado.",
      },
      {
        status: 401,
      },
    );
  }

  const encodedPath = path
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const backendUrl = `${backendApiUrl}/${encodedPath}` + request.nextUrl.search;

  const headers = new Headers();

  headers.set("Authorization", `Bearer ${token}`);

  const accept = request.headers.get("accept");
  const contentType = request.headers.get("content-type");

  if (accept) {
    headers.set("Accept", accept);
  }

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  let body: ArrayBuffer | undefined;

  if (request.method !== "GET" && request.method !== "HEAD") {
    const requestBody = await request.arrayBuffer();

    if (requestBody.byteLength > 0) {
      body = requestBody;
    }
  }

  try {
    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });

    if (backendResponse.status === 401) {
      cookieStore.delete(cookieName);
    }

    const responseHeaders = new Headers();

    const forwardedHeaders = [
      "content-type",
      "content-disposition",
      "content-length",
    ];

    forwardedHeaders.forEach((headerName) => {
      const value = backendResponse.headers.get(headerName);

      if (value) {
        responseHeaders.set(headerName, value);
      }
    });

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      {
        message: "Não foi possível conectar ao back-end.",
      },
      {
        status: 503,
      },
    );
  }
};

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;

import { NextResponse } from "next/server";

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      details,
    },
    { status: 400 },
  );
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status: 401 },
  );
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status: 403 },
  );
}

export function tooManyRequests(retryAfterSeconds: number, message = "Too many requests") {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}

export function serverError(message = "Internal server error") {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status: 500 },
  );
}


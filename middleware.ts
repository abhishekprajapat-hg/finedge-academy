import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const cookieName = "fin_edu_session";

async function readSession(request: NextRequest) {
  const token = request.cookies.get(cookieName)?.value;
  if (!token) {
    return null;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(secret));
    return verified.payload as { role?: "USER" | "ADMIN" };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/dashboard")) {
    const session = await readSession(request);

    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/admin")) {
    const isAdminRoot = pathname === "/admin" || pathname === "/admin/";
    if (isAdminRoot) {
      return NextResponse.next();
    }

    const session = await readSession(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};


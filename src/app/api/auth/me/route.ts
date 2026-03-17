import { NextResponse } from "next/server";
import { getSessionUserFromCookies } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUserFromCookies();
  return NextResponse.json({
    ok: true,
    user,
  });
}


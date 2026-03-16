import { getSessionFromRequest } from "@/lib/auth";
import { forbidden, unauthorized } from "@/lib/http";

export async function requireAuth(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return { error: unauthorized(), session: null };
  }
  return { session, error: null };
}

export async function requireAdmin(request: Request) {
  const auth = await requireAuth(request);
  if (auth.error || !auth.session) {
    return auth;
  }

  if (auth.session.role !== "ADMIN") {
    return { session: null, error: forbidden("Admin access required") };
  }

  return auth;
}


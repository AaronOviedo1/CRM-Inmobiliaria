import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TODO(backend): add next-auth session guard here when backend is wired up.
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  // Mock portal cookies so portal pages don't redirect to login during preview.
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/portal-propietario") && !request.cookies.get("crm_portal_session")) {
    response.cookies.set("crm_portal_session", "mock_owner_token", { path: "/", maxAge: 86400 });
  }
  if (pathname.startsWith("/portal-inquilino") && !request.cookies.get("crm_portal_session")) {
    response.cookies.set("crm_portal_session", "mock_tenant_token", { path: "/", maxAge: 86400 });
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js)).*)"],
};

export type { NextRequest };

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session-token";

/**
 * First line of defence: bounce signed-out visitors (and non-admins on
 * /admin) before the page renders. Pages and API routes re-check against the
 * database, so a blocked user or a revoked role is caught there too.
 */
export async function middleware(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname, search } = req.nextUrl;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/exam/:path*", "/results/:path*", "/leaderboard/:path*"],
};

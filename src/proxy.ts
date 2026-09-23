import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_PATHS = ["/sign-in", "/sign-up"];
const LOCAL_ROOT_HOST = "localhost:3000";

function getSubdomain(host: string) {
  if (host === LOCAL_ROOT_HOST) return null;

  if (host.endsWith(`.${LOCAL_ROOT_HOST}`)) {
    return host.slice(0, -`.${LOCAL_ROOT_HOST}`.length);
  }

  const hostWithoutPort = host.split(":")[0];
  const labels = hostWithoutPort.split(".");

  return labels.length > 2 ? labels[0] : null;
}

function getClubIdFromPath(pathname: string) {
  const match = pathname.match(/^\/clubs\/([^/]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const originalPath = `${url.pathname}${url.search}`;
  const host = request.headers.get("host") ?? "";
  const subdomain = getSubdomain(host);
  const pathClubId = getClubIdFromPath(url.pathname);
  const hasClubScope = Boolean(subdomain ?? pathClubId);
  const isAuthPath = AUTH_PATHS.includes(url.pathname);
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-current-path", originalPath);
  requestHeaders.set(
    "x-app-scope",
    hasClubScope
      ? "club"
      : url.pathname.startsWith("/clubs")
        ? "platform"
        : "landing",
  );

  if (subdomain) {
    requestHeaders.set("x-club-slug", subdomain);
    requestHeaders.delete("x-club-id");
  } else if (pathClubId) {
    requestHeaders.set("x-club-id", pathClubId);
    requestHeaders.delete("x-club-slug");
  } else {
    requestHeaders.delete("x-club-id");
    requestHeaders.delete("x-club-slug");
  }

  if (subdomain && !isAuthPath) {
    url.pathname = `/clubs/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};

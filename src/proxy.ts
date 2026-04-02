import { NextResponse, NextRequest } from "next/server";

function extractSubdomain(request: NextRequest): string | null {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];
  const parts = hostname.split(".");

  if (parts.length > 2) {
    return parts[0];
  }

  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  if (subdomain) {
    return NextResponse.rewrite(
      new URL(`/clubs/${subdomain}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next|[\\w-]+\\.\\w+).*)",
};
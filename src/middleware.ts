import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  const sessionCookie = getSessionCookie(request);
  if (sessionCookie && ["/sign-in", "/sign-up"].includes(url.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (!sessionCookie && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const hostName = request.headers.get("host") || "";
  const root = "localhost";

  const sub = hostName.endsWith(root)
    ? hostName.replace(`.${root}`, "")
    : hostName.split(".")[0];

  console.log("Subdomain", sub);

  if (sub && sub !== "www" && sub !== "localhost") {
    url.pathname = `/clubs/${sub}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|sign-in|sign-up|signin|signup).*)",
  ],
};

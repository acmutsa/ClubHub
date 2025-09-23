import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  console.log("Next URL", request.nextUrl);
  console.log("URL", request.url);

  // const hostName = request.nextUrl.hostname;
  const url = request.nextUrl;
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
  matcher: "/(.*)",
};

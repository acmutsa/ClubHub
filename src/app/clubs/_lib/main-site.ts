// Absolute URL on the main (non-club) domain.
// On a club subdomain, a relative redirect like "/clubs" gets rewritten by
// src/proxy.ts to "/clubs/<sub>/clubs" and 404s, so cross-site redirects
// must point at the root domain explicitly.
const ROOT_URL = (process.env.NEXT_PUBLIC_ROOT_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function mainSiteUrl(path: string) {
  return `${ROOT_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

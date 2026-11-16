import { headers } from "next/headers";

export async function getRequestIpAddress(): Promise<string | null> {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");

  return (
    forwardedFor?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || null
  );
}

import { env } from "@/env";
import {
  createHmac,
  timingSafeEqual
} from "node:crypto";

function sign(rawToken: string) {
  return createHmac("sha256", env.EVENT_PASS_SECRET).update(rawToken).digest("base64url");
}

export function signEventPassToken(rawToken: string) {
  return `${rawToken}.${sign(rawToken)}`;
}

export function readEventPassToken(signedToken: string): string | null {
  const parts = signedToken.split(".");
  if (parts.length != 2) {
    return null;
  }

  const [rawToken, signature] = parts;
  if (!rawToken || !signature) {
    return null;
  }

  const expected = Buffer.from(sign(rawToken));
  const provided = Buffer.from(signature);
  if (expected.length != provided.length) {
    return null;
  }

  return timingSafeEqual(expected, provided) ? rawToken : null;
}

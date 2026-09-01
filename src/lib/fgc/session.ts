import { cookies } from "next/headers";
import { getFgcRuntimeConfig } from "@/lib/fgc/env";
import { createSecureToken, hashToken } from "@/lib/fgc/security";

export const fgcSessionCookieName = "fgc_session";

export class FgcSessionConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FgcSessionConfigurationError";
  }
}

export function requireSessionSecret() {
  const { sessionSecret } = getFgcRuntimeConfig();
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new FgcSessionConfigurationError("FGC_SESSION_SECRET must be configured with at least 32 characters before issuing sessions.");
  }
  return sessionSecret;
}

export function createSessionToken() {
  requireSessionSecret();
  const token = createSecureToken();
  return {
    token,
    sessionHash: hashToken(`${token}:${getFgcRuntimeConfig().sessionSecret}`)
  };
}

export async function setFgcSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(fgcSessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearFgcSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(fgcSessionCookieName);
}

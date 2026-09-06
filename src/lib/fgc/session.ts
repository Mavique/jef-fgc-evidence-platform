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

export function getSessionTtlSeconds() {
  return getFgcRuntimeConfig().sessionTtlSeconds;
}

export async function setFgcSessionCookie(token: string) {
  const cookieStore = await cookies();
  const { environment } = getFgcRuntimeConfig();
  cookieStore.set(fgcSessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: environment === "production" || environment === "staging",
    path: "/",
    maxAge: getSessionTtlSeconds()
  });
}

export async function clearFgcSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(fgcSessionCookieName);
}

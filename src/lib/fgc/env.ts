export type FgcRuntimeConfig = {
  environment: "development" | "test" | "staging" | "production" | "invalid";
  databaseUrl?: string;
  appUrl: string;
  emailProvider?: string;
  emailFrom?: string;
  emailApiKey?: string;
  sessionSecret?: string;
  evidenceStorageProvider?: string;
  evidenceStorageBucket?: string;
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  maxUploadBytes: number;
  sessionTtlSeconds: number;
  verificationTokenTtlSeconds: number;
  passwordResetTokenTtlSeconds: number;
};

const cloudflareBufferedUploadMaxBytes = 10_000_000;
export const fgcTtlBounds = {
  session: { min: 900, max: 86_400, fallback: 28_800 },
  verification: { min: 900, max: 604_800, fallback: 86_400 },
  passwordReset: { min: 900, max: 86_400, fallback: 3_600 }
} as const;

function runtimeEnvironment(): FgcRuntimeConfig["environment"] {
  const configured = process.env.FGC_ENVIRONMENT?.trim().toLowerCase();
  if (configured && ["development", "test", "staging", "production"].includes(configured)) {
    return configured as FgcRuntimeConfig["environment"];
  }
  if (configured) return "invalid";
  if (process.env.NODE_ENV === "production") return "production";
  if (process.env.NODE_ENV === "test") return "test";
  return "development";
}

function boundedNumber(name: string, fallback: number, min: number, max: number) {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  return Number.isInteger(value) && value >= min && value <= max ? value : fallback;
}

export function getFgcTtlSeconds() {
  return {
    session: boundedNumber("FGC_SESSION_TTL_SECONDS", fgcTtlBounds.session.fallback, fgcTtlBounds.session.min, fgcTtlBounds.session.max),
    verification: boundedNumber("FGC_VERIFICATION_TOKEN_TTL_SECONDS", fgcTtlBounds.verification.fallback, fgcTtlBounds.verification.min, fgcTtlBounds.verification.max),
    passwordReset: boundedNumber("FGC_PASSWORD_RESET_TOKEN_TTL_SECONDS", fgcTtlBounds.passwordReset.fallback, fgcTtlBounds.passwordReset.min, fgcTtlBounds.passwordReset.max)
  };
}

export function getFgcRuntimeConfig(): FgcRuntimeConfig {
  const environment = runtimeEnvironment();
  const parsedMaxUploadBytes = Number(process.env.FGC_MAX_UPLOAD_BYTES ?? cloudflareBufferedUploadMaxBytes);
  const configuredMaxUploadBytes = Number.isFinite(parsedMaxUploadBytes) && parsedMaxUploadBytes > 0 ? parsedMaxUploadBytes : cloudflareBufferedUploadMaxBytes;
  const ttl = getFgcTtlSeconds();
  return {
    environment,
    databaseUrl: process.env.DATABASE_URL,
    appUrl: process.env.FGC_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    emailProvider: process.env.FGC_EMAIL_PROVIDER,
    emailFrom: process.env.FGC_EMAIL_FROM,
    emailApiKey: process.env.FGC_EMAIL_API_KEY,
    sessionSecret: process.env.FGC_SESSION_SECRET,
    evidenceStorageProvider: process.env.FGC_EVIDENCE_STORAGE_PROVIDER,
    evidenceStorageBucket: process.env.FGC_EVIDENCE_STORAGE_BUCKET,
    supabaseUrl: process.env.FGC_SUPABASE_URL,
    supabaseServiceRoleKey: process.env.FGC_SUPABASE_SERVICE_ROLE_KEY,
    maxUploadBytes: Math.min(configuredMaxUploadBytes, cloudflareBufferedUploadMaxBytes),
    sessionTtlSeconds: ttl.session,
    verificationTokenTtlSeconds: ttl.verification,
    passwordResetTokenTtlSeconds: ttl.passwordReset
  };
}

export function getMissingProductionConfig(config: Partial<FgcRuntimeConfig> = getFgcRuntimeConfig()) {
  const missing: string[] = [];
  if (!config.environment || config.environment === "invalid") missing.push("FGC_ENVIRONMENT");
  if (!config.databaseUrl) missing.push("DATABASE_URL");
  if (!config.sessionSecret) missing.push("FGC_SESSION_SECRET");
  if (!config.emailProvider) missing.push("FGC_EMAIL_PROVIDER");
  if (!config.emailFrom) missing.push("FGC_EMAIL_FROM");
  if (!config.emailApiKey) missing.push("FGC_EMAIL_API_KEY");
  if (!config.evidenceStorageProvider) missing.push("FGC_EVIDENCE_STORAGE_PROVIDER");
  if (!config.evidenceStorageBucket) missing.push("FGC_EVIDENCE_STORAGE_BUCKET");
  if (config.evidenceStorageProvider === "supabase" && !config.supabaseUrl) missing.push("FGC_SUPABASE_URL");
  if (config.evidenceStorageProvider === "supabase" && !config.supabaseServiceRoleKey) missing.push("FGC_SUPABASE_SERVICE_ROLE_KEY");
  if (config.environment === "staging" || config.environment === "production") {
    if (config.emailProvider && config.emailProvider !== "resend") missing.push("FGC_EMAIL_PROVIDER_SUPPORTED");
    if (config.evidenceStorageProvider && config.evidenceStorageProvider !== "supabase") missing.push("FGC_EVIDENCE_STORAGE_PROVIDER_SUPPORTED");
    const rawMaxUploadBytes = process.env.FGC_MAX_UPLOAD_BYTES;
    if (rawMaxUploadBytes !== undefined && (!/^\d+$/.test(rawMaxUploadBytes) || Number(rawMaxUploadBytes) <= 0 || Number(rawMaxUploadBytes) > cloudflareBufferedUploadMaxBytes)) missing.push("FGC_MAX_UPLOAD_BYTES");
    try {
      const url = new URL(config.appUrl ?? "");
      if (url.protocol !== "https:") missing.push("FGC_APP_URL_HTTPS");
      if (["localhost", "127.0.0.1", "::1"].includes(url.hostname)) missing.push("FGC_APP_URL_PUBLIC_HOST");
      const configuredProductionUrl = process.env.FGC_PRODUCTION_APP_URL;
      if (config.environment === "staging" && configuredProductionUrl && url.origin === configuredProductionUrl.replace(/\/$/, "")) missing.push("FGC_APP_URL_STAGING_SEPARATION");
      if (config.environment === "production" && process.env.FGC_STAGING_APP_URL && url.origin === process.env.FGC_STAGING_APP_URL.replace(/\/$/, "")) missing.push("FGC_APP_URL_PRODUCTION_SEPARATION");
    } catch {
      missing.push("FGC_APP_URL_VALID");
    }
  }
  if (config.environment === "staging" || config.environment === "production") {
    if (!Number.isInteger(config.sessionTtlSeconds) || config.sessionTtlSeconds === undefined || config.sessionTtlSeconds < fgcTtlBounds.session.min || config.sessionTtlSeconds > fgcTtlBounds.session.max) missing.push("FGC_SESSION_TTL_SECONDS");
    if (!Number.isInteger(config.verificationTokenTtlSeconds) || config.verificationTokenTtlSeconds === undefined || config.verificationTokenTtlSeconds < fgcTtlBounds.verification.min || config.verificationTokenTtlSeconds > fgcTtlBounds.verification.max) missing.push("FGC_VERIFICATION_TOKEN_TTL_SECONDS");
    if (!Number.isInteger(config.passwordResetTokenTtlSeconds) || config.passwordResetTokenTtlSeconds === undefined || config.passwordResetTokenTtlSeconds < fgcTtlBounds.passwordReset.min || config.passwordResetTokenTtlSeconds > fgcTtlBounds.passwordReset.max) missing.push("FGC_PASSWORD_RESET_TOKEN_TTL_SECONDS");
  }
  return missing;
}

export function isProductionConfigured() {
  return getMissingProductionConfig().length === 0;
}

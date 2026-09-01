export type FgcRuntimeConfig = {
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
};

export function getFgcRuntimeConfig(): FgcRuntimeConfig {
  return {
    databaseUrl: process.env.DATABASE_URL,
    appUrl: process.env.FGC_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    emailProvider: process.env.FGC_EMAIL_PROVIDER,
    emailFrom: process.env.FGC_EMAIL_FROM,
    emailApiKey: process.env.FGC_EMAIL_API_KEY,
    sessionSecret: process.env.FGC_SESSION_SECRET,
    evidenceStorageProvider: process.env.FGC_EVIDENCE_STORAGE_PROVIDER,
    evidenceStorageBucket: process.env.FGC_EVIDENCE_STORAGE_BUCKET,
    supabaseUrl: process.env.FGC_SUPABASE_URL,
    supabaseServiceRoleKey: process.env.FGC_SUPABASE_SERVICE_ROLE_KEY
  };
}

export function getMissingProductionConfig(config = getFgcRuntimeConfig()) {
  const missing: string[] = [];
  if (!config.databaseUrl) missing.push("DATABASE_URL");
  if (!config.sessionSecret) missing.push("FGC_SESSION_SECRET");
  if (!config.emailProvider) missing.push("FGC_EMAIL_PROVIDER");
  if (!config.emailFrom) missing.push("FGC_EMAIL_FROM");
  if (!config.emailApiKey) missing.push("FGC_EMAIL_API_KEY");
  if (!config.evidenceStorageProvider) missing.push("FGC_EVIDENCE_STORAGE_PROVIDER");
  if (!config.evidenceStorageBucket) missing.push("FGC_EVIDENCE_STORAGE_BUCKET");
  return missing;
}

export function isProductionConfigured() {
  return getMissingProductionConfig().length === 0;
}

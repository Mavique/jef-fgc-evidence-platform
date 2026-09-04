import { NextResponse } from "next/server";
import { FgcConfigurationError } from "@/lib/fgc/db";
import { FgcEmailConfigurationError } from "@/lib/fgc/mailer";
import { FgcSessionConfigurationError } from "@/lib/fgc/session";

export function jsonError(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json({ ok: false, code, message, details }, { status });
}

export function productionConfigError(missingConfig: string[]) {
  return jsonError(
    503,
    "FGC_PRODUCTION_CONFIG_INCOMPLETE",
    "The FGC production backend is not fully configured for this operation.",
    { missingConfig }
  );
}

export function routeError(error: unknown) {
  if (error instanceof FgcValidationError) {
    return jsonError(error.status, error.code, error.message, error.details);
  }

  if (error instanceof FgcConfigurationError || error instanceof FgcEmailConfigurationError || error instanceof FgcSessionConfigurationError) {
    return jsonError(503, error.name, error.message);
  }

  if (isDatabaseError(error) && error.code === "23505") {
    return jsonError(409, "FGC_DUPLICATE_RECORD", "A record with these unique details already exists.");
  }

  return jsonError(500, "FGC_SERVER_ERROR", "The FGC operation could not be completed.");
}

function isDatabaseError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && typeof (error as { code?: unknown }).code === "string";
}

export class FgcValidationError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "FgcValidationError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

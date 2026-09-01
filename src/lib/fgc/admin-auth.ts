import type { NextRequest } from "next/server";
import { FgcValidationError } from "@/lib/fgc/api";
import { resolveFgcCurrentUserFromToken } from "@/lib/fgc/current-user";
import { fgcSessionCookieName } from "@/lib/fgc/session";

const administratorRoles = new Set(["JEF_ADMINISTRATOR", "PLATFORM_SUPER_ADMINISTRATOR"]);

export async function requireFgcAdministrator(request: NextRequest) {
  const currentUser = await resolveFgcCurrentUserFromToken(request.cookies.get(fgcSessionCookieName)?.value);
  if (!currentUser.ok) {
    throw new FgcValidationError(401, "FGC_ADMIN_AUTH_REQUIRED", "Sign in with an approved JEF Administrator account before managing FGC access.");
  }

  const adminRole = currentUser.roles.find((role) => role.status === "APPROVED" && administratorRoles.has(role.code));
  if (!adminRole || !currentUser.access.canOpenProtectedWorkspace) {
    throw new FgcValidationError(403, "FGC_ADMIN_ROLE_REQUIRED", "This operation requires an approved JEF Administrator role.");
  }

  return {
    user: currentUser.user,
    role: adminRole,
    access: currentUser.access
  };
}

export function hasApprovedAdministratorRole(roles: Array<{ code: string; status: string }>) {
  return roles.some((role) => role.status === "APPROVED" && administratorRoles.has(role.code));
}

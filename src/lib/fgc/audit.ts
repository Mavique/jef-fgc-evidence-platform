import { fgcQuery } from "@/lib/fgc/db";

export type AuditInput = {
  actorUserId?: string;
  actorRole?: string;
  action: string;
  objectType: string;
  objectId?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
};

export async function recordAuditEvent(input: AuditInput) {
  await fgcQuery(
    `INSERT INTO fgc.production_audit_events (
      actor_user_id,
      actor_role,
      action,
      object_type,
      object_id,
      reason,
      metadata,
      correlation_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)`,
    [
      input.actorUserId ?? null,
      input.actorRole ?? null,
      input.action,
      input.objectType,
      input.objectId ?? null,
      input.reason ?? null,
      JSON.stringify(input.metadata ?? {}),
      input.correlationId ?? null
    ]
  );
}

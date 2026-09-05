export type FgcIntegrationFaultPoint =
  | "lecturer_submission_after_snapshot"
  | "assessor_submission_after_review"
  | "moderator_finalization_after_decision";

const allowedFaultPoints = new Set<FgcIntegrationFaultPoint>([
  "lecturer_submission_after_snapshot",
  "assessor_submission_after_review",
  "moderator_finalization_after_decision"
]);

export function throwFgcIntegrationFault(point: FgcIntegrationFaultPoint) {
  if (process.env.NODE_ENV !== "test" || process.env.FGC_INTEGRATION_TEST !== "1") return;
  const configured = process.env.FGC_TEST_FAULT_POINT;
  if (!configured) return;
  if (!allowedFaultPoints.has(configured as FgcIntegrationFaultPoint)) {
    throw new Error("Invalid FGC integration fault point.");
  }
  if (configured === point) throw new Error(`FGC integration fault: ${point}`);
}

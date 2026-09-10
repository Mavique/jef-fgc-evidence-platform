export const POSTGRES_IMAGE: string;
export function sanitizeDiagnostic(value: unknown): string;
export function runDockerCommand(
  args: string[],
  options?: { stage?: string; runner?: (...args: unknown[]) => unknown; options?: Record<string, unknown> },
): string;
export function createContainerName(pid?: number, timestamp?: number): string;
export function runIntegrationLifecycle(input: {
  start: () => Promise<void>;
  waitForReady: () => Promise<void>;
  configure: () => Promise<void>;
  migrate: () => Promise<void>;
  test: () => Promise<void>;
  cleanup: () => Promise<void>;
}): Promise<{ exitCode: number; failure?: string }>;

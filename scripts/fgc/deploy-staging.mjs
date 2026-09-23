import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { verifyArtifact, requireGate, WORKER } from './staging-artifact.mjs';
import { bindingGate, controllerRoot, credentialGate, currentVersion, health, metadataGate, report, settings, versionGate } from './staging-control.mjs';

try {
  requireGate(process.env.GITHUB_RUN_ATTEMPT === '1', 'Deployment reruns are forbidden');
  const { controller } = await metadataGate();
  const artifact = verifyArtifact(process.env.ARTIFACT_ROOT, { controller, runId: process.env.VALIDATION_RUN_ID });
  await credentialGate();
  bindingGate(artifact.config, await settings());
  await health();
  // Last read before the sole write: refuse a changed or ambiguous live deployment.
  const previous = await versionGate();
  report({ wrangler_invoked: true, worker: WORKER, artifact_sha256: artifact.manifest.artifactSha256 });
  const result = spawnSync(process.execPath, [resolve(controllerRoot, 'node_modules/wrangler/bin/wrangler.js'), 'deploy', '--config', resolve(artifact.root, 'server/wrangler.staging.json'), '--name', WORKER, '--keep-vars'], { cwd: controllerRoot, env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' }, stdio: 'inherit' });
  requireGate(result.status === 0, 'Wrangler deployment failed; do not retry');
  const version = await currentVersion();
  requireGate(version !== previous, 'No new live Worker version observed');
  report({ deployment: 'verified', previous_version: previous, resulting_version: version });
  await health();
} catch (error) { console.error(error.message); process.exitCode = 1; }

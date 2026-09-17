import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runPreflight } from './cloudflare-credential-preflight.mjs';
import { ARTIFACT, ORIGIN, PAYLOAD, WORKER, requireGate, stampArtifact, verifyArtifact } from './staging-artifact.mjs';

const REPO = 'Mavique/jef-fgc-evidence-platform';
export const controllerRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const report = value => {
  const text = JSON.stringify(value);
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n\`\`\`json\n${text}\n\`\`\`\n`);
};
async function request(url, token) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
  let body = null;
  try { body = await response.json(); } catch { /* Fail closed below. */ }
  return { status: response.status, body };
}
export async function github(path) {
  const response = await request(`https://api.github.com/repos/${REPO}/${path}`, process.env.GH_TOKEN);
  requireGate(response.status === 200, 'GitHub metadata unavailable');
  return response.body;
}
export function validateMetadata({ run, artifact, controller, runId, artifactId }) {
  requireGate(run.id === Number(runId) && run.status === 'completed' && run.conclusion === 'success', 'Source validation did not succeed');
  requireGate(run.head_sha === controller && run.head_branch === 'main' && run.event === 'workflow_dispatch' && run.path === '.github/workflows/fgc-validation.yml', 'Untrusted source workflow');
  requireGate(run.repository?.full_name === REPO, 'Source repository mismatch');
  requireGate(artifact.id === Number(artifactId) && artifact.name === ARTIFACT && artifact.expired === false && Date.parse(artifact.expires_at) > Date.now(), 'Artifact unavailable or expired');
  requireGate(artifact.workflow_run?.id === run.id && artifact.workflow_run?.head_sha === controller, 'Artifact source mismatch');
  requireGate(/^sha256:[a-f0-9]{64}$/.test(artifact.digest), 'Missing GitHub archive checksum');
}
export async function mainGate() {
  const controller = process.env.GITHUB_SHA;
  requireGate(process.env.GITHUB_REPOSITORY === REPO && process.env.GITHUB_REF === 'refs/heads/main', 'Controller must run from main');
  requireGate(execFileSync('git', ['-C', controllerRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() === controller, 'Controller checkout mismatch');
  const main = await github('commits/main');
  requireGate(main.sha === controller, 'Main advanced; revalidation required');
  const pr = await github('pulls/2');
  requireGate(pr.state === 'open' && !pr.merged && pr.head.sha === PAYLOAD, 'PR 2 changed or merged');
  return controller;
}
export async function metadataGate() {
  const controller = await mainGate();
  requireGate(process.env.PAYLOAD_SHA === PAYLOAD && process.env.TARGET_WORKER === WORKER, 'Unauthorized payload or Worker');
  requireGate(/^\d+$/.test(process.env.VALIDATION_RUN_ID) && /^\d+$/.test(process.env.ARTIFACT_ID), 'Invalid provenance IDs');
  requireGate(/^[a-f0-9-]{36}$/.test(process.env.EXPECTED_PREVIOUS_VERSION), 'Invalid previous version');
  const [run, artifact] = await Promise.all([github(`actions/runs/${process.env.VALIDATION_RUN_ID}`), github(`actions/artifacts/${process.env.ARTIFACT_ID}`)]);
  validateMetadata({ run, artifact, controller, runId: process.env.VALIDATION_RUN_ID, artifactId: process.env.ARTIFACT_ID });
  report({ controller_sha: controller, payload_sha: PAYLOAD, validation_run_id: run.id, artifact_id: artifact.id, archive_digest: artifact.digest, expired: artifact.expired });
  return { controller, artifact };
}
export async function cf(path) {
  requireGate(process.env.CLOUDFLARE_API_TOKEN && /^[a-f0-9]{32}$/i.test(process.env.CLOUDFLARE_ACCOUNT_ID), 'Missing Cloudflare configuration');
  const response = await request(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/${path}`, process.env.CLOUDFLARE_API_TOKEN);
  requireGate(response.status === 200 && response.body?.success === true, 'Cloudflare read failed');
  return response.body.result;
}
export async function credentialGate() {
  const result = await runPreflight({ token: process.env.CLOUDFLARE_API_TOKEN, accountId: process.env.CLOUDFLARE_ACCOUNT_ID, request });
  report({ credential_preflight: result.code, token_classification: result.tokenCode ?? 'unverified', account_access: result.code === 'PREFLIGHT_OK' ? 'passed' : 'not_confirmed', worker_access: result.code === 'PREFLIGHT_OK' ? 'passed' : 'not_confirmed' });
  requireGate(result.code === 'PREFLIGHT_OK', 'Credential preflight failed');
}
export function singleVersion(result) {
  const versions = result.deployments?.[0]?.versions;
  requireGate(versions?.length === 1 && versions[0].percentage === 100 && /^[a-f0-9-]{36}$/.test(versions[0].version_id), 'Ambiguous live Worker version');
  return versions[0].version_id;
}
export async function currentVersion() {
  return singleVersion(await cf(`workers/scripts/${WORKER}/deployments`));
}
export async function versionGate() {
  const version = await currentVersion();
  report({ worker: WORKER, previous_version: version });
  requireGate(version === process.env.EXPECTED_PREVIOUS_VERSION, 'Live Worker version mismatch');
  return version;
}
export async function health(requireReady = true) {
  const results = [];
  for (const route of ['/health', '/health/ready']) {
    const response = await fetch(ORIGIN + route, { signal: AbortSignal.timeout(20000), redirect: 'error' });
    const body = await response.json();
    const allowed = new Set(['ready', 'not_ready', 'not_configured', 'unavailable', 'unknown']);
    const checks = Object.fromEntries(['application', 'configuration', 'database', 'migrations', 'storage', 'email'].map(key => [key, allowed.has(body.checks?.[key]) ? body.checks[key] : 'unknown']));
    const good = response.status === 200 && body.ok === true && body.environment === 'staging' && (route === '/health' ? body.status === 'ok' : body.status === 'ready' && Object.values(checks).every(value => value === 'ready'));
    const result = { route, http_status: response.status, ready: good, ...(route.endsWith('/ready') ? { checks } : {}) };
    results.push(result);
    report(result);
  }
  if (requireReady) requireGate(results.every(r => r.ready), 'Staging readiness dependencies unresolved');
  return results;
}
export async function settings() { return cf(`workers/scripts/${WORKER}/settings`); }
export function bindingGate(config, live) {
  for (const [type, name, id] of [['hyperdrive', 'HYPERDRIVE', config.hyperdrive[0].id], ['kv_namespace', 'VINEXT_KV_CACHE', config.kv_namespaces[0].id]]) {
    const binding = live.bindings?.find(b => b.name === name && b.type === type);
    requireGate(binding && (binding.id ?? binding.namespace_id) === id, 'Staging binding differs from live Worker');
  }
  for (const [type, name] of [['images', 'IMAGES'], ['assets', 'ASSETS']]) requireGate(live.bindings?.some(b => b.name === name && b.type === type), 'Generated binding differs from live Worker');
  for (const [name, text] of Object.entries(config.vars)) {
    const binding = live.bindings?.find(b => b.name === name && b.type === 'plain_text');
    requireGate(binding?.text === text, `Existing staging variable differs: ${name}`);
  }
}
async function cli(mode) {
  if (mode === 'build-start') {
    const controller = await mainGate();
    requireGate(process.env.PAYLOAD_SHA === PAYLOAD, 'Unauthorized payload');
    requireGate((await github(`commits/${PAYLOAD}`)).sha === PAYLOAD, 'Payload commit unavailable');
    report({ controller_sha: controller, payload_sha: PAYLOAD });
  } else if (mode === 'checkout' || mode === 'stamp') {
    const root = resolve(process.env.PAYLOAD_ROOT);
    requireGate(process.env.PAYLOAD_SHA === PAYLOAD, 'Unauthorized payload');
    const head = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const branch = execFileSync('git', ['-C', root, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).trim();
    requireGate(head === PAYLOAD && branch === 'HEAD', 'Payload checkout must be exact and detached');
    report({ checked_out_payload_sha: head, detached: true });
    if (mode === 'stamp') {
      execFileSync('git', ['-C', root, 'diff', '--exit-code', 'HEAD', '--'], { stdio: 'pipe' });
      const artifact = stampArtifact(process.env.ARTIFACT_ROOT, { controller: process.env.GITHUB_SHA, runId: process.env.GITHUB_RUN_ID });
      report({ manifest: artifact.manifest, manifest_sha256: artifact.manifestSha256 });
    }
  } else if (mode === 'prepare') {
    const hyperdrive = process.env.FGC_CF_HYPERDRIVE_ID;
    const kv = process.env.FGC_CF_KV_NAMESPACE_ID;
    requireGate(/^[a-f0-9]{32}$/i.test(hyperdrive) && /^[a-f0-9]{32}$/i.test(kv), 'Missing staging resource identifiers');
    const dir = resolve(process.env.PAYLOAD_ROOT, '.wrangler/staging');
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'wrangler.jsonc'), JSON.stringify({ name: WORKER, vars: { FGC_ENVIRONMENT: 'staging', FGC_APP_URL: ORIGIN, NEXT_PUBLIC_APP_URL: ORIGIN, FGC_EVIDENCE_STORAGE_PROVIDER: 'supabase', FGC_EVIDENCE_STORAGE_BUCKET: 'jef-fgc-evidence-staging', FGC_CF_IMAGES_CONFIGURED: 'false' }, kv_namespaces: [{ binding: 'VINEXT_KV_CACHE', id: kv }], hyperdrive: [{ binding: 'HYPERDRIVE', id: hyperdrive }] }));
  } else if (mode === 'metadata') await metadataGate();
  else if (mode === 'preflight') { await credentialGate(); await versionGate(); await health(); }
  else if (mode === 'verify') {
    const verified = verifyArtifact(process.env.ARTIFACT_ROOT, { controller: process.env.GITHUB_SHA, runId: process.env.VALIDATION_RUN_ID });
    report({ manifest: verified.manifest, manifest_sha256: verified.manifestSha256 });
  } else if (mode === 'inspect') {
    await mainGate();
    await credentialGate();
    report({ worker: WORKER, current_version: await currentVersion() });
    const live = await settings();
    const required = ['FGC_ENVIRONMENT', 'FGC_APP_URL', 'DATABASE_URL', 'FGC_SESSION_SECRET', 'FGC_EMAIL_PROVIDER', 'FGC_EMAIL_FROM', 'FGC_EMAIL_API_KEY', 'FGC_EVIDENCE_STORAGE_PROVIDER', 'FGC_EVIDENCE_STORAGE_BUCKET', 'FGC_SUPABASE_URL', 'FGC_SUPABASE_SERVICE_ROLE_KEY'];
    report({ bindings: live.bindings?.map(({ name, type }) => ({ name, type })), missing_names: required.filter(name => !live.bindings?.some(b => b.name === name)) });
    await health(false);
  } else if (mode === 'health') await health();
  else throw new Error('Unknown controller operation');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) cli(process.argv[2]).catch(error => { console.error(error.message); process.exitCode = 1; });

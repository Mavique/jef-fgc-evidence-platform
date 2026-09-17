import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, lstatSync, realpathSync, writeFileSync } from 'node:fs';
import { resolve, relative, isAbsolute, sep } from 'node:path';

export const PAYLOAD = '3676a7f92cd7acecd9da596151df860590901b7d';
export const WORKER = 'jef-fgc-staging';
export const ARTIFACT = `${WORKER}-${PAYLOAD}`;
export const ORIGIN = 'https://jef-fgc-staging.victor-b5a.workers.dev';
export const sha256 = data => createHash('sha256').update(data).digest('hex');
export function requireGate(value, message) { if (!value) throw new Error(message); }
export function contained(root, candidate) {
  const rel = relative(resolve(root), resolve(candidate));
  requireGate(rel !== '' && !isAbsolute(rel) && !rel.split(sep).includes('..'), 'Path outside payload');
  return candidate;
}
export function inventory(root) {
  const records = [];
  function visit(dir) {
    requireGate(!lstatSync(dir).isSymbolicLink(), 'Symlink rejected');
    for (const name of readdirSync(dir).sort()) {
      requireGate(!/[\\\r\n]/.test(name), 'Unsafe filename');
      requireGate(!['.git', 'node_modules', '.env', '.dev.vars'].some(x => name.includes(x)), 'Forbidden payload file');
      const file = contained(root, resolve(dir, name));
      const stat = lstatSync(file);
      requireGate(!stat.isSymbolicLink(), 'Symlink rejected');
      if (stat.isDirectory()) visit(file);
      else {
        requireGate(stat.isFile(), 'Special file rejected');
        records.push({ path: relative(root, file).split(sep).join('/'), sha256: sha256(readFileSync(file)) });
      }
    }
  }
  visit(root);
  records.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  return { count: records.length, sha256: sha256(JSON.stringify(records)) };
}
export function validateConfig(config) {
  requireGate(config.name === WORKER && config.vars?.FGC_ENVIRONMENT === 'staging', 'Only staging permitted');
  requireGate(config.vars?.FGC_APP_URL === ORIGIN, 'Unexpected staging origin');
  requireGate(!/production|postgres(?:ql)?:\/\/|password|service[_-]?role|api[_-]?key|session[_-]?secret|bootstrap[_-]?token/i.test(JSON.stringify(config)), 'Forbidden configuration');
  requireGate(config.no_bundle === true, 'Payload must already be bundled');
  const harmless = new Set(['$schema', 'configPath', 'userConfigPath', 'topLevelName', 'definedEnvironments', 'compatibility_date', 'compatibility_flags', 'jsx_factory', 'jsx_fragment', 'rules', 'name', 'main', 'assets', 'vars', 'kv_namespaces', 'hyperdrive', 'images', 'cache', 'python_modules', 'dev', 'no_bundle']);
  const empty = value => value == null || (Array.isArray(value) ? value.length === 0 : typeof value === 'object' && Object.values(value).every(empty));
  for (const [key, value] of Object.entries(config)) requireGate(harmless.has(key) || empty(value), `Forbidden deployment option: ${key}`);
  for (const [key, binding] of [['hyperdrive', 'HYPERDRIVE'], ['kv_namespaces', 'VINEXT_KV_CACHE']]) {
    const values = config[key];
    requireGate(Array.isArray(values) && values.length === 1 && values[0].binding === binding && /^[a-f0-9]{32}$/i.test(values[0].id), 'Invalid staging binding');
    requireGate(Object.keys(values[0]).every(k => ['binding', 'id'].includes(k)), 'Unexpected binding option');
  }
  requireGate(config.images?.binding === 'IMAGES' && config.assets?.binding === 'ASSETS', 'Unexpected generated binding');
  return config;
}
export function inspectArtifact(root) {
  requireGate(!lstatSync(root).isSymbolicLink(), 'Symlink root rejected');
  root = realpathSync(root);
  requireGate(JSON.stringify(readdirSync(root).sort()) === JSON.stringify(['client', 'manifest.json', 'server']), 'Unexpected artifact root contents');
  inventory(root); // Check every file, including the manifest, before reading configuration.
  const config = validateConfig(JSON.parse(readFileSync(resolve(root, 'server/wrangler.staging.json'), 'utf8')));
  for (const value of [config.main, config.assets.directory]) {
    requireGate(typeof value === 'string' && !isAbsolute(value) && !/^[A-Za-z]:|[\\\r\n]/.test(value), 'Unsafe entry path');
    const full = contained(root, resolve(root, 'server', value));
    contained(root, realpathSync(full));
  }
  const server = inventory(resolve(root, 'server'));
  const client = inventory(resolve(root, 'client'));
  const configSha256 = sha256(readFileSync(resolve(root, 'server/wrangler.staging.json')));
  return { root, config, server, client, configSha256, artifactSha256: sha256(JSON.stringify({ server: server.sha256, client: client.sha256, config: configSha256 })) };
}
export function verifyArtifact(root, { controller, runId }) {
  const actual = inspectArtifact(root);
  const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8'));
  requireGate(manifest.format === 2 && manifest.controller_sha === controller && /^[a-f0-9]{40}$/.test(controller), 'Controller provenance mismatch');
  requireGate(manifest.payload_sha === PAYLOAD && manifest.sourceCommit === PAYLOAD, 'Payload provenance mismatch');
  requireGate(manifest.artifact_name === ARTIFACT && manifest.workerName === WORKER, 'Artifact identity mismatch');
  requireGate(String(manifest.validation_run_id) === String(runId) && /^\d+$/.test(String(runId)), 'Run provenance mismatch');
  requireGate(Number.isFinite(Date.parse(manifest.build_timestamp)) && Date.parse(manifest.build_timestamp) <= Date.now() + 60000, 'Invalid build timestamp');
  for (const key of ['artifactSha256', 'configSha256']) requireGate(manifest[key] === actual[key], 'Artifact checksum mismatch');
  for (const key of ['server', 'client']) requireGate(manifest[key]?.sha256 === actual[key].sha256 && manifest[key]?.count === actual[key].count, 'Inventory mismatch');
  return { ...actual, manifest, manifestSha256: sha256(readFileSync(resolve(root, 'manifest.json'))) };
}
export function stampArtifact(root, { controller, runId }) {
  const actual = inspectArtifact(root);
  const old = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8'));
  requireGate(old.sourceCommit === PAYLOAD && old.artifactSha256 === actual.artifactSha256, 'Original package mismatch');
  writeFileSync(resolve(root, 'manifest.json'), JSON.stringify({ format: 2, controller_sha: controller, payload_sha: PAYLOAD, sourceCommit: PAYLOAD, validation_run_id: String(runId), build_timestamp: new Date().toISOString(), artifact_name: ARTIFACT, workerName: WORKER, server: actual.server, client: actual.client, configSha256: actual.configSha256, artifactSha256: actual.artifactSha256 }, null, 2) + '\n');
  return verifyArtifact(root, { controller, runId });
}

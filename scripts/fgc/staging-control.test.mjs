import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  symlinkSync,
  rmSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  ARTIFACT,
  ORIGIN,
  PAYLOAD,
  WORKER,
  inspectArtifact,
  stampArtifact,
  verifyArtifact,
} from './staging-artifact.mjs';
import {
  validateMetadata,
  singleVersion,
  bindingGate,
  fetchHealthJson,
} from './staging-control.mjs';

const controller = 'a'.repeat(40);
const runId = '123';
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'fgc-security-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'server')); mkdirSync(join(root, 'client'));
  writeFileSync(join(root, 'server/index.js'), 'export default {};');
  writeFileSync(join(root, 'client/index.html'), 'staging');
  const config = { name: WORKER, main: 'index.js', no_bundle: true, assets: { directory: '../client', binding: 'ASSETS' }, images: { binding: 'IMAGES' }, vars: { FGC_ENVIRONMENT: 'staging', FGC_APP_URL: ORIGIN }, hyperdrive: [{ binding: 'HYPERDRIVE', id: 'a'.repeat(32) }], kv_namespaces: [{ binding: 'VINEXT_KV_CACHE', id: 'b'.repeat(32) }] };
  const configFile = join(root, 'server/wrangler.staging.json');
  writeFileSync(configFile, JSON.stringify(config));
  writeFileSync(join(root, 'manifest.json'), '{}');
  const actual = inspectArtifact(root);
  writeFileSync(join(root, 'manifest.json'), JSON.stringify({ sourceCommit: PAYLOAD, artifactSha256: actual.artifactSha256 }));
  stampArtifact(root, { controller, runId });
  return { root, config, configFile };
}
test('two-SHA artifact accepted; tampered generated output rejected', t => {
  const { root } = fixture(t);
  assert.equal(verifyArtifact(root, { controller, runId }).manifest.payload_sha, PAYLOAD);
  writeFileSync(join(root, 'server/index.js'), 'tampered');
  assert.throws(() => verifyArtifact(root, { controller, runId }), /checksum|Inventory/);
});
test('wrong controller, run and synthetic merge payload rejected', t => {
  const { root } = fixture(t);
  assert.throws(() => verifyArtifact(root, { controller: 'b'.repeat(40), runId }), /Controller/);
  assert.throws(() => verifyArtifact(root, { controller, runId: '124' }), /Run/);
  const path = join(root, 'manifest.json');
  const manifest = JSON.parse(readFileSync(path));
  manifest.payload_sha = '81443c78f49412e504f38b464afad4ecad9e551e';
  writeFileSync(path, JSON.stringify(manifest));
  assert.throws(() => verifyArtifact(root, { controller, runId }), /Payload/);
});
for (const [label, change] of [
  ['production Worker', c => { c.name = 'production'; }],
  ['production marker', c => { c.vars.UNSAFE = 'production'; }],
  ['installer hook', c => { c.build = { command: 'npm install' }; }],
  ['route mutation', c => { c.routes = ['example.com/*']; }],
  ['migration', c => { c.migrations = [{ tag: 'new' }]; }],
  ['escaped entry', c => { c.main = '../../outside.js'; }],
  ['escaped assets', c => { c.assets.directory = '../../outside'; }],
  ['extra binding', c => { c.hyperdrive.push({ binding: 'OTHER', id: 'c'.repeat(32) }); }]
]) test(`reject ${label}`, t => {
  const { root, config, configFile } = fixture(t); change(config); writeFileSync(configFile, JSON.stringify(config));
  assert.throws(() => inspectArtifact(root));
});
test('payload cannot add a controller shadow or dependency directory', t => {
  const { root } = fixture(t);
  mkdirSync(join(root, '_control'));
  assert.throws(() => inspectArtifact(root), /root contents/);
});
test('nested symlinks rejected before content reads', { skip: process.platform === 'win32' }, t => {
  const { root } = fixture(t);
  symlinkSync('/etc/passwd', join(root, 'server/linked'));
  assert.throws(() => inspectArtifact(root), /Symlink/);
});
test('source metadata rejects expiry, failure, wrong controller, repository and artifact', () => {
  const run = { id: 123, status: 'completed', conclusion: 'success', head_sha: controller, head_branch: 'main', event: 'workflow_dispatch', path: '.github/workflows/fgc-validation.yml', repository: { full_name: 'Mavique/jef-fgc-evidence-platform' } };
  const artifact = { id: 456, name: ARTIFACT, expired: false, expires_at: new Date(Date.now() + 86400000).toISOString(), workflow_run: { id: 123, head_sha: controller }, digest: `sha256:${'a'.repeat(64)}` };
  const check = (r = run, a = artifact) => validateMetadata({ run: r, artifact: a, controller, runId, artifactId: '456' });
  check();
  for (const patch of [{ conclusion: 'failure' }, { head_sha: PAYLOAD }, { event: 'pull_request' }, { repository: { full_name: 'other/repo' } }]) assert.throws(() => check({ ...run, ...patch }));
  for (const patch of [{ expired: true }, { expires_at: '2000-01-01' }, { name: 'wrong' }, { workflow_run: { id: 124 } }]) assert.throws(() => check(run, { ...artifact, ...patch }));
});
test('ambiguous or partial live deployments rejected', () => {
  const version = { version_id: 'ae3def61-c53b-4610-a6fc-f6d0da877924', percentage: 100 };
  assert.equal(singleVersion({ deployments: [{ versions: [version] }] }), version.version_id);
  assert.throws(() => singleVersion({ deployments: [] }));
  assert.throws(() => singleVersion({ deployments: [{ versions: [version, version] }] }));
  assert.throws(() => singleVersion({ deployments: [{ versions: [{ ...version, percentage: 50 }] }] }));
});
test('existing resource and variable changes blocked', t => {
  const { config } = fixture(t);
  const live = { bindings: [{ name: 'HYPERDRIVE', type: 'hyperdrive', id: 'a'.repeat(32) }, { name: 'VINEXT_KV_CACHE', type: 'kv_namespace', namespace_id: 'b'.repeat(32) }, { name: 'ASSETS', type: 'assets' }, { name: 'IMAGES', type: 'images' }, ...Object.entries(config.vars).map(([name, text]) => ({ name, type: 'plain_text', text }))] };
  bindingGate(config, live);
  live.bindings[0].id = 'c'.repeat(32);
  assert.throws(() => bindingGate(config, live), /binding differs/);
});

test('health JSON succeeds on the first valid response', async t => {
  let calls = 0;

  t.mock.method(globalThis, 'fetch', async () => {
    calls += 1;

    return new Response('{"ok":true}', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const result = await fetchHealthJson('/health');

  assert.equal(calls, 1);
  assert.equal(result.attempt, 1);
  assert.deepEqual(result.body, { ok: true });
});

test('health JSON retries an empty response and then succeeds', async t => {
  let calls = 0;

  t.mock.method(globalThis, 'fetch', async () => {
    calls += 1;

    return new Response(calls === 1 ? '' : '{"ok":true}', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const result = await fetchHealthJson('/health/ready');

  assert.equal(calls, 2);
  assert.equal(result.attempt, 2);
  assert.deepEqual(result.body, { ok: true });
});

test('health JSON retries malformed JSON and then succeeds', async t => {
  let calls = 0;

  t.mock.method(globalThis, 'fetch', async () => {
    calls += 1;

    return new Response(calls === 1 ? '{"incomplete"' : '{"ok":true}', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const result = await fetchHealthJson('/health/ready');

  assert.equal(calls, 2);
  assert.equal(result.attempt, 2);
  assert.deepEqual(result.body, { ok: true });
});

test('health JSON fails closed after all attempts are exhausted', async t => {
  let calls = 0;

  t.mock.method(globalThis, 'fetch', async () => {
    calls += 1;
    return new Response('', { status: 200 });
  });

  await assert.rejects(
    fetchHealthJson('/health/ready'),
    /Health check failed for \/health\/ready after 3 attempts: empty response body/,
  );

  assert.equal(calls, 3);
});

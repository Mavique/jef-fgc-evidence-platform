import assert from "node:assert/strict";

export const RESULT_CODES = Object.freeze({
  MISSING_CREDENTIAL: "MISSING_CREDENTIAL",
  ACCOUNT_TOKEN_ACTIVE: "ACCOUNT_TOKEN_ACTIVE",
  USER_TOKEN_ACTIVE: "USER_TOKEN_ACTIVE",
  TOKEN_AUTH_FAILED: "TOKEN_AUTH_FAILED",
  ACCOUNT_SCOPE_MISMATCH: "ACCOUNT_SCOPE_MISMATCH",
  ACCOUNT_ACCESS_DENIED: "ACCOUNT_ACCESS_DENIED",
  WORKER_ACCESS_DENIED: "WORKER_ACCESS_DENIED",
  WORKER_NOT_FOUND: "WORKER_NOT_FOUND",
  UNEXPECTED_FAILURE: "UNEXPECTED_FAILURE",
  PREFLIGHT_OK: "PREFLIGHT_OK"
});

const messages = Object.freeze({
  MISSING_CREDENTIAL: "Cloudflare credential preflight failed: required credential configuration is missing.",
  TOKEN_AUTH_FAILED: "Cloudflare credential preflight failed: token could not be authenticated for the intended account.",
  ACCOUNT_SCOPE_MISMATCH: "Cloudflare credential preflight failed: token is scoped to a different account.",
  ACCOUNT_ACCESS_DENIED: "Cloudflare credential preflight failed: intended account is inaccessible or incorrectly configured.",
  WORKER_ACCESS_DENIED: "Cloudflare credential preflight failed: token lacks access to the existing staging Worker.",
  WORKER_NOT_FOUND: "Cloudflare credential preflight failed: existing staging Worker was not found.",
  UNEXPECTED_FAILURE: "Cloudflare credential preflight failed: unexpected Cloudflare API failure.",
  PREFLIGHT_OK: "Cloudflare credential preflight passed: token, intended account and existing staging Worker verified."
});

const active = (response) => response?.status === 200
  && response.body?.success === true
  && response.body?.result?.status === "active";

export async function runPreflight({ token, accountId, request }) {
  if (!token || !accountId) return { code: RESULT_CODES.MISSING_CREDENTIAL, calls: [] };
  const calls = [];
  const base = "https://api.cloudflare.com/client/v4";
  const call = async (label, url) => {
    calls.push(label);
    try { return await request(url, token); } catch { return { status: 0, body: null }; }
  };

  const accountToken = await call("account-token-verify", `${base}/accounts/${accountId}/tokens/verify`);
  let tokenCode;
  if (active(accountToken)) {
    tokenCode = RESULT_CODES.ACCOUNT_TOKEN_ACTIVE;
  } else {
    const userToken = await call("user-token-verify-fallback", `${base}/user/tokens/verify`);
    tokenCode = active(userToken) ? RESULT_CODES.USER_TOKEN_ACTIVE : RESULT_CODES.TOKEN_AUTH_FAILED;
  }
  if (tokenCode === RESULT_CODES.TOKEN_AUTH_FAILED) return { code: tokenCode, calls };

  const account = await call("account-access", `${base}/accounts/${accountId}`);
  if (account.status === 403) return { code: RESULT_CODES.ACCOUNT_SCOPE_MISMATCH, calls };
  if (account.status === 401 || account.status === 404) return { code: RESULT_CODES.ACCOUNT_ACCESS_DENIED, calls };
  if (account.status !== 200 || account.body?.success !== true) return { code: RESULT_CODES.UNEXPECTED_FAILURE, calls };

  const worker = await call("worker-access", `${base}/accounts/${accountId}/workers/services/jef-fgc-staging`);
  if (worker.status === 403) return { code: RESULT_CODES.WORKER_ACCESS_DENIED, calls };
  if (worker.status === 404) return { code: RESULT_CODES.WORKER_NOT_FOUND, calls };
  if (worker.status !== 200 || worker.body?.success !== true) return { code: RESULT_CODES.UNEXPECTED_FAILURE, calls };
  return { code: RESULT_CODES.PREFLIGHT_OK, tokenCode, calls };
}

export function messageFor(code) {
  return messages[code] ?? messages.UNEXPECTED_FAILURE;
}

export async function livePreflight() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const result = await runPreflight({
    token,
    accountId,
    request: async (url, bearer) => {
      const response = await fetch(url, { headers: { Authorization: `Bearer ${bearer}`, Accept: "application/json" } });
      let body = null;
      try { body = await response.json(); } catch {}
      return { status: response.status, body };
    }
  });
  if (result.code !== RESULT_CODES.PREFLIGHT_OK) {
    console.error(messageFor(result.code));
    process.exitCode = 1;
    return result;
  }
  console.log(messageFor(result.code));
  return result;
}

async function runFixtures() {
  const ok = { status: 200, body: { success: true, result: { status: "active" } } };
  const denied = (status) => ({ status, body: { success: false } });
  const requestFor = (responses) => async (url) => {
    if (url.includes("/tokens/verify")) return responses[url.includes("/accounts/") ? "accountToken" : "userToken"];
    if (url.includes("/workers/services/")) return responses.worker;
    return responses.account;
  };
  const simulate = async (responses) => {
    let downstreamCalls = 0;
    const result = await runPreflight({ token: "token-value", accountId: "account-id", request: requestFor(responses) });
    if (result.code === RESULT_CODES.PREFLIGHT_OK) downstreamCalls += 1;
    return { result, downstreamCalls };
  };
  const expectCase = async (responses, code, expectedCalls, downstreamCalls = 0) => {
    const { result, downstreamCalls: actualDownstream } = await simulate(responses);
    assert.equal(result.code, code);
    assert.deepEqual(result.calls, expectedCalls);
    assert.equal(actualDownstream, downstreamCalls);
    assert(!messageFor(result.code).match(/token-value|secret-value|account-id|Bearer|postgres|password/i));
  };

  await expectCase({ accountToken: ok, userToken: denied(401), account: ok, worker: ok }, RESULT_CODES.PREFLIGHT_OK, ["account-token-verify", "account-access", "worker-access"], 1);
  await expectCase({ accountToken: denied(401), userToken: ok, account: ok, worker: ok }, RESULT_CODES.PREFLIGHT_OK, ["account-token-verify", "user-token-verify-fallback", "account-access", "worker-access"], 1);
  await expectCase({ accountToken: denied(401), userToken: denied(401), account: ok, worker: ok }, RESULT_CODES.TOKEN_AUTH_FAILED, ["account-token-verify", "user-token-verify-fallback"]);
  await expectCase({ accountToken: ok, userToken: denied(401), account: denied(403), worker: ok }, RESULT_CODES.ACCOUNT_SCOPE_MISMATCH, ["account-token-verify", "account-access"]);
  await expectCase({ accountToken: ok, userToken: denied(401), account: denied(404), worker: ok }, RESULT_CODES.ACCOUNT_ACCESS_DENIED, ["account-token-verify", "account-access"]);
  await expectCase({ accountToken: ok, userToken: denied(401), account: ok, worker: denied(403) }, RESULT_CODES.WORKER_ACCESS_DENIED, ["account-token-verify", "account-access", "worker-access"]);
  await expectCase({ accountToken: ok, userToken: denied(401), account: ok, worker: denied(404) }, RESULT_CODES.WORKER_NOT_FOUND, ["account-token-verify", "account-access", "worker-access"]);
  await expectCase({ accountToken: ok, userToken: denied(401), account: { status: 500, body: null }, worker: ok }, RESULT_CODES.UNEXPECTED_FAILURE, ["account-token-verify", "account-access"]);
  await expectCase({ accountToken: { status: 0, body: null }, userToken: { status: 0, body: null }, account: ok, worker: ok }, RESULT_CODES.TOKEN_AUTH_FAILED, ["account-token-verify", "user-token-verify-fallback"]);
  assert.equal((await runPreflight({ token: "", accountId: "account-id", request: requestFor({}) })).code, RESULT_CODES.MISSING_CREDENTIAL);
  console.log("Cloudflare credential preflight fixtures passed.");
}

if (process.argv.includes("--test")) await runFixtures();
else if (process.argv.includes("--live")) await livePreflight();

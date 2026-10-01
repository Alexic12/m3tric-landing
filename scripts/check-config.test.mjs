import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { validate } from "./lib/release-config.mjs";

const GOOD = {
  NEXT_PUBLIC_SITE_URL: "https://m3tric.co",
  NEXT_PUBLIC_PLATFORM_URL: "https://app.m3tric.co/login",
  NEXT_PUBLIC_CONTACT_EMAIL: "contacto@m3tric.co",
};

const withEnv = (overrides) => ({ ...GOOD, ...overrides });
const fieldProblems = (env, key) => validate(env).filter((p) => p.startsWith(key));

describe("accepted configuration", () => {
  test("a complete production config has no problems", () => {
    assert.deepEqual(validate(GOOD), []);
  });

  test("optional phone in E.164 and a non-default port are accepted", () => {
    assert.deepEqual(
      validate(withEnv({ NEXT_PUBLIC_CONTACT_PHONE: "+573001234567", NEXT_PUBLIC_SITE_URL: "https://m3tric.co:8443" })),
      [],
    );
  });

  test("platform URL may carry a path and query", () => {
    assert.deepEqual(validate(withEnv({ NEXT_PUBLIC_PLATFORM_URL: "https://app.m3tric.co/login?next=/" })), []);
  });

  test("a hostname that merely contains a reserved word is accepted", () => {
    assert.deepEqual(validate(withEnv({ NEXT_PUBLIC_SITE_URL: "https://localhost-tools.co" })), []);
    assert.deepEqual(validate(withEnv({ NEXT_PUBLIC_SITE_URL: "https://m3tric-test.co" })), []);
  });
});

describe("SITE_URL rejections", () => {
  const rejected = {
    "missing": "",
    "http scheme": "http://m3tric.co",
    "javascript scheme": "javascript:alert(1)",
    "scheme only": "http://",
    "trailing slash": "https://m3tric.co/",
    "path": "https://m3tric.co/x",
    "query": "https://m3tric.co?a=1",
    "hash": "https://m3tric.co#top",
    "userinfo trap": "https://m3tric.co@evil.com",
    "userinfo": "https://user:pw@m3tric.co",
    "uppercase host (not the canonical origin)": "https://M3TRIC.co",
    "default port spelled out": "https://m3tric.co:443",
    "localhost": "https://localhost",
    "LOCALHOST uppercase": "https://LOCALHOST",
    "subdomain of localhost": "https://app.localhost",
    "loopback v4": "https://127.0.0.1",
    "loopback v4 other": "https://127.0.0.2",
    "any-address": "https://0.0.0.0",
    "decimal IP that URL normalises": "https://2130706433",
    "IPv6 loopback": "https://[::1]",
    "public IPv4": "https://8.8.8.8",
    "single label": "https://intranet",
    "trailing dot": "https://m3tric.co.",
    ".local": "https://m3tric.local",
    ".internal": "https://api.m3tric.internal",
    "example.com": "https://example.com",
    "subdomain of example.org": "https://www.example.org",
    "example.net": "https://example.net",
    ".example": "https://m3tric.example",
    ".test": "https://m3tric.test",
    ".invalid": "https://m3tric.invalid",
  };
  for (const [label, value] of Object.entries(rejected)) {
    test(`rejects ${label}: ${value || "(empty)"}`, () => {
      assert.ok(fieldProblems(withEnv({ NEXT_PUBLIC_SITE_URL: value }), "NEXT_PUBLIC_SITE_URL").length > 0);
    });
  }
});

describe("PLATFORM_URL rejections", () => {
  const rejected = {
    "missing": "",
    "http scheme": "http://app.m3tric.co/login",
    "javascript scheme": "javascript:alert(1)",
    "scheme only": "http://",
    "userinfo trap": "https://app.m3tric.co@evil.com/login",
    "username": "https://admin@app.m3tric.co/login",
    "username and password": "https://admin:pw@app.m3tric.co/login",
    "localhost": "https://localhost:5173/login",
    "IPv6 loopback": "https://[::1]/login",
    "loopback v4": "https://127.0.0.2/login",
    "single label": "https://app/login",
    "trailing dot": "https://app.m3tric.co./login",
    ".internal": "https://app.m3tric.internal/login",
    "example.com": "https://app.example.com/login",
    ".test": "https://app.m3tric.test/login",
  };
  for (const [label, value] of Object.entries(rejected)) {
    test(`rejects ${label}: ${value || "(empty)"}`, () => {
      assert.ok(fieldProblems(withEnv({ NEXT_PUBLIC_PLATFORM_URL: value }), "NEXT_PUBLIC_PLATFORM_URL").length > 0);
    });
  }
});

describe("CONTACT_EMAIL and PHONE", () => {
  for (const value of ["", "no-at-sign", "a b@m3tric.co", "a@b", "a@@m3tric.co", "a@m3tric.co,b@evil.com", "a@m3tric.co?bcc=x", "a@m3tric.co\nb@evil.com", "<a@m3tric.co>", "a@example.com", "a@mail.example.org", "a@m3tric.test", "a@x.invalid", "a@localhost.local", "a@test.m3tric.co", "a@m3tric.co."]) {
    test(`rejects email ${JSON.stringify(value)}`, () => {
      assert.ok(fieldProblems(withEnv({ NEXT_PUBLIC_CONTACT_EMAIL: value }), "NEXT_PUBLIC_CONTACT_EMAIL").length > 0);
    });
  }

  test("rejects a phone that is not E.164", () => {
    assert.ok(fieldProblems(withEnv({ NEXT_PUBLIC_CONTACT_PHONE: "300 123 4567" }), "NEXT_PUBLIC_CONTACT_PHONE").length > 0);
  });

  test("an empty config reports every required variable", () => {
    assert.equal(validate({}).length, 3);
  });
});

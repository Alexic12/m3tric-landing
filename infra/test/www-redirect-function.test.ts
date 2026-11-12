import { runInNewContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

import { wwwRedirectFunctionCode } from '../lib/www-redirect-function';

// Literal on purpose: the stack test pins that the stack passes the policy's HSTS value.
const HSTS = 'max-age=63072000; includeSubDomains';
const CLOUDFRONT_FUNCTION_MAX_BYTES = 10 * 1024;

const code = wwwRedirectFunctionCode({
  apexDomain: 'm3tric.io',
  redirectDomains: ['www.m3tric.io'],
  strictTransportSecurity: HSTS,
});

type QueryEntry = { value: string; multiValue?: Array<{ value: string }> };
type Handler = (event: { request: Record<string, any> }) => any;

// The function source is a script of declarations, evaluated the way the
// cloudfront-js runtime evaluates it: no modules, no globals beyond ECMAScript.
const handler = runInNewContext(`${code}\nhandler;`, {}, { timeout: 1000 }) as Handler;

function request(host: string | undefined, uri: string, querystring: Record<string, QueryEntry> = {}) {
  return { method: 'GET', uri, querystring, headers: host === undefined ? {} : { host: { value: host } }, cookies: {} };
}

/** Plain-JSON copy: objects built inside the VM belong to another realm. */
function run(req: ReturnType<typeof request>) {
  return JSON.parse(JSON.stringify(handler({ request: req }))) as Record<string, any>;
}

const redirectTo = (location: string) => ({
  statusCode: 301,
  statusDescription: 'Moved Permanently',
  headers: {
    location: { value: location },
    'strict-transport-security': { value: HSTS },
    'cache-control': { value: 'max-age=3600' },
  },
});

describe('www redirect function', () => {
  it('redirects the root path without adding a "?"', () => {
    expect(run(request('www.m3tric.io', '/'))).toEqual(redirectTo('https://m3tric.io/'));
  });

  it('keeps a deep path', () => {
    expect(run(request('www.m3tric.io', '/a/b/c.html'))).toEqual(redirectTo('https://m3tric.io/a/b/c.html'));
  });

  it('keeps a query string', () => {
    const req = request('www.m3tric.io', '/a', { x: { value: '1' } });
    expect(run(req)).toEqual(redirectTo('https://m3tric.io/a?x=1'));
  });

  it('keeps several keys in the key order CloudFront provides', () => {
    const req = request('www.m3tric.io', '/a/b', { x: { value: '1' }, y: { value: '%20z' } });
    expect(run(req)).toEqual(redirectTo('https://m3tric.io/a/b?x=1&y=%20z'));
  });

  it('keeps every value of a repeated key (multiValue), in order per key', () => {
    const req = request('www.m3tric.io', '/', {
      tag: { value: 'a', multiValue: [{ value: 'a' }, { value: 'b' }, { value: 'c' }] },
      z: { value: '9' },
    });
    expect(run(req)).toEqual(redirectTo('https://m3tric.io/?tag=a&tag=b&tag=c&z=9'));
  });

  it('emits a key without a value bare, without "="', () => {
    const req = request('www.m3tric.io', '/', { debug: { value: '' }, x: { value: '1' } });
    expect(run(req)).toEqual(redirectTo('https://m3tric.io/?debug&x=1'));
  });

  it('does not decode or re-encode values', () => {
    const req = request('www.m3tric.io', '/p%20q', { q: { value: 'a%20b%2Bc+d%3D%26' }, r: { value: '%E2%9C%93' } });
    expect(run(req)).toEqual(redirectTo('https://m3tric.io/p%20q?q=a%20b%2Bc+d%3D%26&r=%E2%9C%93'));
  });

  it('matches the host case-insensitively', () => {
    expect(run(request('WWW.M3TRIC.IO', '/x', { a: { value: '1' } }))).toEqual(redirectTo('https://m3tric.io/x?a=1'));
  });

  it('always redirects to the apex over https, never to the requested host', () => {
    const response = run(request('www.m3tric.io', '//evil.example/path'));
    expect(response.headers.location.value).toBe('https://m3tric.io//evil.example/path');
  });

  it('returns the request untouched for the apex', () => {
    const req = request('m3tric.io', '/a', { x: { value: '1' } });
    expect(run(req)).toEqual(JSON.parse(JSON.stringify(req)));
  });

  it('returns the request untouched for the CloudFront host', () => {
    const req = request('d34991vs3lv2po.cloudfront.net', '/');
    expect(run(req)).toEqual(JSON.parse(JSON.stringify(req)));
  });

  it('does not treat other subdomains or look-alikes as redirect hosts', () => {
    for (const host of ['platform.m3tric.io', 'www.m3tric.io.evil.example', 'xwww.m3tric.io', 'www2.m3tric.io']) {
      const req = request(host, '/');
      expect(run(req), host).toEqual(JSON.parse(JSON.stringify(req)));
    }
  });

  it('returns the request untouched when there is no Host header', () => {
    const req = request(undefined, '/');
    expect(run(req)).toEqual(JSON.parse(JSON.stringify(req)));
  });

  it('redirects every configured redirect host', () => {
    const several = wwwRedirectFunctionCode({
      apexDomain: 'm3tric.io',
      redirectDomains: ['www.m3tric.io', 'app.m3tric.io'],
      strictTransportSecurity: HSTS,
    });
    const handle = runInNewContext(`${several}\nhandler;`, {}) as Handler;
    for (const host of ['www.m3tric.io', 'app.m3tric.io']) {
      const response = JSON.parse(JSON.stringify(handle({ request: request(host, '/') }))) as Record<string, any>;
      expect(response.statusCode, host).toBe(301);
    }
  });
});

describe('www redirect function source', () => {
  it('fits CloudFront Functions limit and uses no module system', () => {
    expect(Buffer.byteLength(code, 'utf8')).toBeLessThan(CLOUDFRONT_FUNCTION_MAX_BYTES);
    expect(code).not.toMatch(/\b(require|import|export)\b/);
  });

  it('embeds hostnames as JSON string literals', () => {
    expect(code).toContain('var APEX = "m3tric.io";');
    expect(code).toContain('var REDIRECT_HOSTS = ["www.m3tric.io"];');
  });
});

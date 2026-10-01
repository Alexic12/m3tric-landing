import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  anchorHrefsByText,
  metaContents,
  profileProblems,
  robotsDisallowsAll,
} from "./artifact-rules.mjs";

const STAGING_HTML = '<html><head><meta name="robots" content="noindex, nofollow"/><meta content="deploy-7-abc1234" name="m3tric:release"/></head></html>';
const PROD_HTML = '<html><head><meta name="robots" content="index, follow"/></head></html>';
const STAGING_ROBOTS = "User-Agent: *\nDisallow: /\n";
const PROD_ROBOTS = "User-Agent: *\nAllow: /\n\nSitemap: https://m3tric.co/sitemap.xml\n";

describe("metaContents", () => {
  test("reads content regardless of attribute order and quote style", () => {
    assert.deepEqual(metaContents(STAGING_HTML, "m3tric:release"), ["deploy-7-abc1234"]);
    assert.deepEqual(metaContents("<meta content='x &amp; y' name='robots'>", "robots"), ["x & y"]);
  });
  test("is empty when the meta is absent", () => {
    assert.deepEqual(metaContents("<meta name=\"description\" content=\"a\"/>", "robots"), []);
  });
});

describe("anchorHrefsByText", () => {
  const html =
    '<a class="b" href="https://p.co/login?a=1&amp;b=2"><span>Abrir plataforma</span></a>' +
    '<a href="#contacto">Contacto</a><a data-x="1" href="https://p.co/login?a=1&amp;b=2" >ABRIR PLATAFORMA</a>';
  test("finds nested text, any attribute order, and decodes entities", () => {
    assert.deepEqual(anchorHrefsByText(html, "Abrir plataforma"), ["https://p.co/login?a=1&b=2", "https://p.co/login?a=1&b=2"]);
  });
  test("returns nothing when no anchor matches", () => {
    assert.deepEqual(anchorHrefsByText("<a href=\"/x\">Otro</a>", "Abrir plataforma"), []);
  });
});

describe("robotsDisallowsAll", () => {
  test("detects Disallow: / for *", () => assert.equal(robotsDisallowsAll(STAGING_ROBOTS), true));
  test("an allow-all file is not disallow-all", () => assert.equal(robotsDisallowsAll(PROD_ROBOTS), false));
  test("a disallow for another agent does not count", () =>
    assert.equal(robotsDisallowsAll("User-agent: Googlebot\nDisallow: /\n"), false));
  test("Disallow: / plus Allow: / is not a full block", () =>
    assert.equal(robotsDisallowsAll("User-agent: *\nDisallow: /\nAllow: /\n"), false));
});

describe("profileProblems", () => {
  test("coherent staging passes, including the release id", () => {
    assert.deepEqual(
      profileProblems({ profile: "staging", html: STAGING_HTML, robotsTxt: STAGING_ROBOTS, releaseId: "deploy-7-abc1234" }),
      [],
    );
  });
  test("coherent production passes", () => {
    assert.deepEqual(profileProblems({ profile: "production", html: PROD_HTML, robotsTxt: PROD_ROBOTS }), []);
  });
  test("staging without noindex fails", () => {
    assert.ok(profileProblems({ profile: "staging", html: PROD_HTML, robotsTxt: STAGING_ROBOTS }).length > 0);
  });
  test("staging with an open robots.txt fails", () => {
    assert.ok(profileProblems({ profile: "staging", html: STAGING_HTML, robotsTxt: PROD_ROBOTS }).length >= 2);
  });
  test("production carrying noindex or Disallow: / fails", () => {
    assert.ok(profileProblems({ profile: "production", html: STAGING_HTML, robotsTxt: PROD_ROBOTS }).length > 0);
    assert.ok(profileProblems({ profile: "production", html: PROD_HTML, robotsTxt: STAGING_ROBOTS }).length > 0);
  });
  test("a release id mismatch fails and a missing meta fails", () => {
    assert.ok(profileProblems({ profile: "staging", html: STAGING_HTML, robotsTxt: STAGING_ROBOTS, releaseId: "other" }).length > 0);
    assert.ok(profileProblems({ profile: "production", html: PROD_HTML, robotsTxt: PROD_ROBOTS, releaseId: "x" }).length > 0);
  });
  test("an unknown profile fails closed", () => {
    assert.ok(profileProblems({ profile: "", html: PROD_HTML, robotsTxt: PROD_ROBOTS }).length > 0);
  });
});

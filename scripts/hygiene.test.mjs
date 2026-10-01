import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";

const SCRIPT = join(import.meta.dirname, "hygiene.sh");
const SHA = "a".repeat(40);

/** Builds a throwaway git repo with the given files, runs hygiene.sh in it and returns { code, stderr }. */
function run(files) {
  const dir = mkdtempSync(join(tmpdir(), "hygiene-"));
  const git = (...args) => execFileSync("git", args, { cwd: dir, stdio: "ignore" });
  git("init", "-q");
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  git("add", "-A", "-f");
  const result = spawnSync("bash", [SCRIPT], { cwd: dir, encoding: "utf8" });
  return { code: result.status, stderr: result.stderr };
}

const workflow = (uses) => `jobs:\n  a:\n    steps:\n      - uses: ${uses}\n`;

describe("hygiene.sh", () => {
  test("a clean repo passes (SHA-pinned action with comment, local reusable workflow, .env.example)", () => {
    const { code } = run({
      ".github/workflows/a.yml": workflow(`actions/checkout@${SHA} # v7.0.1`) + `  b:\n    uses: ./.github/workflows/x.yml\n`,
      ".env.example": "A=\n",
      "README.md": "Title\n=======\n",
    });
    assert.equal(code, 0);
  });

  test("a tag-pinned action fails", () => {
    const { code, stderr } = run({ ".github/workflows/a.yml": workflow("actions/checkout@v4") });
    assert.equal(code, 1);
    assert.match(stderr, /not pinned/);
  });

  test("a short or branch ref fails", () => {
    assert.equal(run({ ".github/workflows/a.yml": workflow("actions/checkout@main") }).code, 1);
    assert.equal(run({ ".github/workflows/a.yml": workflow("actions/checkout@abc1234") }).code, 1);
  });

  for (const path of [".env", ".env.production.local", "infra/.env.local", "id.pem", "k/server.key", "infra/cdk.out/a.json", "node_modules/x/i.js", "out/index.html", ".next/a.js"]) {
    test(`forbidden tracked file ${path} fails`, () => {
      const { code, stderr } = run({ [path]: "x" });
      assert.equal(code, 1);
      assert.match(stderr, /forbidden tracked file/);
    });
  }

  test("conflict markers fail", () => {
    const { code, stderr } = run({ "a.txt": "x\n<<<<<<< HEAD\ny\n=======\nz\n>>>>>>> branch\n" });
    assert.equal(code, 1);
    assert.match(stderr, /conflict marker/);
  });
});

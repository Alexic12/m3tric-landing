#!/usr/bin/env bash
# Repository hygiene (fail-closed). Run from anywhere inside the repo: `npm run hygiene`.
#   1. every `uses:` in .github/workflows is a local ./ reusable workflow or pinned to a 40-hex commit SHA
#   2. no forbidden tracked files (.env* except .env.example, keys, build output, dependencies, font files)
#   3. no merge conflict markers in tracked text files
set -euo pipefail

root="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "hygiene: not inside a git worktree" >&2; exit 2; }
cd "$root"
failures=0
fail() { echo "hygiene: $*" >&2; failures=$((failures + 1)); }

# 1. Unpinned actions. A mutable tag (@v4) lets whoever controls the tag change what runs with our token.
if [ -d .github/workflows ]; then
  while IFS= read -r line; do
    file="${line%%:*}"
    ref="$(printf '%s' "$line" | sed -E 's/^[^:]*:[0-9]+:[[:space:]]*(-[[:space:]]*)?uses:[[:space:]]*//; s/[[:space:]]+#.*$//; s/^["'"'"']//; s/["'"'"']$//')"
    case "$ref" in ./*) continue ;; esac
    if ! printf '%s' "$ref" | grep -Eq '@[0-9a-f]{40}$'; then
      fail "action not pinned to a 40-hex SHA: ${ref} (${file})"
    fi
  done < <(grep -rnE '^[[:space:]]*(-[[:space:]]*)?uses:' .github/workflows --include='*.yml' --include='*.yaml' || true)
fi

# 2. Forbidden tracked files. Font files are here because licensed fonts never enter this public repository (ADR-010).
#    Matched ignoring case, like the file systems developers use: `.ENV.local`, `DIN2014Rounded.OTF`.
forbidden='(^|/)\.env($|\.)|\.pem$|\.key$|(^|/)cdk\.out(/|$)|(^|/)node_modules(/|$)|^out/|(^|/)\.next(/|$)|\.(woff2?|ttf|otf|eot)$'
while IFS= read -r path; do
  case "$path" in .env.example|*/.env.example) continue ;; esac
  fail "forbidden tracked file: ${path}"
done < <(git ls-files | grep -Ei "$forbidden" || true)

# 3. Conflict markers (the `=======` separator alone is skipped: it is a valid Markdown heading underline).
while IFS= read -r hit; do
  fail "conflict marker: ${hit}"
done < <(git grep -InE '^(<<<<<<<|>>>>>>>)( |$)' -- . ':!scripts/hygiene.test.mjs' || true)

if [ "$failures" -gt 0 ]; then
  echo "hygiene: FAILED (${failures} problem(s))" >&2
  exit 1
fi
echo "hygiene: OK"

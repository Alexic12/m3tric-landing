#!/usr/bin/env bash
# Publishes out/ to the site bucket with the right headers, then invalidates CloudFront and waits.
# Usage: publish.sh <bucket> <distribution-id>        (env: OUT_DIR, default "out")
# Needs AWS credentials in the environment. The manifest is uploaded separately (upload-manifest.sh)
# because it contains the smoke result, and the smoke runs after this script.
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <bucket> <distribution-id>" >&2
  exit 2
fi
BUCKET="$1"
DISTRIBUTION_ID="$2"
OUT_DIR="${OUT_DIR:-out}"
DEST="s3://${BUCKET}/"

[ -f "${OUT_DIR}/index.html" ] || { echo "publish: ${OUT_DIR}/index.html not found; run the release build first" >&2; exit 1; }

IMMUTABLE="public, max-age=31536000, immutable"
DAY="public, max-age=86400"
REVALIDATE="no-cache"

# Why `cp --recursive` for the typed passes and not `sync`:
#   `sync` skips an object whose size matches and whose destination is not older, so the headers of an
#   already-published object would never be corrected. `cp` always uploads, hence every object carries
#   exactly the Cache-Control/Content-Type below on every deploy, whatever its mtime.
# Why the delete is a separate, last pass:
#   `cp` cannot delete. A final `sync --delete --size-only` removes stale keys and, because every key in
#   out/ was just uploaded with the same byte size, it uploads nothing (asserted below), so it cannot
#   overwrite the typed headers. `_deploy/*` (the manifest) is excluded, so it is never deleted.
# Order: hashed assets first (new HTML references them), HTML last, so a visitor never gets a page whose
# assets are not there yet.
# Filters: S3 `*` crosses `/`; a later filter wins; `--exclude "*"` then `--include X` selects only X.
pass() { # <cache-control> <content-type|-> <filter args...>
  local cache="$1" ctype="$2"
  shift 2
  local args=(--recursive --only-show-errors --cache-control "$cache")
  if [ "$ctype" != "-" ]; then args+=(--content-type "$ctype"); fi
  aws s3 cp "$OUT_DIR" "$DEST" "${args[@]}" "$@"
}

echo "publish: 1/7 hashed assets (immutable)"
pass "$IMMUTABLE" "font/woff2" --exclude "*" --include "_next/static/*.woff2"
pass "$IMMUTABLE" "-" --exclude "*" --include "_next/static/*" --exclude "_next/static/*.woff2"

echo "publish: 2/7 images and icons (1 day)"
pass "$DAY" "-" --exclude "*" \
  --include "images/*" --include "og.png" --include "icon.svg" --include "apple-icon.png" \
  --include "icon-192.png" --include "icon-512.png"

echo "publish: 3/7 web manifest"
pass "$REVALIDATE" "application/manifest+json" --exclude "*" --include "*.webmanifest"

echo "publish: 4/7 text files (robots.txt and RSC payloads)"
pass "$REVALIDATE" "text/plain; charset=utf-8" --exclude "*" --include "*.txt"

echo "publish: 5/7 everything else (revalidate: the safe default for any file not listed above)"
pass "$REVALIDATE" "-" \
  --exclude "_next/static/*" --exclude "images/*" --exclude "og.png" --exclude "icon.svg" \
  --exclude "apple-icon.png" --exclude "icon-192.png" --exclude "icon-512.png" \
  --exclude "*.webmanifest" --exclude "*.txt" --exclude "*.html" --exclude "_deploy/*"

echo "publish: 6/7 HTML (last) and removal of stale objects"
pass "$REVALIDATE" "text/html; charset=utf-8" --exclude "*" --include "*.html"
SYNC_LOG="$(aws s3 sync "$OUT_DIR" "$DEST" --delete --size-only --exclude "_deploy/*" --cache-control "$REVALIDATE")"
if [ -n "$SYNC_LOG" ]; then printf '%s\n' "$SYNC_LOG"; fi
if printf '%s\n' "$SYNC_LOG" | grep -q '^upload:'; then
  echo "publish: the delete pass uploaded files, so a typed pass missed them; fix the pass filters" >&2
  exit 1
fi

echo "publish: 7/7 CloudFront invalidation"
INVALIDATION_ID="$(aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths '/*' --query 'Invalidation.Id' --output text)"
echo "publish: invalidation ${INVALIDATION_ID} created, waiting for Completed"
aws cloudfront wait invalidation-completed --distribution-id "$DISTRIBUTION_ID" --id "$INVALIDATION_ID"
echo "publish: done"

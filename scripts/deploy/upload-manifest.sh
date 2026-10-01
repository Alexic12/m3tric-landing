#!/usr/bin/env bash
# Publishes the deploy manifest as _deploy/manifest.json (no-cache), so the live version is knowable.
# Usage: upload-manifest.sh <bucket> <manifest-file>
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <bucket> <manifest-file>" >&2
  exit 2
fi
[ -f "$2" ] || { echo "upload-manifest: $2 not found" >&2; exit 1; }
aws s3 cp "$2" "s3://$1/_deploy/manifest.json" --only-show-errors \
  --cache-control "no-cache" --content-type "application/json"
echo "upload-manifest: s3://$1/_deploy/manifest.json updated"

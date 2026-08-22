#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node --test tests/model.test.mjs
python tests/browser_inline_probe.py
node scripts/measure.mjs
for file in public/js/*.js scripts/*.mjs; do
  node --check "$file"
done

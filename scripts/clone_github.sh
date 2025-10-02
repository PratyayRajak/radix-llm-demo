#!/usr/bin/env bash
# scripts/clone_github.sh
set -e
OUTDIR="../data/raw/github"
mkdir -p "$OUTDIR"
repo="https://github.com/radixdlt/radixdlt-scrypto.git"
git clone --depth 1 "$repo" "$OUTDIR/radixdlt-scrypto" || echo "Already cloned or failed."
cd "$OUTDIR/radixdlt-scrypto"
git rev-parse --short HEAD > ../../radix_scrypto_commit.txt
echo "Cloned to $OUTDIR/radixdlt-scrypto"

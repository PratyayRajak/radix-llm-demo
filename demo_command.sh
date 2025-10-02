#!/usr/bin/env bash
set -e
# run from repo root
echo "Cloning GitHub..."
bash scripts/clone_github.sh

echo "Scraping docs..."
python3 scripts/scrape_radix_docs.py

echo "Scraping developer portal..."
python3 scripts/scrape_developer_portal.py

echo "Cleaning..."
python3 scripts/clean_to_jsonl.py

echo "Run prompt -> code pipeline example"
# create example prompt file
cat > example_prompt.txt <<'PROMPT'
You are an expert Scrypto developer. Produce a minimal Scrypto blueprint that compiles with cargo test.
The blueprint should provide a resource and a method to mint a single token; include unit tests that compile with cargo test.
PROMPT

python3 scripts/prompt_to_code.py --prompt-file example_prompt.txt --workdir tmp_project
echo "Done. Check results.json and data/cleaned/"

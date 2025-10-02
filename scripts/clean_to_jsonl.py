#!/usr/bin/env python3
# scripts/clean_to_jsonl.py
import os, glob, json, re, time
from bs4 import BeautifulSoup
from tqdm import tqdm

ROOT = os.path.join("..", "data", "raw")
OUT = os.path.join("..", "data", "cleaned")
os.makedirs(OUT, exist_ok=True)

def clean_html_file(path):
    with open(path, "rb") as f:
        raw = f.read()
    try:
        soup = BeautifulSoup(raw, "lxml")
    except Exception:
        soup = BeautifulSoup(raw, "html.parser")
    # Remove likely boilerplate
    for sel in soup.select("nav, footer, .toc, .sidebar, .header, script, style"):
        sel.decompose()
    # Extract visible text
    text = soup.get_text("\n")
    # Normalize whitespace
    text = re.sub(r"\n\s+\n", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text).strip()
    # Extract <code> and fenced blocks
    codes = []
    for code in soup.find_all(["code", "pre"]):
        ctext = code.get_text().strip()
        if ctext:
            codes.append(ctext)
    # metadata from .meta file if exists
    meta = {}
    meta_path = path + ".meta"
    if os.path.exists(meta_path):
        try:
            with open(meta_path, "r") as m:
                for line in m:
                    if ":" in line:
                        k, v = line.split(":", 1)
                        meta[k.strip()] = v.strip()
        except:
            pass
    return {
        "id": os.path.basename(path),
        "file_path": path,
        "url": meta.get("url", ""),
        "fetched_at": int(meta.get("fetched_at", time.time())),
        "content": text,
        "code_blocks": codes
    }

def process_folder(folder, outname):
    files = glob.glob(os.path.join(ROOT, folder, "*.html"))
    outpath = os.path.join(OUT, outname)
    with open(outpath, "w", encoding="utf8") as out:
        for f in tqdm(files, desc=f"Processing {folder}"):
            try:
                rec = clean_html_file(f)
                out.write(json.dumps(rec, ensure_ascii=False) + "\n")
            except Exception as e:
                print("error processing", f, e)

if __name__ == "__main__":
    process_folder("radix_docs", "radix_docs.jsonl")
    process_folder("developer_portal", "developer_portal.jsonl")
    # For GitHub repo, extract .rs and md files
    github_rs_files = []
    for root,_,files in os.walk(os.path.join(ROOT,"github","radixdlt-scrypto")):
        for fn in files:
            if fn.endswith(".rs") or fn.endswith(".toml") or fn.endswith(".md"):
                github_rs_files.append(os.path.join(root,fn))
    outpath = os.path.join(OUT, "github_code.jsonl")
    with open(outpath,"w",encoding="utf8") as out:
        for f in tqdm(github_rs_files, desc="GitHub files"):
            try:
                with open(f,"r",encoding="utf8",errors="ignore") as fh:
                    content = fh.read()
                rec = {"id": os.path.relpath(f, start=os.path.join(ROOT,"github")), "file_path": f, "content": content}
                out.write(json.dumps(rec, ensure_ascii=False) + "\n")
            except Exception as e:
                print("err", f, e)

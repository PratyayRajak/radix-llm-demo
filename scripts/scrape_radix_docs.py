#!/usr/bin/env python3
# scripts/scrape_radix_docs.py
import requests, os, time
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from tqdm import tqdm

BASE = "https://docs.radixdlt.com/docs/scrypto-1"
OUTDIR = os.path.join("..", "data", "raw", "radix_docs")
os.makedirs(OUTDIR, exist_ok=True)

HEADERS = {"User-Agent": "radix-llm-demo-scraper/1.0 (+https://github.com/youruser)"}
CRAWL_DELAY = 1.0  # seconds between requests

def collect_links(root):
    """Fetch root page and collect internal links under /docs/scrypto-1"""
    r = requests.get(root, headers=HEADERS, timeout=20)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "lxml")
    links = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("/"):
            full = urljoin("https://docs.radixdlt.com", href)
        elif href.startswith("http"):
            full = href
        else:
            full = urljoin(root, href)
        if "/docs/scrypto-1" in full:
            links.add(full.split("#")[0])
    links.add(root)
    return sorted(links)

def save_url(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
        r.raise_for_status()
        safe_name = url.replace("https://", "").replace("http://", "").replace("/", "_")[:160]
        filename = os.path.join(OUTDIR, f"{safe_name}.html")
        with open(filename, "wb") as f:
            f.write(r.content)
        meta_path = filename + ".meta"
        with open(meta_path, "w") as m:
            m.write(f"url: {url}\nstatus: {r.status_code}\nets: {r.headers.get('ETag')}\nfetched_at: {int(time.time())}\n")
        return filename
    except Exception as e:
        print("FAILED", url, e)
        return None

def main():
    print("Collecting links from", BASE)
    links = collect_links(BASE)
    print(f"Found {len(links)} links to fetch.")
    for u in tqdm(links):
        save_url(u)
        time.sleep(CRAWL_DELAY)

if __name__ == "__main__":
    main()

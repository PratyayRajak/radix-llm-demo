#!/usr/bin/env python3
# scripts/scrape_developer_portal.py
import requests, os, time
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from tqdm import tqdm

BASE = "https://developers.radixdlt.com/"
OUTDIR = os.path.join("..", "data", "raw", "developer_portal")
os.makedirs(OUTDIR, exist_ok=True)
HEADERS = {"User-Agent": "radix-llm-demo-scraper/1.0"}
CRAWL_DELAY = 1.0

def collect_links(root, max_links=200):
    r = requests.get(root, headers=HEADERS, timeout=20)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "lxml")
    links = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("http") and "developers.radixdlt.com" in href:
            links.add(href.split("#")[0])
        elif href.startswith("/"):
            links.add(urljoin(root, href).split("#")[0])
    return list(links)[:max_links]

def save_url(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
        r.raise_for_status()
        safe_name = url.replace("https://", "").replace("http://", "").replace("/", "_")[:160]
        filename = os.path.join(OUTDIR, f"{safe_name}.html")
        with open(filename, "wb") as f:
            f.write(r.content)
        with open(filename + ".meta", "w") as m:
            m.write(f"url: {url}\nstatus: {r.status_code}\nfetched_at: {int(time.time())}\n")
        return filename
    except Exception as e:
        print("FAILED", url, e)
        return None

def main():
    links = collect_links(BASE)
    print("Found", len(links), "links")
    for u in tqdm(links):
        save_url(u)
        time.sleep(CRAWL_DELAY)

if __name__ == "__main__":
    main()

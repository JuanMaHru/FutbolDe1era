"""Fotos libres de jugadores/DTs: imagen de Wikidata (P18) + autor y licencia de Wikimedia Commons.
Escribe src/data/photos.json: {id: {url, author, license, page}}. Solo licencias libres (CC BY, CC BY-SA, CC0, dominio público)."""
import json, os, re, sys, html, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
import wikidata as wd

ROOT = os.path.join(os.path.dirname(__file__), "..")
ids = json.load(open(os.path.join(os.path.dirname(__file__), "wikidata_ids.json")))
qids = [v["qid"] for v in ids.values() if v["qid"]]
ents = wd.entities(qids)
files = {}
for pid, v in ids.items():
    e = ents.get(v["qid"]) if v["qid"] else None
    if not e: continue
    p18 = wd._vals(e, "P18")
    if p18: files[pid] = p18[0][0]
print(len(files), "personas con foto en Wikidata", flush=True)

def commons(titles):
    import urllib.request, time, hashlib
    params = {"action": "query", "titles": "|".join("File:" + t for t in titles), "prop": "imageinfo", "iiprop": "url|extmetadata",
              "iiurlwidth": 240, "iiextmetadatafilter": "Artist|LicenseShortName|UsageTerms|AttributionRequired", "format": "json"}
    key = hashlib.sha1(json.dumps(params, sort_keys=True).encode()).hexdigest()
    path = os.path.join(wd.CACHE, "c" + key + ".json")
    if os.path.exists(path): return json.load(open(path))
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    for i in range(12):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": wd.UA}), timeout=60) as r:
                d = json.load(r)
            json.dump(d, open(path, "w")); time.sleep(1); return d
        except urllib.error.HTTPError as e:
            if e.code == 429:
                w = int(e.headers.get("retry-after", "30")) + 2; print(f"  (Commons pide esperar {w}s)", flush=True); time.sleep(w); continue
            raise

def clean(s):
    s = re.sub(r"<[^>]+>", "", s or ""); s = html.unescape(s).strip()
    return re.sub(r"\s+", " ", s)[:60]

FREE = re.compile(r"^(CC BY(-SA)?( \d\.\d)?|CC0|Public domain|PD.*)$", re.I)
out = {}
items = list(files.items())
for i in range(0, len(items), 50):
    chunk = items[i:i + 50]
    d = commons([f for _, f in chunk])
    pages = {p.get("title", "").replace("File:", "").replace("_", " "): p for p in d.get("query", {}).get("pages", {}).values()}
    norm = {n["from"].replace("File:", ""): n["to"].replace("File:", "") for n in d.get("query", {}).get("normalized", [])}
    for pid, f in chunk:
        p = pages.get(norm.get(f, f).replace("_", " ")) or pages.get(f.replace("_", " "))
        if not p or "imageinfo" not in p: continue
        ii = p["imageinfo"][0]; md = ii.get("extmetadata", {})
        lic = clean(md.get("LicenseShortName", {}).get("value"))
        if not FREE.match(lic): continue
        out[pid] = {"url": ii.get("thumburl") or ii["url"], "author": clean(md.get("Artist", {}).get("value")) or "Wikimedia Commons",
                    "license": lic, "page": ii.get("descriptionurl")}
json.dump(out, open(f"{ROOT}/src/data/photos.json", "w"), ensure_ascii=False, indent=1)
print(len(out), "fotos con licencia libre guardadas")

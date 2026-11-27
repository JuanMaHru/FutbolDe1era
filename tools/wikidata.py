"""Lectura de Wikidata por su API (wbsearchentities / wbgetentities) con caché local."""
import json, os, time, urllib.parse, urllib.request, urllib.error, hashlib

UA = "futbol-de-primera-datacheck/1.0 (https://futbol-de1era.vercel.app)"
API = "https://www.wikidata.org/w/api.php"
CACHE = os.path.join(os.path.dirname(__file__), ".wdcache")
os.makedirs(CACHE, exist_ok=True)

def _get(params):
    key = hashlib.sha1(json.dumps(params, sort_keys=True).encode()).hexdigest()
    path = os.path.join(CACHE, key + ".json")
    if os.path.exists(path):
        return json.load(open(path))
    full = API + "?" + urllib.parse.urlencode({**params, "format": "json", "maxlag": 5})
    for i in range(12):
        try:
            req = urllib.request.Request(full, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = json.load(r)
            if "error" in data:
                if data["error"].get("code") == "maxlag": time.sleep(5); continue
                raise RuntimeError(data["error"].get("info"))
            json.dump(data, open(path, "w"))
            time.sleep(1.0)
            return data
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = int(e.headers.get("retry-after", "30")) + 2
                print(f"  (Wikidata pide esperar {wait}s)", flush=True); time.sleep(wait); continue
            if i == 11: raise
            time.sleep(3 * (i + 1))
        except Exception:
            if i == 11: raise
            time.sleep(3 * (i + 1))

def search(name, lang="es"):
    d = _get({"action": "wbsearchentities", "search": name, "language": lang, "type": "item", "limit": 7})
    return [x["id"] for x in d.get("search", [])]

_ent = {}
def entities(qids, props="claims|labels"):
    # Caché por entidad (independiente del orden de los pedidos).
    for q in dict.fromkeys(qids):
        if q and q not in _ent and os.path.exists(os.path.join(CACHE, f"e_{q}.json")):
            _ent[q] = json.load(open(os.path.join(CACHE, f"e_{q}.json")))
    need = sorted(q for q in dict.fromkeys(qids) if q and q not in _ent)
    for i in range(0, len(need), 50):
        d = _get({"action": "wbgetentities", "ids": "|".join(need[i:i + 50]), "props": props, "languages": "es|en"})
        for q, e in d.get("entities", {}).items():
            _ent[q] = e
            if "missing" not in e: json.dump(e, open(os.path.join(CACHE, f"e_{q}.json"), "w"))
    return {q: _ent.get(q) for q in qids if _ent.get(q)}

FOOT, COACH = "Q937857", "Q628099"

def _vals(e, prop):
    out = []
    for st in e.get("claims", {}).get(prop, []):
        dv = st.get("mainsnak", {}).get("datavalue")
        if not dv: continue
        v = dv["value"]
        out.append((v["id"] if isinstance(v, dict) and "id" in v else v.get("time") if isinstance(v, dict) else v, st))
    return out

def label(e, lang="es"):
    l = e.get("labels", {})
    return (l.get(lang) or l.get("en") or l.get("es") or {}).get("value")

def birth(e):
    v = _vals(e, "P569")
    return v[0][0][1:11] if v else None

def occupations(e):
    return {v for v, _ in _vals(e, "P106")}

def qual(st, p):
    q = st.get("qualifiers", {}).get(p)
    if not q or "datavalue" not in q[0]: return None
    v = q[0]["datavalue"]["value"]
    return v.get("time", "")[1:5] if isinstance(v, dict) and "time" in v else v

def profile(e):
    teams = []
    for tq, st in _vals(e, "P54"):
        teams.append({"qid": tq, "start": qual(st, "P580"), "end": qual(st, "P582"), "num": qual(st, "P1618"),
                      "loan": any(x.get("datavalue", {}).get("value", {}).get("id") == "Q2914547" for x in st.get("qualifiers", {}).get("P1642", []))})
    return {"birth": birth(e), "sport": [v for v, _ in _vals(e, "P1532")], "cit": [v for v, _ in _vals(e, "P27")],
            "pos": [v for v, _ in _vals(e, "P413")], "teams": sorted(teams, key=lambda t: t["start"] or "9999")}

def by_titles(titles, site="eswiki"):
    """Resuelve títulos de Wikipedia a QIDs, de a 50 por pedido. Devuelve {título: entidad}."""
    out = {}
    for i in range(0, len(titles), 50):
        chunk = titles[i:i + 50]
        d = _get({"action": "wbgetentities", "sites": site, "titles": "|".join(chunk), "props": "claims|labels|sitelinks", "languages": "es|en", "sitefilter": site})
        for q, e in d.get("entities", {}).items():
            if q.startswith("-") or "missing" in e: continue
            _ent[q] = e
            t = e.get("sitelinks", {}).get(site, {}).get("title")
            if t: out[t] = e
    return out

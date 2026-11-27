"""src/data/fame.json: cuán conocido es cada jugador/DT = cantidad de Wikipedias con artículo sobre él (Wikidata)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import wikidata as wd
ROOT = os.path.join(os.path.dirname(__file__), "..")
ids = json.load(open(os.path.join(os.path.dirname(__file__), "wikidata_ids.json")))
q = sorted({v["qid"] for v in ids.values() if v["qid"]})
links = {}
for i in range(0, len(q), 50):
    d = wd._get({"action": "wbgetentities", "ids": "|".join(q[i:i + 50]), "props": "sitelinks"})
    for k, e in d.get("entities", {}).items():
        links[k] = sum(1 for s in e.get("sitelinks", {}) if s.endswith("wiki") and s not in ("commonswiki", "specieswiki"))
out = {pid: links.get(v["qid"], 0) for pid, v in ids.items() if v["qid"]}
json.dump(out, open(f"{ROOT}/src/data/fame.json", "w"), separators=(",", ":"))
print(len(out), "personas; mediana", sorted(out.values())[len(out) // 2])

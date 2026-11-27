"""src/data/bios.json: trayectoria por clubes de cada persona según Wikidata (para pistas, fichas y nuevos modos)."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from clubnames import our_name, ROOT

raw = json.load(open(os.path.join(os.path.dirname(__file__), "wikidata_careers.json")))
out = {}
for pid, car in raw.items():
    stints = []
    for s in sorted(car, key=lambda s: s["from"]):
        name = our_name(s["es"], s.get("en"))
        if re.search(r"(\bB$|\bII$|Castilla|Atl[eèé]tic\b|Primavera|Sub-?\d|U-?\d\d|Reserva|Juvenil|Youth|Academy)", f"{name} {s['es']}", re.I): continue
        if stints and stints[-1]["club"] == name and not s["loan"]:
            stints[-1]["to"] = s["to"]; continue
        st = {"club": name, "from": s["from"], "to": s["to"]}
        if s["loan"]: st["loan"] = True
        stints.append(st)
    if stints: out[pid] = {"career": stints}
json.dump(out, open(f"{ROOT}/src/data/bios.json", "w"), ensure_ascii=False, separators=(",", ":"))
print(len(out), "trayectorias;", sum(len(v["career"]) for v in out.values()), "etapas")
